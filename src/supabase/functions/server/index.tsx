import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { getSupabaseClient } from "./lib/supabaseClient.tsx";
import { validateServerEnv } from "./lib/envCheck.tsx";
import * as kv from "./kv_store.tsx";
import { matching } from "./routes/matching.tsx";
import { v4 as uuidv4 } from "npm:uuid";

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
    } else {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      if (!user?.id || error) {
        return c.json({ error: "Unauthorized - Please login again" }, 401);
      }
      userId = user.id;
    }

    const body = await c.req.json();
    const { linkedinUrl, githubUrl, portfolioUrl, name, title } = body;

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
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
          } else {
          }
        }
      } catch (error) {
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
        
        // Fallback to mock analysis if OpenAI fails
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
        
        aiAnalysis = JSON.parse(data.choices[0]?.message?.content || '{}');
      }
    } catch (openaiError: any) {
      
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

    return c.json({ 
      success: true,
      analysis: aiAnalysis,
      profileData,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    
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
    return c.json({ error: `Failed to get analysis: ${error.message}` }, 500);
  }
});

// Mount matching routes
app.route("/", matching);

Deno.serve(app.fetch);
async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizePhone(input: string, defaultCode: string) {
  let p = (input || "").replace(/\s+/g, "");
  if (p.startsWith("0") && defaultCode.startsWith("+")) p = `${defaultCode}${p.slice(1)}`;
  if (!p.startsWith("+") && defaultCode) p = `${defaultCode}${p}`;
  return p;
}

async function aesGcmEncrypt(plaintext: string, base64Key: string) {
  const keyBytes = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc);
  const ctBytes = new Uint8Array(ct);
  const payload = new Uint8Array(iv.length + ctBytes.length);
  payload.set(iv, 0);
  payload.set(ctBytes, iv.length);
  return btoa(String.fromCharCode(...payload));
}

async function aesGcmDecrypt(b64: string, base64Key: string) {
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const iv = bytes.slice(0, 12);
  const ct = bytes.slice(12);
  const keyBytes = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ct);
  return new TextDecoder().decode(pt);
}

async function enqueueJob(jobType: 'send_otp'|'send_email'|'anchor_chain', payload: Record<string, any>) {
  const key = Deno.env.get('PHONE_ENCRYPTION_KEY') || '';
  const encPayload = await aesGcmEncrypt(JSON.stringify(payload), key);
  await supabase.from('job_queue').insert({ job_type: jobType, payload_encrypted: encPayload });
}

async function processJobs(limit = 10) {
  const key = Deno.env.get('PHONE_ENCRYPTION_KEY') || '';
  const { data: jobs } = await supabase
    .from('job_queue')
    .select('id, job_type, payload_encrypted, try_count')
    .eq('status', 'pending')
    .lte('run_after', new Date().toISOString())
    .limit(limit);
  for (const job of jobs || []) {
    await supabase.from('job_queue').update({ status: 'processing' }).eq('id', job.id);
    let ok = false;
    try {
      const payloadText = await aesGcmDecrypt(job.payload_encrypted, key);
      const payload = JSON.parse(payloadText || '{}');
      if (job.job_type === 'send_otp') {
        const smsUrl = Deno.env.get('SMS_PROVIDER_URL') || '';
        const smsKey = Deno.env.get('SMS_PROVIDER_KEY') || '';
        if (smsUrl && smsKey) {
          await withRetry(async () => {
            await fetch(smsUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${smsKey}` }, body: JSON.stringify({ to: payload.phone, message: `Your Core-ID code is ${payload.otp}` }) });
          }, 2);
        }
        ok = true;
      } else if (job.job_type === 'send_email') {
        const resendKey = Deno.env.get('RESEND_API_KEY') || '';
        if (resendKey) {
          await withRetry(async () => {
            await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` }, body: JSON.stringify({ from: 'Core-ID <no-reply@coreid.africa>', to: payload.to, subject: payload.subject, html: payload.html }) });
          }, 2);
        }
        ok = true;
        if ((payload.subject || '').toLowerCase().includes('welcome')) {
          await supabase.from('audit_events').insert({ event_type: 'welcome_email_sent', user_id: payload.user_id || null });
          if (payload.user_id) await supabase.from('identity_users').update({ welcome_email_sent: true, welcome_email_sent_at: new Date().toISOString() }).eq('user_id', payload.user_id);
        } else if ((payload.subject || '').toLowerCase().includes('verify')) {
          await supabase.from('audit_events').insert({ event_type: 'email_verification_sent', user_id: payload.user_id || null });
        }
      } else if (job.job_type === 'anchor_chain') {
        ok = true;
      }
    } catch (e) {
      if (job.job_type === 'send_email' && (e?.message || '').length) {
        await supabase.from('audit_events').insert({ event_type: 'welcome_email_failed', meta: { error: e.message } });
      }
    }
    const updates: any = { try_count: (job.try_count || 0) + 1, updated_at: new Date().toISOString() };
    if (ok) updates.status = 'done'; else {
      const retryDelay = 60;
      updates.status = 'pending';
      updates.run_after = new Date(Date.now() + retryDelay * 1000).toISOString();
    }
    await supabase.from('job_queue').update(updates).eq('id', job.id);
  }
}

