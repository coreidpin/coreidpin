import { Hono } from "npm:hono";
import { getSupabaseClient, getAuthUser } from "../lib/supabaseClient.tsx";

const endorsements = new Hono();

// Get all endorsements for the authenticated user
endorsements.get("/", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseClient();
    const status = c.req.query('status'); // Optional filter by status

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

// Request a new endorsement
endorsements.post("/request", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { endorser_name, endorser_id, role, company, text } = body;

    if (!endorser_name || !text) {
      return c.json({ error: "Endorser name and text are required" }, 400);
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

// Respond to an endorsement (accept or reject)
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

    // Verify this endorsement belongs to the user
    const { data: existing } = await supabase
      .from('professional_endorsements')
      .select('professional_id')
      .eq('id', endorsementId)
      .single();

    if (!existing || existing.professional_id !== user.id) {
      return c.json({ error: "Endorsement not found or access denied" }, 404);
    }

    // Update endorsement status
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

// Delete an endorsement
endorsements.delete("/:id", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const endorsementId = c.req.param('id');
    const supabase = getSupabaseClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('professional_endorsements')
      .select('professional_id')
      .eq('id', endorsementId)
      .single();

    if (!existing || existing.professional_id !== user.id) {
      return c.json({ error: "Endorsement not found or access denied" }, 404);
    }

    // Delete endorsement
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
