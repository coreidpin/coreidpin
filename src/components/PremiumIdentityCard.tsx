import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Fingerprint,
  Share2,
  Wallet,
  ExternalLink,
  Copy,
  CheckCircle,
  Sparkles,
  Lock,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

interface PremiumIdentityCardProps {
  name: string;
  role: string;
  location: string;
  email?: string;
  phone?: string;
  industry?: string;
  pinNumber?: string;
  avatar?: string;
  verificationStatus?: 'verified' | 'pending' | 'beta';
  onGeneratePin?: () => void;
}

export function PremiumIdentityCard({
  name,
  role,
  location,
  email,
  phone,
  industry,
  pinNumber,
  avatar,
  verificationStatus = 'verified',
  onGeneratePin
}: PremiumIdentityCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (pinNumber) {
      navigator.clipboard.writeText(pinNumber);
      setCopied(true);
      toast.success('PIN copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share && pinNumber) {
      navigator.share({
        title: `${name}'s Professional Identity`,
        text: `Connect with me using GidiPIN PIN: ${pinNumber}`,
        url: `${window.location.origin}/pin/${pinNumber}`
      });
    } else {
      toast.info('Share functionality coming soon');
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20 transition-colors px-3 py-1">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20 transition-colors px-3 py-1">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Pending
          </Badge>
        );
      case 'beta':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20 transition-colors px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Beta Tester
          </Badge>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto perspective-1000"
    >
      <Card className="relative overflow-hidden bg-white border-0 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 opacity-[0.03]" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="relative p-6 sm:p-8 space-y-8">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                <Fingerprint className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">GidiPIN</h3>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Professional Identity</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Profile Identity Header */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full opacity-20 blur-sm" />
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl relative">
                <AvatarImage src={avatar} className="object-cover" />
                <AvatarFallback className="bg-slate-100 text-slate-600 text-2xl font-bold">
                  {name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {verificationStatus === 'verified' && (
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-slate-100">
                  <div className="bg-emerald-500 rounded-full p-1">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {name}
              </h2>
              <p className="text-base font-medium text-slate-600">{role}</p>
              <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500 pt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          {/* Professional Details Section */}
          <div className="grid gap-3 py-6 border-y border-slate-100">
            {email && (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Mail className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                </div>
                <span className="text-sm text-slate-600 font-medium truncate">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Phone className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                </div>
                <span className="text-sm text-slate-600 font-medium">{phone}</span>
              </div>
            )}
            {industry && (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Sparkles className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                </div>
                <span className="text-sm text-slate-600 font-medium">{industry}</span>
              </div>
            )}
          </div>

          {/* Secure PIN Module */}
          {pinNumber ? (
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20" />
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                      <Lock className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Secure PIN</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="text-center py-2">
                  <span className="text-3xl font-mono font-bold text-white tracking-[0.2em] drop-shadow-lg">
                    {pinNumber}
                  </span>
                </div>
                
                <p className="text-center text-[10px] text-slate-500 font-medium">
                  Share this PIN to verify your identity
                </p>
              </div>
            </div>
          ) : (
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/30 transition-all duration-500" />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300">
                  <Fingerprint className="h-6 w-6 text-blue-300" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white">Generate Your PIN</h4>
                  <p className="text-sm text-slate-300 max-w-[200px] mx-auto">
                    Create your unique professional identity number
                  </p>
                </div>

                <Button
                  onClick={onGeneratePin}
                  className="w-full bg-white text-slate-900 hover:bg-blue-50 font-semibold shadow-lg shadow-black/25 border-0"
                >
                  Generate Now
                </Button>
              </div>
            </div>
          )}

          {/* Verification QR Block */}
          {pinNumber && (
            <div className="flex justify-center pt-2">
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <QRCode
                  value={`${window.location.origin}/pin/${pinNumber}`}
                  size={100}
                  level="H"
                  fgColor="#0f172a"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {pinNumber && (
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex flex-col items-center gap-1 h-auto py-3 border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-[10px] font-medium">Share</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              >
                <Wallet className="h-4 w-4" />
                <span className="text-[10px] font-medium">Wallet</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-[10px] font-medium">Profile</span>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
