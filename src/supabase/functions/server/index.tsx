import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { getSupabaseClient } from "./lib/supabaseClient.tsx";
import { validateServerEnv } from "./lib/envCheck.tsx";
import * as kv from "./kv_store.tsx";
import { matching } from "./routes/matching.tsx";

// Validate environment before app initializes
validateServerEnv();
const app = new Hono();

// Supabase client singleton
const supabase = getSupabaseClient();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-5cd3a043/health", (c) => {
  return c.json({ status: "ok" });
});

// Registration data validation endpoint
app.post("/make-server-5cd3a043/validate-registration", async (c) => {
  try {
    const body = await c.req.json();
    const entryPoint = body.entryPoint as 'signup' | 'get-started' | undefined;
    const userType = body.userType as 'professional' | 'employer' | 'university' | undefined;
    const data = body.data || {};

    const errors: string[] = [];

    if (!entryPoint) errors.push('Missing entryPoint');
    if (!userType) errors.push('Missing userType');

    // Common fields
    const email = (data.email || data.contactEmail || '').toString().trim();
    const name = (data.name || '').toString().trim();
    const phone = (data.phone || '').toString().trim();
    const password = (data.password || '').toString();
    const confirmPassword = (data.confirmPassword || '').toString();

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('Email Address must be a valid email');
    }

    if (!name) {
      errors.push('Full Name is required');
    }

    // Phone optional: allow +country and digits, spaces, hyphens
    if (phone && !/^\+?[0-9\s-]{7,20}$/.test(phone)) {
      errors.push('Phone Number format is invalid');
    }

    // Password requirements for both entry points
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      errors.push('Password and Confirm Password must match');
    }

    // User-type specific validations
    if (userType === 'professional') {
      const title = (data.title || '').toString().trim();
      const location = (data.location || '').toString().trim();
      if (!title) errors.push('Professional Title is required');
      if (!location) errors.push('Location is required');
    }

    if (userType === 'employer') {
      const companyName = (data.companyName || '').toString().trim();
      const industry = (data.industry || '').toString().trim();
      const headquarters = (data.headquarters || '').toString().trim();
      const contactEmail = (data.contactEmail || '').toString().trim();
      if (!companyName) errors.push('Company Name is required');
      if (!industry) errors.push('Industry is required');
      if (!headquarters) errors.push('Headquarters Location is required');
      if (!contactEmail || !emailRegex.test(contactEmail)) {
        errors.push('Contact Email must be a valid email');
      }
    }

    return c.json({ valid: errors.length === 0, errors });
  } catch (error: any) {
    return c.json({ valid: false, errors: ['Validation failed', error?.message] }, 400);
  }
});

// User Registration Endpoint
app.post("/make-server-5cd3a043/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, userType, companyName, role, institution } = body;

    // Validate required fields
    if (!email || !password || !name || !userType) {
      return c.json({ error: "Missing required fields: email, password, name, userType" }, 400);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        userType,
        companyName: companyName || null,
        role: role || null,
        institution: institution || null
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log("Registration error during auth creation:", authError);
      return c.json({ error: `Registration failed: ${authError.message}` }, 400);
    }

    // Store additional user data in KV store
    const userId = authData.user?.id;
    if (userId) {
      await kv.set(`user:${userId}`, {
        id: userId,
        email,
        name,
        userType,
        companyName: companyName || null,
        role: role || null,
        institution: institution || null,
        createdAt: new Date().toISOString(),
        verificationStatus: "pending"
      });

      // Create user profile entry
      await kv.set(`profile:${userType}:${userId}`, {
        userId,
        profileComplete: false,
        onboardingComplete: false,
        createdAt: new Date().toISOString()
      });
    }

    return c.json({ 
      success: true, 
      message: "Registration successful",
      userId,
      userType
    });
  } catch (error) {
    console.log("Registration error:", error);
    return c.json({ error: `Registration failed: ${error.message}` }, 500);
  }
});

// User Login Endpoint
app.post("/make-server-5cd3a043/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log("Login error:", error);
      return c.json({ error: `Login failed: ${error.message}` }, 401);
    }

    // Get user data from KV store
    const userId = data.user?.id;
    const userData = userId ? await kv.get(`user:${userId}`) : null;

    return c.json({ 
      success: true,
      accessToken: data.session?.access_token,
      user: data.user,
      userData
    });
  } catch (error) {
    console.log("Login error:", error);
    return c.json({ error: `Login failed: ${error.message}` }, 500);
  }
});

// Get User Profile Endpoint (Protected)
app.get("/make-server-5cd3a043/profile/:userId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    // Ensure user can only access their own profile
    if (user.id !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ success: true, user: userData });
  } catch (error) {
    console.log("Profile retrieval error:", error);
    return c.json({ error: `Failed to get profile: ${error.message}` }, 500);
  }
});

