import { test, expect } from '@playwright/test';

test.describe('Setup Wizard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/company/TEST001/setup');
  });

  test('should display all setup steps', async ({ page }) => {
    // Should show step indicators
    await expect(page.locator('text=Company Information')).toBeVisible();
    await expect(page.locator('text=Countries & Locations')).toBeVisible();
    await expect(page.locator('text=Branches & Offices')).toBeVisible();
    await expect(page.locator('text=Team Members')).toBeVisible();
    await expect(page.locator('text=Final Settings')).toBeVisible();
  });

  test('should allow navigation between steps', async ({ page }) => {
    // Should start at step 1 (Company Information)
    await expect(page.locator('input[name="companyName"]')).toBeVisible();
    
    // Try to go to next step (should show validation error if no data)
    await page.click('button:has-text("Next")');
    
    // Should show validation error or stay on same step
    await expect(page.locator('input[name="companyName"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")');
    
    // Should show validation errors or stay on current step
    await expect(page.locator('input[name="companyName"]')).toBeVisible();
  });

  test('should auto-generate company code', async ({ page }) => {
    // Fill in company name
    await page.fill('input[name="companyName"]', 'Test Company');
    
    // Company code should be auto-generated
    await expect(page.locator('input[name="companyCode"]')).toHaveValue(/^TC/);
  });

  test('should show license management option for company admins', async ({ page }) => {
    // Navigate to company portal first
    await page.goto('/company/TEST001');
    
    // Should show license management option if user is company admin
    // This test might need adjustment based on actual role implementation
    await expect(page.locator('text=License')).toBeVisible();
  });
});
