# CoreID URL Routing System

## Overview

The CoreID application implements a comprehensive URL routing system using React Router that provides seamless navigation, proper browser history management, and clean, semantic URLs throughout the application.

## Route Structure

### Landing Page
- **URL**: `/` (root domain)
- **Description**: Main landing page with no path segments
- **Features**: Clean root URL, no query parameters by default

### Authentication Routes
- **Login**: `/login` - Dedicated login page
- **Get Started**: `/get-started` - User onboarding flow
- **Email Verification**: `/auth/verify-email` - Email verification page
- **Auth Callback**: `/auth/callback` - OAuth callback handler

### Public Routes
- **Our Story**: `/our-story` - Company story and mission
- **How It Works**: `/how-it-works` - Product explanation
- **Solutions**: `/solutions` - Solutions overview
- **Trust & Safety**: `/trust-safety` - Security and compliance info
- **Help**: `/help` - Help center and support
- **Contact**: `/contact` - Contact information
- **Documentation**: `/docs` - Technical documentation

### Legal Pages
- **Terms of Service**: `/terms`
- **Privacy Policy**: `/privacy`
- **Cookie Policy**: `/cookies`
- **GDPR Compliance**: `/gdpr`

### Protected Routes
- **Dashboard**: `/dashboard` - User dashboard (requires authentication)
- **Admin**: `/admin` - Admin panel (requires admin privileges)
- **Monitoring**: `/monitoring` - System monitoring

### Dynamic Routes
- **Public PIN**: `/pin/:pinNumber` - Public PIN verification pages

## Technical Implementation

### Router Architecture

```typescript
// Main router component
<BrowserRouter>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/dashboard" element={
      <ProtectedRoute isAuthenticated={isAuthenticated}>
        <Dashboard />
      </ProtectedRoute>
    } />
    // ... other routes
  </Routes>
</BrowserRouter>
```

### Route Protection

#### Protected Route Component
```typescript
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  isAuthenticated: boolean;
  redirectTo?: string;
}> = ({ children, isAuthenticated, redirectTo = '/login' }) => {
  return isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} replace />;
};
```

#### Admin Route Component
```typescript
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};
```

### Navigation Behavior

#### Smooth Transitions
- All navigation uses React Router's built-in SPA behavior
- No page reloads during navigation
- Smooth transitions with motion animations

#### Browser History
- Proper back/forward button support
- Bookmarkable URLs for all routes
- Shareable links maintain state

#### URL Management
- Clean URLs without hash routing
- Automatic parameter cleanup when appropriate
- Query parameter preservation when needed

## Route Guards

### Authentication Guards
- Dashboard routes require `isAuthenticated: true`
- Automatic redirect to `/login` for unauthenticated users
- Session persistence across browser refreshes

### Admin Guards
- Admin routes require `isAdmin: true` in localStorage
- Automatic redirect to home for non-admin users
- Separate admin authentication flow

### Error Handling
- 404 page for invalid routes
- Graceful fallbacks for missing components
- Error boundaries for route-level errors

## URL Patterns

### Naming Convention
- All routes use lowercase with hyphens: `/trust-safety`, `/how-it-works`
- No underscores or camelCase in URLs
- Descriptive, SEO-friendly paths

### Parameter Handling
- Dynamic segments: `/pin/:pinNumber`
- Query parameters preserved: `/login?redirect=/dashboard`
- Clean parameter parsing and validation

## Mobile Responsiveness

### Touch Navigation
- Touch-friendly navigation elements
- Proper mobile menu handling
- Swipe gesture support where appropriate

### Performance
- Code splitting by route
- Lazy loading for non-critical routes
- Optimized bundle sizes per route

## Testing

### Route Testing
```typescript
describe('URL Routing System', () => {
  it('should navigate to correct routes', () => {
    render(<AppRouter {...props} />);
    // Test navigation logic
  });
});
```

### Browser Testing
- Cross-browser compatibility testing
- Mobile browser testing
- Deep linking validation

## Development Guidelines

### Adding New Routes

1. **Define the route in Router.tsx**:
```typescript
<Route path="/new-page" element={<NewPageComponent />} />
```

2. **Update navigation components**:
```typescript
const navigationItems = [
  { label: 'New Page', href: '/new-page' }
];
```

3. **Add route protection if needed**:
```typescript
<Route path="/protected" element={
  <ProtectedRoute isAuthenticated={isAuthenticated}>
    <ProtectedComponent />
  </ProtectedRoute>
} />
```

### Best Practices

1. **Use semantic URLs**: Choose descriptive, user-friendly paths
2. **Implement proper guards**: Protect sensitive routes appropriately
3. **Handle edge cases**: Account for invalid URLs and error states
4. **Test thoroughly**: Verify all navigation paths work correctly
5. **Optimize performance**: Use code splitting for large route components

## Deployment Considerations

### Production Setup
- Configure server for SPA routing (serve index.html for all routes)
- Set up proper redirects for old URLs
- Implement HTTPS for all routes

### SEO Optimization
- Add proper meta tags for each route
- Implement structured data where appropriate
- Configure sitemap.xml with all public routes

### Analytics
- Track route changes for analytics
- Monitor 404 errors and fix broken links
- Analyze user navigation patterns

## Troubleshooting

### Common Issues

1. **404 on refresh**: Ensure server is configured for SPA routing
2. **Broken navigation**: Check for missing route definitions
3. **Authentication loops**: Verify route guard logic
4. **Performance issues**: Implement code splitting and lazy loading

### Debug Tools
- React Router DevTools for route debugging
- Browser network tab for navigation analysis
- Console logging for route guard behavior

## Future Enhancements

### Planned Features
- Route-based code splitting
- Advanced route animations
- Breadcrumb navigation
- Route-based permissions system

### Performance Optimizations
- Preloading critical routes
- Service worker integration
- Route-based caching strategies