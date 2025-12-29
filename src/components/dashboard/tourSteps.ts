// Professional Dashboard Tour Steps
export const professionalDashboardTour = [
  {
    target: '#identity-completion',
    title: '👋 Welcome to Your Dashboard!',
    description: 'This banner shows your profile completion progress. Complete all required fields to increase your credibility and unlock more features. Click "Complete Profile" to get started!',
    placement: 'bottom' as const
  },
  {
    target: '#quick-actions',
    title: '⚡ Quick Actions Panel',
    description: 'Use these buttons to quickly access common tasks like requesting endorsements, adding projects, generating your PIN, and downloading your professional badge.',
    placement: 'bottom' as const
  },
  {
    target: '#professional-pin-card',
    title: '🎯 Your Professional PIN',
    description: 'This card displays your unique Professional Identification Number. Share this PIN with organizations to verify your identity and professional credentials.',
    placement: 'bottom' as const
  }
];

// Generic tour steps for any dashboard
export const createTourSteps = (steps: Array<{
  target: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}>) => steps;
