import { Hono } from "npm:hono";
import { getSupabaseClient, getAuthUser } from "../lib/supabaseClient.tsx";
import * as kv from "../kv_store.tsx";
import { maybeEncryptKVValue, decryptJson } from "../lib/crypto.tsx";

const profile = new Hono();

// Supabase client is initialized per-request within handlers to avoid boot-time errors

// Get Profile Endpoint
profile.get("/:userId", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    // Verify user can access this profile
    if (user.id !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    let userProfile = await kv.get(`user:${userId}`);
    try {
      userProfile = await decryptJson(userProfile);
    } catch (_) {}
    
    if (!userProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json({ success: true, profile: userProfile });
  } catch (error) {
    console.log("Get profile error:", error);
    return c.json({ error: `Failed to get profile: ${error.message}` }, 500);
  }
});

// Update Profile Endpoint
profile.put("/:userId", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    if (user.id !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    let currentProfile = await kv.get(`user:${userId}`);

    // If profile is missing, create a baseline so updates succeed (fixes race with email verification)
    if (!currentProfile) {
      const baseline = {
        id: userId,
        email: user.email,
        userType: body?.userType || (user.user_metadata as any)?.userType || 'unknown',
        createdAt: new Date().toISOString(),
        verificationStatus: user.email_confirmed_at ? 'verified' : 'pending'
      };
      await kv.set(`user:${userId}`, baseline);
      currentProfile = baseline;
    }

    const updatedProfile = {
      ...currentProfile,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedProfile);

    // Encrypted audit trail for profile updates
    try {
      const auditPayload = {
        userId,
        userType: updatedProfile.userType || 'unknown',
        changes: body,
        ip: c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown',
        userAgent: c.req.header('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
      };
      const enc = await maybeEncryptKVValue(auditPayload);
      await kv.set(`audit:profile_update:${userId}:${Date.now()}`, enc);
    } catch (_) {}

    return c.json({ 
      success: true, 
      message: "Profile updated successfully",
      profile: updatedProfile
    });
  } catch (error) {
    console.log("Profile update error:", error);
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
      console.log("Demo user detected, proceeding with analysis");
    } else {
      const { user, error } = await getAuthUser(c);
      
      if (!user?.id || error) {
        console.log("Authorization error during profile analysis:", error);
        return c.json({ error: "Unauthorized - Please login again" }, 401);
      }
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
      console.log("OpenAI API error:", errorData);
      return c.json({ error: "AI service error" }, 500);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.log("Failed to parse AI response:", aiResponse);
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
    console.log("Profile analysis error:", error);
    return c.json({ error: `Profile analysis failed: ${error.message}` }, 500);
  }
});

// Save Complete Profile Data
profile.post("/complete", async (c) => {
  try {
    const supabase = getSupabaseClient();
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

    // Progressive setup steps
    const setupSteps = profileData.setup_steps || {};
    const setupProgress = typeof profileData.setup_progress === 'number' ? profileData.setup_progress : Object.values(setupSteps).filter(Boolean).length;

    // Save complete profile
    await kv.set(`profile-complete:${userId}`, {
      userId,
      ...profileData,
      completionPercentage,
      setup_steps: setupSteps,
      setup_progress: setupProgress,
      savedAt: new Date().toISOString()
    });

    // Update user profile status in KV
    const userProfile = await kv.get(`user:${userId}`) || {};
    await kv.set(`user:${userId}`, {
      ...userProfile,
      profileComplete: true,
      completionPercentage,
      setup_steps: setupSteps,
      setup_progress: setupProgress,
      updatedAt: new Date().toISOString()
    });

    // Update public.profiles table with setup_progress and setup_steps
    try {
      await supabase
        .from('profiles')
        .update({
          profile_complete: true,
          completion_percentage: completionPercentage,
          setup_progress: setupProgress,
          setup_steps: setupSteps
        })
        .eq('user_id', userId);
    } catch (err) {
      console.log('Failed to update public.profiles setup_progress:', err);
    }

    return c.json({ 
      success: true, 
      message: "Profile saved successfully",
      completionPercentage,
      setup_steps: setupSteps,
      setup_progress: setupProgress,
      missingFields: allFields.filter(key => !filledFields.includes(key)),
      profile: {
        ...profileData,
        completionPercentage,
        setup_steps: setupSteps,
        setup_progress: setupProgress
      }
    });
  } catch (error) {
    console.log("Save profile error:", error);
    return c.json({ error: `Failed to save profile: ${error.message}` }, 500);
  }
});

// Get Profile Analysis
profile.get("/analysis/:userId", async (c) => {
  try {
    const supabase = getSupabaseClient();
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
    console.log("Get analysis error:", error);
    return c.json({ error: `Failed to get analysis: ${error.message}` }, 500);
  }
});

export { profile };