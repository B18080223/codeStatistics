import { test, expect } from '@playwright/test'

test.describe('GitLab 连接配置', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('应正确显示配置表单', async ({ page }) => {
    await expect(page.getByText('GitLab 连接配置')).toBeVisible()
    await expect(page.getByLabel('服务器地址')).toBeVisible()
    await expect(page.getByLabel('用户名')).toBeVisible()
    await expect(page.getByLabel('访问令牌')).toBeVisible()
    await expect(page.getByRole('button', { name: '保存配置' })).toBeVisible()
  })

  test('空表单提交应显示验证错误', async ({ page }) => {
    await page.getByRole('button', { name: '保存配置' }).click()
    await expect(page.getByText('服务器地址不能为空')).toBeVisible()
    await expect(page.getByText('用户名不能为空')).toBeVisible()
    await expect(page.getByText('访问令牌不能为空')).toBeVisible()
  })

  test('服务器地址格式无效应提示错误', async ({ page }) => {
    await page.getByLabel('服务器地址').fill('invalid-url')
    await page.getByLabel('服务器地址').blur()
    await expect(page.getByText('服务器地址格式无效')).toBeVisible()
  })

  test('配置验证成功应跳转到统计页面', async ({ page }) => {
    // mock 后端接口返回成功
    await page.route('**/api/gitlab/config', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'GitLab 连接验证成功',
          userId: 1,
          userName: 'testuser'
        })
      })
    })

    // mock 统计数据接口（配置成功后会自动请求）
    await page.route('**/api/gitlab/stats**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalCommits: 42,
          totalChanges: 1200,
          avgDailyCommits: 3.5,
          projectCount: 5,
          dailyCommits: [],
          projectCommits: [],
          lastUpdated: new Date().toISOString()
        })
      })
    })

    // 填写表单
    await page.getByLabel('服务器地址').fill('https://gitlab.example.com')
    await page.getByLabel('用户名').fill('testuser')
    await page.getByLabel('访问令牌').fill('glpat-xxxxxxxxxxxxxxxxxxxx')

    // 提交
    await page.getByRole('button', { name: '保存配置' }).click()

    // 验证跳转到统计页面
    await expect(page.getByText('GitLab 提交统计')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('GitLab 连接配置')).not.toBeVisible()
  })

  test('配置验证失败应显示错误提示', async ({ page }) => {
    await page.route('**/api/gitlab/config', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'GitLab 连接验证失败: 401 Unauthorized'
        })
      })
    })

    await page.getByLabel('服务器地址').fill('https://gitlab.example.com')
    await page.getByLabel('用户名').fill('testuser')
    await page.getByLabel('访问令牌').fill('invalid-token')

    await page.getByRole('button', { name: '保存配置' }).click()

    // 验证错误提示出现（ElMessage 弹窗）
    await expect(
      page.getByText('GitLab 连接验证失败: 401 Unauthorized')
    ).toBeVisible({ timeout: 5000 })

    // 应仍停留在配置页面
    await expect(page.getByText('GitLab 连接配置')).toBeVisible()
  })

  test('网络异常应显示错误提示', async ({ page }) => {
    await page.route('**/api/gitlab/config', async (route) => {
      await route.abort('connectionrefused')
    })

    await page.getByLabel('服务器地址').fill('https://gitlab.example.com')
    await page.getByLabel('用户名').fill('testuser')
    await page.getByLabel('访问令牌').fill('glpat-xxxxxxxxxxxxxxxxxxxx')

    await page.getByRole('button', { name: '保存配置' }).click()

    // 验证错误提示出现
    await expect(page.locator('.el-message--error')).toBeVisible({ timeout: 5000 })

    // 应仍停留在配置页面
    await expect(page.getByText('GitLab 连接配置')).toBeVisible()
  })

  test('提交时按钮应显示加载状态', async ({ page }) => {
    // 延迟响应以观察 loading 状态
    await page.route('**/api/gitlab/config', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'GitLab 连接验证成功',
          userId: 1,
          userName: 'testuser'
        })
      })
    })

    await page.route('**/api/gitlab/stats**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalCommits: 0,
          totalChanges: 0,
          avgDailyCommits: 0,
          projectCount: 0,
          dailyCommits: [],
          projectCommits: []
        })
      })
    })

    await page.getByLabel('服务器地址').fill('https://gitlab.example.com')
    await page.getByLabel('用户名').fill('testuser')
    await page.getByLabel('访问令牌').fill('glpat-xxxxxxxxxxxxxxxxxxxx')

    await page.getByRole('button', { name: '保存配置' }).click()

    // 验证按钮进入 loading 状态
    await expect(page.getByText('验证中...')).toBeVisible()
  })
})
