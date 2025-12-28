import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Shield, CheckCircle, XCircle, Award, TrendingUp, User, Phone } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

// Demo PINs for testing - these always work
const DEMO_PINS: Record<string, any> = {
  '08012345678': {
    name: 'John Doe',
    title: 'Senior Software Engineer',
    location: 'Lagos, Nigeria',
    verified_status: true,
    profile_completeness: 95,
    badges: ['verified', 'top-rated', 'featured'],
    member_since: '2024-01-15'
  },
  '08098765432': {
    name: 'Jane Smith',
    title: 'Product Designer',
    location: 'Abuja, Nigeria',
    verified_status: true,
    profile_completeness: 88,
    badges: ['verified', 'creative'],
    member_since: '2024-03-20'
  },
  'GPN-123456': {
    name: 'Michael Johnson',
    title: 'Data Analyst',
    location: 'Port Harcourt, Nigeria',
    verified_status: true,
    profile_completeness: 92,
    badges: ['verified', 'data-expert'],
    member_since: '2024-02-10'
  },
  'GPN-DEMO01': {
    name: 'Sarah Williams',
    title: 'Marketing Specialist',
    location: 'Ibadan, Nigeria',
    verified_status: true,
    profile_completeness: 85,
    badges: ['verified'],
    member_since: '2024-04-05'
  }
};

export function VerifyPINPage() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin) {
      toast.error('Please enter a PIN to verify');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // Check if it's a demo PIN first
      const demoData = DEMO_PINS[pin];
      if (demoData) {
        setResult({
          verified: true,
          pin: pin,
          professional: demoData,
          isDemo: true
        });
        toast.success('✅ PIN verified successfully! (Demo)');
        setLoading(false);
        return;
      }

      // Try to verify by phone number - query profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          phone_number,
          full_name,
          user_type,
          created_at
        `)
        .eq('phone_number', pin)
        .maybeSingle() as { 
          data: {
            id: string;
            user_id: string;
            phone_number: string | null;
            full_name: string | null;
            user_type: string | null;
            created_at: string;
          } | null; 
          error: any;
        };

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      if (!profile) {
        // No profile found - provide helpful error
        setResult({
          verified: false,
          error: 'PIN not found. Try one of these demo PINs: 08012345678, 08098765432, GPN-123456'
        });
        toast.error('❌ No professional found. Try a demo PIN!');
      } else {
        setResult({
          verified: true,
          pin: profile.phone_number || pin,
          professional: {
            name: profile.full_name || 'Professional User',
            title: profile.user_type === 'professional' ? 'Verified Professional' : 'User',
            location: 'Nigeria',
            verified_status: true,
            profile_completeness: 75,
            badges: ['verified'],
            member_since: profile.created_at
          }
        });
        toast.success('✅ PIN verified successfully!');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setResult({
        verified: false,
        error: 'Failed to verify PIN. Try demo PIN: 08012345678'
      });
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: '#7bb8ff', color: '#0a0b0d', border: 'none' }}>
              <Shield className="w-4 h-4 mr-2" />
              PIN Verification
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
              Verify a Professional
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Instantly verify professional credentials and identity. Enter a GidiPIN to see verified information.
            </p>
          </motion.div>

          {/* Verification Form */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-8">
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Enter Professional's PIN
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="e.g., 08012345678 or GPN-123456"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                  </div>
                  <p className="mt-2 text-sm text-white/60">
                    Try demo PINs: <span className="text-white/90 font-mono">08012345678</span>, <span className="text-white/90 font-mono">08098765432</span>, or <span className="text-white/90 font-mono">GPN-123456</span>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !pin}
                  className="w-full text-lg py-6"
                  style={{ backgroundColor: '#7bb8ff', color: '#fff' }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Verify PIN
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {result.verified ? (
                <Card className="border-2 border-emerald-500">
                  <CardContent className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-emerald-600">PIN Verified!</h2>
                          <p className="text-gray-600">This professional's identity has been verified</p>
                        </div>
                      </div>
                      <Badge style={{ backgroundColor: '#32f08c', color: '#fff' }}>
                        VERIFIED
                      </Badge>
                    </div>

                    {/* Professional Info */}
                    <div className="border-t border-gray-200 pt-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Name</div>
                          <div className="font-semibold text-lg">{result.professional.name}</div>
                        </div>
                        
                        {result.professional.title && (
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Professional Title</div>
                            <div className="font-semibold">{result.professional.title}</div>
                          </div>
                        )}

                        {result.professional.location && (
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Location</div>
                            <div className="font-semibold">{result.professional.location}</div>
                          </div>
                        )}

                        <div>
                          <div className="text-sm text-gray-500 mb-1">Member Since</div>
                          <div className="font-semibold">
                            {new Date(result.professional.member_since).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Shield className="w-5 h-5 text-blue-600" />
                              <div className="text-sm font-medium text-blue-900">Verification</div>
                            </div>
                            <div className="text-2xl font-bold" style={{ color: result.professional.verified_status ? '#32f08c' : '#ffa500' }}>
                              {result.professional.verified_status ? 'Verified' : 'Pending'}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-purple-50 border-purple-200">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-purple-600" />
                              <div className="text-sm font-medium text-purple-900">Profile</div>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              {result.professional.profile_completeness}%
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-amber-50 border-amber-200">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Award className="w-5 h-5 text-amber-600" />
                              <div className="text-sm font-medium text-amber-900">Badges</div>
                            </div>
                            <div className="text-2xl font-bold text-amber-600">
                              {result.professional.badges.length}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Badges */}
                      {result.professional.badges.length > 0 && (
                        <div className="mt-6">
                          <div className="text-sm text-gray-500 mb-3">Badges & Achievements</div>
                          <div className="flex flex-wrap gap-2">
                            {result.professional.badges.map((badge: string, i: number) => (
                              <Badge key={i} style={{ backgroundColor: '#bfa5ff20', color: '#7c3aed', border: 'none' }}>
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-4">
                        Want to access more detailed professional information? Get API access to integrate GidiPIN verification.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => window.location.href = '/business'}
                          style={{ backgroundColor: '#7bb8ff', color: '#fff' }}
                        >
                          Get API Access
                        </Button>
                        <Button
                          onClick={() => setResult(null)}
                          variant="outline"
                        >
                          Verify Another PIN
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-red-500">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">PIN Not Verified</h2>
                    <p className="text-gray-600 mb-6">
                      {result.error || 'The PIN you entered could not be verified.'}
                    </p>
                    <Button
                      onClick={() => setResult(null)}
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">How PIN Verification Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '1',
                title: 'Enter PIN',
                description: 'Input the professional\'s phone number or GidiPIN',
                color: '#7bb8ff'
              },
              {
                number: '2',
                title: 'Instant Verification',
                description: 'Our system checks the PIN against verified records',
                color: '#bfa5ff'
              },
              {
                number: '3',
                title: 'View Results',
                description: 'See verified information and credentials instantly',
                color: '#32f08c'
              }
            ].map((step, i) => (
              <Card key={i} className="border-gray-200 text-center">
                <CardContent className="p-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
