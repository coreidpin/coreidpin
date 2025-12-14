import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import {
  Webhook,
  Plus,
  Trash2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy
} from 'lucide-react';

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret: string;
  created_at: string;
  last_triggered_at?: string;
  failure_rate?: number;
}

interface WebhooksManagerProps {
  businessId?: string;
  isLoading?: boolean;
}

const AVAILABLE_EVENTS = [
  { id: 'pin.verified', label: 'PIN Verified' },
  { id: 'profile.accessed', label: 'Profile Accessed' },
  { id: 'auth.signin', label: 'Instant Sign-in' },
  { id: 'quota.warning', label: 'Quota Warning' }
];

export function WebhooksManager({ businessId, isLoading }: WebhooksManagerProps) {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchWebhooks();
    }
  }, [businessId]);

  const fetchWebhooks = async () => {
    if (!businessId) {
      setFetching(false);
      return;
    }

    try {
      // Use database function to fetch webhooks (bypasses RLS but validates ownership)
      const { data, error } = await supabase
        .rpc('get_webhooks_for_business', {
          p_business_id: businessId
        });

      if (error) {
        // Check if function doesn't exist (migration not applied)
        if (error.code === '42883') {
          console.warn('Webhook function not found. Please apply migration.');
          setEndpoints([]);
          return;
        }
        throw error;
      }
      
      setEndpoints(data || []);
    } catch (error: any) {
      console.error('Error fetching webhooks:', error);
      toast.error('Failed to load webhooks');
    } finally {
      setFetching(false);
    }
  };

  const createWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    if (selectedEvents.length === 0) {
        toast.error('Select at least one event');
        return;
    }

    if (!businessId) {
      toast.error('Business profile required. Please save your profile in Settings first.');
      return;
    }

    setCreating(true);
    try {
      // Generate webhook secret
      const secret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Use database function to create webhook (bypasses RLS but validates ownership)
      const { data, error } = await supabase
        .rpc('create_webhook_for_business', {
          p_business_id: businessId,
          p_url: newUrl,
          p_events: selectedEvents,
          p_secret: secret
        });

      if (error) throw error;

      // The function returns an array with one row
      const webhookData = Array.isArray(data) ? data[0] : data;

      if (!webhookData) {
        throw new Error('Failed to create webhook');
      }

      setEndpoints([webhookData, ...endpoints]);
      setNewUrl('');
      setSelectedEvents([]);
      setShowCreateForm(false);
      toast.success('Webhook endpoint added');
    } catch (error: any) {
      console.error('Error creating webhook:', error);
      
      if (error.message?.includes('not found or unauthorized')) {
        toast.error('Business profile not found. Please save your profile in Settings first.');
      } else if (error.message?.includes('row-level security')) {
        toast.error('Permission denied. Please refresh the page and try again.');
      } else {
        toast.error(error.message || 'Failed to create webhook');
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook endpoint?')) return;
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEndpoints(endpoints.filter(ep => ep.id !== id));
      toast.success('Webhook deleted');
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  };

  const toggleWebhook = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      setEndpoints(endpoints.map(ep => 
        ep.id === id ? { ...ep, is_active: !currentState } : ep
      ));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
        setSelectedEvents(selectedEvents.filter(e => e !== eventId));
    } else {
        setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
    );
  }

  if (!businessId) {
    return (
        <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="flex flex-col items-center justify-center py-8">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Profile Required</h3>
                <p className="text-sm text-yellow-700 text-center mb-4">
                    Please complete your Business Profile in the Settings tab to enable Webhooks.
                </p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Webhooks</h2>
          <p className="text-sm text-gray-500 mt-1">
            Receive real-time event notifications to your server
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Endpoint
        </Button>
      </div>

      {showCreateForm && (
        <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-gray-900">Add Webhook Endpoint</CardTitle>
                <CardDescription>Configure where to send event payloads</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={createWebhook} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="url">Endpoint URL</Label>
                        <Input 
                            id="url"
                            placeholder="https://api.yourcompany.com/webhooks/gidipin"
                            value={newUrl}
                            onChange={e => setNewUrl(e.target.value)}
                            className="bg-white border-gray-200 text-gray-900"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Events to subscribe</Label>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            {AVAILABLE_EVENTS.map(event => (
                                <div key={event.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={event.id} 
                                        checked={selectedEvents.includes(event.id)}
                                        onCheckedChange={() => toggleEvent(event.id)}
                                    />
                                    <label
                                        htmlFor={event.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                                    >
                                        {event.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={creating} className="bg-purple-600 hover:bg-purple-700">
                            {creating ? 'Adding...' : 'Add Endpoint'}
                        </Button>
                        <Button variant="outline" type="button" onClick={() => setShowCreateForm(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-4">
        {endpoints.length === 0 && !fetching ? (
             <Card className="bg-gray-50 border-dashed border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Webhook className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Webhooks Configured</h3>
                    <p className="text-sm text-gray-500 text-center mb-4">
                        Add an endpoint to start listening for API events
                    </p>
                </CardContent>
             </Card>
        ) : (
            endpoints.map(endpoint => (
                <Card key={endpoint.id} className="bg-white border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <Badge variant={endpoint.is_active ? 'default' : 'secondary'} className={endpoint.is_active ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                                        {endpoint.is_active ? 'Active' : 'Disabled'}
                                    </Badge>
                                    <code className="text-sm font-semibold text-gray-900">{endpoint.url}</code>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                    <span>Created: {new Date(endpoint.created_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>Signing Secret: {endpoint.secret.substring(0, 8)}...</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {endpoint.events.map(ev => (
                                        <Badge key={ev} variant="outline" className="text-xs bg-gray-50 text-gray-600">
                                            {ev}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => toggleWebhook(endpoint.id, endpoint.is_active)}>
                                    {endpoint.is_active ? 'Disable' : 'Enable'}
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteWebhook(endpoint.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}
