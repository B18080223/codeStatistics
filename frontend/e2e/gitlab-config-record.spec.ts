import { test, expect } from '@playwright/test'

/**
 * 录制专用：所有场景在同一个 test 中串行执行，生成一个完整视频
 */
test.use({ actionTimeout: 10000 })

const SLOW_DELAY = 800 // 每步操作间隔（毫秒）

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

test('GitLab 连接配置 - 完整功能演示', async ({ page }) => {
  // ========== 场景1：页面初始状态 ==========
  await page.goto('/')
  await delay(SLOW_DELAY)

  await expect(page.getByText('GitLab 连接配置')).toBeVisible()
  await expect(page.getByLabel('服务器地址')).toBeVisible()
  await expect(page.getByLabel('用户名')).toBeVisible()
  await expect(page.getByLabel('访问令牌')).toBeVisible()
  await expect(page.getByRole('button', { name: '保存配置' })).toBeVisible()
  await delay(SLOW_DELAY)

  // ========== 场景2：空表单提交验证 ==========
  await page.getByRole('button', { name: '保存配置' }).click()
  await delay(SLOW_DELAY)

  await expect(page.getByText('服务器地址不能为空')).toBeVisible()
  await expect(page.getByText('用户名不能为空')).toBeVisible()
  await expect(page.getByText('访问令牌不能为空')).toBeVisible()
  await delay(SLOW_DELAY * 2)

  // ========== 场景3：服务器地址格式校验 ==========
  await page.getByLabel('服务器地址').click()
  await delay(300)
  await page.getByLabel('服务器地址').fill('invalid-url')
  await delay(SLOW_DELAY)
  await page.getByLabel('用户名').click() // 触发 blur
  await delay(SLOW_DELAY)

  await expect(page.getByText('服务器地址格式无效')).toBeVisible()
  await delay(SLOW_DELAY * 2)

  // 清空输入，准备下一个场景
  await page.getByLabel('服务器地址').clear()
  await delay(300)

  // ========== 场景4：配置验证失败 ==========
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

  await page.getByLabel('服务器地址').click()
  await delay(300)
  await page.getByLabel('服务器地址').fill('https://gitlab.example.com')
  await delay(SLOW_DELAY)

  await page.getByLabel('用户名').click()
  await delay(300)
  await page.getByLabel('用户名').fill('testuser')
  await delay(SLOW_DELAY)

  await page.getByLabel('访问令牌').click()
  await delay(300)
  await page.getByLabel('访问令牌').fill('invalid-token')
  await delay(SLOW_DELAY)

  await page.getByRole('button', { name: '保存配置' }).click()
  await delay(SLOW_DELAY)

  await expect(
    page.getByText('GitLab 连接验证失败: 401 Unauthorized')
  ).toBeVisible({ timeout: 5000 })
  await delay(SLOW_DELAY * 2)

  // 仍在配置页面
  await expect(page.getByText('GitLab 连接配置')).toBeVisible()
  await delay(SLOW_DELAY)

  // ========== 场景5：网络异常 ==========
  await page.unroute('**/api/gitlab/config')
  await page.route('**/api/gitlab/config', async (route) => {
    await route.abort('connectionrefused')
  })

  await page.getByLabel('访问令牌').click()
  await delay(300)
  await page.getByLabel('访问令牌').clear()
  await page.getByLabel('访问令牌').fill('glpat-xxxxxxxxxxxxxxxxxxxx')
  await delay(SLOW_DELAY)

  await page.getByRole('button', { name: '保存配置' }).click()
  await delay(SLOW_DELAY)

  await expect(page.locator('.el-message--error')).toBeVisible({ timeout: 5000 })
  await delay(SLOW_DELAY * 2)

  await expect(page.getByText('GitLab 连接配置')).toBeVisible()
  await delay(SLOW_DELAY)

  // ========== 场景6：配置验证成功，跳转统计页 ==========
  await page.unroute('**/api/gitlab/config')
  await page.route('**/api/gitlab/config', async (route) => {
    await delay(1500) // 模拟网络延迟，展示 loading 状态
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
        totalCommits: 42,
        totalChanges: 1200,
        avgDailyCommits: 3.5,
        projectCount: 5,
        dailyCommits: [
          { date: '2026-03-01', count: 5 },
          { date: '2026-03-02', count: 3 },
          { date: '2026-03-03', count: 8 },
          { date: '2026-03-04', count: 2 },
          { date: '2026-03-05', count: 6 }
        ],
        projectCommits: [
          { projectId: 1, projectName: 'frontend-app', commitCount: 15 },
          { projectId: 2, projectName: 'backend-api', commitCount: 12 },
          { projectId: 3, projectName: 'shared-lib', commitCount: 8 },
          { projectId: 4, projectName: 'docs', commitCount: 4 },
          { projectId: 5, projectName: 'infra', commitCount: 3 }
        ],
        lastUpdated: new Date().toISOString()
      })
    })
  })

  await page.getByRole('button', { name: '保存配置' }).click()
  await delay(500)

  // 验证 loading 状态
  await expect(page.getByText('验证中...')).toBeVisible()
  await delay(SLOW_DELAY)

  // 等待跳转到统计页面
  await expect(page.getByText('GitLab 提交统计')).toBeVisible({ timeout: 10000 })
  await delay(SLOW_DELAY)

  // 配置表单应消失
  await expect(page.getByText('GitLab 连接配置')).not.toBeVisible()
  await delay(SLOW_DELAY * 3) // 多停留一会，展示统计页面
})
