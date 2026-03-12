import { test, expect } from '@playwright/test'

test('页面标题正确', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/fullstack-app|frontend/)
})
