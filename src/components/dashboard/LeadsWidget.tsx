import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Shield, Mail, Calendar, ExternalLink, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { LeadReplyModal } from './LeadReplyModal';

interface JobLead {
  id: string;
  professional_id: string;
  sender_name: string;
  sender_email: string;
  inquiry_type: string;
  message: string;
  budget_range: string;
  created_at: string;
  status: string;
}

interface LeadsWidgetProps {
  professionalId?: string;
  currentPin?: string | null;
}

export function LeadsWidget({ professionalId, currentPin }: LeadsWidgetProps) {
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(professionalId || null);
  const [rpcErrorMsg, setRpcErrorMsg] = useState<string | null>(null);
  const [replyingLead, setReplyingLead] = useState<JobLead | null>(null);

  useEffect(() => {
    // If prop provided, use it and skip auth fetch if possible, or verify
    if (professionalId) {
       setCurrentUserId(professionalId);
    }
  }, [professionalId]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        let userId = professionalId;
        
        if (!userId) {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id;
          setCurrentUserId(userId || null);
        }
        
        // Try RPC first (more reliable permissions)
        let { data, error } = await supabase.rpc('get_my_leads');

        if (error) {
           setRpcErrorMsg(error.message);
           console.warn('[LeadsWidget] RPC failed, falling back to SELECT:', error);
           
           if (!userId) return; // Can't select without ID if fallback
           
           const result = await supabase
            .from('job_leads')
            .select('*')
            .eq('professional_id', userId) // Enforce filter explicitly
            .order('created_at', { ascending: false })
            .limit(5);
            
           data = result.data as any;
           error = result.error as any;
        } else {
           setRpcErrorMsg(null);
        }

        if (error) throw error;
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };



    fetchLeads();
  }, []);

  // Subscribe to changes once we have a user ID
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('job_leads_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'job_leads',
          filter: `professional_id=eq.${currentUserId}`
        },
        (payload) => {
          // Refetch leads manually since we can't easily call fetchLeads from here without adding it to dependency array and creating loop
          // Simplified: just update local state if we knew the shape, or simpler: trigger a re-fetch.
          // For now, let's just trigger a reload of window or re-call fetch logic.
          // Better: Extract fetchLeads to outside or use a refetch trigger.
          // Simplest: just append the new lead to state if it matches?
          // Let's just append it.
          const newLead = payload.new as JobLead;
          setLeads(prev => [newLead, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  if (loading) {
    return (
      <Card className="h-full border-none shadow-sm bg-white/50">
        <CardContent className="flex items-center justify-center p-6 min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-none shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Recent Inquiries
        </CardTitle>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          {leads.length} New
        </Badge>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p>No inquiries yet.</p>
            <p className="text-sm">Share your profile to get hired!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => {
              const initials = lead.sender_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={lead.id} className="group flex flex-col gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-100 hover:shadow-md transition-all duration-200">
                  {/* Top Row: Avatar, Name, Date */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
                      {initials}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{lead.sender_name}</h4>
                          {lead.status === 'new' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          {lead.sender_email}
                        </p>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal bg-gray-100 text-gray-600 hover:bg-gray-200 shrink-0">
                          {lead.inquiry_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Message Bubble */}
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed border border-gray-100 relative">
                     {/* Tiny arrow/triangle for bubble effect (optional, keep simple for now) */}
                    "{lead.message}"
                  </div>
                  
                  
                  {/* Footer: Budget & Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {lead.budget_range && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span>💰</span> {lead.budget_range}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="h-8 text-xs gap-2 px-4 shadow-sm hover:shadow transition-all bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setReplyingLead(lead)}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {lead.status === 'replied' ? 'Relpyd' : 'Reply'}
                    </Button>
                  </div>
                </div>
              );
            })}
            <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary h-9 mt-2 group">
              View All Messages
              <ExternalLink className="ml-2 h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        )}
      </CardContent>

      <LeadReplyModal
        isOpen={!!replyingLead}
        onClose={() => setReplyingLead(null)}
        lead={replyingLead}
        onReplySent={(leadId) => {
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'replied' } : l));
        }}
      />
    </Card>
  );
}
