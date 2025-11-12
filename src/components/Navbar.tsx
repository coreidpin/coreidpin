import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Logo } from './Logo';
import { AnnouncementBanner } from './AnnouncementBanner';
import { 
  Shield, 
  Menu, 
  X, 
  ChevronDown,
  Building,
  UserCheck,
  GraduationCap,
  BookOpen,
  Settings,
  HelpCircle,
  Phone,
  LogIn
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navigationItems = [
    {
      label: 'About',
      items: [
        { label: 'Our Story', href: 'our-story' },
        { label: 'How It Works', href: 'how-it-works' },
        { label: 'Trust & Safety', href: 'trust-safety' }
      ]
    },
    {
      label: 'Solutions',
      items: [
        { label: 'For Employers', href: 'employers', icon: Building },
        { label: 'For Professionals', href: 'professionals', icon: UserCheck },
        // { label: 'For Universities', href: 'universities', icon: GraduationCap }
      ]
    },
    {
      label: 'Resources',
      items: [
        { label: 'Help Center', href: 'help', icon: HelpCircle },
        { label: 'Contact', href: 'contact', icon: Phone },
        { label: 'Documentation', href: 'docs', icon: BookOpen }
      ]
    }
  ];

  const handleNavigate = (href: string) => {
    onNavigate(href);
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
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-md hover:bg-accent/50"
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
            className="absolute top-full -left-4 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
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
                    className="flex items-center gap-3 w-full px-3 py-3 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-lg transition-all duration-200 group/item"
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
        message="🎉 New: Swipe. Verify. Match. Hire. Join the world's first social network for verified talent!"
        type="promotional"
        dismissible={true}
      />
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-surface bg-surface backdrop-blur-md sticky top-0 z-50 shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Logo size="md" onClick={() => handleNavigate('landing')} />

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
                  onClick={() => onNavigate('login')}
                  className="text-foreground hover:bg-surface transition-colors"
                >
                  Login
                </Button>
                <div className="w-px h-6 bg-border"></div>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleLogin('professional')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
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
                  onClick={() => handleNavigate('dashboard')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onLogout} 
                  size="sm"
                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                >
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden flex-shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-[350px] p-0">
              <SheetHeader className="px-6 py-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Logo size="sm" />
                </SheetTitle>
                <SheetDescription className="text-left">
                  Navigate through swipe platform sections and features
                </SheetDescription>
              </SheetHeader>
              
              <div className="px-6 py-4 space-y-6 overflow-y-auto flex-1">
                {!isAuthenticated ? (
                  <>
                    {/* Mobile Navigation */}
                    <div className="space-y-6">
                      {navigationItems.map((item) => (
                        <div key={item.label} className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider px-2">
                            {item.label}
                          </h4>
                          <div className="space-y-1">
                            {item.items.map((subItem) => (
                              <button
                                key={subItem.href}
                                onClick={() => handleNavigate(subItem.href)}
                                className="flex items-center gap-3 w-full px-4 py-3 text-left text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 active:scale-95"
                              >
                                {subItem.icon && <subItem.icon className="h-5 w-5 text-primary flex-shrink-0" />}
                                <span className="font-medium">{subItem.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mobile Auth Buttons */}
                    <div className="space-y-4 pt-6 border-t border-border">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider px-2">
                        Account
                      </h4>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-11 px-4"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onNavigate('login');
                        }}
                      >
                        <LogIn className="h-4 w-4 mr-3" />
                        <span className="font-medium">Login</span>
                      </Button>
                      
                      <div className="pt-4">
                        <div className="text-xs text-muted-foreground px-2 mb-3">New to swipe?</div>
                        <div className="space-y-3">
                          <Button 
                            variant="default" 
                            className="w-full justify-start h-12 px-4 bg-primary"
                            onClick={() => handleLogin('professional')}
                          >
                            <UserCheck className="h-5 w-5 mr-3" />
                            <div className="text-left">
                              <div className="font-medium">I'm a Professional</div>
                              <div className="text-xs text-primary-foreground/80">Get verified & hired</div>
                            </div>
                          </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-12 px-4"
                          onClick={() => handleLogin('employer')}
                        >
                          <Building className="h-5 w-5 mr-3 text-blue-600" />
                          <div className="text-left">
                            <div className="font-medium">I'm an Employer</div>
                            <div className="text-xs text-muted-foreground">Hire verified talent</div>
                          </div>
                        </Button>
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
    </>
  );
}
