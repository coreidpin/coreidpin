import React, { useState } from 'react';
import { Key, Calendar, Shield, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

interface CreateAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (keyData: CreateAPIKeyData) => void;
}

export interface CreateAPIKeyData {
  name: string;
  description: string;
  client_name: string;
  client_contact: string;
  client_organization: string;
  rate_limit: number;
  expires_in_days: number;
  permissions: string[];
}

export function CreateAPIKeyModal({ isOpen, onClose, onCreate }: CreateAPIKeyModalProps) {
  const [formData, setFormData] = useState<CreateAPIKeyData>({
    name: '',
    description: '',
    client_name: '',
    client_contact: '',
    client_organization: '',
    rate_limit: 1000,
    expires_in_days: 365,
    permissions: [],
  });

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const availablePermissions = [
    'read:users',
    'write:users',
    'read:projects',
    'write:projects',
    'read:endorsements',
    'write:endorsements',
    'read:identities',
    'admin:all',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      permissions: Array.from(selectedPermissions),
    });
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      client_name: '',
      client_contact: '',
      client_organization: '',
      rate_limit: 1000,
      expires_in_days: 365,
      permissions: [],
    });
    setSelectedPermissions(new Set());
    onClose();
  };

  const togglePermission = (permission: string) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    setSelectedPermissions(newPermissions);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Create New API Key
          </DialogTitle>
          <DialogDescription>
            Generate a new API key for external integrations and partners
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Key className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div>
              <Label htmlFor="name">API Key Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Production API Key"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this API key's purpose"
                rows={3}
              />
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Client Information
            </h3>
            
            <div>
              <Label htmlFor="client_name">Client Name *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="e.g., Acme Corp"
                required
              />
            </div>

            <div>
              <Label htmlFor="client_organization">Organization</Label>
              <Input
                id="client_organization"
                value={formData.client_organization}
                onChange={(e) => setFormData({ ...formData, client_organization: e.target.value })}
                placeholder="e.g., Acme Corporation Inc."
              />
            </div>

            <div>
              <Label htmlFor="client_contact">Contact Email</Label>
              <Input
                id="client_contact"
                type="email"
                value={formData.client_contact}
                onChange={(e) => setFormData({ ...formData, client_contact: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Configuration
            </h3>
            
            <div>
              <Label htmlFor="rate_limit">Rate Limit (requests/min) *</Label>
              <Select
                value={formData.rate_limit.toString()}
                onValueChange={(value) => setFormData({ ...formData, rate_limit: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 requests/min</SelectItem>
                  <SelectItem value="500">500 requests/min</SelectItem>
                  <SelectItem value="1000">1,000 requests/min</SelectItem>
                  <SelectItem value="5000">5,000 requests/min</SelectItem>
                  <SelectItem value="10000">10,000 requests/min</SelectItem>
                  <SelectItem value="50000">50,000 requests/min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expires_in_days">Expires In *</Label>
              <Select
                value={formData.expires_in_days.toString()}
                onValueChange={(value) => setFormData({ ...formData, expires_in_days: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="730">2 years</SelectItem>
                  <SelectItem value="-1">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {availablePermissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center space-x-2 p-2 rounded border cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.has(permission)}
                    onChange={() => togglePermission(permission)}
                    className="rounded"
                  />
                  <span className="text-sm font-mono">{permission}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button type="submit">
              Create API Key
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
