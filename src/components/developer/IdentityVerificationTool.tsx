import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Search, Loader2, CheckCircle2, AlertCircle, Shield, MapPin, Briefcase } from 'lucide-react';
import { supabase, supabaseUrl } from '../../utils/supabase/client';
import { getProfileAvatar } from '../../utils/avatarUtils';

export function IdentityVerificationTool() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    let data: any = {};
    const toastId = toast.loading('Verifying PIN...');

    try {
      // Get current user ID to act as verifier_id
      const { data: { user } } = await supabase.auth.getUser();
      const verifierId = user?.id;

      // Call API Endpoint
      const baseUrl = supabaseUrl.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/functions/v1/auth-otp/verify-identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
            pin_number: pin.trim(),
            verifier_id: verifierId
        })
      });

      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Failed to parse response:', text);
        throw new Error('Invalid server response: ' + (text.substring(0, 100) || 'Empty response'));
      }

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setResult(data.data || {});
      toast.success('Identity verified successfully!', { id: toastId });

    } catch (err: any) {
      console.error('Verification error details:', err);
      // Show more details if available
      const detailMsg = data && data.details ? JSON.stringify(data.details) : '';
      setError((err.message || 'Verification failed.') + (detailMsg ? ` (${detailMsg})` : ''));
      toast.error(err.message || 'Verification failed.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
        <p className="text-gray-500 mt-2">
          Verify a professional's identity instantly using their GidiPIN.
        </p>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm border-t-4 border-t-purple-600">
        <CardContent className="p-6">
          <form onSubmit={handleVerify} className="relative">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter PIN (e.g. PIN-NG-2025-3E634F)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="pl-10 h-12 text-lg tracking-widest font-mono bg-gray-50 border-gray-200"
                />
              </div>
              <Button 
                type="submit" 
                className="h-12 px-8 bg-transparent hover:bg-gray-100 text-black font-semibold border border-gray-300"
                disabled={loading || pin.length < 18}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-1">
              Enter the full PIN code provided by the professional.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900">Verification Failed</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <Card className="bg-white border-green-100 shadow-lg animate-in zoom-in-95 duration-300 ring-1 ring-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-50 pb-4">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              <span>Identity Verified Successfully</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Center Aligned Layout */}
            <div className="flex flex-col items-center text-center">
              
              {/* Large Avatar */}
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-2xl bg-gray-100 p-1 shadow-inner overflow-hidden">
                  <img 
                    src={getProfileAvatar(result)} 
                    alt={result.full_name} 
                    className="h-full w-full object-cover rounded-xl"
                  />
                </div>
              </div>

              {/* Name & Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{result.full_name || result.name}</h3>

              {/* Badges Row */}
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                 <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 gap-1 px-3 py-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                 </Badge>
                 <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1 px-3 py-1">
                    <span className="text-xs">✨</span>
                    Beta Tester
                 </Badge>
                 {result.job_title && (
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 gap-1 px-3 py-1">
                        🏆 Top Talent
                    </Badge>
                 )}
              </div>

              <p className="text-lg text-gray-600 font-medium mb-6">{result.role || result.job_title || 'Professional'}</p>

              {/* Work Status Box */}
              <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6 flex items-center justify-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-medium text-gray-900">Actively Working • Remote</span>
              </div>

              {/* Stats/Info Row */}
              <div className="flex flex-wrap justify-center gap-3 w-full">
                  {result.city && (
                    <Badge variant="outline" className="text-gray-500 bg-white border-gray-200 px-4 py-2 font-normal text-sm gap-2 h-auto">
                      <MapPin className="h-4 w-4" /> {result.city}
                    </Badge>
                  )}
                  {result.industry && (
                    <Badge variant="outline" className="text-gray-500 bg-white border-gray-200 px-4 py-2 font-normal text-sm gap-2 h-auto">
                      <Briefcase className="h-4 w-4" /> {result.industry}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-gray-500 bg-white border-gray-200 px-4 py-2 font-normal text-sm gap-2 h-auto">
                      <span className="text-base">📅</span> 10 Years Exp.
                  </Badge>
              </div>

              {/* Work Experience Section */}
              {result.work_experiences && result.work_experiences.length > 0 && (
                <div className="w-full mt-8 text-left bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5" />
                    Recent Experience
                  </h4>
                  <div className="space-y-4">
                    {result.work_experiences.map((exp: any, i: number) => (
                      <div key={i} className="group flex gap-4">
                        <div className="flex-shrink-0 mt-1.5">
                           {exp.company_logo_url ? (
                              <img src={exp.company_logo_url} alt="" className="w-8 h-8 rounded-md object-contain bg-white border border-gray-100" />
                           ) : (
                              <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">
                                {exp.company_name?.substring(0, 2).toUpperCase()}
                              </div>
                           )}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start">
                             <h5 className="font-semibold text-gray-900 text-sm">{exp.job_title}</h5>
                             <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                               {new Date(exp.start_date).getFullYear()} - 
                               {exp.is_current ? 'Pres.' : new Date(exp.end_date).getFullYear()}
                             </span>
                           </div>
                           <div className="text-sm text-gray-600">{exp.company_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
              <div className="font-mono">ID: {result.id?.substring(0, 8)}...</div>
              <div>Verified at {new Date().toLocaleTimeString()}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
