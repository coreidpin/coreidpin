import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Mail, TrendingUp, MousePointer, AlertCircle, 
  Send, Check, X, Clock, RefreshCw, Eye, Edit3, Users
} from 'lucide-react';
import { emailService, type EmailStatistics, type QueuedEmail, type EmailLog } from '../services/email.service';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

export default function EmailManagement() {
  const [stats, setStats] = useState<EmailStatistics | null>(null);
  const [queue, setQueue] = useState<QueuedEmail[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'compose' | 'queue' | 'logs'>('overview');
  const [statusFilter, setStatusFilter] = useState('all');

  // Compose form state
  const [recipientType, setRecipientType] = useState<'all' | 'professionals' | 'businesses' | 'individual'>('all');
  const [individualEmail, setIndividualEmail] = useState('');
  const [template, setTemplate] = useState('announcement');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [statsData, queueData, logsData] = await Promise.all([
        emailService.getStatistics(),
        emailService.getEmailQueue({ limit: 50 }),
        emailService.getEmailLogs({ limit: 50 })
      ]);

      setStats(statsData);
      setQueue(queueData.emails);
      setLogs(logsData.logs);
    } catch (error: any) {
      console.error('❌ Failed to load email data:', error);
      toast.error('Failed to load email data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryEmail = async (queueId: string) => {
    try {
      await emailService.retryEmail(queueId);
      toast.success('Email queued for retry');
      loadData();
    } catch (error: any) {
      toast.error('Failed to retry email');
    }
  };

  const handleCancelEmail = async (queueId: string) => {
    if (!confirm('Cancel this email?')) return;
    
    try {
      await emailService.cancelEmail(queueId);
      toast.success('Email cancelled');
      loadData();
    } catch (error: any) {
      toast.error('Failed to cancel email');
    }
  };

  const handleSendEmail = async () => {
    if (!subject || !message) {
      toast.error('Please fill in subject and message');
      return;
    }

    if (recipientType === 'individual' && !individualEmail) {
      toast.error('Please enter recipient email');
      return;
    }

    try {
      setSending(true);

      // Get recipients
      let recipients: Array<{ email: string; userId: string; name: string }> = [];

      if (recipientType === 'individual') {
        // Send to individual
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, email, name')
          .eq('email', individualEmail)
          .single();

        if (profile) {
          recipients = [{ email: profile.email, userId: profile.user_id, name: profile.name }];
        } else {
         toast.error('User not found');
          return;
        }
      } else {
        // Send to  group
        let query = supabase
          .from('profiles')
          .select('user_id, email, name, user_type');

        if (recipientType === 'professionals') {
          query = query.eq('user_type', 'professional');
        } else if (recipientType === 'businesses') {
          query = query.eq('user_type', 'business');
        }

        const { data: profiles } = await query;
        recipients = (profiles || []).map(p => ({ email: p.email, userId: p.user_id, name: p.name }));
      }

      if (recipients.length === 0) {
        toast.error('No recipients found');
        return;
      }

      // Queue emails
      let queued = 0;
      for (const recipient of recipients) {
        try {
          await emailService.queueEmail({
            userId: recipient.userId,
            toEmail: recipient.email,
            templateId: template,
            subject: subject,
            variables: {
              name: recipient.name,
              title: title || subject,
              message: message,
              type: 'info'
            },
            priority
          });
          queued++;
        } catch (error) {
          console.error(`Failed to queue email for ${recipient.email}:`, error);
        }
      }

      toast.success(`${queued} email(s) queued successfully`);
      
      // Reset form
      setSubject('');
      setTitle('');
      setMessage('');
      setIndividualEmail('');
      
      // Reload data
      loadData();
    } catch (error: any) {
      console.error('Failed to send emails:', error);
      toast.error('Failed to queue emails');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'opened':
        return 'bg-green-100 text-green-800';
      case 'clicked':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'bounced':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600 mt-1">Manage email notifications and view analytics</p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.total_sent.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">
                {stats?.delivery_rate}% delivered
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.open_rate}%
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">
                {stats?.total_opened.toLocaleString()} opened
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.click_rate}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MousePointer className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">
                {stats?.total_clicked.toLocaleString()} clicked
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Queue Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.pending_count}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">
                {stats?.total_failed} failed
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compose'
               ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Edit3 className="w-4 h-4 inline mr-2" />
            Compose
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'queue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Email Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Email Logs ({logs.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivery Rate</span>
                  <span className="font-semibold">{stats?.delivery_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Open Rate</span>
                  <span className="font-semibold">{stats?.open_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Click Rate</span>
                  <span className="font-semibold">{stats?.click_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bounce Rate</span>
                  <span className="font-semibold text-red-600">
                    {stats?.total_sent > 0 
                      ? ((stats.total_bounced / stats.total_sent) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {log.to_email}
                      </p>
                      <p className="text-xs text-gray-500">{log.template_id}</p>
                    </div>
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'compose' && (
        <Card>
          <CardHeader>
            <CardTitle>Compose & Send Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Recipient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Recipients
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                >
                  <option value="all">All Users</option>
                  <option value="professionals">All Professionals</option>
                  <option value="businesses">All Businesses</option>
                  <option value="individual">Individual User</option>
                </select>
              </div>

              {recipientType === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={individualEmail}
                    onChange={(e) => setIndividualEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />
                </div>
              )}

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Template
                </label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                >
                  <option value="announcement">Announcement</option>
                  <option value="welcome">Welcome Email</option>
                  <option value="verification">Verification</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject line"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  required
                />
              </div>

              {/* Title (for announcement template) */}
              {template === 'announcement' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Email message content..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  HTML formatting supported
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                >
                  <option value="high">High - Send immediately</option>
                  <option value="normal">Normal - Standard queue</option>
                  <option value="low">Low - Send when idle</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {recipientType === 'individual' 
                    ? '1 recipient' 
                    : recipientType === 'professionals'
                    ? 'All professionals will receive this email'
                    : recipientType === 'businesses'
                    ? 'All businesses will receive this email'
                    : 'All users will receive this email'}
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubject('');
                      setTitle('');
                      setMessage('');
                      setIndividualEmail('');
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={sending || !subject || !message}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Queue Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'queue' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Email Queue</CardTitle>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">To</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Template</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Attempts</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Scheduled</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue
                    .filter(email => statusFilter === 'all' || email.status === statusFilter)
                    .map((email) => (
                      <tr key={email.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{email.to_email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{email.template_id}</td>
                        <td className="py-3 px-4">
                          <Badge className={getPriorityColor(email.priority)}>
                            {email.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(email.status)}>
                            {email.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {email.attempts}/3
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(email.scheduled_for).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {email.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetryEmail(email.id)}
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                            )}
                            {email.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelEmail(email.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">To</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Template</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Opens</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Clicks</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{log.to_email}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.template_id}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.open_count}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.click_count}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
