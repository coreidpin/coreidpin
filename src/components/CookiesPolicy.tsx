import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Cookie, Settings, Eye, BarChart, Shield } from 'lucide-react';
import { Button } from './ui/button';

export function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl">Cookies Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>
          <Badge variant="secondary" className="mb-4">
            <Settings className="h-3 w-3 mr-1" />
            How We Use Cookies
          </Badge>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                What Are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cookies are small text files that are placed on your device when you visit our platform. They help us provide you with a better experience by remembering your preferences, keeping you logged in, and understanding how you use our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Types of Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 flex items-center gap-2">
                        Strictly Necessary Cookies
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        These cookies are essential for the platform to function properly. They enable core functionality such as security, authentication, and session management.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Examples:</strong> Session tokens, authentication cookies, security cookies
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Duration:</strong> Session or up to 30 days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 flex items-center gap-2">
                        Functional Cookies
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        These cookies allow us to remember your preferences and choices (such as language, region, or theme) to provide enhanced, personalized features.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Examples:</strong> Language preference, theme selection, notification settings
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Duration:</strong> Up to 12 months
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 flex items-center gap-2">
                        Analytics Cookies
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Examples:</strong> Google Analytics, usage statistics, performance monitoring
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Duration:</strong> Up to 24 months
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 flex items-center gap-2">
                        Marketing Cookies
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        These cookies track your online activity to help us deliver more relevant advertising and measure campaign effectiveness.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Examples:</strong> Ad targeting, retargeting pixels, conversion tracking
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Duration:</strong> Up to 12 months
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Third-Party Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We use carefully selected third-party services that may set cookies on our platform:
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Google Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Helps us understand user behavior and improve our platform. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Supabase</h4>
                  <p className="text-sm text-muted-foreground">
                    Authentication and database services for secure user management. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Payment Processors</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure payment processing and fraud prevention for transactions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Managing Your Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences in several ways:
              </p>
              
              <div className="space-y-3">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Cookie Consent Banner</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    When you first visit our platform, we'll ask for your consent to use optional cookies. You can change your preferences at any time.
                  </p>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Cookie Preferences
                  </Button>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Browser Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Most browsers allow you to control cookies through their settings:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4 mt-2">
                    <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chrome</a></li>
                    <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firefox</a></li>
                    <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                    <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Edge</a></li>
                  </ul>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Opt-Out Tools</h4>
                  <p className="text-sm text-muted-foreground">
                    You can opt out of interest-based advertising:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4 mt-2">
                    <li><a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Digital Advertising Alliance (DAA)</a></li>
                    <li><a href="http://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">European Interactive Digital Advertising Alliance (EDAA)</a></li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Blocking or deleting cookies may impact your experience on our platform. Some features may not function properly without strictly necessary cookies.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookie Consent for Different User Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Professionals</h4>
                  <p className="text-sm text-muted-foreground">
                    We use cookies to maintain your verification status, credential wallet, and job matching preferences.
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Employers</h4>
                  <p className="text-sm text-muted-foreground">
                    Cookies help us remember your hiring preferences, saved candidates, and compliance dashboard settings.
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Universities</h4>
                  <p className="text-sm text-muted-foreground">
                    We use cookies to track credential issuance sessions and institutional verification processes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Cookies Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last updated" date.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                Questions About Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                If you have questions about how we use cookies:
              </p>
              <ul className="space-y-1 text-sm">
            <li><strong>Email:</strong> privacy@GidiPIN.work</li>
            <li><strong>Address:</strong> GidiPIN, Lagos, Nigeria</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
