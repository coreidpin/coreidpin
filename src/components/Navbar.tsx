import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Logo } from './Logo';
// import { AnnouncementBanner } from './AnnouncementBanner';
import { WaitlistForm } from './WaitlistForm';
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
  User,
  Loader2,
  Users
} from 'lucide-react';
import { NotificationBell } from './notifications/NotificationBell';
import { SantaHat } from './ui/christmas-effects';

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
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  // Consider dashboard pages as "light" theme if they are rendering on white background
  const isLight = currentPage === 'landing' || currentPage === 'dashboard' || currentPage === 'referrals' || currentPage === 'employers' || currentPage === 'developer';
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
    setIsNavigating(true);
    navigate(href);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setTimeout(() => setIsNavigating(false), 800);
  };

  const handleLogin = (type: 'employer' | 'professional' | 'university') => {
    setIsNavigating(true);
    onLogin?.(type);
    setIsMobileMenuOpen(false);
    navigate('/get-started');
    setTimeout(() => setIsNavigating(false), 800);
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
      {/* <AnnouncementBanner 
        onCtaClick={() => setShowWaitlist(true)}
      /> */}
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
        className={cn(
          "border-b backdrop-blur-md sticky top-0 z-50 shadow-sm transition-colors duration-200",
          isLight 
            ? "bg-white/80 border-slate-200 text-slate-900" 
            : "bg-[#0a0b0d]/95 border-white/10 text-white"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16 lg:h-18">
          {/* Logo */}
          {/* Logo with Holiday Hat */}
          <div className="relative group">
            <SantaHat className="top-[-18px] left-[-2px] scale-75 rotate-[-10deg] group-hover:rotate-[-5deg] transition-transform duration-300" />
            <Logo size="md" isLight={isLight} showText={false} onClick={() => handleNavigate('/')} />
          </div>

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
                    {userType === 'admin' && 'Admin Dashboard'}
                    {/* {userType === 'university' && 'University Dashboard'} */}
                  </span>
                </div>
              </div>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={import.meta.env.PROD}
                  onClick={() => navigate('/login')}
                  className={cn(
                    "transition-colors",
                    isLight ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900" : "hover:bg-white/10 text-white"
                  )}
                >
                  Login
                </Button>
                <div className="w-px h-6 bg-border"></div>
                <Button 
                  variant={isLight ? "ghost" : "default"}
                  size="sm"
                  disabled={import.meta.env.PROD}
                  onClick={() => handleLogin('professional')}
                  className={cn(
                    isLight ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900" : ""
                  )}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </>
            ) : (
              <>
                <NotificationBell />
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    setIsNavigating(true);
                    let target = '/dashboard';
                    if (userType === 'business') target = '/developer';
                    if (userType === 'admin') target = '/admin/dashboard';
                    navigate(target);
                    setTimeout(() => setIsNavigating(false), 800);
                  }}
                  disabled={isNavigating}
                  className={cn(
                    "disabled:opacity-70 disabled:cursor-not-allowed",
                    isLight 
                      ? "bg-slate-800 text-white hover:bg-slate-700"
                      : "bg-[#f5f5dc] text-slate-900 hover:bg-[#e8e8cf]"
                  )}
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Building className="h-4 w-4 mr-2" />
                      Dashboard
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onLogout} 
                  size="sm"
                  className={cn(
                    "transition-colors",
                    isLight
                      ? "border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      : "border-[#f5f5dc]/50 text-[#f5f5dc] hover:bg-[#f5f5dc]/10 hover:border-[#f5f5dc]"
                  )}
                >
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Mobile First: Larger touch target */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "lg:hidden flex-shrink-0",
                    // Mobile: 44px minimum touch target
                    "h-11 w-11 p-0",
                    // Desktop: Smaller
                    "lg:h-9 lg:w-auto lg:px-3",
                    isLight 
                      ? "bg-transparent text-slate-900 hover:bg-slate-100" 
                      : "bg-white text-black hover:bg-white hover:text-black"
                  )}
                >
                  <Menu className="h-6 w-6 lg:h-5 lg:w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[85vw] max-w-[350px] p-0 bg-[#0a0b0d]/95 backdrop-blur-xl text-white border-l border-white/10"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                <SheetHeader className="px-4 py-3 md:px-6 md:py-4 border-b border-white/10 backdrop-blur-sm bg-white/5">
                  <SheetTitle className="flex items-center gap-2 text-left text-white">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <Logo size="sm" isLight={false} showText={false} />
                    </motion.div>
                  </SheetTitle>
                  <SheetDescription className="text-left text-white/70">
                    Navigate through GidiPIN platform sections and features
                  </SheetDescription>
                </SheetHeader>
                
                  <div className="px-3 py-4 md:px-4 md:py-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
                  {!isAuthenticated ? (
                    <>
                      {/* Mobile Navigation - Enhanced Card Style with Glassmorphism */}
                      <div className="space-y-4">
                        {navigationItems.map((item, idx) => (
                          <motion.div 
                            key={item.label}
                            initial={{ opacity: 0, x: -30, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 120,
                              damping: 15,
                              delay: idx * 0.08
                            }}
                            whileHover={{ scale: 1.02 }}
                            className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 border border-white/20 backdrop-blur-md shadow-lg hover:shadow-[#32f08c]/20 hover:border-[#32f08c]/30 transition-all duration-300"
                          >
                            {/* Animated gradient background overlay */}
                            <motion.div
                              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#32f08c]/0 to-[#32f08c]/0 group-hover:from-[#32f08c]/5 group-hover:to-transparent transition-all duration-500"
                              initial={false}
                            />
                            
                            {/* Shimmer effect on hover */}
                            <div className="absolute inset-0 rounded-2xl overflow-hidden">
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                              />
                            </div>
                            
                            <div className="relative z-10">
                              <h4 className="font-semibold text-xs text-white/50 uppercase tracking-wider mb-3 px-1">
                                {item.label}
                              </h4>
                              <div className="space-y-1">
                                {item.items.map((subItem, subIdx) => (
                                  <motion.button
                                    key={subItem.href}
                                    onClick={() => handleNavigate(subItem.href)}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.08 + subIdx * 0.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative flex items-center gap-3 w-full px-3 py-3 text-left text-white hover:bg-white/10 rounded-xl transition-all duration-200 overflow-hidden group/item"
                                  >
                                    {/* Ripple effect container */}
                                    <span className="absolute inset-0 rounded-xl overflow-hidden">
                                      <span className="absolute inset-0 bg-gradient-to-r from-[#32f08c]/0 via-[#32f08c]/20 to-[#32f08c]/0 translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-700 ease-out" />
                                    </span>
                                    
                                    {subItem.icon && (
                                      <motion.div
                                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                      >
                                        <subItem.icon className="h-5 w-5 text-[#32f08c] flex-shrink-0 relative z-10" />
                                      </motion.div>
                                    )}
                                    <span className="font-medium text-sm relative z-10">{subItem.label}</span>
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Mobile Auth Buttons - Premium Cards with Magnetic Effect */}
                      <div className="space-y-4 pt-2">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", delay: 0.3 }}
                        >
                          <h4 className="font-semibold text-xs text-white/50 uppercase tracking-wider mb-3 px-1">
                            Account
                          </h4>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              variant="outline" 
                              className="relative w-full justify-start h-12 px-4 border-white/20 text-white hover:bg-white/10 hover:border-[#32f08c]/50 overflow-hidden group"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                navigate('/login');
                              }}
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-[#32f08c]/0 via-[#32f08c]/10 to-[#32f08c]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                              <LogIn className="h-5 w-5 mr-3 text-[#32f08c] relative z-10" />
                              <span className="font-medium relative z-10">Login</span>
                            </Button>
                          </motion.div>
                        </motion.div>
                        
                        <div className="pt-2">
                          <h4 className="font-semibold text-xs text-white/50 uppercase tracking-wider mb-3 px-1">
                            Get Started
                          </h4>
                          <div className="space-y-3">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: "spring", delay: 0.4 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                variant="default" 
                                className="relative w-full justify-between h-14 px-4 bg-gradient-to-r from-[#32f08c] to-[#28d97a] hover:from-[#28d97a] hover:to-[#32f08c] text-black shadow-lg shadow-[#32f08c]/20 hover:shadow-[#32f08c]/40 overflow-hidden group"
                                onClick={() => handleLogin('professional')}
                              >
                                {/* Animated glow effect */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                  animate={{ x: ["-100%", "100%"] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                                
                                <div className="flex items-center gap-3 relative z-10">
                                  <motion.div 
                                    className="p-2 bg-black/10 rounded-lg"
                                    whileHover={{ rotate: [0, -5, 5, 0] }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <UserCheck className="h-5 w-5" />
                                  </motion.div>
                                  <div className="text-left">
                                    <div className="font-semibold">Professional</div>
                                    <div className="text-xs opacity-80">Get verified & hired</div>
                                  </div>
                                </div>
                                <motion.div
                                  animate={{ x: [0, 3, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  <ChevronDown className="h-4 w-4 rotate-[-90deg] relative z-10" />
                                </motion.div>
                              </Button>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: "spring", delay: 0.5 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                variant="outline" 
                                className="relative w-full justify-between h-14 px-4 border-white/20 text-white hover:bg-white/10 hover:border-[#bfa5ff]/50 hover:shadow-lg hover:shadow-[#bfa5ff]/20 overflow-hidden group"
                                disabled={isProd}
                                onClick={() => { if (isProd) return; handleLogin('employer'); }}
                              >
                                {/* Ripple background on hover */}
                                <span className="absolute inset-0 bg-gradient-to-r from-[#bfa5ff]/0 via-[#bfa5ff]/10 to-[#bfa5ff]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                
                                <div className="flex items-center gap-3 relative z-10">
                                  <motion.div 
                                    className="p-2 bg-[#bfa5ff]/10 rounded-lg"
                                    whileHover={{ rotate: [0, -5, 5, 0] }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Building className="h-5 w-5 text-[#bfa5ff]" />
                                  </motion.div>
                                  <div className="text-left">
                                    <div className="font-semibold">Employer</div>
                                    <div className="text-xs text-white/60">Hire verified talent</div>
                                  </div>
                                </div>
                                <ChevronDown className="h-4 w-4 rotate-[-90deg] relative z-10" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <motion.div 
                            className="w-2 h-2 bg-emerald-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <p className="text-sm text-muted-foreground">Logged in as</p>
                        </div>
                        <p className="font-medium">
                          {userType === 'employer' && 'Employer Dashboard'}
                          {userType === 'professional' && 'Professional Dashboard'}
                          {userType === 'admin' && 'Admin Dashboard'}
                        </p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-12 hover:bg-white/10"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate('/referrals');
                          }}
                        >
                          <Users className="h-5 w-5 mr-3" />
                          Invite & Earn
                          <span className="ml-auto bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse shadow-lg shadow-blue-500/20">NEW</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          variant="outline" 
                          className="w-full h-12 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-300"
                          onClick={onLogout}
                        >
                          Logout
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
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
              onClick={() => navigate(userType === 'business' ? '/developer' : '/dashboard')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                (currentPage.includes('dashboard') || currentPage.includes('developer')) 
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
      
      {showWaitlist && (
        <WaitlistForm onClose={() => setShowWaitlist(false)} />
      )}
    </>
  );
}
