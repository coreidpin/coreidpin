import { test, expect } from '@playwright/test';

test('Admin Projects Page', async ({ page }) => {
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

  // Navigate to the projects page
  await page.goto('/admin/projects');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check for page heading
  await expect(page.getByText('Projects', { exact: true }).first()).toBeVisible();

  // Check for page description
  await expect(page.getByText('Manage and verify professional projects')).toBeVisible();

  // Check for stats cards
  await expect(page.getByText('Total Projects')).toBeVisible();
  await expect(page.getByText('Verified')).toBeVisible();
  await expect(page.getByText('Pending Verification')).toBeVisible();

  // Check for filter section
  await expect(page.getByText('Filter Projects')).toBeVisible();
  await expect(page.getByPlaceholder('Search projects, professionals...')).toBeVisible();

  // Check for table headers
  await expect(page.getByRole('cell', { name: 'Project Title' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Professional' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Technologies' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Status' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Created' })).toBeVisible();
});
