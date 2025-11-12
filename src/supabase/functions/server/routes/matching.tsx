import { Hono } from "npm:hono";
import { getSupabaseClient, getAuthUser } from "../lib/supabaseClient.tsx";
import * as kv from "../kv_store.tsx";

const matching = new Hono();

// Supabase client singleton
const supabase = getSupabaseClient();

// Get recommended profiles/jobs for swipe interface
matching.get("/make-server-5cd3a043/recommendations", async (c) => {
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
      const recommendations = professionals
        .filter((profile: any) => profile.profileComplete)
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
        title: ['Senior Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'DevOps Engineer'][i % 5],
        company: ['TechCorp Global', 'Innovation Labs', 'Digital Solutions Inc', 'CloudWare', 'DataFlow Systems'][i % 5],
        location: 'Remote (Nigeria)',
        type: ['Remote', 'Hybrid', 'On-site'][i % 3],
        employmentType: ['Full-time', 'Part-time', 'Contract'][i % 3],
        salary: {
          min: 80000 + (i * 10000),
          max: 120000 + (i * 15000),
          currency: '$'
        },
        description: 'We are seeking a talented professional to join our dynamic team and contribute to exciting projects...',
        requirements: ['5+ years experience', 'Strong technical skills', 'Team player', 'Excellent communication'],
        benefits: ['Health insurance', 'Remote work', '401(k) matching', 'Professional development', 'Flexible hours'],
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Python'].slice(0, 4 + (i % 3)),
        postedDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        matchScore: Math.floor(Math.random() * 30) + 70
      }));

      return c.json({
        success: true,
        recommendations: mockJobs,
        count: mockJobs.length
      });
    }
  } catch (error: any) {
    console.log("Get recommendations error:", error);
    return c.json({ error: `Failed to get recommendations: ${error.message}` }, 500);
  }
});

// Record a swipe action
matching.post("/make-server-5cd3a043/swipe", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { targetId, direction, targetType } = body; // direction: 'left' (pass) or 'right' (like)

    if (!targetId || !direction || !targetType) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const swipeKey = `swipe:${user.id}:${targetId}`;
    
    await kv.set(swipeKey, {
      userId: user.id,
      targetId,
      targetType, // 'profile' or 'job'
      direction,
      timestamp: new Date().toISOString()
    });

    // Check for mutual like (match)
    let isMatch = false;
    if (direction === 'right') {
      // Check if the other party also liked
      const reverseSwipeKey = `swipe:${targetId}:${user.id}`;
      const reverseSwipe = await kv.get(reverseSwipeKey);
      
      if (reverseSwipe && reverseSwipe.direction === 'right') {
        isMatch = true;
        
        // Store the match
        const matchKey = `match:${[user.id, targetId].sort().join(':')}`;
        await kv.set(matchKey, {
          user1: user.id,
          user2: targetId,
          matchedAt: new Date().toISOString(),
          status: 'new'
        });
      }
    }

    return c.json({
      success: true,
      isMatch,
      message: isMatch ? "It's a match!" : "Swipe recorded"
    });
  } catch (error: any) {
    console.log("Swipe error:", error);
    return c.json({ error: `Failed to record swipe: ${error.message}` }, 500);
  }
});

// Get user's matches
matching.get("/make-server-5cd3a043/matches", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all matches involving this user
    const allMatches = await kv.getByPrefix('match:');
    
    const userMatches = allMatches.filter((match: any) => 
      match.user1 === user.id || match.user2 === user.id
    );

    // Enrich matches with profile data
    const enrichedMatches = await Promise.all(
      userMatches.map(async (match: any) => {
        const otherUserId = match.user1 === user.id ? match.user2 : match.user1;
        const otherUserProfile = await kv.get(`user:${otherUserId}`) || 
                                 await kv.get(`profile:professional:${otherUserId}`);
        
        return {
          id: match.matchKey,
          ...match,
          otherUser: otherUserProfile
        };
      })
    );

    return c.json({
      success: true,
      matches: enrichedMatches,
      count: enrichedMatches.length
    });
  } catch (error: any) {
    console.log("Get matches error:", error);
    return c.json({ error: `Failed to get matches: ${error.message}` }, 500);
  }
});

// Update match status (messaged, interview scheduled, etc.)
matching.put("/make-server-5cd3a043/match/:matchId/status", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const matchId = c.req.param('matchId');
    const body = await c.req.json();
    const { status } = body;

    const match = await kv.get(`match:${matchId}`);
    
    if (!match) {
      return c.json({ error: "Match not found" }, 404);
    }

    // Verify user is part of this match
    if (match.user1 !== user.id && match.user2 !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await kv.set(`match:${matchId}`, {
      ...match,
      status,
      updatedAt: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: "Match status updated"
    });
  } catch (error: any) {
    console.log("Update match status error:", error);
    return c.json({ error: `Failed to update match: ${error.message}` }, 500);
  }
});

// Send message in match
matching.post("/make-server-5cd3a043/match/:matchId/message", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const matchId = c.req.param('matchId');
    const body = await c.req.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return c.json({ error: "Message cannot be empty" }, 400);
    }

    const match = await kv.get(`match:${matchId}`);
    
    if (!match) {
      return c.json({ error: "Match not found" }, 404);
    }

    // Verify user is part of this match
    if (match.user1 !== user.id && match.user2 !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    // Store message
    const messageKey = `message:${matchId}:${Date.now()}`;
    await kv.set(messageKey, {
      matchId,
      senderId: user.id,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });

    // Update match with last message
    await kv.set(`match:${matchId}`, {
      ...match,
      lastMessage: message,
      lastMessageAt: new Date().toISOString(),
      status: match.status === 'new' ? 'messaged' : match.status
    });

    return c.json({
      success: true,
      message: "Message sent"
    });
  } catch (error: any) {
    console.log("Send message error:", error);
    return c.json({ error: `Failed to send message: ${error.message}` }, 500);
  }
});

// Get messages for a match
matching.get("/make-server-5cd3a043/match/:matchId/messages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const matchId = c.req.param('matchId');
    const match = await kv.get(`match:${matchId}`);
    
    if (!match) {
      return c.json({ error: "Match not found" }, 404);
    }

    // Verify user is part of this match
    if (match.user1 !== user.id && match.user2 !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    // Get all messages for this match
    const allMessages = await kv.getByPrefix(`message:${matchId}:`);
    
    // Sort by timestamp
    const messages = allMessages.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return c.json({
      success: true,
      messages,
      count: messages.length
    });
  } catch (error: any) {
    console.log("Get messages error:", error);
    return c.json({ error: `Failed to get messages: ${error.message}` }, 500);
  }
});

export { matching };
