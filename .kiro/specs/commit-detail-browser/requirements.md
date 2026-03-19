# 需求文档

## 简介

提交记录明细浏览器（Commit Detail Browser）是一个独立的 React 前端应用，用于消费后端已有的 `GET /api/gitlab/commits` 接口，提供提交记录的明细查看能力。该应用与现有 Vue 前端形成互补：Vue 负责「统计概览」，React 负责「明细浏览」。

项目采用 qiankun 微前端架构，将现有 Vue 应用作为主应用（基座），React 应用作为子应用接入。通过 qiankun 实现两个技术栈应用的运行时集成，在同一个页面框架下按路由切换，同时保持各自独立开发和部署的能力。

当前后端 `CommitRecordDTO` 缺少 `additions` 和 `deletions` 字段（虽然内部模型 `CommitRecord` 已有这两个字段），因此需要对后端 DTO 做一次小幅补全，以支持代码增删行数的展示。

## 术语表

- **Commit_Browser**: 基于 React 构建的提交记录明细浏览前端应用
- **Commits_API**: 后端 `GET /api/gitlab/commits` 接口，接受 `startDate` 和 `endDate` 参数，返回 `CommitRecordDTO` 列表
- **CommitRecordDTO**: 后端返回的提交记录数据传输对象，包含 id、shortId、title、message、authorName、authorEmail、committedDate、projectId、projectName 字段（需补充 additions、deletions）
- **Commit_Table**: 提交记录表格组件，展示提交列表并支持交互操作
- **Filter_Panel**: 筛选面板组件，提供按项目、作者、日期范围筛选提交记录的能力
- **Detail_Panel**: 提交详情展开面板，展示 commit message 全文和代码增删量
- **qiankun**: 蚂蚁金服开源的微前端框架，基于 single-spa 封装，提供子应用注册、生命周期管理、沙箱隔离和应用间通信能力
- **主应用（基座）**: 现有 Vue 前端应用，负责整体布局、路由分发和子应用的注册与加载
- **子应用**: React 提交记录明细浏览器，通过 qiankun 生命周期钩子（bootstrap、mount、unmount）接入主应用

## 需求列表

### 需求 1：连接配置后的模块选择入口

**用户故事：** 作为用户，我希望在完成 GitLab 连接配置后，看到一个模块选择页面，以便在「代码统计」和「提交详情」两个功能模块之间自由切换。

#### 验收标准

1. 当用户完成 GitLab 连接配置后，主应用应展示模块选择页面，而非直接进入代码统计页面
2. 模块选择页面应提供两个入口卡片：「代码统计」（现有 Vue 功能）和「提交详情」（React 子应用）
3. 当用户点击「代码统计」时，主应用应加载并展示现有的 Vue 统计概览页面
4. 当用户点击「提交详情」时，主应用应通过 qiankun 加载并展示 React 提交记录明细浏览器
5. 模块选择页面应在两个入口卡片上展示简要的功能描述，帮助用户理解各模块用途
6. 在任一功能模块内，用户应能通过导航返回模块选择页面
7. 当用户尚未完成连接配置时，应仍然展示配置表单，配置成功后跳转到模块选择页面

### 需求 2：后端 DTO 补全

**用户故事：** 作为前端开发者，我希望 Commits_API 返回代码变更统计信息（新增行数和删除行数），以便 Commit_Browser 能够展示行级别的变更信息。

#### 验收标准

1. CommitRecordDTO 应包含 `additions`（int）和 `deletions`（int）字段
2. 当 Commits_API 返回提交记录时，CommitRecordDTO 应从内部 CommitRecord 模型中填充 additions 和 deletions 字段
3. 当提交记录没有代码变更数据时，CommitRecordDTO 的 additions 和 deletions 应返回 0

### 需求 3：提交记录表格展示

**用户故事：** 作为用户，我希望看到一个包含关键信息的提交记录表格，以便快速浏览提交明细。

#### 验收标准

1. 当 Commit_Browser 加载时，Commit_Table 应展示以下列：标题（title）、作者（authorName）、项目名（projectName）、提交时间（committedDate）、新增行数（additions）、删除行数（deletions）
2. Commit_Table 应将 committedDate 格式化为易读格式（YYYY-MM-DD HH:mm）
3. 当 Commits_API 返回空列表时，Commit_Table 应显示「暂无数据」占位提示
4. 当 Commits_API 请求失败时，Commit_Browser 应显示描述失败原因的错误信息

### 需求 4：搜索功能

**用户故事：** 作为用户，我希望通过关键词搜索提交记录，以便快速找到特定的提交。

#### 验收标准

1. Commit_Browser 应在 Commit_Table 上方提供搜索输入框
2. 当用户输入关键词时，Commit_Table 应筛选出标题（title）或作者（authorName）包含该关键词的记录（不区分大小写）
3. 当搜索输入框被清空时，Commit_Table 应显示当前筛选条件下的所有记录

### 需求 5：排序功能

