import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Calendar, 
  Download, 
  Clock, 
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  FileDown,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { reportService, ReportTemplate, ScheduledReport, ReportHistory } from '../services/report.service';

export function ReportBuilder() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'scheduled' |'history'>('templates');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [templatesData, scheduledData, historyData] = await Promise.all([
        reportService.getReportTemplates(),
        reportService.getScheduledReports(),
        reportService.getReportHistory(20)
      ]);

      setTemplates(templatesData);
      setScheduledReports(scheduledData);
      setReportHistory(historyData);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (templateId: string) => {
    const reportId = await reportService.generateReport(templateId);
    if (reportId) {
      // Show success message
      await loadData(); // Refresh data
    }
  };

  const handleToggleScheduled = async (id: string, isActive: boolean) => {
    const success = await reportService.toggleScheduledReport(id, !isActive);
    if (success) {
      await loadData();
    }
  };

  const tabs = [
    { value: 'templates' as const, label: 'Report Templates', icon: FileText },
    { value: 'scheduled' as const, label: 'Scheduled Reports', icon: Calendar },
    { value: 'history' as const, label: 'Report History', icon: Clock }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Builder</h1>
            <p className="text-gray-600 mt-1">Create, schedule, and export custom reports</p>
          </div>
        </div>

        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Create New Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <FileText className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Templates</p>
            </div>
            <p className="text-4xl font-bold mb-1">{templates.length}</p>
            <p className="text-xs opacity-75">Report templates</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <Calendar className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Scheduled</p>
            </div>
            <p className="text-4xl font-bold mb-1">{scheduledReports.filter(r => r.is_active).length}</p>
            <p className="text-xs opacity-75">Active schedules</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <Download className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Generated</p>
            </div>
            <p className="text-4xl font-bold mb-1">{reportHistory.length}</p>
            <p className="text-xs opacity-75">Total reports</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <Clock className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Recent</p>
            </div>
            <p className="text-4xl font-bold mb-1">
              {reportHistory.filter(r => {
                const hourAgo = new Date(Date.now() - 3600000);
                return new Date(r.generated_at) > hourAgo;
              }).length}
            </p>
            <p className="text-xs opacity-75">Last hour</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-gray-100 rounded-lg shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              relative px-6 py-3 text-sm font-medium rounded-md 
              transition-all duration-300 ease-out flex items-center gap-2
              ${
                activeTab === tab.value
                  ? 'text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
              }
            `}
            style={{
              background: activeTab === tab.value
                ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                : 'transparent'
            }}
          >
            {activeTab === tab.value && (
              <span 
                className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 blur-sm"
                style={{ zIndex: -1 }}
              />
            )}
            <tab.icon className="h-4 w-4" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'templates' && (
          <TemplatesTab 
            templates={templates} 
            onGenerate={handleGenerateReport}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'scheduled' && (
          <ScheduledTab 
            scheduled={scheduledReports} 
            onToggle={handleToggleScheduled}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab 
            history={reportHistory} 
            onRefresh={loadData}
          />
        )}
      </div>
    </div>
  );
}

// Templates Tab Component
function TemplatesTab({ 
  templates, 
  onGenerate,
  onRefresh 
}: { 
  templates: ReportTemplate[]; 
  onGenerate: (id: string) => void;
  onRefresh: () => void;
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'engagement': return 'bg-blue-100 text-blue-800';
      case 'performance': return 'bg-green-100 text-green-800';
      case 'geographic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Report Templates</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first report template to get started</p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Create Template
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(template.report_type)}`}>
                {template.report_type}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Data Sources:</p>
                <div className="flex flex-wrap gap-1">
                  {template.data_sources.map((source, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t">
                <button
                  onClick={() => onGenerate(template.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <Play className="h-4 w-4" />
                  Generate
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Scheduled Reports Tab Component
function ScheduledTab({ 
  scheduled, 
  onToggle, 
  onRefresh 
}: { 
  scheduled: ScheduledReport[]; 
  onToggle: (id: string, isActive: boolean) => void;
  onRefresh: () => void;
}) {
  const getScheduleText = (report: ScheduledReport) => {
    const { schedule_type, schedule_config } = report;
    const time = schedule_config.time || '09:00';

    switch (schedule_type) {
      case 'daily':
        return `Daily at ${time}`;
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = days[schedule_config.day_of_week || 1];
        return `Every ${day} at ${time}`;
      case 'monthly':
        return `Monthly on day ${schedule_config.day_of_month || 1} at ${time}`;
      default:
        return 'Custom schedule';
    }
  };

  const formatNextRun = (date: string | undefined) => {
    if (!date) return 'Not scheduled';
    const nextRun = new Date(date);
    const now = new Date();
    const diffMs = nextRun.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) return `in ${diffDays} days`;
    if (diffHours > 1) return `in ${diffHours} hours`;
    return 'Soon';
  };

  if (scheduled.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Scheduled Reports</h3>
            <p className="text-sm text-gray-500 mb-4">Schedule reports to run automatically</p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Schedule Report
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scheduled.map((report) => (
        <Card key={report.id} className={`${!report.is_active ? 'opacity-60' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    report.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {report.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  Template: <span className="font-medium">{report.template_name}</span>
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Schedule</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getScheduleText(report)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Next Run</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatNextRun(report.next_run_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Format</p>
                    <p className="text-sm font-medium text-gray-900 uppercase">
                      {report.export_format}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Recipients</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {report.recipients.length} people
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {report.recipients.slice(0, 3).map((email, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      {email}
                    </span>
                  ))}
                  {report.recipients.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      +{report.recipients.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onToggle(report.id, report.is_active)}
                  className={`p-2 rounded-lg transition-colors ${
                    report.is_active
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={report.is_active ? 'Pause' : 'Resume'}
                >
                  {report.is_active ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit className="h-5 w-5" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// History Tab Component
function HistoryTab({ 
  history, 
  onRefresh 
}: { 
  history: ReportHistory[];
  onRefresh: () => void;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'generating':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Report History</h3>
            <p className="text-sm text-gray-500">Generated reports will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Report Name</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Format</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Size</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Generated</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((report) => (
                <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.template_name}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {report.report_type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-gray-900 uppercase">
                      {report.export_format}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {formatFileSize(report.file_size)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {formatDate(report.generated_at)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {report.status === 'completed' && report.file_url && (
                      <button
                        onClick={() => window.open(report.file_url, '_blank')}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        <FileDown className="h-4 w-4" />
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
