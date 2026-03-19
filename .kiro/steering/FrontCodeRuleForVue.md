---
inclusion: fileMatch
fileMatchPattern: "frontend/**"
---

# Vue 3 前端编码规范

> 适用范围：`frontend/` 目录下所有 Vue 3 代码

## 技术栈

- Vue 3.5（Composition API + `<script setup>`）
- TypeScript 5.9
- Vite 8
- Element Plus（UI 组件库）
- SCSS（样式）
- qiankun（微前端主应用）

---

## 一、结构规范

### 依赖导入顺序

严格按以下顺序排列，各组之间空一行：

```typescript
// 1. Vue 核心
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 2. 第三方库
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

// 3. 项目内部公共模块（hooks、services、types、const）
import { useGitLabStats } from '@/hooks/useGitLabStats'
import { getCommitStats } from '@/services/gitlabService'
import type { CommitStats } from '@/types/gitlab'
import { STATUS_LIST } from '@/const/gitlabStats'

// 4. 业务子组件
import ConfigForm from '@/components/gitlab-stats/ConfigForm.vue'

// 5. 样式文件（如有）
import './style.scss'
```

### 组件内代码分层

`<script setup>` 内部按以下顺序组织：

1. Props / Emits 定义
2. 路由 / 外部 hook 调用
3. 响应式数据定义（ref / reactive）
4. computed 计算属性
5. 方法定义
6. 生命周期钩子（onMounted 等）

```vue
<script setup lang="ts">
// --- Props / Emits ---
const props = defineProps<{ total: number }>()
const emit = defineEmits<{ change: [value: string] }>()

// --- 路由 / Hook ---
const router = useRouter()
const { statsData, fetchStats } = useGitLabStats()

// --- 响应式数据 ---
const loading = ref(false)
const formData = reactive({ name: '', status: '' })

// --- 计算属性 ---
const isEmpty = computed(() => !statsData.value)

// --- 方法 ---
const handleSubmit = async () => {
  loading.value = true
  try {
    await fetchStats()
  } finally {
    loading.value = false
  }
}

// --- 生命周期 ---
onMounted(() => {
  fetchStats()
})
</script>
```

### 模板嵌套控制

- 模板嵌套不超过 3 层，超过时拆为独立子组件
- 复杂条件渲染抽取为 computed 或方法

```vue
<!-- ✅ 推荐：拆分子组件 -->
<StatsOverview :data="statsData" :loading="loading" />

<!-- ❌ 避免：深层嵌套 -->
<div>
  <div>
    <div>
      <div>...</div>
    </div>
  </div>
</div>
```

---

## 二、变量与常量

### 常量管理

- 公用静态变量统一存入 `src/const/` 目录，按模块拆分文件
- 禁止在组件中零散定义魔法数字或硬编码字符串

```typescript
// src/const/gitlabStats.ts
export const DEFAULT_PAGE_SIZE = 20
export const DATE_FORMAT = 'YYYY-MM-DD'

export const STATUS_LIST = [
  { value: 1, label: '进行中' },
  { value: 2, label: '已完成' }
] as const
```

### 命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL`、`MAX_RETRY_COUNT` |
| 变量 | camelCase | `userList`、`pageIndex` |
| 布尔值 | `is/has/can` 前缀 | `isLoading`、`hasData`、`canEdit` |
| ref | camelCase | `loading`、`statsData` |
| reactive | camelCase | `formData`、`dateRange` |

---

## 三、网络请求

### 文件组织

| 文件 | 职责 |
|------|------|
| `src/services/base.ts` | axios 实例封装，统一拦截器、错误处理 |
| `src/services/{module}.ts` | 业务接口，按模块拆分 |

### 规则

- 所有请求必须通过 `services/base.ts` 封装的 `get`/`post` 方法
- 禁止在组件中直接使用 `axios`
- 接口函数命名遵循 API 命名约定（query/get/fetch/create/update/delete）

### API 命名约定

| 前缀 | 用途 | 示例 |
|------|------|------|
| `query` | 查询列表 | `queryTaskList` |
| `get` | 查询详情/状态 | `getConfigStatus` |
| `fetch` | 获取（有副作用） | `fetchLatestData` |
| `save` / `create` | 创建/保存 | `saveGitLabConfig` |
| `update` | 更新 | `updateTask` |
| `delete` | 删除 | `deleteTask` |

