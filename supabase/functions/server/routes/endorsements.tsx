import { Hono } from "npm:hono";
import { getSupabaseClient, getAuthUser } from "../lib/supabaseClient.tsx";
import { sendEmail } from "../lib/email.ts";

const endorsements = new Hono();

// POST /endorsements/request-v2 - Request endorsement in v2 table (bypasses RLS)
endorsements.post("/request-v2", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const {
      endorser_name,
      endorser_email,
      endorser_role,
      endorser_company,
      endorser_linkedin_url,
      relationship_type,
      company_worked_together,
      time_worked_together_start,
      time_worked_together_end,
      project_context,
      suggested_skills,
      custom_message
    } = body;

    if (!endorser_name ||!endorser_email) {
      return c.json({ error: "Endorser name and email are required" }, 400);
    }

    const supabase = getSupabaseClient();

    // Check if endorser is a platform user
    let endorser_id: string | null = null;
    const { data: endorserProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', endorser_email)
      .single();
    
    endorser_id = endorserProfile?.user_id || null;

    // Generate verification token
    const verification_token = crypto.randomUUID();
    const verification_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Insert with service role (bypasses RLS)
    const { data: endorsement, error: insertError } = await supabase
      .from('professional_endorsements_v2')
      .insert({
        professional_id: user.id,
        endorser_id,
        endorser_name,
        endorser_email,
        endorser_role: endorser_role || null,
        endorser_company: endorser_company || null,
        endorser_linkedin_url: endorser_linkedin_url || null,
        relationship_type: relationship_type || null,
        company_worked_together: company_worked_together || null,
        time_worked_together_start: time_worked_together_start || null,
        time_worked_together_end: time_worked_together_end || null,
        project_context: project_context || null,
        skills_endorsed: suggested_skills || [],
        status: 'requested',
        verification_token,
        verification_expires_at: verification_expires_at.toISOString(),
        verification_method: endorser_id ? 'platform_user' : 'email',
        text: custom_message || 'Endorsement request pending',
        metadata: { custom_message }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Endorsement insert error:', insertError);
      return c.json({ success: false, error: insertError.message }, 400);
    }

    return c.json({ success: true, endorsement });
  } catch (error: any) {
    console.error('Request endorsement error:', error);
    return c.json({ success: false, error: 'Failed to request endorsement' }, 500);
  }
});

// GET /endorsements - List all endorsements for authenticated user
endorsements.get("/", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseClient();
    const status = c.req.query('status');

    let query = supabase
      .from('professional_endorsements')
      .select('*')
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      console.error("Fetch endorsements error:", fetchError);
      return c.json({ error: `Failed to fetch endorsements: ${fetchError.message}` }, 500);
    }

    return c.json({
      success: true,
      endorsements: data || []
    });
  } catch (error: any) {
    console.error("Get endorsements error:", error);
    return c.json({ error: `Failed to get endorsements: ${error.message}` }, 500);
  }
});

// POST /endorsements/request - Request endorsement in v1 table
endorsements.post("/request", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { endorser_name, endorser_id, role, company, text, endorser_email } = body;

    if (!endorser_name || !text || !endorser_email) {
      return c.json({ error: "Endorser name, email, and text are required" }, 400);
    }

    const supabase = getSupabaseClient();

    const { data, error: insertError } = await supabase
      .from('professional_endorsements')
      .insert({
        professional_id: user.id,
        endorser_name,
        endorser_id: endorser_id || null,
        role,
        company,
        text,
        status: 'pending',
        verified: false
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert endorsement error:", insertError);
      return c.json({ error: `Failed to request endorsement: ${insertError.message}` }, 500);
    }

    return c.json({
      success: true,
      endorsement: data
    });
  } catch (error: any) {
    console.error("Request endorsement error:", error);
    return c.json({ error: `Failed to request endorsement: ${error.message}` }, 500);
  }
});

// PUT /endorsements/:id/respond - Respond to endorsement
endorsements.put("/:id/respond", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const endorsementId = c.req.param('id');
    const body = await c.req.json();
    const { status } = body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return c.json({ error: "Status must be 'accepted' or 'rejected'" }, 400);
    }

    const supabase = getSupabaseClient();

    const { data: existing } = await supabase
      .from('professional_endorsements')
      .select('professional_id')
      .eq('id', endorsementId)
      .single();

    if (!existing || existing.professional_id !== user.id) {
      return c.json({ error: "Endorsement not found or access denied" }, 404);
    }

    const { data, error: updateError } = await supabase
      .from('professional_endorsements')
      .update({ status })
      .eq('id', endorsementId)
      .select()
      .single();

    if (updateError) {
      console.error("Update endorsement error:", updateError);
      return c.json({ error: `Failed to update endorsement: ${updateError.message}` }, 500);
    }

    return c.json({
      success: true,
      endorsement: data
    });
  } catch (error: any) {
    console.error("Respond to endorsement error:", error);
    return c.json({ error: `Failed to respond to endorsement: ${error.message}` }, 500);
  }
});

// DELETE /endorsements/:id - Delete endorsement
endorsements.delete("/:id", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const endorsementId = c.req.param('id');
    const supabase = getSupabaseClient();

    const { data: existing } = await supabase
      .from('professional_endorsements')
      .select('professional_id')
      .eq('id', endorsementId)
      .single();

    if (!existing || existing.professional_id !== user.id) {
      return c.json({ error: "Endorsement not found or access denied" }, 404);
    }

    const { error: deleteError } = await supabase
      .from('professional_endorsements')
      .delete()
      .eq('id', endorsementId);

    if (deleteError) {
      console.error("Delete endorsement error:", deleteError);
      return c.json({ error: `Failed to delete endorsement: ${deleteError.message}` }, 500);
    }

    return c.json({
      success: true,
      message: "Endorsement deleted successfully"
    });
  } catch (error: any) {
    console.error("Delete endorsement error:", error);
    return c.json({ error: `Failed to delete endorsement: ${error.message}` }, 500);
  }
});

export { endorsements };