app.post("/api/register/start", async (c) => {
  try {
    const body = await c.req.json();
    const name = String(body.full_name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phoneRaw = String(body.phone || "").trim();
    const idem = String(body.idempotency_key || "");
  const defaultCode = Deno.env.get("DEFAULT_COUNTRY_CODE") || "+234";
  const salt = Deno.env.get("SERVER_SALT") || "";
  const ttlSec = Number(Deno.env.get("OTP_TTL_SEC") || 600);
  const cooldownSec = Number(Deno.env.get("OTP_RESEND_COOLDOWN") || 90);
  const maxSendsPerHour = Number(Deno.env.get("OTP_MAX_SENDS_PER_HOUR") || 3);
  const phone = normalizePhone(phoneRaw, defaultCode);
    if (!/^\+[1-9]\d{6,15}$/.test(phone)) return c.json({ error: "invalid_phone" }, 400);
    const phoneHash = await sha256Hex(`${phone}${salt}`);
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const { data: recentOtps, error: otpsErr } = await supabase
      .from("otps")
      .select("id, created_at")
      .eq("contact_hash", phoneHash)
      .gte("created_at", hourAgo);
    if (!otpsErr && (recentOtps?.length || 0) >= maxSendsPerHour) return c.json({ error: "rate_limited" }, 429);
    const regToken = uuidv4();
    const { error: upErr } = await supabase
      .from("registrations")
      .upsert({ reg_token: regToken, data: { full_name: name, email, normalized_phone: phone }, phone_hash: phoneHash, progress_stage: "basic" }, { onConflict: "reg_token" });
    if (upErr) return c.json({ error: "registration_upsert_failed" }, 500);
    const ip = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || '';
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await sha256Hex(`${otpCode}${salt}`);
    const expiresAt = new Date(now.getTime() + ttlSec * 1000).toISOString();
    const { error: insErr } = await supabase.from("otps").insert({ contact_hash: phoneHash, otp_hash: otpHash, expires_at: expiresAt });
    if (insErr) return c.json({ error: "otp_create_failed" }, 500);
    await supabase.from("audit_events").insert({ event_type: "registration_started", meta: { phone_hash: phoneHash, ip }, user_id: null });
    const { error: auditErr } = await supabase.from("audit_events").insert({ event_type: "otp_sent", meta: { phone_hash: phoneHash }, user_id: null });
    if (auditErr) {}
  await enqueueJob('send_otp', { phone, otp: otpCode });
  Promise.resolve().then(() => processJobs(5));
    return c.json({ reg_token: regToken, otp_expires_in: ttlSec, message: "OTP sent" });
  } catch (e: any) {
    return c.json({ error: "server_error", message: e?.message || "" }, 500);
  }
});

app.post("/api/register/verify-otp", async (c) => {
  try {
    const body = await c.req.json();
    const regToken = String(body.reg_token || "");
    const otp = String(body.otp || "").trim();
    const salt = Deno.env.get("SERVER_SALT") || "";
  const { data: regRow, error: regErr } = await supabase.from("registrations").select("id, phone_hash, data, user_id").eq("reg_token", regToken).maybeSingle();
    if (regErr || !regRow) return c.json({ error: "invalid_reg_token" }, 401);
    const phoneHash = regRow.phone_hash;
    const otpHashInput = await sha256Hex(`${otp}${salt}`);
    const nowIso = new Date().toISOString();
    const { data: otpRows } = await supabase
      .from("otps")
      .select("id, otp_hash, expires_at, attempts, used")
      .eq("contact_hash", phoneHash)
      .order("created_at", { ascending: false })
      .limit(1);
    const otpRow = otpRows?.[0];
    if (!otpRow) return c.json({ error: "otp_not_found" }, 401);
    if (otpRow.used) return c.json({ error: "otp_used" }, 401);
    if (otpRow.expires_at < nowIso) return c.json({ error: "otp_expired" }, 410);
    const maxAttempts = Number(Deno.env.get("OTP_MAX_ATTEMPTS") || 5);
    if ((otpRow.attempts || 0) >= maxAttempts) return c.json({ error: "attempts_exceeded" }, 429);
    const match = otpRow.otp_hash === otpHashInput;
    const { error: updOtpErr } = await supabase
      .from("otps")
      .update({ attempts: (otpRow.attempts || 0) + 1, used: match })
      .eq("id", otpRow.id);
    if (updOtpErr) return c.json({ error: "otp_update_failed" }, 500);
    if (!match) {
      await supabase.from("audit_events").insert({ event_type: "otp_failed", meta: { phone_hash: phoneHash }, user_id: null });
      return c.json({ error: "invalid_otp" }, 401);
    }
    const { error: updRegErr } = await supabase.from("registrations").update({ otp_verified: true }).eq("id", regRow.id);
    if (updRegErr) return c.json({ error: "registration_update_failed" }, 500);
    let userId = regRow.user_id;
    let pinVal = "";
    const normalizedPhone = String(regRow.data?.normalized_phone || "");
    const pinMode = (Deno.env.get("PIN_MODE") || "phone").toLowerCase();
    if (!userId) {
      const email = String(regRow.data?.email || "").toLowerCase();
      const name = String(regRow.data?.full_name || "");
      const { data: usersExisting } = await supabase.from("identity_users").select("user_id, pin").eq("phone_hash", phoneHash).maybeSingle();
      if (usersExisting?.user_id) {
        userId = usersExisting.user_id;
        pinVal = usersExisting.pin;
      } else {
        const aliasEmail = email || `user_${phoneHash.slice(0,8)}@example.invalid`;
        const { data: authCreated, error: authErr } = await supabase.auth.admin.createUser({ email: aliasEmail, password: crypto.randomUUID(), user_metadata: { full_name: name } });
        if (authErr) return c.json({ error: "auth_create_failed" }, 500);
        userId = authCreated.user?.id || "";
        if (pinMode === "phone" && normalizedPhone) {
          pinVal = normalizedPhone;
        } else {
          pinVal = `PIN-${regToken.replace(/-/g, "").slice(0,6).toUpperCase()}`;
        }
        const encPhone = await aesGcmEncrypt(normalizedPhone, Deno.env.get('PHONE_ENCRYPTION_KEY') || '');
        const { error: insUserErr } = await supabase.from("identity_users").insert({ user_id: userId, full_name: name, email: email || null, email_verified: false, phone_encrypted: encPhone, phone_hash: phoneHash, pin: pinVal, status: "incomplete" });
        if (insUserErr) return c.json({ error: "identity_create_failed" }, 500);
        if (email) await enqueueJob('send_email', { to: email, subject: 'Verify your email', html: '<p>Verify your email to activate Core-ID features.</p>' });
      }
      const { error: linkErr } = await supabase.from("registrations").update({ user_id: userId }).eq("id", regRow.id);
      if (linkErr) {}
    }
    const { error: auditOtpErr } = await supabase.from("audit_events").insert({ event_type: "otp_verified", meta: { phone_hash: phoneHash }, user_id: userId || null });
    const { error: auditPinErr } = await supabase.from("audit_events").insert({ event_type: "pin_issued", meta: { phone_hash: phoneHash, pin: pinVal }, user_id: userId || null });
    if (auditOtpErr) {}
    if (auditPinErr) {}
    return c.json({ registration_token: regToken, next: "complete_profile", user_exists: !!userId, pin: pinVal || null });
  } catch (e: any) {
    return c.json({ error: "server_error", message: e?.message || "" }, 500);
  }
});

app.post("/api/register/profile/save", async (c) => {
  try {
    const auth = c.req.header("Authorization") || "";
    const token = auth.split(" ")[1] || "";
    const body = await c.req.json();
    const stage = String(body.stage || "basic");
    const data = body.data || {};
    const regToken = c.req.header("X-Registration-Token") || "";
    const { data: regRow } = await supabase.from("registrations").select("id, user_id").eq("reg_token", regToken).maybeSingle();
    if (!regRow) return c.json({ error: "invalid_registration_token" }, 401);
    const { error: updErr } = await supabase.from("registrations").update({ data, progress_stage: stage }).eq("id", regRow.id);
    if (updErr) return c.json({ error: "save_failed" }, 500);
    let completion = 0;
    if (regRow.user_id) {
      const { error: compErr } = await supabase.from("identity_users").update({ profile_completion: 42 }).eq("user_id", regRow.user_id);
      if (compErr) {}
      completion = 42;
    }
    return c.json({ status: "ok", profile_completion: completion });
  } catch (e: any) {
    return c.json({ error: "server_error", message: e?.message || "" }, 500);
  }
});

app.post("/api/register/finalize", async (c) => {
  try {
    const regToken = c.req.header("X-Registration-Token") || "";
    const { data: regRow } = await supabase.from("registrations").select("user_id, otp_verified").eq("reg_token", regToken).maybeSingle();
    if (!regRow || !regRow.otp_verified) return c.json({ error: "insufficient_data" }, 422);
    const { error: updErr } = await supabase.from("identity_users").update({ status: "active" }).eq("user_id", regRow.user_id);
    if (updErr) return c.json({ error: "finalize_failed" }, 500);
    const { data: userRow } = await supabase.from("identity_users").select("pin, email_verified, email").eq("user_id", regRow.user_id).maybeSingle();
    if (userRow?.email) await enqueueJob('send_email', { to: userRow.email, subject: 'Welcome to Core-ID', html: '<p>Welcome — your Core-ID PIN has been created.</p>', user_id: regRow.user_id });
    if ((Deno.env.get('ANCHOR_ASYNC') || 'false') === 'true') {
      await enqueueJob('anchor_chain', { user_id: regRow.user_id, pin: userRow?.pin || null });
      Promise.resolve().then(() => processJobs(5));
      return c.json({ status: 202, message: 'Anchoring in progress' }, 202);
    }
    await supabase.from("audit_events").insert({ event_type: "registration_finalized", user_id: regRow.user_id });
    return c.json({ access_token: "jwt.placeholder", user: { id: regRow.user_id, pin: userRow?.pin || null, email_verified: userRow?.email_verified || false } });
  } catch (e: any) {
    return c.json({ error: "server_error", message: e?.message || "" }, 500);
  }
});

app.post('/jobs/process', async (c) => {
  try { await processJobs(10); return c.json({ status: 'ok' }); } catch { return c.json({ error: 'failed' }, 500) }
});

app.get("/user/me", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id || error) return c.json({ error: "unauthorized" }, 401);
    const { data: idUser } = await supabase.from("identity_users").select("pin, status, profile_completion, email_verified, welcome_email_sent").eq("user_id", user.id).maybeSingle();
    return c.json({ pin: idUser?.pin || null, status: idUser?.status || "incomplete", profile_completion: idUser?.profile_completion || 0, email_verified: idUser?.email_verified || false, welcome_email_sent: idUser?.welcome_email_sent || false });
  } catch (e: any) {
    return c.json({ error: "server_error", message: e?.message || "" }, 500);
  }
});

