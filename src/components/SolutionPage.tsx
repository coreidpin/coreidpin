import { motion } from 'motion/react';
import { Smartphone, Key, Lock, Webhook, LayoutDashboard, Shield } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const steps = [
  { icon: Smartphone, label: 'User enters phone number', color: '#bfa5ff' },
  { icon: Key, label: 'OTP verification', color: '#32f08c' },
  { icon: Lock, label: 'PIN minted and stored hashed', color: '#7bb8ff' },
  { icon: Shield, label: 'API returns verified data', color: '#bfa5ff' },
];

const apiFeatures = [
  { icon: Key, label: 'API Key', description: 'Secure authentication' },
  { icon: Shield, label: '/verify-pin', description: 'Verify identity' },
  { icon: Lock, label: '/pin/create', description: 'Create new PIN' },
  { icon: Webhook, label: 'Webhooks', description: 'Real-time events' },
  { icon: LayoutDashboard, label: 'Dashboard', description: 'Analytics & insights' },
];

export function SolutionPage() {
  return (
    <section id="solution" className="relative py-24 md:py-32 overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #0a0b0d 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-[#bfa5ff]/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#32f08c]/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block text-[#32f08c] tracking-[0.2em] text-sm mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            THE SOLUTION
          </motion.span>
          
          <h2 className="text-6xl md:text-7xl mb-8 text-foreground">
            Our Solution —<br />
            <span className="bg-gradient-to-r from-[#bfa5ff] to-[#7bb8ff] bg-clip-text text-transparent">
              Phone Number as PIN
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            PIN turns every verified phone number into a universal professional identity, 
            secured by encryption + optional blockchain proofs.
          </p>
        </motion.div>

        {/* Process Flow */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl text-center mb-12 text-foreground">
            How It Works
          </h3>
          
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-[#bfa5ff] via-[#32f08c] to-[#7bb8ff] hidden lg:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-center">
                      {/* Icon container */}
                      <motion.div
                        className="relative mx-auto w-32 h-32 mb-6 rounded-2xl flex items-center justify-center bg-card shadow-xl"
                        style={{ 
                          boxShadow: `0 10px 40px ${step.color}30`,
                        }}
                        whileHover={{ y: -8, boxShadow: `0 20px 60px ${step.color}40` }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Number badge */}
                        <div
                          className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: step.color }}
                        >
                          {index + 1}
                        </div>
                        
                        <Icon className="w-12 h-12" style={{ color: step.color }} />
                      </motion.div>
                      
                      {/* Label */}
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                        {step.label}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* API Integration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl text-center mb-4 text-foreground">
            How Businesses Plug In
          </h3>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Simple, powerful APIs for seamless integration
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {apiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  className="group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="relative p-6 rounded-2xl transition-all duration-300 hover:border-[#bfa5ff] hover:shadow-2xl">
                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#bfa5ff]/0 to-[#7bb8ff]/0 group-hover:from-[#bfa5ff]/5 group-hover:to-[#7bb8ff]/5 transition-all duration-300" />
                    
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#bfa5ff]/10 to-[#7bb8ff]/10 flex items-center justify-center mb-4 group-hover:from-[#bfa5ff]/20 group-hover:to-[#7bb8ff]/20 transition-all">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="text-sm mb-1 text-card-foreground">{feature.label}</div>
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Code snippet preview */}
        <motion.div
          className="mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="relative rounded-2xl overflow-hidden bg-[#0a0b0d] shadow-2xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-6 py-4 bg-[#1a1b2d] border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
              <span className="ml-4 text-sm text-white/50">API Example</span>
            </div>
            
            {/* Code */}
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm text-white/80">
                <code>
                  <span className="text-[#bfa5ff]">POST</span> <span className="text-white">/api/v1/pin/create</span>
                  {'\n\n'}
                  <span className="text-white/50">{'{'}</span>
                  {'\n  '}<span className="text-[#32f08c]">"phone"</span>: <span className="text-[#7bb8ff]">"+234 803 555 1212"</span>,
                  {'\n  '}<span className="text-[#32f08c]">"partner_token"</span>: <span className="text-[#7bb8ff]">"pk_live_..."</span>
                  {'\n'}<span className="text-white/50">{'}'}</span>
                  {'\n\n'}
                  <span className="text-white/50">// Response</span>
                  {'\n'}<span className="text-white/50">{'{'}</span>
                  {'\n  '}<span className="text-[#32f08c]">"pin"</span>: <span className="text-[#7bb8ff]">"PIN-234-8035551212"</span>,
                  {'\n  '}<span className="text-[#32f08c]">"status"</span>: <span className="text-[#7bb8ff]">"verified"</span>,
                  {'\n  '}<span className="text-[#32f08c]">"trust_score"</span>: <span className="text-[#7bb8ff]">0.92</span>
                  {'\n'}<span className="text-white/50">{'}'}</span>
                </code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}