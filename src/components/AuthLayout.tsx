import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { CheckCircle, Globe, Shield, Users } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showSidebar?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, showSidebar = true }) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useLayoutEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    handleResize();
    setIsLoaded(true);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isLoaded) return <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d' }} />;

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        width: '100%', 
        display: 'flex', 
        flexDirection: isDesktop ? 'row' : 'column',
        backgroundColor: '#08090a',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Narrative Sidebar */}
      {showSidebar && isDesktop && (
        <div 
          style={{ 
            width: '40%', 
            minWidth: '400px',
            backgroundColor: '#0d1117', 
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px'
          }}
        >
          {/* Ambient Background Glows */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', backgroundColor: 'rgba(52, 211, 153, 0.15)', borderRadius: '50%', filter: 'blur(120px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: '50%', filter: 'blur(120px)' }} />

          <div style={{ position: 'relative', zIndex: 10 }}>
            <Logo size="lg" style={{ marginBottom: '48px' }} />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                The global <br/>standard for <br/><span style={{ color: '#34d399' }}>verified identity.</span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '48px', maxWidth: '380px', lineHeight: 1.6 }}>
                Connect your phone number to a trusted professional PIN and unlock instant verification worldwide.
              </p>

              {/* Identity Card Visualization */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                style={{ 
                  backgroundColor: 'rgba(10, 11, 13, 0.8)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  padding: '32px',
                  border: '1px solid rgba(52, 211, 153, 0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(52, 211, 153, 0.1)',
                  maxWidth: '300px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ height: '40px', width: '40px', borderRadius: '12px', backgroundColor: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                      <CheckCircle style={{ height: '24px', width: '24px', color: '#34d399' }} />
                    </div>
                    <div style={{ padding: '4px 12px', borderRadius: '100px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', letterSpacing: '0.1em' }}>SECURE</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Global Identity PIN</div>
                    <div style={{ fontSize: '1.75rem', color: 'white', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.1em' }}>PIN-882-192</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.4)' }}>
              <Users size={16} />
              <span style={{ fontSize: '0.75rem' }}>128k+ users</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.4)' }}>
              <Globe size={16} />
              <span style={{ fontSize: '0.75rem' }}>60+ countries</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.4)' }}>
              <Shield size={16} />
              <span style={{ fontSize: '0.75rem' }}>ISO Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: isDesktop ? '64px' : '32px',
          backgroundColor: '#0a0b0d',
          overflowY: 'auto'
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          {!isDesktop && (
            <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'center' }}>
              <Logo size="md" />
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
