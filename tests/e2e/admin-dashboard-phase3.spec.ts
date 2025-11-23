import { test, expect } from '@playwright/test';

test('Admin Dashboard Phase 3: Overview Page Components', async ({ page }) => {
  // Mock admin authentication
  await page.addInitScript(() => {
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminSession', 'true');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', 'admin');
    localStorage.setItem('userId', 'admin-123');
    localStorage.setItem('accessToken', 'mock-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');
    localStorage.setItem('expiresAt', (Date.now() + 3600 * 1000).toString());
  });

  await page.goto('/admin');
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log(`PAGE ERROR: "${exception}"`));
  console.log('Current URL:', page.url());

  // Verify we are still on the admin page and not redirected
  await expect(page).toHaveURL(/\/admin/);

  // Check for Sidebar
  await expect(page.getByText('Core-ID Admin')).toBeVisible();

  // Check for page title with longer timeout to account for lazy loading
  await expect(page.getByText('Overview')).toBeVisible({ timeout: 15000 });

  // Check for Stats Cards (existing)
  await expect(page.getByText('Total Users')).toBeVisible();
  
  // Check for New Charts
  // Recharts renders SVG, so we check for text within the charts or the container
  await expect(page.getByText('User Growth')).toBeVisible();
  await expect(page.getByText('Weekly Activity')).toBeVisible();
  
  // Check for System Health
  await expect(page.getByText('API Status')).toBeVisible();
  await expect(page.getByText('Operational')).toBeVisible();
  await expect(page.getByText('Database')).toBeVisible();
  await expect(page.getByText('Healthy')).toBeVisible();
});
