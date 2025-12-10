import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Search, Loader2, CheckCircle2, AlertCircle, Shield, MapPin, Briefcase } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
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

    try {
      // 1. Resolve PIN to User ID
      const { data: pinData, error: pinError } = await (supabase
        .from('professional_pins') as any)
        .select('user_id')
        .eq('pin_number', pin.trim())
        .single();

      if (pinError || !pinData) {
        throw new Error('PIN not found or invalid');
      }

      // 2. Fetch Profile Details
      const { data: profileData, error: profileError } = await (supabase
        .from('profiles') as any)
        .select('*')
        .eq('user_id', pinData.user_id)
        .single();

      if (profileError) {
        throw new Error('Associated profile not active');
      }

      setResult({
        ...profileData,
        pin_status: pinData.status
      });

    } catch (err: any) {
      console.error('Verification error details:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code
      });
      setError(err.message || 'Verification failed');
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
                disabled={loading || pin.length < 5}
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
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              
              {/* Avatar */}
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl bg-gray-100 p-1 shadow-inner">
                  <img 
                    src={getProfileAvatar(result)} 
                    alt={result.full_name} 
                    className="h-full w-full object-cover rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-100 text-green-700 p-1.5 rounded-full border border-white shadow-sm">
                  <Shield className="h-4 w-4" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{result.full_name || result.name}</h3>
                  <p className="text-gray-600 font-medium">{result.role || result.job_title || 'Professional'}</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                  {result.city && (
                    <Badge variant="outline" className="text-gray-600 bg-gray-50 font-normal">
                      <MapPin className="h-3 w-3 mr-1" /> {result.city}
                    </Badge>
                  )}
                  {result.industry && (
                    <Badge variant="outline" className="text-gray-600 bg-gray-50 font-normal">
                      <Briefcase className="h-3 w-3 mr-1" /> {result.industry}
                    </Badge>
                  )}
                  <Badge className="bg-green-600 hover:bg-green-700 font-normal">
                    Active Status: {result.pin_status || 'Good Standing'}
                  </Badge>
                </div>

                {result.bio && (
                  <p className="text-sm text-gray-500 mt-4 line-clamp-2 max-w-md">
                    {result.bio}
                  </p>
                )}
              </div>
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
