import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Code, Play, Copy, Check, Key, Shield, Zap, 
  AlertCircle, CheckCircle, Clock, Activity 
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function APIPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState('verify');

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      id: 'verify',
      method: 'POST',
      path: '/api/v1/verify',
      title: 'Verify PIN',
      description: 'Verify if a PIN exists and get basic professional information',
      auth: true,
      rateLimit: '100/min',
      request: {
        pin: 'GPN-123456'
      },
      response: {
        valid: true,
        professional: {
          name: 'Jane Doe',
          title: 'Senior Software Engineer',
          verified: true,
          verification_date: '2024-01-15'
        }
      },
      curl: `curl -X POST https://api.gidipin.com/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"pin": "GPN-123456"}'`
    },
    {
      id: 'professional',
      method: 'GET',
      path: '/api/v1/professional/:pin',
      title: 'Get Professional Data',
      description: 'Access detailed professional data (requires user consent)',
      auth: true,
      rateLimit: '50/min',
      response: {
        pin: 'GPN-123456',
        profile: {
          name: 'Jane Doe',
          title: 'Senior Software Engineer',
          experience: [
            {
              company: 'Tech Corp',
              role: 'Senior Engineer',
              duration: '2020-Present'
            }
          ],
          skills: ['JavaScript', 'React', 'Node.js'],
          endorsements: 45
        },
        consent_expires: '2024-12-31T23:59:59Z'
      },
      curl: `curl -X GET https://api.gidipin.com/v1/professional/GPN-123456 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      id: 'signin',
      method: 'POST',
      path: '/api/v1/signin/initiate',
      title: 'Initiate Sign-In',
      description: 'Start PIN-based authentication flow',
      auth: true,
      rateLimit: '20/min',
      request: {
        pin: 'GPN-123456',
        redirect_uri: 'https://yourapp.com/callback'
      },
      response: {
        session_id: 'sess_abc123',
        authorization_url: 'https://gidipin.com/authorize?session=sess_abc123',
        expires_in: 300
      },
      curl: `curl -X POST https://api.gidipin.com/v1/signin/initiate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"pin":"GPN-123456","redirect_uri":"https://yourapp.com/callback"}'`
    }
  ];

  const statusCodes = [
    { code: '200', description: 'Success', color: '#32f08c' },
    { code: '201', description: 'Created', color: '#32f08c' },
    { code: '400', description: 'Bad Request', color: '#ff6b6b' },
    { code: '401', description: 'Unauthorized', color: '#ff6b6b' },
    { code: '404', description: 'Not Found', color: '#ff6b6b' },
    { code: '429', description: 'Rate Limit Exceeded', color: '#ffa500' },
    { code: '500', description: 'Server Error', color: '#ff6b6b' }
  ];

  const currentEndpoint = endpoints.find(e => e.id === activeEndpoint) || endpoints[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: '#7bb8ff', color: '#0a0b0d', border: 'none' }}>
              <Code className="w-4 h-4 mr-2" />
              API Reference
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
              GidiPIN REST API
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              Build with our powerful identity verification API. Simple, fast, and secure.
            </p>
            
            {/* Base URL */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="text-left">
                  <div className="text-sm text-white/60 mb-1">Base URL</div>
                  <code className="text-white font-mono">https://api.gidipin.com/v1</code>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyCode('https://api.gidipin.com/v1', 'base-url')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  {copiedCode === 'base-url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Zap, label: '< 100ms', desc: 'Avg Response', color: '#32f08c' },
              { icon: Shield, label: '99.9%', desc: 'Uptime SLA', color: '#7bb8ff' },
              { icon: Activity, label: '100/min', desc: 'Rate Limit', color: '#bfa5ff' },
              { icon: CheckCircle, label: 'REST', desc: 'API Type', color: '#32f08c' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-center">
                  <CardContent className="p-4">
                    <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
                    <div className="text-2xl font-bold text-white">{stat.label}</div>
                    <div className="text-xs text-white/60">{stat.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Key className="w-8 h-8" style={{ color: '#7bb8ff' }} />
            Authentication
          </h2>
          
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                All API requests require authentication using API keys. Include your API key in the <code className="bg-gray-100 px-2 py-1 rounded">Authorization</code> header as a Bearer token.
              </p>
              
              <div className="bg-black rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4" style={{ backgroundColor: '#000', color: '#fff' }}>
                <pre>Authorization: Bearer YOUR_API_KEY</pre>
              </div>

              <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-yellow-900">Keep your API keys secure</div>
                  <p className="text-sm text-yellow-800">Never expose API keys in client-side code or public repositories.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold mb-8">API Endpoints</h2>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Endpoint List */}
            <div className="lg:col-span-4 space-y-3">
              {endpoints.map((endpoint) => (
                <button
                  key={endpoint.id}
                  onClick={() => setActiveEndpoint(endpoint.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    activeEndpoint === endpoint.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      style={{
                        backgroundColor: endpoint.method === 'POST' ? '#7bb8ff' : '#32f08c',
                        color: '#fff'
                      }}
                    >
                      {endpoint.method}
                    </Badge>
                    <span className="text-xs text-gray-500">{endpoint.rateLimit}</span>
                  </div>
                  <div className="font-semibold text-sm mb-1">{endpoint.title}</div>
                  <code className="text-xs text-gray-600">{endpoint.path}</code>
                </button>
              ))}
            </div>

            {/* Endpoint Details */}
            <div className="lg:col-span-8">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{currentEndpoint.title}</h3>
                        <p className="text-gray-600">{currentEndpoint.description}</p>
                      </div>
                      <Badge
                        className="text-lg px-4 py-2"
                        style={{
                          backgroundColor: currentEndpoint.method === 'POST' ? '#7bb8ff' : '#32f08c',
                          color: '#fff'
                        }}
                      >
                        {currentEndpoint.method}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Auth Required
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {currentEndpoint.rateLimit}
                      </span>
                    </div>
                  </div>

                  <Tabs defaultValue="request" className="w-full">
                    <TabsList>
                      <TabsTrigger value="request">Request</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="request">
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Request Body</h4>
                          <button
                            onClick={() => copyCode(JSON.stringify(currentEndpoint.request || {}, null, 2), `req-${currentEndpoint.id}`)}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {copiedCode === `req-${currentEndpoint.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copy
                          </button>
                        </div>
                        <div className="bg-black rounded-lg p-4 font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                          <pre>{JSON.stringify(currentEndpoint.request || {}, null, 2)}</pre>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="response">
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Response Body</h4>
                          <button
                            onClick={() => copyCode(JSON.stringify(currentEndpoint.response, null, 2), `res-${currentEndpoint.id}`)}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {copiedCode === `res-${currentEndpoint.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copy
                          </button>
                        </div>
                        <div className="bg-black rounded-lg p-4 font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                          <pre>{JSON.stringify(currentEndpoint.response, null, 2)}</pre>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="curl">
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">cURL Command</h4>
                          <button
                            onClick={() => copyCode(currentEndpoint.curl, `curl-${currentEndpoint.id}`)}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {copiedCode === `curl-${currentEndpoint.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copy
                          </button>
                        </div>
                        <div className="bg-black rounded-lg p-4 font-mono text-sm overflow-x-auto" style={{ backgroundColor: '#000', color: '#fff' }}>
                          <pre>{currentEndpoint.curl}</pre>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Status Codes */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-6">HTTP Status Codes</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {statusCodes.map((status) => (
              <Card key={status.code} className="border-gray-200">
                <CardContent className="p-4 flex items-center gap-4">
                  <div 
                    className="text-2xl font-bold px-4 py-2 rounded-lg"
                    style={{ backgroundColor: `${status.color}20`, color: status.color }}
                  >
                    {status.code}
                  </div>
                  <div className="text-gray-700 font-medium">{status.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Start Building?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Get your API key and start integrating GidiPIN in minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/business">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Get API Key
                </Button>
              </a>
              <a href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10"
                >
                  View Full Docs
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