// Update User Profile Endpoint (Protected)
app.put("/make-server-5cd3a043/profile/:userId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    // Ensure user can only update their own profile
    if (user.id !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const currentData = await kv.get(`user:${userId}`);
    
    if (!currentData) {
      return c.json({ error: "User not found" }, 404);
    }

    const updatedData = {
      ...currentData,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedData);

    return c.json({ success: true, user: updatedData });
  } catch (error) {
    console.log("Profile update error:", error);
    return c.json({ error: `Failed to update profile: ${error.message}` }, 500);
  }
});

// AI-Powered Talent Matching Endpoint
app.post("/make-server-5cd3a043/ai/match-talent", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { jobDescription, requiredSkills, location, experienceLevel } = body;

    // Call OpenAI API for talent matching
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return c.json({ error: "AI service not configured. Please contact administrator." }, 503);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI talent matching assistant for nwanne platform. Analyze job requirements and provide talent matching insights for Nigerian professionals.'
          },
          {
            role: 'user',
            content: `Analyze this job posting and provide talent matching criteria:\n\nJob Description: ${jobDescription}\nRequired Skills: ${requiredSkills}\nLocation: ${location}\nExperience Level: ${experienceLevel}\n\nProvide: 1) Key skill requirements 2) Recommended experience range 3) Cultural fit considerations 4) Compliance requirements`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("OpenAI API error:", errorData);
      return c.json({ error: "AI service error" }, 500);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    return c.json({ 
      success: true,
      analysis: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log("AI matching error:", error);
    return c.json({ error: `AI matching failed: ${error.message}` }, 500);
  }
});

// AI-Powered Compliance Check Endpoint
app.post("/make-server-5cd3a043/ai/compliance-check", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { candidateName, documents, location, employmentType } = body;

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return c.json({ error: "AI service not configured. Please contact administrator." }, 503);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a compliance assistant for nwanne platform. Analyze compliance requirements for hiring Nigerian professionals.'
          },
          {
            role: 'user',
            content: `Analyze compliance requirements for:\n\nCandidate: ${candidateName}\nDocuments: ${documents}\nLocation: ${location}\nEmployment Type: ${employmentType}\n\nProvide: 1) Required compliance checks 2) Tax implications 3) Regulatory requirements 4) Risk assessment`
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("OpenAI API error:", errorData);
      return c.json({ error: "AI service error" }, 500);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    return c.json({ 
      success: true,
      complianceAnalysis: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log("AI compliance check error:", error);
    return c.json({ error: `Compliance check failed: ${error.message}` }, 500);
  }
});

// Get all professionals (for employer search)
app.get("/make-server-5cd3a043/professionals", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all professional profiles
    const professionals = await kv.getByPrefix('profile:professional:');
    
    return c.json({ 
      success: true,
      professionals: professionals || [],
      count: professionals?.length || 0
    });
  } catch (error) {
    console.log("Get professionals error:", error);
    return c.json({ error: `Failed to get professionals: ${error.message}` }, 500);
  }
});

