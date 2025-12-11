import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Code,
  Shield
} from 'lucide-react';

interface APIKey {
  id: string;
  key_name: string;
  api_key: string;
  api_secret: string;
  environment: 'sandbox' | 'production';
  permissions: {
    verify_pin: boolean;
    read_profile: boolean;
    instant_signin: boolean;
  };
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export function APIKeysManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnvironment, setNewKeyEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [newKeyPermissions, setNewKeyPermissions] = useState({
    verify_pin: true,
    read_profile: false,
    instant_signin: false,
  });
  const [newKeyRateLimits, setNewKeyRateLimits] = useState({
    per_minute: 60,
    per_day: 10000,
  });
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<APIKey | null>(null);

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Session expired. Please log out and back in.');
        return;
      }

      // Generate API key and secret
      const { data: generatedKey, error: keyError } = await supabase
        .rpc('generate_api_key');
      
      const { data: generatedSecret, error: secretError } = await supabase
        .rpc('generate_api_secret');

      if (keyError || secretError) throw keyError || secretError;

      // Insert new key
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          key_name: newKeyName.trim(),
          api_key: generatedKey,
          api_secret: generatedSecret,
          environment: newKeyEnvironment,
          permissions: {
            verify_pin: true,
            read_profile: newKeyEnvironment === 'production', 
            instant_signin: false
          }
        })
        .select()
        .single();

      if (error) throw error;

      setNewlyCreatedKey(data);
      setApiKeys([data, ...apiKeys]);
      toast.success('API key created successfully!');
      setNewKeyName('');
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast.error(error.message || 'Failed to create API key');
    }
  };

  const revokeAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, is_active: false } : key
      ));
      toast.success('API key revoked');
    } catch (error: any) {
      console.error('Error revoking key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast.success('API key deleted');
    } catch (error: any) {
      console.error('Error deleting key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const toggleReveal = (keyId: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(keyId)) {
      newRevealed.delete(keyId);
    } else {
      newRevealed.add(keyId);
    }
    setRevealedKeys(newRevealed);
  };

  const maskKey = (key: string) => {
    if (key.length < 12) return key;
    return key.substring(0, 12) + '•'.repeat(key.length - 12);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your API authentication keys for accessing GidiPIN services
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* Newly Created Key Modal */}
      {newlyCreatedKey && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                API Key Created Successfully!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Save these credentials securely. You won't be able to see the secret again.
              </p>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">API Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded text-sm text-gray-900 font-mono">
                      {newlyCreatedKey.api_key}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(newlyCreatedKey.api_key, 'API Key')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">API Secret</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded text-sm text-gray-900 font-mono">
                      {newlyCreatedKey.api_secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(newlyCreatedKey.api_secret, 'API Secret')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewlyCreatedKey(null)}
                className="mt-4"
              >
                Got it, close
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Key Form */}
      {showCreateModal && (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Create New API Key</CardTitle>
            <CardDescription className="text-gray-500">Generate a new key for API authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g., Production Server, Development Testing"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 focus:ring-purple-500"
              />
            </div>

            <div>
              <Label>Environment</Label>
              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  variant={newKeyEnvironment === 'sandbox' ? 'default' : 'outline'}
                  onClick={() => setNewKeyEnvironment('sandbox')}
                  className="flex-1"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Sandbox
                </Button>
                <Button
                  type="button"
                  variant={newKeyEnvironment === 'production' ? 'default' : 'outline'}
                  onClick={() => setNewKeyEnvironment('production')}
                  className="flex-1"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Production
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {newKeyEnvironment === 'sandbox' 
                  ? 'Use test data and mock PINs for development'
                  : 'Access real professional data (requires consent)'}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={createAPIKey} className="flex-1">
                Create Key
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <Card className="bg-gray-50 border-dashed border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No API Keys Yet</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Create your first API key to start integrating GidiPIN
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apiKeys.map((key) => (
            <Card key={key.id} className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{key.key_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={key.environment === 'production' ? 'default' : 'secondary'}>
                        {key.environment}
                      </Badge>
                      <Badge variant={key.is_active ? 'default' : 'destructive'}>
                        {key.is_active ? 'Active' : 'Revoked'}
                      </Badge>
                    </div>
                  </div>
                  {key.is_active && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => revokeAPIKey(key.id)}
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Revoke
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteAPIKey(key.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">API Key</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 rounded text-sm text-gray-900 font-mono">
                        {revealedKeys.has(key.id) ? key.api_key : maskKey(key.api_key)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleReveal(key.id)}
                      >
                        {revealedKeys.has(key.id) ? 
                          <EyeOff className="w-4 h-4" /> : 
                          <Eye className="w-4 h-4" />
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(key.api_key, 'API Key')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                    {key.last_used_at && (
                      <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