app.post("/auth/resend-verification-email", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id || error) return c.json({ error: "unauthorized" }, 401);
    return c.json({ status: "ok" });
  } catch (e: any) {
    return c.json({ error: "server_error", message: e?.message || "" }, 500);
  }
});

app.get("/verify-email", async (c) => {
  try {
    const token = c.req.query("token") || "";
    const { data: row } = await supabase.from("email_verification_tokens").select("user_id, expires_at, used").eq("token", token).maybeSingle();
    if (!row || row.used || new Date(row.expires_at) < new Date()) return c.json({ error: "invalid_or_expired" }, 410);
    const { error: markUsedErr } = await supabase.from("email_verification_tokens").update({ used: true }).eq("token", token);
    if (markUsedErr) return c.json({ error: "update_failed" }, 500);
    const { error: updUserErr } = await supabase.from("identity_users").update({ email_verified: true }).eq("user_id", row.user_id);
    if (updUserErr) return c.json({ error: "verify_failed" }, 500);
    const { error: auditErr } = await supabase.from("audit_events").insert({ event_type: "email_verified", user_id: row.user_id });
    if (auditErr) {}
    return c.json({ status: "ok" });
  } catch (e: any) {
    return c.json({ error: "server_error", message: e?.message || "" }, 500);
  }
});
app.get('/metrics/summary', async (c) => {
  try {
    const hours = Number(c.req.query('hours') || '24');
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const { data } = await supabase
      .from('audit_events')
      .select('event_type, created_at')
      .gte('created_at', since);
    const summary: Record<string, number> = {};
    for (const row of data || []) summary[row.event_type] = (summary[row.event_type] || 0) + 1;
    return c.json({ hours, summary });
  } catch {
    return c.json({ error: 'metrics_failed' }, 500);
  }
});

