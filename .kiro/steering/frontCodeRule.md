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