import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { GeneralSettingsForm } from '../components/settings/GeneralSettingsForm';
import { SecuritySettingsForm } from '../components/settings/SecuritySettingsForm';
import { AdminUserManagement } from '../components/settings/AdminUserManagement';
import { AuditLogViewer } from '../components/settings/AuditLogViewer';
import { Settings as SettingsIcon, Shield, Users, FileText, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/card';

export default function Settings() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminSession');
    window.location.href = '/';
  };

  return (
    <AdminLayout breadcrumbs={['System', 'Settings']} onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: '#0A2540' }}>
              Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage system configuration and administrative access
            </p>
          </div>
        </div>
        </div>
        
        <Tabs defaultValue="general" className="space-y-6">
          <Card className="p-1.5 inline-flex bg-gray-100/80 border-transparent">
            <TabsList className="h-auto bg-transparent gap-1 p-0">
              <TabsTrigger 
                value="general" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#445DFF] data-[state=active]:shadow-sm text-gray-500 font-medium transition-all"
              >
                <SettingsIcon className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#445DFF] data-[state=active]:shadow-sm text-gray-500 font-medium transition-all"
              >
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="admins" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#445DFF] data-[state=active]:shadow-sm text-gray-500 font-medium transition-all"
              >
                <Users className="h-4 w-4" />
                Admins
              </TabsTrigger>
              <TabsTrigger 
                value="logs" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#445DFF] data-[state=active]:shadow-sm text-gray-500 font-medium transition-all"
              >
                <FileText className="h-4 w-4" />
                Audit Logs
              </TabsTrigger>
            </TabsList>
          </Card>

          <div className="mt-6">
            <TabsContent value="general" className="m-0 focus-visible:outline-none">
              <GeneralSettingsForm />
            </TabsContent>

            <TabsContent value="security" className="m-0 focus-visible:outline-none">
              <SecuritySettingsForm />
            </TabsContent>

            <TabsContent value="admins" className="m-0 focus-visible:outline-none">
              <AdminUserManagement />
            </TabsContent>

            <TabsContent value="logs" className="m-0 focus-visible:outline-none">
              <AuditLogViewer />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
