import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "../supabase/functions/server/kv_store.tsx";

const profile = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Get Profile Endpoint
profile.get("/:userId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    // Verify user can access this profile
    if (user.id !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    let userProfile = await kv.get(`user:${userId}`);
    
    // If profile doesn't exist, create a basic one from auth metadata
    if (!userProfile) {
      
      const userType = user.user_metadata?.userType || 'professional';
      userProfile = {
        id: userId,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        userType,
        companyName: user.user_metadata?.companyName || null,
        role: user.user_metadata?.role || null,
        institution: user.user_metadata?.institution || null,
        gender: user.user_metadata?.gender || null,
        createdAt: user.created_at || new Date().toISOString(),
        verificationStatus: user.email_confirmed_at ? "verified" : "pending"
      };
      
      // Store the new profile
      await kv.set(`user:${userId}`, userProfile);
      
      // Create user profile entry if it doesn't exist
      const profileKey = `profile:${userType}:${userId}`;
      const existingProfile = await kv.get(profileKey);
      if (!existingProfile) {
        await kv.set(profileKey, {
          userId,
          profileComplete: false,
          onboardingComplete: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    return c.json({ success: true, profile: userProfile });
  } catch (error) {
    return c.json({ error: `Failed to get profile: ${error.message}` }, 500);
  }
});

// Update Profile Endpoint
profile.put("/:userId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    if (user.id !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const currentProfile = await kv.get(`user:${userId}`);

    if (!currentProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const updatedProfile = {
      ...currentProfile,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedProfile);

    return c.json({ 
      success: true, 
      message: "Profile updated successfully",
      profile: updatedProfile
    });
  } catch (error) {
    return c.json({ error: `Failed to update profile: ${error.message}` }, 500);
  }
});

// Analyze Profile Links with AI (LinkedIn, GitHub, Portfolio)
profile.post("/analyze", async (c) => {
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
    const { linkedinUrl, githubUrl, portfolioUrl, resumeUrl, name, title } = body;

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      // Return mock analysis for testing
      const mockAnalysis = {
        yearsOfExperience: 5,
        experienceLevel: "senior",
        nigerianResponse: "My chief, you dey chief with solid experience",
        analysis: "Based on your professional background, you have demonstrated strong expertise in your field.",
        topSkills: ["Product Management", "Strategy", "Team Leadership"]
      };
      
      await kv.set(`profile-analysis:${userId}`, {
        userId,
        ...mockAnalysis,
        profileData: { linkedin: null, github: null, portfolio: null, resume: null },
        analyzedAt: new Date().toISOString(),
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        resumeUrl,
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
      portfolio: null,
      resume: null
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
    const analysisPrompt = `Analyze this professional's profile and provide experience assessment.

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
Has Resume: ${resumeUrl ? 'Yes' : 'No'}

Provide a JSON response with:
1. yearsOfExperience: estimated years (number)
2. experienceLevel: "entry", "junior", "mid", "senior", "expert", or "chief"
3. nigerianResponse: A culturally relevant Nigerian response celebrating their level (e.g., "My chief, you dey chief with massive experience!" for senior/expert)
4. analysis: Brief professional assessment
5. topSkills: Array of 3-5 key skills inferred from the profile

Response format: JSON only, no markdown.`;

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
            content: 'You are an AI career analyst for nwanne platform. Analyze professional profiles and provide experience assessments with Nigerian cultural flavor.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return c.json({ error: "AI service error" }, 500);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      analysisResult = {
        yearsOfExperience: 3,
        experienceLevel: "mid",
        nigerianResponse: "You dey try well for this field!",
        analysis: "Experienced professional with demonstrated capabilities.",
        topSkills: ["Professional Skills", "Communication", "Problem Solving"]
      };
    }

    // Store the analysis
    await kv.set(`profile-analysis:${userId}`, {
      userId,
      ...analysisResult,
      profileData,
      analyzedAt: new Date().toISOString(),
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      resumeUrl
    });

    return c.json({ 
      success: true,
      analysis: analysisResult,
      profileData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: `Profile analysis failed: ${error.message}` }, 500);
  }
});

// Save Complete Profile Data
profile.post("/complete", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const isDemoUser = accessToken?.startsWith('demo-token-');
    let userId = '';
    
    if (isDemoUser) {
      userId = 'demo-user-' + Date.now();
    } else {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      if (!user?.id || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      userId = user.id;
    }

    const profileData = await c.req.json();

    // Validate required fields
    const required = ['name', 'title', 'email', 'location'];
    const missing = required.filter(field => !profileData[field]);
    
    if (missing.length > 0) {
      return c.json({ 
        error: `Missing required fields: ${missing.join(', ')}` 
      }, 400);
    }

    // Calculate completion percentage
    const allFields = Object.keys(profileData);
    const filledFields = allFields.filter(key => {
      const value = profileData[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'number') return value > 0;
      return value !== '' && value !== null && value !== undefined;
    });
    
    const completionPercentage = Math.round((filledFields.length / allFields.length) * 100);

    // Save complete profile
    await kv.set(`profile-complete:${userId}`, {
      userId,
      ...profileData,
      completionPercentage,
      savedAt: new Date().toISOString()
    });

    // Update user profile status
    const userProfile = await kv.get(`user:${userId}`) || {};
    await kv.set(`user:${userId}`, {
      ...userProfile,
      profileComplete: true,
      completionPercentage,
      updatedAt: new Date().toISOString()
    });

    // Sync to public.profiles (service role bypasses RLS)
    try {
      const userType = (userProfile?.userType) || (profileData?.userType) || 'professional';
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          email: profileData.email,
          name: profileData.name,
          user_type: userType,
          profile_complete: true,
          onboarding_complete: (userProfile?.onboardingComplete === true),
        }, { onConflict: 'user_id' });
      if (upsertErr) {
      }
    } catch (profilesErr) {
    }

    // Audit trail for profile completion
    await kv.set(`audit:profile_complete:${userId}:${Date.now()}`, {
      userId,
      completionPercentage,
      timestamp: new Date().toISOString(),
      action: 'profile_complete',
    });

    return c.json({ 
      success: true, 
      message: "Profile saved successfully",
      completionPercentage,
      missingFields: allFields.filter(key => !filledFields.includes(key))
    });
  } catch (error) {
    return c.json({ error: `Failed to save profile: ${error.message}` }, 500);
  }
});

// Get Profile Analysis
profile.get("/analysis/:userId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const isDemoUser = accessToken?.startsWith('demo-token-');
    
    if (!isDemoUser) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      if (!user?.id || error) {
        return c.json({ error: "Unauthorized" }, 401);
      }
    }

    const userId = c.req.param('userId');
    const analysis = await kv.get(`profile-analysis:${userId}`);
    
    if (!analysis) {
      return c.json({ success: false, message: "No analysis found" }, 404);
    }

    return c.json({ success: true, analysis });
  } catch (error) {
    return c.json({ error: `Failed to get analysis: ${error.message}` }, 500);
  }
});

export { profile };