**用户故事：** 作为用户，我希望按不同列对提交记录进行排序，以便按有意义的顺序组织数据。

#### 验收标准

1. Commit_Table 应支持按提交时间（committedDate）、新增行数（additions）和删除行数（deletions）列排序
2. 当用户点击可排序的列标题时，Commit_Table 应在升序和降序之间切换
3. 当 Commit_Browser 首次加载时，Commit_Table 应按提交时间降序排列（最新的在前）

### 需求 6：分页功能

**用户故事：** 作为用户，我希望对提交记录进行分页浏览，以便高效地浏览大量数据。

#### 验收标准

1. Commit_Table 应支持可配置的每页记录数，默认为 20 条
2. Commit_Browser 应提供分页控件，显示当前页码、总页数以及导航按钮（上一页、下一页、首页、末页）
3. 当用户切换页码时，Commit_Table 应显示对应页的记录
4. Commit_Browser 应允许用户从以下选项中选择每页条数：10、20、50

### 需求 7：筛选功能

**用户故事：** 作为用户，我希望按项目、作者和日期范围筛选提交记录，以便聚焦于特定的数据子集。

#### 验收标准

1. Filter_Panel 应提供项目下拉框，选项从已加载的提交记录中提取不重复的 projectName 值
2. Filter_Panel 应提供作者下拉框，选项从已加载的提交记录中提取不重复的 authorName 值
3. Filter_Panel 应提供日期范围输入（startDate 和 endDate），用于查询 Commits_API
4. 当用户选择项目筛选时，Commit_Table 应仅显示匹配所选 projectName 的记录
5. 当用户选择作者筛选时，Commit_Table 应仅显示匹配所选 authorName 的记录
6. 当用户修改日期范围并触发查询时，Commit_Browser 应使用更新后的 startDate 和 endDate 参数调用 Commits_API
7. 当多个筛选条件同时生效时，Commit_Table 应仅显示满足所有筛选条件的记录（AND 逻辑）

### 需求 8：提交详情展开

**用户故事：** 作为用户，我希望展开某条提交记录查看完整的 commit message 和代码变更统计，以便在不离开页面的情况下审查提交详情。

#### 验收标准

1. 当用户点击 Commit_Table 中的某行时，Detail_Panel 应在该行下方展开，显示完整的 commit message 文本
2. Detail_Panel 应以视觉区分的方式展示新增行数和删除行数（新增用绿色，删除用红色）
3. 当用户点击已展开的行时，Detail_Panel 应收起
4. Detail_Panel 应展示 commit shortId 和 authorEmail 作为补充信息

### 需求 9：GitLab 跳转链接（可选功能）

**用户故事：** 作为用户，我希望点击链接跳转到 GitLab 上对应的提交页面，以便查看完整的 diff 和上下文。

#### 验收标准

1. 当 GitLab 链接功能启用时，Detail_Panel 应为每条提交显示一个可点击的链接
2. 当 GitLab 链接功能启用时，Commit_Browser 应使用 `{serverUrl}/{projectPath}/-/commit/{commitId}` 模式构造 GitLab 提交 URL
3. 当用户点击 GitLab 链接时，Commit_Browser 应在新浏览器标签页中打开该 URL

### 需求 10：qiankun 微前端架构集成

**用户故事：** 作为开发者，我希望通过 qiankun 微前端框架将 React 子应用集成到现有 Vue 主应用中，以便两个不同技术栈的应用能在同一页面框架下协同运行，同时保持独立开发和部署的能力。

#### 验收标准

1. 现有 Vue 应用（`frontend/`）应作为 qiankun 主应用（基座），安装 `qiankun` 依赖并注册 React 子应用
2. 主应用应在页面中提供子应用挂载容器（如 `<div id="subapp-container"></div>`），用于渲染 React 子应用
3. 主应用应通过路由规则（如 `/commits` 路径前缀）激活 React 子应用的加载
4. React 子应用应导出 qiankun 要求的三个生命周期钩子：`bootstrap`、`mount`、`unmount`
5. React 子应用在 `mount` 钩子中应将自身渲染到主应用提供的挂载容器中，在 `unmount` 钩子中应正确卸载
6. React 子应用应支持独立运行模式（不通过 qiankun 加载时也能正常启动和开发）
7. qiankun 应启用 JS 沙箱和样式隔离，避免主应用与子应用之间的全局变量和样式冲突

### 需求 11：React 应用独立部署

**用户故事：** 作为开发者，我希望 Commit_Browser 是 monorepo 中的一个独立 React 应用，以便可以独立于 Vue 前端进行开发和部署。

#### 验收标准

1. Commit_Browser 应作为 monorepo 根目录下的独立目录（如 `react-app/`），与现有的 `frontend/` 和 `backend/` 目录并列
2. Commit_Browser 应使用 React 18、TypeScript 和 Vite 作为构建工具链
3. Commit_Browser 在开发环境下应将 API 请求代理到后端服务器 `http://localhost:8080`
4. Commit_Browser 的开发端口应与现有 Vue 前端（端口 5173）不同
