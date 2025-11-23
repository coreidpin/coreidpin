import { test, expect } from '@playwright/test';

test('Admin Users Page', async ({ page }) => {
  // Mock admin authentication
  await page.addInitScript(() => {
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminSession', 'true');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', 'professional');
    localStorage.setItem('userId', 'admin-123');
    localStorage.setItem('accessToken', 'mock-token');
  });

  // Listen for console logs
  page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
  page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

  await page.goto('/admin/users');
  console.log('Navigated to /admin/users');
  console.log('Current URL:', page.url());

  // Wait for a bit to see if it redirects
  await page.waitForTimeout(2000);
  console.log('URL after wait:', page.url());

  if (page.url() !== 'http://localhost:3000/admin/users') {
    console.log('Redirected away from /admin/users');
    // console.log('Page content:', await page.content());
  }

  // Verify we are on the users page
  console.log('Checking URL...');
  await expect(page).toHaveURL(/\/admin\/users/);
  console.log('URL check passed');

  console.log('Checking "Users" heading...');
  try {
    await expect(page.getByText('Users', { exact: true }).first()).toBeVisible({ timeout: 5000 });
    console.log('"Users" heading check passed');
  } catch (e) {
    console.log('Failed to find "Users" heading');
    console.log('Page content:', await page.content());
    throw e;
  }

  console.log('Checking description...');
  await expect(page.getByText('Manage and view all registered users')).toBeVisible();
  console.log('Description check passed');

  // Check for table headers
  await expect(page.getByRole('cell', { name: 'Name' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Email' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Type' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Status' })).toBeVisible();

  // Check for search input
  await expect(page.getByPlaceholder('Search users...')).toBeVisible();
  console.log('Checking search input...');
  await expect(page.getByPlaceholder('Search users...')).toBeVisible();
  console.log('Search input check passed');

  // Check table visibility
  console.log('Checking table visibility...');
  await expect(page.locator('table')).toBeVisible();
  console.log('Table visibility check passed');
});
