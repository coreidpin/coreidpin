import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Code2, Key, Zap, Shield, Users, Webhook, 
  ChevronRight, Copy, Check, ArrowRight, ExternalLink,
  FileText, Terminal, Cloud, Lock
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(191,165,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(191,165,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2 bg-[#bfa5ff] text-[#0a0b0d] border-0">
              <BookOpen className="h-4 w-4 mr-2" />
              API Documentation
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
              GidiPIN API
              <br />
              <span style={{ color: '#32f08c' }}>Developer Documentation</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Build trusted identity verification into your application in minutes.
              Complete API reference, SDKs, and integration guides.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Zap, label: '5 min', desc: 'Integration time', color: '#7bb8ff' },
              { icon: Shield, label: '99.9%', desc: 'Uptime SLA', color: '#bfa5ff' },
              { icon: Code2, label: '3', desc: 'Core APIs', color: '#32f08c' },
              { icon: Users, label: '50K+', desc: 'Verified users', color: '#7bb8ff' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-4 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="text-2xl font-bold text-white">{stat.label}</div>
                  <div className="text-sm text-white/60">{stat.desc}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Documentation */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b bg-transparent p-0 h-auto">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'authentication', label: 'Authentication', icon: Key },
                { id: 'apis', label: 'API Reference', icon: Code2 },
                { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                { id: 'sdks', label: 'SDKs', icon: Terminal }
              ].map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none pb-4"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-8 space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
                <p className="text-gray-600 mb-6">
                  GidiPIN provides a phone-based professional identity infrastructure. 
                  Integrate verified identity checks, professional data access, and passwordless authentication.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: Shield,
                      title: 'PIN Verification',
                      desc: 'Verify if a PIN exists and is valid',
                      color: '#7bb8ff'
                    },
                    {
                      icon: Users,
                      title: 'Professional Data',
                      desc: 'Access verified work history and skills',
                      color: '#bfa5ff'
                    },
                    {
                      icon: Zap,
                      title: 'Instant Sign-In',
                      desc: 'OAuth-like authentication flow',
                      color: '#32f08c'
                    }
                  ].map((feature, i) => (
                    <Card key={i} className="border-gray-200">
                      <CardContent className="p-6">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                          style={{ backgroundColor: `${feature.color}20` }}
                        >
                          <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Start */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Terminal className="w-6 h-6" />
                    Quick Start
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">1. Get API Key</span>
                      </div>
                      <div className="p-4 rounded-lg font-mono text-sm" style={{ backgroundColor: '#000', color: '#fff' }}>
                        Create account → Developer Console → Generate API Key
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">2. Install SDK (Optional)</span>
                        <button
                          onClick={() => copyCode('npm install @gidipin/sdk', 'npm')}
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {copiedCode === 'npm' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                      </div>
                      <div className="p-4 rounded-lg font-mono text-sm" style={{ backgroundColor: '#000', color: '#fff' }}>
                        npm install @gidipin/sdk
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">3. Make Your First Request</span>
                        <button
                          onClick={() => copyCode(`const gidipin = require('@gidipin/sdk');
gidipin.init({ apiKey: 'your-api-key' });

const result = await gidipin.verify('GPN-123456');
console.log(result);`, 'first-request')}
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {copiedCode === 'first-request' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                      </div>
                      <div className="p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                        <pre>{`const gidipin = require('@gidipin/sdk');
gidipin.init({ apiKey: 'your-api-key' });

const result = await gidipin.verify('GPN-123456');
console.log(result);`}</pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Authentication Tab */}
            <TabsContent value="authentication" className="mt-8 space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Authentication</h2>
                <p className="text-gray-600 mb-6">
                  All API requests require authentication using API keys. Include your API key in the <code className="bg-gray-100 px-2 py-1 rounded">Authorization</code> header.
                </p>

                <Card className="border-gray-200 mb-6">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Authentication Header</h3>
                    <div className="p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                      <pre>{`Authorization: Bearer YOUR_API_KEY`}</pre>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-1">Keep your API keys secure</h4>
                        <p className="text-sm text-yellow-800">
                          Never expose your API keys in client-side code. Always make API calls from your backend server.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* API Reference Tab */}
            <TabsContent value="apis" className="mt-8 space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">API Reference</h2>
                <p className="text-gray-600 mb-8">
                  Complete reference for all GidiPIN API endpoints.
                </p>

                {/* PIN Verification API */}
                <Card className="border-gray-200 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2" style={{ backgroundColor: '#7bb8ff', color: '#fff' }}>POST</Badge>
                        <h3 className="text-xl font-semibold">/api/v1/verify</h3>
                        <p className="text-gray-600 mt-1">Verify if a PIN exists and get basic information</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Request Body</h4>
                        <div className="p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                          <pre>{`{
  "pin": "GPN-123456"
}`}</pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Response</h4>
                        <div className="p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                          <pre>{`{
  "valid": true,
  "professional": {
    "name": "Jane Doe",
    "title": "Senior Software Engineer",
    "verified": true,
    "verification_date": "2024-01-15"
  }
}`}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Data API */}
                <Card className="border-gray-200 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2" style={{ backgroundColor: '#32f08c', color: '#000' }}>GET</Badge>
                        <h3 className="text-xl font-semibold">/api/v1/professional/:pin</h3>
                        <p className="text-gray-600 mt-1">Access detailed professional data (requires consent)</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Response</h4>
                        <div className="p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                          <pre>{`{
  "pin": "GPN-123456",
  "profile": {
    "name": "Jane Doe",
    "title": "Senior Software Engineer",
    "experience": [...],
    "skills": [...],
    "endorsements": 45
  },
  "consent_expires": "2024-12-31T23:59:59Z"
}`}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sign-In API */}
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2" style={{ backgroundColor: '#bfa5ff', color: '#fff' }}>POST</Badge>
                        <h3 className="text-xl font-semibold">/api/v1/signin/initiate</h3>
                        <p className="text-gray-600 mt-1">Initiate PIN-based authentication</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Request Body</h4>
                        <div className="p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                          <pre>{`{
  "pin": "GPN-123456",
  "redirect_uri": "https://yourapp.com/callback"
}`}</pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Response</h4>
                        <div className="p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                          <pre>{`{
  "session_id": "sess_abc123",
  "authorization_url": "https://gidipin.com/authorize?session=sess_abc123",
  "expires_in": 300
}`}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Webhooks Tab */}
            <TabsContent value="webhooks" className="mt-8 space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Webhooks</h2>
                <p className="text-gray-600 mb-6">
                  Receive real-time notifications about events in your integration.
                </p>

                <Card className="border-gray-200 mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Available Events</h3>
                    <div className="space-y-3">
                      {[
                        { event: 'verification.completed', desc: 'A user completed identity verification' },
                        { event: 'signin.success', desc: 'Successful sign-in via PIN' },
                        { event: 'consent.granted', desc: 'User granted data access consent' },
                        { event: 'consent.revoked', desc: 'User revoked data access consent' }
                      ].map((webhook, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg">
                          <code className="text-sm font-mono text-purple-600">{webhook.event}</code>
                          <p className="text-sm text-gray-600 mt-1">{webhook.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Webhook Payload Example</h3>
                    <div className="p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                      <pre>{`{
  "event": "verification.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "pin": "GPN-123456",
    "verification_status": "approved"
  }
}`}</pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* SDKs Tab */}
            <TabsContent value="sdks" className="mt-8 space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">SDKs & Libraries</h2>
                <p className="text-gray-600 mb-8">
                  Official SDKs to integrate GidiPIN in your preferred language.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { name: 'Node.js', command: 'npm install @gidipin/sdk', status: 'Available' },
                    { name: 'Python', command: 'pip install gidipin', status: 'Available' },
                    { name: 'PHP', command: 'composer require gidipin/sdk', status: 'Coming Soon' },
                    { name: 'Ruby', command: 'gem install gidipin', status: 'Coming Soon' }
                  ].map((sdk, i) => (
                    <Card key={i} className="border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{sdk.name}</h3>
                          <Badge variant={sdk.status === 'Available' ? 'default' : 'outline'}>
                            {sdk.status}
                          </Badge>
                        </div>
                        <div className="p-3 rounded-lg font-mono text-sm" style={{ backgroundColor: '#000', color: '#fff' }}>
                          {sdk.command}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Build?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Get started with GidiPIN API in minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#32f08c] hover:bg-[#2BB89A] text-black"
              >
                Get API Key
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                View Examples
                <ExternalLink className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
