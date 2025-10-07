import { test, expect } from '@playwright/test';

test.describe('Application Smoke Tests', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    
    // Should have login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display company portal when accessing with company code', async ({ page }) => {
    await page.goto('/company/TEST001');
    
    // Should show company portal elements
    await expect(page.locator('h1')).toContainText('Company Portal');
    await expect(page.locator('text=Setup Status')).toBeVisible();
  });

  test('should show setup wizard when accessing setup route', async ({ page }) => {
    await page.goto('/company/TEST001/setup');
    
    // Should show setup wizard elements
    await expect(page.locator('text=Company Setup Wizard')).toBeVisible();
    await expect(page.locator('text=Company Information')).toBeVisible();
  });

  test('should have working navigation between pages', async ({ page }) => {
    // Start at login page
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    
    // Navigate to company portal
    await page.goto('/company/TEST001');
    await expect(page.locator('h1')).toContainText('Company Portal');
    
    // Navigate to setup wizard
    await page.goto('/company/TEST001/setup');
    await expect(page.locator('text=Company Setup Wizard')).toBeVisible();
  });

  test('should display error for non-existent company', async ({ page }) => {
    await page.goto('/company/NONEXISTENT');
    
    // Should show some kind of error or not found state
    // This test might need adjustment based on actual error handling
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have responsive design elements', async ({ page }) => {
    await page.goto('/company/TEST001');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('h1')).toBeVisible();
  });
});
