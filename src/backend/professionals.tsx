import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "../supabase/functions/server/kv_store.tsx";

const professionals = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Get All Professionals (for employers)
professionals.get("/", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all professional profiles
    const allProfiles = await kv.getByPrefix('profile:professional:');
    
    // Filter and format the data
    const professionals = allProfiles
      .filter((profile: any) => profile.profileComplete)
      .map((profile: any) => ({
        id: profile.userId,
        ...profile
      }));

    return c.json({ 
      success: true, 
      professionals,
      count: professionals.length 
    });
  } catch (error) {
    console.log("Get professionals error:", error);
    return c.json({ error: `Failed to get professionals: ${error.message}` }, 500);
  }
});

// Search Professionals
professionals.post("/search", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { skills, location, experienceLevel, availability } = body;

    // Get all professional profiles
    const allProfiles = await kv.getByPrefix('profile:professional:');
    
    // Filter based on search criteria
    let filtered = allProfiles.filter((profile: any) => profile.profileComplete);
    
    if (skills && skills.length > 0) {
      filtered = filtered.filter((profile: any) => 
        profile.skills?.some((skill: string) => 
          skills.some((searchSkill: string) => 
            skill.toLowerCase().includes(searchSkill.toLowerCase())
          )
        )
      );
    }
    
    if (location) {
      filtered = filtered.filter((profile: any) => 
        profile.location?.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (experienceLevel) {
      filtered = filtered.filter((profile: any) => 
        profile.yearsOfExperience >= parseInt(experienceLevel)
      );
    }
    
    if (availability) {
      filtered = filtered.filter((profile: any) => 
        profile.availability === availability
      );
    }

    return c.json({ 
      success: true, 
      professionals: filtered,
      count: filtered.length 
    });
  } catch (error) {
    console.log("Search professionals error:", error);
    return c.json({ error: `Search failed: ${error.message}` }, 500);
  }
});

export { professionals };