app.get('/metrics/alerts', async (c) => {
  try {
    const otpThreshold = Number(Deno.env.get('ALERT_THRESHOLD_OTP_FAILED') || 10);
    const regIpThreshold = Number(Deno.env.get('ALERT_THRESHOLD_REG_START_IP') || 50);
    const emailFailThreshold = Number(Deno.env.get('ALERT_THRESHOLD_EMAIL_FAILED') || 5);
    const now = Date.now();
    const since15 = new Date(now - 15 * 60 * 1000).toISOString();
    const since60 = new Date(now - 60 * 60 * 1000).toISOString();
    const { data: otpFailed } = await supabase.from('audit_events').select('id').eq('event_type', 'otp_failed').gte('created_at', since15);
    const { data: regStarted } = await supabase.from('audit_events').select('meta, created_at').eq('event_type', 'registration_started').gte('created_at', since60);
    const { data: emailFailed } = await supabase.from('audit_events').select('id').eq('event_type', 'welcome_email_failed').gte('created_at', since60);
    const alerts: any[] = [];
    if ((otpFailed?.length || 0) > otpThreshold) alerts.push({ code: 'otp_spike', count: otpFailed?.length || 0 });
    const ipCounts: Record<string, number> = {};
    for (const row of regStarted || []) {
      const ip = (row as any)?.meta?.ip || 'unknown';
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    }
    for (const [ip, cnt] of Object.entries(ipCounts)) if (cnt > regIpThreshold) alerts.push({ code: 'register_spike_ip', ip, count: cnt });
    if ((emailFailed?.length || 0) > emailFailThreshold) alerts.push({ code: 'welcome_email_failures', count: emailFailed?.length || 0 });
    return c.json({ alerts });
  } catch {
    return c.json({ error: 'alerts_failed' }, 500);
  }
});

