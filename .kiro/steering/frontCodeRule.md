# 前端编码规范

> 参考来源：[共性问题编码规范](https://mi.feishu.cn/docx/WHkDdN009o0o6wxkTUfcUXyonef)

## 技术栈

- Vue 3 (Composition API + script setup)
- TypeScript / ES6+
- Vite 构建工具

## 代码格式化

- 缩进：2 个空格
- 引号：单引号（JSX 属性除外）
- 分号：不使用
- 行宽：最大 100 字符
- 尾随逗号：不使用

## 命名规范

### 文件命名

- Vue 组件：PascalCase（`HelloWorld.vue`）
- JS/TS 文件：camelCase（`useMessage.ts`）

### 变量命名

- 普通变量：camelCase（`tableLoading`、`pageIndex`）
- 常量：UPPER_SNAKE_CASE（`ISSUE_TYPE_LIST`）
- 布尔值：`is/has/can` 前缀（`isLoading`、`hasData`）

### 组件命名

- 组件名使用 PascalCase
- 通用组件放 `src/components/common/`
- 业务组件放对应业务目录

## Vue 组件规范

### 使用 script setup

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const loading = ref(false)
const formData = reactive({
  name: '',
  value: ''
})
</script>
```

### Props 定义

```typescript
const props = defineProps<{
  page?: number
  total: number
  canEdit?: boolean
}>()
```

### Emits 定义

```typescript
const emits = defineEmits<{
  change: [value: string]
  submit: []
}>()
```

### 引入顺序

1. Vue 核心库
2. 第三方库
3. 项目内部模块（hooks、services、components）
4. 样式文件

## 接口请求规范

### 文件组织

- 请求封装基础模块：`src/services/base.ts`
- 业务 API 文件：`src/services/{module}.ts`（如 `gitlab.ts`、`user.ts`）
- 所有向后端的请求必须写在 `src/services/` 目录下的文件中

### 基础请求封装（base.ts）

使用 axios 创建统一的请求实例，内置错误预处理：

```typescript
import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

const instance: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/** 错误预处理 */
const errorPreHandler = (error: any): void => {
  if (error?.response) {
    const { status } = error.response
    if (status === 401) {
      // 未授权，跳转登录
      window.location.href = '/login'
      return
    }
    if (status === 403) {
      console.error('没有权限访问该资源')
      return
    }
  }
  console.error('请求失败:', error?.message ?? '未知错误')
}

/** GET 请求 */
export const get = async <T = any>(
  url: string,
  params?: Record<string, any>
): Promise<T> => {
  try {
    const res: AxiosResponse<ApiResponse<T>> = await instance.get(url, { params })
    if (res.data.code !== 200) {
      throw new Error(res.data.message ?? '请求失败')
    }
    return res.data.data
  } catch (error) {
    errorPreHandler(error)
    throw error
  }
}

/** POST 请求 */
export const post = async <T = any>(
  url: string,
  data?: Record<string, any>
): Promise<T> => {
  try {
    const res: AxiosResponse<ApiResponse<T>> = await instance.post(url, data)
    if (res.data.code !== 200) {
      throw new Error(res.data.message ?? '请求失败')
    }
    return res.data.data
  } catch (error) {
    errorPreHandler(error)
    throw error
  }
}
```

### API 命名约定

| 前缀 | 用途 | 示例 |
|------|------|------|
| `query` | 查询列表 | `queryTaskList` |
| `get` | 查询详情 | `getTaskDetail` |
| `fetch` | 获取（有副作用） | `fetchLatestData` |
| `create` / `save` | 创建 | `createTask`、`saveConfig` |
| `update` | 更新 | `updateTask` |
| `confirm` | 确认操作 | `confirmOrder` |
| `batch` | 批量操作 | `batchDeleteTasks` |
| `delete` | 删除 | `deleteTask` |

### 业务 API 文件示例

```typescript
// services/gitlab.ts
import { get, post } from './base'
import type { GitLabConfig, CommitStats } from '@/types/gitlab'

/** 保存并验证 GitLab 配置 */
export const saveGitLabConfig = (config: GitLabConfig) => {
  return post('/api/gitlab/config', config)
}

/** 获取提交统计数据 */
export const getCommitStats = (params: { startDate: string, endDate: string }) => {
  return get<CommitStats>('/api/gitlab/stats', params)
}
```

## 异步处理规范

- 优先使用 `async/await`，避免 `.then()` 链式调用
- 异步操作必须使用 `try-catch` 捕获错误
- 使用 `try-finally` 管理 loading 状态

```typescript
// ✅ 推荐
const fetchData = async () => {
  loading.value = true
  try {
    const data = await getCommitStats(params)
    statsData.value = data
  } catch (error) {
    errorMessage.value = '获取数据失败'
  } finally {
    loading.value = false
  }
}

// ❌ 避免
getCommitStats(params)
  .then(data => { statsData.value = data })
  .catch(err => { console.log(err) })
```

## 异常处理规范

- 使用 `try-catch-finally` 完整结构处理异步错误
- 仅需管理 loading 状态时可使用 `try-finally`（base.ts 已内置错误提示）
- 禁止空 `catch` 块，必须有错误处理逻辑

```typescript
// ✅ 完整错误处理
const submitConfig = async () => {
  loading.value = true
  try {
    await saveGitLabConfig(formData)
    message.value = '配置成功'
  } catch (error) {
    message.value = '配置失败，请重试'
  } finally {
    loading.value = false
  }
}

// ✅ 仅管理 loading（base.ts 已处理错误提示）
const loadStats = async () => {
  loading.value = true
  try {
    statsData.value = await getCommitStats(params)
  } finally {
    loading.value = false
  }
}

// ❌ 禁止空 catch
try {
  await fetchData()
} catch (e) {
  // 不允许空 catch
}
```

## 常量定义

放在 `src/const/` 目录，使用数组或 Map 格式：

```typescript
export const STATUS_LIST = [
  { value: 1, label: '进行中' },
  { value: 2, label: '已完成' }
]
```

## 响应式数据

```typescript
// 简单值用 ref
const loading = ref(false)

// 对象用 reactive
const formData = reactive({
  name: '',
  status: undefined
})
```

## 样式规范

- 使用 SCSS
- 组件样式加 `scoped`
- 深度选择器用 `:deep()`

```vue
<style lang="scss" scoped>
.container {
  :deep(.el-input) {
    width: 100%;
  }
}
</style>
```

## ESLint 规则

### 必须遵守

- 使用 `===` 而非 `==`
- 使用 `let/const`，禁止 `var`
- 操作符左右有空格

### 禁止事项

- 禁止未使用的变量
- 禁止对函数参数重新赋值
- 禁止使用 `eval`

## 最佳实践

1. 组件拆分：复杂组件拆分为小组件
2. 类型安全：使用可选链 `?.` 和空值合并 `??`
3. 错误处理：使用 try-catch-finally，禁止空 catch
4. 性能优化：不常切换的内容用 `v-if`
5. 异步操作：统一使用 async/await
6. 接口请求：所有 API 调用通过 `src/services/base.ts` 封装方法

## 严格禁止

1. 不要使用 `var`
2. 不要使用 `==` 比较
3. 不要直接修改 props
4. 不要在 computed 中修改响应式数据
5. 不要使用魔法数字，应定义为常量
6. 不要在组件中直接使用 axios，必须通过 `services/base.ts` 封装
7. 不要写空的 catch 块
8. 不要使用 `.then()` 链式调用，使用 async/await


## 测试规范

### 测试工具

- 单元测试 / 组件测试：Vitest + @vue/test-utils + happy-dom
- E2E 测试：Playwright

### 目录结构

| 目录 | 用途 |
|------|------|
| `src/**/__tests__/` | 单元测试、组件测试（就近放置） |
| `e2e/` | E2E 端到端测试 |

### 文件命名

- 单元测试 / 组件测试：`*.test.ts` 或 `*.spec.ts`（与被测文件同目录的 `__tests__/` 下）
- E2E 测试：`*.spec.ts`（放在 `e2e/` 目录下）

### 常用命令

```bash
npm run test            # 运行单元测试（单次执行）
npm run test:watch      # 运行单元测试（监听模式）
npm run test:coverage   # 运行单元测试并生成覆盖率报告
npm run test:e2e        # 运行 E2E 测试
npm run test:e2e:ui     # 运行 E2E 测试（UI 模式）
```

### 单元测试规范

#### 基本结构

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
  it('应正确渲染默认状态', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.text()).toContain('预期文本')
  })

  it('应响应用户交互', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})
```

#### 测试命名

- `describe` 使用被测模块名称
- `it` / `test` 使用「应 + 行为描述」格式（如 `应正确渲染列表`）

#### Mock 规范

```typescript
import { vi } from 'vitest'

// mock 模块
vi.mock('@/services/gitlabService', () => ({
  getCommitStats: vi.fn()
}))

// mock 函数
const mockFn = vi.fn().mockResolvedValue({ data: [] })
```

#### 组件测试要点

- 使用 `mount` 进行完整渲染，`shallowMount` 进行浅渲染
- 测试 props 传入后的渲染结果
- 测试用户交互（click、input 等）触发的 emits
- 测试异步数据加载后的 UI 变化
- 使用 `vi.mock` 隔离外部依赖（API 请求等）

### E2E 测试规范

#### 核心原则：一场景一文件一视频

- 一个测试场景对应一个测试文件（`*.spec.ts`）
- 一个测试文件内只包含一个 `test()` 块，将该场景的所有步骤串行执行
- 运行后产出一个测试结果、一个录屏视频（`.webm`）
- 禁止在同一文件中使用多个 `test()` 拆分步骤（会生成多个视频）

#### 文件命名

- 以测试场景命名，使用 camelCase：`connectConfigTest.spec.ts`、`commitStatsQuery.spec.ts`
- 文件名应能直接反映测试的功能模块

#### 文件头部注释

每个 E2E 测试文件必须包含 JSDoc 头部注释，说明：

```typescript
/**
 * [场景名称] - E2E 测试
 *
 * 测试范围：[简要描述测试覆盖的功能]
 * 测试方式：所有步骤串行在同一个 test 中执行，生成一个测试结果和一个录屏视频
 *
 * 覆盖步骤：
 *  1. [步骤描述]
 *  2. [步骤描述]
 *  ...
 *
 * 运行命令：npx playwright test e2e/[文件名] --headed --workers=1
 * 录屏输出：frontend/test-results/ 目录下的 video.webm
 */
```

#### 基本结构

```typescript
import { test, expect } from '@playwright/test'

const SLOW = 800
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

test('场景名称', async ({ page }) => {
  // ---- 步骤1：描述 ----
  await page.goto('/')
  await wait(SLOW)
  // 断言...

  // ---- 步骤2：描述 ----
  await page.getByRole('button', { name: '提交' }).click()
  await wait(SLOW)
  await expect(page.getByText('提交成功')).toBeVisible()
  await wait(SLOW)
})
```

#### 录屏与交互速度

- `playwright.config.ts` 中配置 `video: 'on'` 以开启录屏
- 步骤之间使用 `wait(SLOW)`（建议 800ms）控制交互节奏，确保录屏可读
- 运行命令使用 `--headed --workers=1` 以可视化方式串行执行

#### E2E 测试要点

- 优先使用语义化选择器：`getByRole`、`getByText`、`getByLabel`
- 避免使用 CSS 选择器或 XPath
- 每个测试文件保持独立，不依赖其他文件的执行顺序
- 关注核心用户流程，不要测试实现细节

### 测试最佳实践

1. 每个组件至少有一个基础渲染测试
2. 关键业务逻辑必须有单元测试覆盖
3. hooks（组合式函数）应有独立的单元测试
4. 使用 `vi.mock` 隔离外部依赖，不要在单元测试中发起真实请求
5. E2E 测试覆盖核心用户流程（配置提交、数据查询等）
6. 测试中使用有意义的断言，避免仅断言 `toBeTruthy()`

### 测试禁止事项

1. 禁止在单元测试中发起真实 HTTP 请求
2. 禁止测试用例之间存在依赖关系
3. 禁止在测试中使用 `setTimeout` 等待，应使用框架提供的异步工具
4. 禁止写无断言的测试用例
5. 禁止在 E2E 测试中使用硬编码的 `sleep`，应使用 `waitFor` 或 `expect` 自动等待
