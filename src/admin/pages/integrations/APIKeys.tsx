import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import { APIKeysTable, APIKey } from '../../components/integrations/APIKeysTable';
import { APIKeyDetailModal } from '../../components/integrations/APIKeyDetailModal';
import { CreateAPIKeyModal, CreateAPIKeyData } from '../../components/integrations/CreateAPIKeyModal';
import { supabase } from '../../../utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Search, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { toast } from '../../utils/toast';

export function APIKeysPage() {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  useEffect(() => {
    filterKeys();
  }, [apiKeys, searchQuery, statusFilter]);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      
      // Fetch API keys from Supabase
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching API keys:', error);
        throw error;
      }

      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      // Set empty array on error
      setApiKeys([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterKeys = () => {
    let filtered = [...apiKeys];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (key) =>
          key.name.toLowerCase().includes(query) ||
          key.client_name.toLowerCase().includes(query) ||
          key.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((key) => key.status === statusFilter);
    }

    setFilteredKeys(filtered);
  };

  const handleViewKey = (key: APIKey) => {
    setSelectedKey(key);
    setIsDetailModalOpen(true);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API Key Copied", {
      description: "The API key has been copied to your clipboard.",
    });
  };

  const handleRevokeKey = async (keyId: string) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      try {
        // In a real app, this would call an API endpoint
        // For now, we'll just update the local state to simulate revocation
        /*
        const { error } = await supabase
          .from('api_keys')
          .update({ status: 'revoked', revoked_at: new Date().toISOString() })
          .eq('id', keyId);

        if (error) throw error;
        */
        
        // Optimistic update
        setApiKeys(apiKeys.map(key => 
          key.id === keyId 
            ? { ...key, status: 'revoked', revoked_at: new Date().toISOString() } 
            : key
        ));
        
        toast.success("API Key Revoked", {
          description: "The API key has been successfully revoked.",
        });
      } catch (error) {
        console.error('Error revoking API key:', error);
        toast.error("Error", {
          description: "Failed to revoke API key. Please try again.",
        });
      }
    }
  };

  const handleCreateKey = async (keyData: CreateAPIKeyData) => {
    try {
      // In a real app, this would call an API endpoint to generate a secure key
      // For now, we'll simulate key creation
      
      const newKey: APIKey = {
        id: crypto.randomUUID(),
        name: keyData.name,
        key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        key_preview: `sk_live_...${Math.random().toString(36).substring(2, 6)}`,
        description: keyData.description,
        client_name: keyData.client_name,
        client_contact: keyData.client_contact,
        client_organization: keyData.client_organization,
        status: 'active',
        rate_limit: keyData.rate_limit,
        permissions: keyData.permissions,
        total_requests: 0,
        created_at: new Date().toISOString(),
        expires_at: keyData.expires_in_days > 0 
          ? new Date(Date.now() + keyData.expires_in_days * 24 * 60 * 60 * 1000).toISOString() 
          : undefined,
        created_by: 'current-admin-id',
      };

      /*
      const { error } = await supabase
        .from('api_keys')
        .insert([newKey]);

      if (error) throw error;
      */

      setApiKeys([newKey, ...apiKeys]);
      setIsCreateModalOpen(false);
      
      toast.success("API Key Created", {
        description: "The new API key has been successfully created.",
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error("Error", {
        description: "Failed to create API key. Please try again.",
      });
    }
  };

  const stats = {
    total: apiKeys.length,
    active: apiKeys.filter((key) => key.status === 'active').length,
    revoked: apiKeys.filter((key) => key.status === 'revoked').length,
    expired: apiKeys.filter((key) => key.status === 'expired').length,
  };

  return (
    <AdminLayout onLogout={() => window.location.href = '/login'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
              <p className="text-gray-500 mt-1">
                Manage API keys for external integrations and partners
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-black hover:bg-gray-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500">Total Keys</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-gray-500">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.revoked}</div>
              <p className="text-xs text-gray-500">Revoked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
              <p className="text-xs text-gray-500">Expired</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, client, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-black"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Keys Table */}
        <Card>
          <CardContent className="p-0">
            <APIKeysTable
              apiKeys={filteredKeys}
              isLoading={isLoading}
              onViewKey={handleViewKey}
              onCopyKey={handleCopyKey}
              onRevokeKey={handleRevokeKey}
            />
          </CardContent>
        </Card>

        {/* API Key Detail Modal */}
        <APIKeyDetailModal
          apiKey={selectedKey}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedKey(null);
          }}
        />

        {/* Create API Key Modal */}
        <CreateAPIKeyModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateKey}
        />
      </div>
    </AdminLayout>
  );
}
