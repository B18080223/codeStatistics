/**
 * GitLab 连接配置 - E2E 测试
 *
 * 测试范围：GitLab 连接配置表单的完整功能验证
 * 测试方式：所有场景串行在同一个 test 中执行，共享浏览器上下文，
 *          生成一个测试结果和一个录屏视频（.webm）
 *
 * 覆盖场景（按顺序）：
 *  1. 页面初始状态 → 展示配置表单各字段
 *  2. 空表单提交 → 触发必填项校验提示
 *  3. 服务器地址格式校验 → 输入无效 URL 后提示格式错误
 *  4. 配置验证失败 → 填写错误 token，后端返回 401，显示失败提示
 *  5. 网络异常 → 模拟网络中断，显示错误提示
 *  6. 配置验证成功 → 展示 loading 状态，成功后跳转到统计页面
 *
 * 运行命令：npx playwright test e2e/connectConfigTest.spec.ts --headed --workers=1
 * 录屏输出：frontend/test-results/ 目录下的 video.webm
 */
import { test, expect } from '@playwright/test'

// ============================================================
// Mock 数据
// ============================================================
const MOCK_SUCCESS_CONFIG = {
  success: true,
  message: 'GitLab 连接验证成功',
  userId: 1,
  userName: 'testuser'
}

const MOCK_FAIL_CONFIG = {
  success: false,
  message: 'GitLab 连接验证失败: 401 Unauthorized'
}

const MOCK_STATS = {
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
}

const fulfillJson = (data: object) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(data)
})

const SLOW = 800
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ============================================================
// 测试用例
// ============================================================
test('GitLab 连接配置', async ({ page }) => {
  // ---- 场景1：页面初始状态 ----
  await page.goto('/')
  await wait(SLOW)
  await expect(page.getByText('GitLab 连接配置')).toBeVisible()
  await expect(page.getByLabel('服务器地址')).toBeVisible()
  await expect(page.getByLabel('用户名')).toBeVisible()
  await expect(page.getByLabel('访问令牌')).toBeVisible()
  await expect(page.getByRole('button', { name: '保存配置' })).toBeVisible()
  await wait(SLOW)

  // ---- 场景2：空表单提交 ----
  await page.getByRole('button', { name: '保存配置' }).click()
  await wait(SLOW)
  await expect(page.getByText('服务器地址不能为空')).toBeVisible()
  await expect(page.getByText('用户名不能为空')).toBeVisible()
  await expect(page.getByText('访问令牌不能为空')).toBeVisible()
  await wait(SLOW * 2)

  // ---- 场景3：地址格式校验 ----
  await page.getByLabel('服务器地址').click()
  await wait(300)
  await page.getByLabel('服务器地址').fill('invalid-url')
  await wait(SLOW)
  await page.getByLabel('用户名').click()
  await wait(SLOW)
  await expect(page.getByText('服务器地址格式无效')).toBeVisible()
  await wait(SLOW * 2)
  await page.getByLabel('服务器地址').clear()
  await wait(300)

  // ---- 场景4：验证失败 ----
  await page.route('**/api/gitlab/config', (route) =>
    route.fulfill(fulfillJson(MOCK_FAIL_CONFIG)))

  await page.getByLabel('服务器地址').click()
  await wait(300)
  await page.getByLabel('服务器地址').fill('https://gitlab.example.com')
  await wait(SLOW)
  await page.getByLabel('用户名').click()
  await wait(300)
  await page.getByLabel('用户名').fill('testuser')
  await wait(SLOW)
  await page.getByLabel('访问令牌').click()
  await wait(300)
  await page.getByLabel('访问令牌').fill('invalid-token')
  await wait(SLOW)
  await page.getByRole('button', { name: '保存配置' }).click()
  await wait(SLOW)
  await expect(
    page.getByText('GitLab 连接验证失败: 401 Unauthorized')
  ).toBeVisible({ timeout: 5000 })
  await wait(SLOW * 2)
  await expect(page.getByText('GitLab 连接配置')).toBeVisible()
  await wait(SLOW)

  // ---- 场景5：网络异常 ----
  await page.unroute('**/api/gitlab/config')
  await page.route('**/api/gitlab/config', (route) =>
    route.abort('connectionrefused'))

  await page.getByLabel('访问令牌').click()
  await wait(300)
  await page.getByLabel('访问令牌').clear()
  await page.getByLabel('访问令牌').fill('glpat-xxxxxxxxxxxxxxxxxxxx')
  await wait(SLOW)
  await page.getByRole('button', { name: '保存配置' }).click()
  await wait(SLOW)
  await expect(page.locator('.el-message--error')).toBeVisible({ timeout: 5000 })
  await wait(SLOW * 2)
  await expect(page.getByText('GitLab 连接配置')).toBeVisible()
  await wait(SLOW)

  // ---- 场景6：验证成功，跳转统计页 ----
  await page.unroute('**/api/gitlab/config')
  await page.route('**/api/gitlab/config', async (route) => {
    await wait(1500)
    await route.fulfill(fulfillJson(MOCK_SUCCESS_CONFIG))
  })
  await page.route('**/api/gitlab/stats**', (route) =>
    route.fulfill(fulfillJson(MOCK_STATS)))

  await page.getByRole('button', { name: '保存配置' }).click()
  await wait(500)
  await expect(page.getByText('验证中...')).toBeVisible()
  await wait(SLOW)
  await expect(page.getByText('GitLab 提交统计')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('GitLab 连接配置')).not.toBeVisible()
  await wait(SLOW * 3)
})
