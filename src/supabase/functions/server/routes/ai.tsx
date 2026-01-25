import { Hono } from "npm:hono";
import { getSupabaseClient, getAuthUser } from "../lib/supabaseClient.tsx";

const ai = new Hono();

// Supabase client singleton
const supabase = getSupabaseClient();

// AI-Powered Talent Matching Endpoint
ai.post("/match-talent", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
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
            content: `Analyze this job posting and provide talent matching criteria:\\n\\nJob Description: ${jobDescription}\\nRequired Skills: ${requiredSkills}\\nLocation: ${location}\\nExperience Level: ${experienceLevel}\\n\\nProvide: 1) Key skill requirements 2) Recommended experience range 3) Cultural fit considerations 4) Compliance requirements`
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
ai.post("/compliance-check", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
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
            content: `Review compliance for this candidate:\\n\\nCandidate: ${candidateName}\\nDocuments: ${documents}\\nLocation: ${location}\\nEmployment Type: ${employmentType}\\n\\nProvide: 1) Required compliance checks 2) Necessary documentation 3) Potential red flags 4) Recommendations`
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
    return c.json({ error: `Compliance check failed: ${error.message}` }, 500);
  }
});

export { ai };
