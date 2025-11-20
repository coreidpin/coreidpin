import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Logo } from './Logo';
import { AnnouncementBanner } from './AnnouncementBanner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Menu, 
  ChevronDown,
  Building,
  UserCheck,
  BookOpen,
  HelpCircle,
  Phone,
  LogIn,
  User
} from 'lucide-react';

interface NavbarProps {
  currentPage?: string;
  onNavigate: (page: string) => void;
  onLogin?: (userType: 'employer' | 'professional' | 'university') => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
  userType?: string;
}

export function Navbar({ 
  currentPage = 'landing', 
  onNavigate, 
  onLogin, 
  onLogout, 
  isAuthenticated = false,
  userType 
}: NavbarProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const isLight = currentPage === 'landing';
  const isProd = import.meta.env.PROD;

  useEffect(() => {
    try {
      const existing = localStorage.getItem('cookieConsent');
      if (!existing) setShowCookieConsent(true);
    } catch {}
  }, []);

  const acceptAllCookies = () => {
    try {
      localStorage.setItem('cookieConsent', 'all');
      document.cookie = `cookie_consent=all; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } catch {}
    setShowCookieConsent(false);
  };

  const rejectAllCookies = () => {
    try {
      localStorage.setItem('cookieConsent', 'none');
      document.cookie = `cookie_consent=none; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } catch {}
    setShowCookieConsent(false);
  };

  const navigationItems = [
    {
      label: 'About',
      items: [
        { label: 'Our Story', href: '/our-story' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Trust & Safety', href: '/trust-safety' }
      ]
    },
    {
      label: 'Solutions',
      items: [
        { label: 'For Employers', href: '/employers', icon: Building },
        { label: 'For Professionals', href: '/professionals', icon: UserCheck },
        // { label: 'For Universities', href: '/universities', icon: GraduationCap }
      ]
    },
    {
      label: 'Resources',
      items: [
        { label: 'Help Center', href: '/help', icon: HelpCircle },
        { label: 'Contact', href: '/contact', icon: Phone },
        { label: 'Documentation', href: '/docs', icon: BookOpen }
      ]
    }
  ];

  const handleNavigate = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleLogin = (type: 'employer' | 'professional' | 'university') => {
    onLogin?.(type);
    setIsMobileMenuOpen(false);
  };

  const DesktopDropdown = ({ item }: { item: typeof navigationItems[0] }) => (
    <div className="relative group">
      <button
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-accent/50"
        onMouseEnter={() => setActiveDropdown(item.label)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        {item.label}
        <motion.div
          animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {activeDropdown === item.label && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full -left-4 mt-2 w-64 bg-card border border-border shadow-xl z-50 overflow-hidden"
            onMouseEnter={() => setActiveDropdown(item.label)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="p-1">
              <div className="p-3 border-b border-border bg-muted/30">
                <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                  {item.label}
                </h4>
              </div>
              <div className="p-2 space-y-1">
                {item.items.map((subItem, index) => (
                  <motion.button
                    key={subItem.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigate(subItem.href)}
                    className="flex items-center gap-3 w-full px-3 py-3 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200 group/item"
                  >
                    {subItem.icon && (
                      <subItem.icon className="h-4 w-4 text-primary group-hover/item:text-primary" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{subItem.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <AnnouncementBanner 
        message="We are launching soon, Join our beta forum to learn more"
        type="promotional"
        dismissible={true}
      />
      <Dialog open={showCookieConsent} onOpenChange={setShowCookieConsent}>
        <DialogContent className="bg-white text-black rounded-3xl border-0 shadow-2xl p-8 max-w-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-semibold">Choose your cookies</DialogTitle>
            <DialogDescription className="text-base text-black/70">
              To provide the best experiences, we may use technologies like cookies to store and/or access device information. Consenting will allow us to process data such as browsing behavior on this site. Not consenting may adversely affect certain features and functions.
            </DialogDescription>
          </DialogHeader>
          <div>
            <button
              onClick={() => navigate('/cookies')}
              className="underline underline-offset-4 mb-4"
              style={{ color: '#2F4F2F' }}
            >
              Learn more and manage
            </button>
          </div>
          <div className="space-y-3">
            <Button
              size="lg"
              onClick={acceptAllCookies}
              className="w-full rounded-full h-12 text-base shadow-sm"
              style={{ backgroundColor: '#2F4F2F', color: '#ffffff' }}
            >
              Accept all
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={rejectAllCookies}
              className="w-full rounded-full h-12 text-base"
              style={{ border: '2px solid #2F4F2F', color: '#2F4F2F', background: 'transparent' }}
            >
              Reject all
            </Button>
          </div>
          <div className="pt-3 text-center">
            <button
              onClick={() => navigate('/cookies')}
              className="underline underline-offset-4"
              style={{ color: '#2F4F2F' }}
            >
              View Cookies Policy
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-[#0a0b0d]/95 text-white backdrop-blur-md sticky top-0 z-50 shadow-sm border-white/10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Logo size="md" isLight={isLight} showText={false} onClick={() => handleNavigate('/')} />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            {!isAuthenticated && navigationItems.map((item) => (
              <DesktopDropdown key={item.label} item={item} />
            ))}
            
            {isAuthenticated && (
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">
                    {userType === 'employer' && 'Employer Dashboard'}
                    {userType === 'professional' && 'Professional Dashboard'}
                    {/* {userType === 'university' && 'University Dashboard'} */}
                  </span>
                </div>
              </div>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={isProd}
                  onClick={() => { if (isProd) return; navigate('/login'); }}
                  className={isLight ? "hover:bg-white/10 transition-colors" : "hover:bg-primary/10 transition-colors"}
                  style={isLight ? { color: '#69798f' } : undefined}
                >
                  Login
                </Button>
                <div className="w-px h-6 bg-border"></div>
                <Button 
                  variant={isLight ? "ghost" : "default"}
                  size="sm"
                  disabled={isProd}
                  onClick={() => { if (isProd) return; handleLogin('professional'); }}
                  className={isLight ? "hover:bg-white/10 transition-colors" : ""}
                  style={isLight ? { color: '#69798f' } : undefined}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  <span className="hidden xl:inline">Get Started</span>
                  <span className="xl:hidden">Join</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onLogout} 
                  size="sm"
                  className="border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-[var(--brand-primary-contrast)] transition-colors"
                >
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="lg:hidden flex-shrink-0 bg-white text-black hover:bg-white hover:text-black"
                >
                  <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-[350px] p-0 bg-[#0a0b0d] text-white border-l border-white/10">
              <SheetHeader className="px-6 py-4 border-b border-white/10">
                <SheetTitle className="flex items-center gap-2 text-left text-white">
                  <Logo size="sm" isLight={false} showText={false} />
                </SheetTitle>
                <SheetDescription className="text-left text-white/70">
                  Navigate through swipe platform sections and features
                </SheetDescription>
              </SheetHeader>
              
              <div className="px-4 py-6 space-y-6 overflow-y-auto flex-1">
                {!isAuthenticated ? (
                  <>
                    {/* Mobile Navigation - Card Style */}
                    <div className="space-y-4">
                      {navigationItems.map((item, idx) => (
                        <motion.div 
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          <h4 className="font-semibold text-xs text-white/50 uppercase tracking-wider mb-3 px-1">
                            {item.label}
                          </h4>
                          <div className="space-y-1">
                            {item.items.map((subItem) => (
                              <button
                                key={subItem.href}
                                onClick={() => handleNavigate(subItem.href)}
                                className="flex items-center gap-3 w-full px-3 py-3 text-left text-white hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95 group"
                              >
                                {subItem.icon && <subItem.icon className="h-5 w-5 text-[#32f08c] flex-shrink-0 group-hover:scale-110 transition-transform" />}
                                <span className="font-medium text-sm">{subItem.label}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Mobile Auth Buttons - Modern Cards */}
                    <div className="space-y-4 pt-2">
                      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h4 className="font-semibold text-xs text-white/50 uppercase tracking-wider mb-3 px-1">
                          Account
                        </h4>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start h-12 px-4 border-white/20 text-white hover:bg-white/10 hover:border-[#32f08c]/50"
                          disabled={isProd}
                          onClick={() => {
                            if (isProd) return;
                            setIsMobileMenuOpen(false);
                            navigate('/login');
                          }}
                        >
                          <LogIn className="h-5 w-5 mr-3 text-[#32f08c]" />
                          <span className="font-medium">Login</span>
                        </Button>
                      </motion.div>
                      
                      <div className="pt-2">
                        <h4 className="font-semibold text-xs text-white/50 uppercase tracking-wider mb-3 px-1">
                          Get Started
                        </h4>
                        <div className="space-y-3">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <Button 
                              variant="default" 
                              className="w-full justify-between h-14 px-4 bg-gradient-to-r from-[#32f08c] to-[#28d97a] hover:from-[#28d97a] hover:to-[#32f08c] text-black shadow-lg shadow-[#32f08c]/20"
                              disabled={isProd}
                              onClick={() => { if (isProd) return; handleLogin('professional'); }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-black/10 rounded-lg">
                                  <UserCheck className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                  <div className="font-semibold">Professional</div>
                                  <div className="text-xs opacity-80">Get verified & hired</div>
                                </div>
                              </div>
                              <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                            </Button>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <Button 
                              variant="outline" 
                              className="w-full justify-between h-14 px-4 border-white/20 text-white hover:bg-white/10 hover:border-[#bfa5ff]/50"
                              disabled={isProd}
                              onClick={() => { if (isProd) return; handleLogin('employer'); }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#bfa5ff]/10 rounded-lg">
                                  <Building className="h-5 w-5 text-[#bfa5ff]" />
                                </div>
                                <div className="text-left">
                                  <div className="font-semibold">Employer</div>
                                  <div className="text-xs text-white/60">Hire verified talent</div>
                                </div>
                              </div>
                              <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                            </Button>
                          </motion.div>
                          {/*
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start h-12 px-4"
                            onClick={() => handleLogin('university')}
                          >
                            <GraduationCap className="h-5 w-5 mr-3 text-purple-600" />
                            <div className="text-left">
                              <div className="font-medium">I'm from a University</div>
                              <div className="text-xs text-muted-foreground">Issue credentials</div>
                            </div>
                          </Button>
                          */}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <p className="text-sm text-muted-foreground">Logged in as</p>
                      </div>
                      <p className="font-medium">
                        {userType === 'employer' && 'Employer Dashboard'}
                        {userType === 'professional' && 'Professional Dashboard'}
                        {/* {userType === 'university' && 'University Dashboard'} */}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      onClick={onLogout}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>

      {/* Mobile Bottom Tab Bar - Only visible on mobile */}
      {isAuthenticated && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0b0d]/95 backdrop-blur-lg border-t border-white/10 z-50 safe-area-pb"
        >
          <nav className="flex items-center justify-around px-2 py-3">
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentPage.includes('dashboard') 
                  ? 'text-[#32f08c] bg-[#32f08c]/10' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Building className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => navigate('/identity-management')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'identity-management' 
                  ? 'text-[#32f08c] bg-[#32f08c]/10' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Profile</span>
            </button>

            <button
              onClick={() => navigate('/help')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'help' 
                  ? 'text-[#32f08c] bg-[#32f08c]/10' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Help</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-white/60 hover:text-white transition-all"
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs font-medium">Menu</span>
            </button>
          </nav>
        </motion.div>
      )}
    </>
  );
}
