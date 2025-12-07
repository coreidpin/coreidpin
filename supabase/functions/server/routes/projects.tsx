import { Hono } from "npm:hono";
import { getSupabaseClient, getAuthUser } from "../lib/supabaseClient.tsx";

const projects = new Hono();

// Get all projects for the authenticated user
projects.get("/", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseClient();

    const { data, error: fetchError } = await supabase
      .from('professional_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Fetch projects error:", fetchError);
      return c.json({ error: `Failed to fetch projects: ${fetchError.message}` }, 500);
    }

    return c.json({
      success: true,
      projects: data || []
    });
  } catch (error: any) {
    console.error("Get projects error:", error);
    return c.json({ error: `Failed to get projects: ${error.message}` }, 500);
  }
});

// Create a new project
projects.post("/", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { title, description, role, timeline, skills, links } = body;

    if (!title) {
      return c.json({ error: "Title is required" }, 400);
    }

    const supabase = getSupabaseClient();

    const { data, error: insertError } = await supabase
      .from('professional_projects')
      .insert({
        user_id: user.id,
        title,
        description,
        role,
        timeline,
        skills: skills || [],
        links: links || [],
        // New case study fields
        challenge: body.challenge,
        solution: body.solution,
        result: body.result,
        media_urls: body.media_urls || [],
        featured_image_url: body.featured_image_url,
        is_portfolio_visible: body.is_portfolio_visible ?? true,
        project_type: body.project_type || 'basic',
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert project error:", insertError);
      return c.json({ error: `Failed to create project: ${insertError.message}` }, 500);
    }

    return c.json({
      success: true,
      project: data
    });
  } catch (error: any) {
    console.error("Create project error:", error);
    return c.json({ error: `Failed to create project: ${error.message}` }, 500);
  }
});

// Update an existing project
projects.put("/:id", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.param('id');
    const body = await c.req.json();
    const { title, description, role, timeline, skills, links } = body;

    const supabase = getSupabaseClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('professional_projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return c.json({ error: "Project not found or access denied" }, 404);
    }

    // Update project
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (role !== undefined) updateData.role = role;
    if (timeline !== undefined) updateData.timeline = timeline;
    if (skills !== undefined) updateData.skills = skills;
    if (links !== undefined) updateData.links = links;
    // New fields
    if (body.challenge !== undefined) updateData.challenge = body.challenge;
    if (body.solution !== undefined) updateData.solution = body.solution;
    if (body.result !== undefined) updateData.result = body.result;
    if (body.media_urls !== undefined) updateData.media_urls = body.media_urls;
    if (body.featured_image_url !== undefined) updateData.featured_image_url = body.featured_image_url;
    if (body.is_portfolio_visible !== undefined) updateData.is_portfolio_visible = body.is_portfolio_visible;
    if (body.project_type !== undefined) updateData.project_type = body.project_type;

    const { data, error: updateError } = await supabase
      .from('professional_projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error("Update project error:", updateError);
      return c.json({ error: `Failed to update project: ${updateError.message}` }, 500);
    }

    return c.json({
      success: true,
      project: data
    });
  } catch (error: any) {
    console.error("Update project error:", error);
    return c.json({ error: `Failed to update project: ${error.message}` }, 500);
  }
});

// Delete a project
projects.delete("/:id", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.param('id');
    const supabase = getSupabaseClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('professional_projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return c.json({ error: "Project not found or access denied" }, 404);
    }

    // Delete project
    const { error: deleteError } = await supabase
      .from('professional_projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) {
      console.error("Delete project error:", deleteError);
      return c.json({ error: `Failed to delete project: ${deleteError.message}` }, 500);
    }

    return c.json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error: any) {
    console.error("Delete project error:", error);
    return c.json({ error: `Failed to delete project: ${error.message}` }, 500);
  }
});

export { projects };
