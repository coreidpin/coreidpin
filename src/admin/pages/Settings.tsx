import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { GeneralSettingsForm } from '../components/settings/GeneralSettingsForm';
import { SecuritySettingsForm } from '../components/settings/SecuritySettingsForm';
import { AdminUserManagement } from '../components/settings/AdminUserManagement';
import { AuditLogViewer } from '../components/settings/AuditLogViewer';
import { Settings as SettingsIcon, Shield, Users, FileText } from 'lucide-react';

export default function Settings() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage system configuration and administrative access.
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-slate-200 dark:bg-slate-800">
          <TabsTrigger 
            value="general" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50 dark:text-slate-400"
          >
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50 dark:text-slate-400"
          >
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="admins" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50 dark:text-slate-400"
          >
            <Users className="h-4 w-4" />
            Admins
          </TabsTrigger>
          <TabsTrigger 
            value="logs" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50 dark:text-slate-400"
          >
            <FileText className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettingsForm />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySettingsForm />
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