---

## 四、ES6+ 与 TypeScript 规范

### 必须遵守

- 禁止 `var`，统一使用 `const`（优先）和 `let`
- 优先使用箭头函数、解构赋值、模板字符串
- 使用 `===` 而非 `==`
- 函数参数超过 3 个时使用对象解构传入
- 方法逻辑超过 20 行拆分为子函数，保持单一职责

```typescript
// ✅ 推荐
const { startDate, endDate } = dateRange
const message = `共 ${total} 条记录`

// ❌ 避免
var result = data
if (status == 200) { ... }
```

### 类型安全

- 使用可选链 `?.` 和空值合并 `??`
- Props 使用泛型定义类型
- API 返回值标注泛型

```typescript
const name = user?.profile?.name ?? '未知'
const data = await get<CommitStats>('/api/gitlab/stats', params)
```

---

## 五、Vue 3 专项规范

### 组合式 API

- 必须使用 `<script setup lang="ts">`
- 复杂逻辑抽取为 `src/hooks/useXxx.ts` 组合式函数
- 简单值用 `ref`，对象用 `reactive`

### Props & Emits

```typescript
// Props：泛型定义
const props = defineProps<{
  total: number
  canEdit?: boolean
}>()

// Emits：泛型定义
const emit = defineEmits<{
  change: [value: string]
  submit: []
}>()
```

### 异步处理

- 统一使用 `async/await`，禁止 `.then()` 链式调用
- 使用 `try-catch-finally` 管理 loading 和错误状态
- 禁止空 `catch` 块

```typescript
const fetchData = async () => {
  loading.value = true
  try {
    statsData.value = await getCommitStats(params)
  } catch (error) {
    errorMessage.value = '获取数据失败'
  } finally {
    loading.value = false
  }
}
```

### 性能优化

- 不常切换的内容用 `v-if`，频繁切换用 `v-show`
- 列表渲染必须提供唯一 `key`
- 避免在 `computed` 中修改响应式数据
- 大列表考虑虚拟滚动

---

## 六、样式规范

- 使用 SCSS，组件样式加 `scoped`
- 深度选择器用 `:deep()`
- 全局样式存入 `src/style.css` 或 `src/styles/` 目录
- 组件样式局部化，禁止组件内写全局样式

```vue
<style lang="scss" scoped>
.container {
  padding: 24px;

  :deep(.el-input) {
    width: 100%;
  }
}
</style>
```

---

## 七、文件命名

| 类型 | 规则 | 示例 |
|------|------|------|
| Vue 组件 | PascalCase | `ConfigForm.vue`、`StatsOverview.vue` |
| TS/JS 文件 | camelCase | `useGitLabStats.ts`、`gitlabService.ts` |
| 常量文件 | camelCase | `gitlabStats.ts` |
| 类型文件 | camelCase | `gitlab.ts` |
| 样式文件 | camelCase | `style.scss` |

---

## 八、目录约定

| 目录 | 用途 |
|------|------|
| `src/components/` | Vue 组件（按业务模块分子目录） |
| `src/views/` | 页面级组件 |
| `src/hooks/` | 组合式函数 |
| `src/services/` | API 请求封装 |
| `src/types/` | TypeScript 类型定义 |
| `src/const/` | 常量定义 |
| `src/router/` | 路由配置 |
| `src/assets/` | 静态资源 |

---

## 九、注释规范

- 仅标注复杂逻辑和关键业务流程，避免冗余注释
- 代码命名应见名知意，减少注释依赖
- 组合式函数和 service 方法使用 JSDoc 注释

```typescript
/** 页面加载时检查后端配置状态，已配置则直接拉取数据 */
const checkConfig = async () => { ... }
```

---

## 十、严格禁止

1. 禁止使用 `var`
2. 禁止使用 `==` 比较
3. 禁止直接修改 props
4. 禁止在 computed 中修改响应式数据
5. 禁止使用魔法数字，应定义为常量
6. 禁止在组件中直接使用 axios
7. 禁止空 catch 块
8. 禁止 `.then()` 链式调用
9. 禁止对函数参数重新赋值
10. 禁止使用 `eval`