// Analyze Profile Links with AI (LinkedIn, GitHub, Portfolio)
app.post("/make-server-5cd3a043/profile/analyze", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Skip auth check for demo users
    const isDemoUser = accessToken?.startsWith('demo-token-');
    let userId = '';
    
    if (isDemoUser) {
      userId = 'demo-user-' + Date.now();
      console.log("Demo user detected, proceeding with analysis");
    } else {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      if (!user?.id || error) {
        console.log("Authorization error during profile analysis:", error);
        return c.json({ error: "Unauthorized - Please login again" }, 401);
      }
      userId = user.id;
    }

    const body = await c.req.json();
    const { linkedinUrl, githubUrl, portfolioUrl, name, title } = body;

    console.log("Analyzing profile for user:", userId, { name, title, linkedinUrl, githubUrl, portfolioUrl });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log("OpenAI API key not found - using mock analysis");
      // Return mock analysis for testing
      const mockAnalysis = {
        yearsOfExperience: 5,
        experienceLevel: "senior",
        nigerianResponse: "My chief, you dey chief with solid experience",
        analysis: "Based on your professional background, you have demonstrated strong expertise in your field.",
        topSkills: ["React", "TypeScript", "Node.js"]
      };
      
      await kv.set(`profile-analysis:${userId}`, {
        userId,
        ...mockAnalysis,
        profileData: { linkedin: null, github: null, portfolio: null },
        analyzedAt: new Date().toISOString(),
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        isMock: true
      });
      
      return c.json({ 
        success: true,
        analysis: mockAnalysis,
        profileData: {},
        timestamp: new Date().toISOString(),
        note: "Mock analysis - AI service configuration pending"
      });
    }

    // Fetch profile data from the URLs
    let profileData: any = {
      linkedin: null,
      github: null,
      portfolio: null
    };

    let githubAccountAge = 0;
    let githubReposCount = 0;
    let githubLanguages: string[] = [];

    // Fetch GitHub data if provided
    if (githubUrl) {
      try {
        const githubUsername = githubUrl.split('github.com/')[1]?.split('/')[0]?.split('?')[0];
        console.log("Fetching GitHub data for username:", githubUsername);
        
        if (githubUsername) {
          const githubResponse = await fetch(`https://api.github.com/users/${githubUsername}`, {
            headers: {
              'User-Agent': 'nwanne-profile-analyzer'
            }
          });
          
          if (githubResponse.ok) {
            const githubData = await githubResponse.json();
            const reposResponse = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`, {
              headers: {
                'User-Agent': 'nwanne-profile-analyzer'
              }
            });
            const repos = reposResponse.ok ? await reposResponse.json() : [];
            
            // Calculate account age in years
            const createdDate = new Date(githubData.created_at);
            githubAccountAge = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
            githubReposCount = githubData.public_repos;
            githubLanguages = repos
              .map((repo: any) => repo.language)
              .filter((lang: any) => lang)
              .slice(0, 5);
            
            profileData.github = {
              username: githubData.login,
              name: githubData.name,
              bio: githubData.bio,
              publicRepos: githubData.public_repos,
              followers: githubData.followers,
              following: githubData.following,
              createdAt: githubData.created_at,
              accountAgeYears: githubAccountAge,
              repositories: repos.map((repo: any) => ({
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                updatedAt: repo.updated_at
              }))
            };
            
            console.log("GitHub data fetched successfully:", {
              username: githubData.login,
              repos: githubReposCount,
              accountAge: githubAccountAge
            });
          } else {
            console.log("GitHub API response not OK:", githubResponse.status);
          }
        }
      } catch (error) {
        console.log("GitHub fetch error:", error);
        // Continue without GitHub data
      }
    }

    // Use OpenAI to analyze the profile data
    const analysisPrompt = `Analyze this Nigerian professional's profile and provide experience assessment.

Name: ${name || 'Professional'}
Title: ${title || 'Not specified'}
Has LinkedIn: ${linkedinUrl ? 'Yes' : 'No'}
Has GitHub: ${githubUrl ? 'Yes' : 'No'}
${profileData.github ? `
GitHub Info:
- Account age: ${githubAccountAge} years
- Public repos: ${githubReposCount}
- Languages: ${githubLanguages.join(', ') || 'None detected'}
` : ''}
Has Portfolio: ${portfolioUrl ? 'Yes' : 'No'}

Provide a JSON response with:
1. yearsOfExperience: Estimate 0-20 years based on data (GitHub age can indicate minimum experience)
2. experienceLevel: "junior" (0-3 yrs), "mid" (3-5 yrs), "senior" (5-8 yrs), or "expert" (8+ yrs)
3. nigerianResponse: A SHORT (max 12 words) Nigerian Pidgin/slang phrase:
   - For expert/senior: "My chief, you don dey senior with massive experience"
   - For mid: "You dey try well, solid mid-level professional"
   - For junior: "Rising star, you go reach there soon"
4. analysis: Brief 1-2 sentence analysis
5. topSkills: Array of 3-5 skills (extract from title or GitHub languages)

Respond with ONLY valid JSON, no other text.`;

    console.log("Calling OpenAI API...");

    let aiAnalysis: any;
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an AI career analyst. Respond only with valid JSON. Be realistic about experience estimates.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 400
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("OpenAI API error status:", response.status);
        console.log("OpenAI API error body:", errorText);
        
        // Fallback to mock analysis if OpenAI fails
        console.log("OpenAI failed, using fallback analysis");
        aiAnalysis = {
          yearsOfExperience: githubAccountAge || 3,
          experienceLevel: githubAccountAge >= 5 ? "senior" : githubAccountAge >= 3 ? "mid" : "junior",
          nigerianResponse: githubAccountAge >= 5 
            ? "My chief, you don dey senior well well" 
            : githubAccountAge >= 3 
            ? "Mid-level boss, you dey do well"
            : "Rising star, you go reach there",
          analysis: `Professional with ${githubAccountAge || 3}+ years of experience in software development.`,
          topSkills: githubLanguages.length > 0 ? githubLanguages.slice(0, 3) : ["JavaScript", "React", "Node.js"]
        };
      } else {
        const data = await response.json();
        console.log("OpenAI response received");
        
        aiAnalysis = JSON.parse(data.choices[0]?.message?.content || '{}');
        console.log("Parsed AI analysis:", aiAnalysis);
      }
    } catch (openaiError: any) {
      console.log("OpenAI API exception:", openaiError.message);
      
      // Use intelligent fallback based on available data
      aiAnalysis = {
        yearsOfExperience: githubAccountAge || 3,
        experienceLevel: githubAccountAge >= 5 ? "senior" : githubAccountAge >= 3 ? "mid" : "junior",
        nigerianResponse: githubAccountAge >= 5 
          ? "My chief, you don senior for this game" 
          : githubAccountAge >= 3 
          ? "Mid-level professional, you dey try"
          : "Rising talent, the future is bright",
        analysis: title 
          ? `Experienced ${title} with demonstrated expertise.`
          : "Professional with solid background in technology.",
        topSkills: githubLanguages.length > 0 
          ? githubLanguages.slice(0, 3) 
          : (title?.includes('React') ? ["React", "JavaScript", "TypeScript"] : ["JavaScript", "Python", "Git"])
      };
    }

    // Validate analysis has required fields
    if (!aiAnalysis.yearsOfExperience) aiAnalysis.yearsOfExperience = 3;
    if (!aiAnalysis.experienceLevel) aiAnalysis.experienceLevel = "mid";
    if (!aiAnalysis.nigerianResponse) aiAnalysis.nigerianResponse = "Professional talent verified";
    if (!aiAnalysis.analysis) aiAnalysis.analysis = "Experienced professional";
    if (!aiAnalysis.topSkills) aiAnalysis.topSkills = ["Technology", "Problem Solving", "Communication"];

    // Store the analysis result
    await kv.set(`profile-analysis:${userId}`, {
      userId,
      ...aiAnalysis,
      profileData,
      analyzedAt: new Date().toISOString(),
      linkedinUrl,
      githubUrl,
      portfolioUrl
    });

    console.log("Analysis stored successfully for user:", userId);

    return c.json({ 
      success: true,
      analysis: aiAnalysis,
      profileData,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.log("Profile analysis error:", error?.message);
    console.log("Error stack:", error?.stack);
    
    // Return a user-friendly error with fallback
    return c.json({ 
      error: "Unable to analyze profile at this time",
      details: error?.message,
      suggestion: "Please try again or contact support if the issue persists"
    }, 500);
  }
});

// Save Complete Profile Data
app.post("/make-server-5cd3a043/profile/complete", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const {
      name,
      title,
      email,
      phone,
      location,
      bio,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      skills,
      hourlyRate,
      availability,
      yearsOfExperience,
      profileImage
    } = body;

    // Validate required fields
    const requiredFields = ['name', 'title', 'email', 'location'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return c.json({ 
        error: "Missing required fields",
        missingFields,
        message: `Please complete: ${missingFields.join(', ')}`
      }, 400);
    }

    // Calculate profile completion percentage
    const allFields = [
      'name', 'title', 'email', 'phone', 'location', 'bio',
      'linkedinUrl', 'githubUrl', 'portfolioUrl', 'skills',
      'hourlyRate', 'availability', 'yearsOfExperience', 'profileImage'
    ];
    const completedFields = allFields.filter(field => body[field]);
    const completionPercentage = Math.round((completedFields.length / allFields.length) * 100);

    // Store complete profile
    const profileData = {
      userId: user.id,
      name,
      title,
      email,
      phone: phone || null,
      location,
      bio: bio || null,
      linkedinUrl: linkedinUrl || null,
      githubUrl: githubUrl || null,
      portfolioUrl: portfolioUrl || null,
      skills: skills || [],
      hourlyRate: hourlyRate || null,
      availability: availability || 'Available',
      yearsOfExperience: yearsOfExperience || 0,
      profileImage: profileImage || null,
      completionPercentage,
      profileComplete: completionPercentage >= 80,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`profile:professional:${user.id}`, profileData);

    // Update user data
    const userData = await kv.get(`user:${user.id}`);
    await kv.set(`user:${user.id}`, {
      ...userData,
      profileComplete: profileData.profileComplete,
      updatedAt: new Date().toISOString()
    });

    return c.json({ 
      success: true,
      profile: profileData,
      completionPercentage,
      missingFields: allFields.filter(field => !body[field])
    });
  } catch (error) {
    console.log("Profile completion error:", error);
    return c.json({ error: `Failed to save profile: ${error.message}` }, 500);
  }
});

// Get Profile Analysis
app.get("/make-server-5cd3a043/profile/analysis/:userId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    // Get analysis data
    const analysis = await kv.get(`profile-analysis:${userId}`);
    
    if (!analysis) {
      return c.json({ error: "No analysis found" }, 404);
    }

    return c.json({ 
      success: true,
      analysis
    });
  } catch (error) {
    console.log("Get analysis error:", error);
    return c.json({ error: `Failed to get analysis: ${error.message}` }, 500);
  }
});

// Mount matching routes
app.route("/", matching);

Deno.serve(app.fetch);