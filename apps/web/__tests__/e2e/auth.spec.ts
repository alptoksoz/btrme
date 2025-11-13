import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('should display sign up page', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible()
  })

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByRole('button', { name: /sign in/i }).click()

    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toHaveAttribute('required')
  })
})
