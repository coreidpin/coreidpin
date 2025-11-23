import { test, expect } from '@playwright/test';

test('Admin Auth Logs Page', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminSession', 'true');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', 'professional');
    localStorage.setItem('userId', 'admin-123');
    localStorage.setItem('accessToken', 'mock-token');
  });

  // Listen for console logs and errors
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  // Navigate to the auth logs page
  await page.goto('/admin/logs/auth');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check for page heading
  await expect(page.getByText('Auth Logs', { exact: true }).first()).toBeVisible();

  // Check for page description
  await expect(page.getByText('Monitor authentication activities and security events')).toBeVisible();

  // Check for stats cards
  await expect(page.getByText('Total Events')).toBeVisible();
  await expect(page.getByText('Successful')).toBeVisible();
  await expect(page.getByText('Failed')).toBeVisible();
  await expect(page.getByText('Suspicious')).toBeVisible();

  // Check for filter section
  await expect(page.getByText('Filter Logs')).toBeVisible();
  await expect(page.getByPlaceholder('Search by email, IP, user agent...')).toBeVisible();

  // Check for table headers
  await expect(page.getByRole('cell', { name: 'Timestamp' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'User' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Event Type' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Status' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'IP Address' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'User Agent' })).toBeVisible();
});
