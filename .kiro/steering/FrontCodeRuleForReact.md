---
inclusion: fileMatch
fileMatchPattern: "react-app/**"
---

# React 18 前端编码规范

> 适用范围：`react-app/` 目录下所有 React 代码

## 技术栈

- React 18（函数组件 + Hooks）
- TypeScript 5.9
- Vite 6
- Ant Design 5（UI 组件库）
- @ant-design/icons（图标库）
- vite-plugin-qiankun（微前端子应用）

---

## 一、结构规范

### 依赖导入顺序

严格按以下顺序排列，各组之间空一行：

```typescript
// 1. React 核心
import { useState, useEffect, useCallback, useMemo } from 'react'

// 2. 第三方库
import { Table, Button, Input, Select, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

// 3. 项目内部公共模块（hooks、services、types、const）
import { useCommitData } from '@/hooks/useCommitData'
import { fetchCommits } from '@/services/api'
import type { CommitRecord } from '@/types/commit'
import { DEFAULT_PAGE_SIZE } from '@/const/common'

// 4. 业务子组件
import FilterPanel from './components/FilterPanel'
import CommitTable from './components/CommitTable'
```

### 组件内代码分层

函数组件内部按以下顺序组织：

1. Props 解构
2. 外部 Hook 调用（useRouter、自定义 hooks）
3. State 定义（useState）
4. 派生数据（useMemo）
5. 副作用（useEffect）
6. 事件处理方法（useCallback）
7. 渲染辅助函数
8. return JSX

```tsx
const CommitList = ({ startDate, endDate }: CommitListProps) => {
  // --- 外部 Hook ---
  const { loading, data, loadData } = useCommitData()

  // --- State ---
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // --- 派生数据 ---
  const isEmpty = useMemo(() => data.length === 0, [data])

  // --- 副作用 ---
  useEffect(() => {
    loadData(startDate, endDate)
  }, [startDate, endDate])

  // --- 事件处理 ---
  const handleRowClick = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  // --- 渲染 ---
  return (
    <div>
      {isEmpty ? <Empty /> : <Table dataSource={data} />}
    </div>
  )
}
```

### JSX 嵌套控制

- JSX 嵌套不超过 3 层，超过时拆为独立子组件
- 复杂条件渲染抽取为变量或独立函数

```tsx
// ✅ 推荐：拆分子组件
<FilterPanel filters={filters} onChange={handleFilterChange} />

// ❌ 避免：深层嵌套
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
- 组件外部的静态配置（如列定义、选项列表）定义在组件文件顶部或独立常量文件中
- 禁止在组件内零散定义魔法数字或硬编码字符串

```typescript
// src/const/common.ts
export const DEFAULT_PAGE_SIZE = 20
export const DATE_FORMAT = 'YYYY-MM-DD'

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
```

### 命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL`、`MAX_RETRY_COUNT` |
| 变量 | camelCase | `userList`、`pageIndex` |
| 布尔值 | `is/has/can` 前缀 | `isLoading`、`hasData`、`canEdit` |
| State | camelCase | `loading`、`expandedId` |
| Props 接口 | PascalCase + Props 后缀 | `FilterPanelProps`、`CommitTableProps` |
| 组件 | PascalCase | `FilterPanel`、`CommitTable` |

---

## 三、网络请求

### 文件组织

| 文件 | 职责 |
|------|------|
| `src/services/api.ts` | 请求封装与业务接口 |

### 规则

- 所有请求统一封装在 `src/services/` 目录下
- 禁止在组件中直接使用 `fetch` 或 `axios`
- 请求函数标注返回类型
- 错误处理在请求层统一抛出，组件层 catch 处理 UI 反馈

```typescript
// src/services/api.ts
import type { CommitRecord } from '@/types/commit'

export const fetchCommits = async (
  startDate: string,
  endDate: string
): Promise<CommitRecord[]> => {
  const params = new URLSearchParams({ startDate, endDate })
  const response = await fetch(`/api/gitlab/commits?${params}`)

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
```

### API 命名约定

| 前缀 | 用途 | 示例 |
|------|------|------|
| `query` | 查询列表 | `queryCommitList` |
| `get` | 查询详情/状态 | `getCommitDetail` |
| `fetch` | 获取（有副作用） | `fetchCommits` |
| `save` / `create` | 创建/保存 | `saveConfig` |
| `update` | 更新 | `updateFilter` |
| `delete` | 删除 | `deleteRecord` |

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

- 组件 Props 使用 `interface` 定义，命名为 `XxxProps`
- 使用可选链 `?.` 和空值合并 `??`
- API 返回值标注具体类型，避免 `any`
- 事件处理函数参数标注类型

```typescript
interface FilterPanelProps {
  projects: string[]
  selectedProject: string
  onProjectChange: (project: string) => void
}

const name = user?.profile?.name ?? '未知'
```

---

## 五、React 18 专项规范

### Hooks 使用规范

- 必须使用函数组件 + Hooks，禁止 class 组件
- 复杂逻辑抽取为 `src/hooks/useXxx.ts` 自定义 Hook
- 合理使用性能优化 Hooks：