// PIN Conversion Endpoint - Convert existing PIN to phone number
app.post("/make-server-5cd3a043/pin/convert-phone", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { phoneNumber } = await c.req.json();

    if (!phoneNumber) {
      return c.json({ error: "Phone number is required" }, 400);
    }
    
    // Sanitize phone number to digits only
    const newPin = phoneNumber.replace(/\D/g, '');

    // Get existing PIN
    const { data: existingPin } = await supabase
      .from('professional_pins')
      .select('id, pin_number')
      .eq('user_id', user.id)
      .single();

    if (!existingPin) {
      return c.json({ error: "No PIN found for this user" }, 404);
    }

    // Check if new PIN is already in use by another user
    const { data: conflict } = await supabase
      .from('professional_pins')
      .select('id')
      .eq('pin_number', newPin)
      .neq('user_id', user.id)
      .single();

    if (conflict) {
      return c.json({ error: "This phone number is already used as a PIN by another user" }, 409);
    }

    // Update PIN to phone number
    const { error: updateError } = await supabase
      .from('professional_pins')
      .update({ 
        pin_number: newPin,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingPin.id);

    if (updateError) {
      console.error('Update PIN error:', updateError);
      throw new Error('Failed to update PIN');
    }

    // Update KV cache if available
    try {
      await kv.set(`pin:${newPin}`, { 
        pinId: existingPin.id, 
        userId: user.id, 
        pinNumber: newPin, 
        updatedAt: new Date().toISOString() 
      });
      // Delete old key if different
      if (existingPin.pin_number !== newPin) {
        await kv.del(`pin:${existingPin.pin_number}`);
      }
    } catch (kvErr) {
      // Non-fatal, continue
    }

    // Log the conversion
    await supabase.from('audit_events').insert({
      event_type: 'pin_converted_to_phone',
      user_id: user.id,
      meta: { old_pin: existingPin.pin_number, new_pin: newPin }
    });

    return c.json({ success: true, pinNumber: newPin });
  } catch (error: any) {
    console.error("Convert PIN error:", error);
    return c.json({ error: error.message || "Failed to convert PIN" }, 500);
  }
});

