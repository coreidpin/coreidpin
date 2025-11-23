import { test, expect } from '@playwright/test';

test('Admin Endorsements Page', async ({ page }) => {
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

  // Navigate to the endorsements page
  await page.goto('/admin/endorsements');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check for page heading
  await expect(page.getByText('Endorsements', { exact: true }).first()).toBeVisible();

  // Check for page description
  await expect(page.getByText('Manage and verify professional endorsements')).toBeVisible();

  // Check for stats cards
  await expect(page.getByText('Total Endorsements')).toBeVisible();
  await expect(page.getByText('Verified')).toBeVisible();
  await expect(page.getByText('Pending')).toBeVisible();
  await expect(page.getByText('Flagged')).toBeVisible();

  // Check for filter section
  await expect(page.getByText('Filter Endorsements')).toBeVisible();
  await expect(page.getByPlaceholder('Search by skill, endorsee, endorser...')).toBeVisible();

  // Check for table headers
  await expect(page.getByRole('cell', { name: 'Endorsee' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Endorser' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Skill' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Relationship' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Status' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Date' })).toBeVisible();
});