| Hook | 使用场景 |
|------|----------|
| `useCallback` | 传递给子组件的回调函数，避免不必要的重渲染 |
| `useMemo` | 计算开销大的派生数据（过滤、排序等） |
| `useState` | 组件内部状态 |
| `useEffect` | 副作用（数据请求、订阅等） |

```typescript
// ✅ 推荐：传给子组件的回调用 useCallback
const handleRowClick = useCallback((id: string) => {
  setExpandedId(prev => prev === id ? null : id)
}, [])

// ✅ 推荐：大数据量过滤用 useMemo
const filteredData = useMemo(() => {
  return allData.filter(item => item.projectName === selectedProject)
}, [allData, selectedProject])

// ❌ 避免：不必要的 useMemo（简单计算）
const count = useMemo(() => list.length, [list])
```

### 异步处理

- 统一使用 `async/await`
- 在自定义 Hook 中封装异步逻辑，组件层保持简洁
- 使用 `try-catch-finally` 管理 loading 和错误状态
- 禁止空 `catch` 块

```typescript
// hooks/useCommitData.ts
const loadData = useCallback(async (startDate: string, endDate: string) => {
  setLoading(true)
  setError('')
  try {
    const data = await fetchCommits(startDate, endDate)
    setAllData(data)
  } catch (e: any) {
    setError(e?.message || '数据加载失败')
  } finally {
    setLoading(false)
  }
}, [])
```

### 组件设计原则

- 单一职责：一个组件只做一件事
- Props 向下传递，事件向上回调
- 避免在组件内直接操作 DOM，使用 `useRef` 替代
- 条件渲染优先使用三元表达式或 `&&` 短路

```tsx
// ✅ 推荐
{loading ? <Spin /> : <Table dataSource={data} />}
{error && <Alert message={error} type="error" />}

// ❌ 避免：复杂的 if-else 嵌套在 JSX 中
```

---

## 六、Ant Design 使用规范

### 组件引入

- 按需引入组件，不要整体导入
- 使用 `ConfigProvider` 包裹根组件，配置中文 locale

```tsx
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'

const Root = () => (
  <ConfigProvider locale={zhCN}>
    <AntApp>
      <App />
    </AntApp>
  </ConfigProvider>
)
```

### 表格（Table）

- 使用 `columns` 配置定义在组件外部或 useMemo 中
- 必须提供 `rowKey`
- 排序、筛选使用 Table 内置功能

### 表单（Form）

- 使用 `Form` + `Form.Item` 组合
- 表单验证使用 `rules` 属性
- 提交时使用 `form.validateFields()`

---

## 七、样式规范

- 优先使用 Ant Design 组件自带样式，减少自定义 CSS
- 组件级样式使用 CSS Modules 或 inline style 对象
- 全局样式存入 `src/styles/` 目录
- 禁止使用 `!important` 覆盖 Ant Design 样式

```tsx
// ✅ 推荐：inline style 对象（简单场景）
const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px' },
  title: { marginBottom: '20px' }
}

// ✅ 推荐：CSS Modules（复杂场景）
import styles from './App.module.scss'
<div className={styles.container}>...</div>
```

---

## 八、文件命名

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `FilterPanel.tsx`、`CommitTable.tsx` |
| Hook 文件 | camelCase，use 前缀 | `useCommitData.ts` |
| Service 文件 | camelCase | `api.ts` |
| 类型文件 | camelCase | `commit.ts` |
| 常量文件 | camelCase | `common.ts` |

---

## 九、目录约定

| 目录 | 用途 |
|------|------|
| `src/components/` | React 组件 |
| `src/hooks/` | 自定义 Hooks |
| `src/services/` | API 请求封装 |
| `src/types/` | TypeScript 类型定义 |
| `src/const/` | 常量定义 |
| `src/styles/` | 全局样式 |

---

## 十、注释规范

- 仅标注复杂逻辑和关键业务流程，避免冗余注释
- 代码命名应见名知意，减少注释依赖
- 自定义 Hook 和 service 方法使用 JSDoc 注释
- Props 接口中复杂字段添加行内注释

```typescript
interface CommitTableProps {
  data: CommitRecord[]
  /** 当前排序字段 */
  sortField: SortField
  /** 排序方向 */
  sortOrder: SortOrder
  /** 当前展开行的 ID，null 表示无展开 */
  expandedId: string | null
  onSort: (field: SortField) => void
  onRowClick: (id: string) => void
}
```

---

## 十一、微前端（qiankun 子应用）规范

- 入口文件使用 `renderWithQiankun` 注册生命周期
- 支持独立运行和作为子应用运行两种模式
- 子应用挂载点通过 `props.container` 获取

```tsx
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

renderWithQiankun({
  mount(props) {
    render(props.container as HTMLElement)
  },
  unmount() {
    root?.unmount()
    root = null
  }
})

// 独立运行
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
```

---

## 十二、严格禁止

1. 禁止使用 `var`
2. 禁止使用 `==` 比较
3. 禁止使用 class 组件
4. 禁止在组件中直接使用 `fetch`/`axios`，必须通过 services 封装
5. 禁止使用魔法数字，应定义为常量
6. 禁止空 catch 块
7. 禁止对函数参数重新赋值
8. 禁止使用 `eval`
9. 禁止在 `useEffect` 中直接定义 async 函数（应内部包裹）
10. 禁止使用 `!important` 覆盖组件库样式