// Phone Verification - Send OTP
app.post("/pin/send-otp", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { phone } = await c.req.json();

    if (!phone) {
      return c.json({ error: "Phone number is required" }, 400);
    }

    // Sanitize phone number
    const sanitizedPhone = phone.replace(/\D/g, '');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('phone_verification_otps')
      .insert({
        user_id: user.id,
        phone_number: sanitizedPhone,
        otp_code: otp,
        expires_at: expiresAt.toISOString()
      });

    if (otpError) {
      console.error('Failed to store OTP:', otpError);
      return c.json({ error: "Failed to generate OTP" }, 500);
    }

    // TODO: Integrate with SMS provider to actually send SMS
    // For now, we'll just log it (in production, send actual SMS)

    // In production, you would call your SMS provider here:
    // await sendSMS(sanitizedPhone, `Your verification code is: ${otp}`);

    return c.json({ 
      success: true, 
      message: "OTP sent successfully",
      expiresIn: 300,
      // Remove this in production - only for testing
      _dev_otp: otp 
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return c.json({ error: error.message || "Failed to send OTP" }, 500);
  }
});

// Phone Verification - Verify OTP
app.post("/pin/verify-phone", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { phone, otp } = await c.req.json();

    if (!phone || !otp) {
      return c.json({ error: "Phone number and OTP are required" }, 400);
    }

    // Sanitize phone number
    const sanitizedPhone = phone.replace(/\D/g, '');

    // Get the latest unused OTP for this user and phone
    const { data: otpRecord, error: fetchError } = await supabase
      .from('phone_verification_otps')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone_number', sanitizedPhone)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return c.json({ error: "No OTP found. Please request a new one." }, 404);
    }

    // Check if OTP expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return c.json({ error: "OTP has expired. Please request a new one." }, 410);
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return c.json({ error: "Too many attempts. Please request a new OTP." }, 429);
    }

    // Increment attempts
    await supabase
      .from('phone_verification_otps')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id);

    // Verify OTP
    if (otpRecord.otp_code !== otp) {
      return c.json({ error: "Invalid OTP code" }, 400);
    }

    // Mark OTP as used
    await supabase
      .from('phone_verification_otps')
      .update({ used: true })
      .eq('id', otpRecord.id);

    // Update profile - mark phone as verified
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        phone_verified: true,
        phone: sanitizedPhone,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Failed to update profile:', profileError);
      return c.json({ error: "Failed to verify phone" }, 500);
    }

    // Log success
    await supabase.from('audit_events').insert({
      event_type: 'phone_verified',
      user_id: user.id,
      meta: { phone_hash: sanitizedPhone.slice(-4) }
    });

    return c.json({ 
      success: true,
      message: "Phone verified successfully"
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return c.json({ error: error.message || "Failed to verify OTP" }, 500);
  }
});

