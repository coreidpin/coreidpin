import { Hono } from "npm:hono";
import { getSupabaseClient, getAuthUser } from "../lib/supabaseClient.tsx";
import * as kv from "../kv_store.tsx";

const matching = new Hono();

// Supabase client singleton
const supabase = getSupabaseClient();

// Get recommended profiles/jobs for swipe interface
matching.get("/recommendations", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userType = c.req.query('userType') || 'professional';
    const limit = parseInt(c.req.query('limit') || '20');

    if (userType === 'employer') {
      // Get professionals for employer
      const professionals = await kv.getByPrefix('profile:professional:');
      
      // Filter completed profiles and calculate match scores
      const recommendations = (professionals || [])
        .filter((profile: any) => profile?.profileComplete)
        .map((profile: any) => ({
          ...profile,
          matchScore: Math.floor(Math.random() * 30) + 70 // 70-100% match
        }))
        .sort((a: any, b: any) => b.matchScore - a.matchScore)
        .slice(0, limit);

      return c.json({
        success: true,
        recommendations,
        count: recommendations.length
      });
    } else {
      // Get jobs for professional - return mock jobs for now
      const mockJobs = Array.from({ length: limit }, (_, i) => ({
        id: `job-${i + 1}`,
        title: `Software Engineer ${i + 1}`,
        company: `Tech Corp ${i + 1}`,
        location: ['Remote', 'Lagos', 'Abuja'][i % 3],
        salaryRange: ['$60k-$80k', '$80k-$100k', '$100k-$120k'][i % 3],
        matchScore: Math.floor(Math.random() * 30) + 60 // 60-90% match
      }));

      return c.json({
        success: true,
        recommendations: mockJobs,
        count: mockJobs.length
      });
    }
  } catch (error) {
    console.log("Recommendations error:", error);
    return c.json({ error: `Failed to get recommendations: ${error.message}` }, 500);
  }
});

// Record swipe action and check for matches
matching.post("/swipe", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { targetId, targetType, direction } = body as { targetId: string; targetType: 'profile' | 'job'; direction: 'like' | 'dislike' };

    if (!targetId || !targetType || !direction) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const swipeKey = `swipe:${user.id}:${targetId}`;
    const swipeRecord = {
      userId: user.id,
      targetId,
      targetType,
      direction,
      timestamp: new Date().toISOString()
    };

    await kv.set(swipeKey, swipeRecord);

    let matchCreated = false;
    let matchId: string | null = null;

    // Check mutual like for profiles
    if (targetType === 'profile' && direction === 'like') {
      const reciprocal = await kv.get(`swipe:${targetId}:${user.id}`);
      if (reciprocal?.direction === 'like') {
        matchCreated = true;
        matchId = `${user.id}:${targetId}`;
        const matchKey = `match:${matchId}`;
        await kv.set(matchKey, {
          participants: [user.id, targetId],
          createdAt: new Date().toISOString(),
          status: 'active'
        });
      }
    }

    return c.json({ success: true, matchCreated, matchId });
  } catch (error) {
    console.log("Swipe error:", error);
    return c.json({ error: `Failed to record swipe: ${error.message}` }, 500);
  }
});

// Get matches for the current user
matching.get("/matches", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allMatches = await kv.getByPrefix('match:');
    const myMatches = (allMatches || []).filter((m: any) => Array.isArray(m?.participants) && m.participants.includes(user.id));

    return c.json({ success: true, matches: myMatches });
  } catch (error) {
    console.log("Matches fetch error:", error);
    return c.json({ error: `Failed to get matches: ${error.message}` }, 500);
  }
});

// Update match status
matching.put("/match/:matchId/status", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const matchId = c.req.param('matchId');
    const body = await c.req.json();
    const status = body?.status as 'active' | 'archived' | 'blocked';

    if (!status) {
      return c.json({ error: "Missing status" }, 400);
    }

    const matchKey = `match:${matchId}`;
    const match = await kv.get(matchKey);
    if (!match || !Array.isArray(match?.participants) || !match.participants.includes(user.id)) {
      return c.json({ error: "Match not found or unauthorized" }, 404);
    }

    await kv.set(matchKey, { ...match, status, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log("Match status update error:", error);
    return c.json({ error: `Failed to update status: ${error.message}` }, 500);
  }
});

// Send a message within a match
matching.post("/match/:matchId/message", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const matchId = c.req.param('matchId');
    const content = (await c.req.json())?.content as string;
    if (!content) {
      return c.json({ error: "Message content is required" }, 400);
    }

    const matchKey = `match:${matchId}`;
    const match = await kv.get(matchKey);
    if (!match || !Array.isArray(match?.participants) || !match.participants.includes(user.id)) {
      return c.json({ error: "Match not found or unauthorized" }, 404);
    }

    const messagesKey = `messages:${matchId}`;
    const messages = (await kv.get(messagesKey)) || [];
    const message = {
      id: `${Date.now()}`,
      from: user.id,
      content,
      timestamp: new Date().toISOString()
    };
    messages.push(message);
    await kv.set(messagesKey, messages);

    return c.json({ success: true, message });
  } catch (error) {
    console.log("Send message error:", error);
    return c.json({ error: `Failed to send message: ${error.message}` }, 500);
  }
});

// Get all messages for a match
matching.get("/match/:matchId/messages", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const matchId = c.req.param('matchId');
    const matchKey = `match:${matchId}`;
    const match = await kv.get(matchKey);
    if (!match || !Array.isArray(match?.participants) || !match.participants.includes(user.id)) {
      return c.json({ error: "Match not found or unauthorized" }, 404);
    }

    const messagesKey = `messages:${matchId}`;
    const messages = (await kv.get(messagesKey)) || [];
    messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return c.json({ success: true, messages });
  } catch (error) {
    console.log("Get messages error:", error);
    return c.json({ error: `Failed to get messages: ${error.message}` }, 500);
  }
});

export { matching };