# 实施计划：提交记录明细浏览器（Commit Detail Browser）

## 概述

基于需求和设计文档，将实施分为六个阶段：后端 DTO 补全、Vue 主应用路由与微前端改造、React 子应用脚手架搭建、React 核心功能实现、qiankun 集成联调、最终验证。每个阶段递增构建，确保无孤立代码。

## 任务列表

- [x] 1. 后端 DTO 补全
  - [x] 1.1 在 CommitRecordDTO 中添加 additions 和 deletions 字段
    - 修改 `backend/src/main/java/com/example/dto/CommitRecordDTO.java`，添加 `additions`（int）和 `deletions`（int）字段
    - 修改 `backend/src/main/java/com/example/controller/GitLabController.java` 中的 `convertToCommitDTO` 方法，将 `CommitRecord` 的 additions 和 deletions 映射到 DTO
    - 当 CommitRecord 无代码变更数据时，DTO 的 additions 和 deletions 默认返回 0
    - _需求: 2.1, 2.2, 2.3_

  - [ ]* 1.2 编写 CommitRecordDTO 字段映射单元测试
    - 在 `backend/src/test/` 下创建测试类，验证 convertToCommitDTO 正确映射 additions 和 deletions
    - 验证当 additions/deletions 未设置时默认为 0
    - _需求: 2.1, 2.2, 2.3_

- [x] 2. 检查点 - 后端变更验证
  - 确保后端编译通过（`mvn clean install`），所有测试通过，如有问题请询问用户。

- [x] 3. Vue 主应用路由与微前端基座改造
  - [x] 3.1 安装 vue-router 和 qiankun 依赖
    - 在 `frontend/` 目录下安装 `vue-router@4` 和 `qiankun` 依赖
    - _需求: 10.1_

  - [x] 3.2 配置 vue-router 路由
    - 创建 `frontend/src/router/index.ts`，定义三条路由：
      - `/` → 模块选择页 ModuleSelect
      - `/stats` → 现有代码统计页 GitLabStats
      - `/commits` → 子应用容器页 SubAppContainer（包含 `<div id="subapp-container">` 挂载点）
    - 修改 `frontend/src/main.ts`，引入并使用 vue-router
    - 修改 `frontend/src/App.vue`，将直接引用 `<GitLabStats />` 替换为 `<router-view />`
    - _需求: 1.1, 1.3, 1.4, 10.3_

  - [x] 3.3 创建模块选择页组件
    - 创建 `frontend/src/views/ModuleSelect.vue`
    - 展示两个入口卡片：「代码统计」和「提交详情」，各附简要功能描述
    - 点击「代码统计」跳转 `/stats`，点击「提交详情」跳转 `/commits`
    - 使用 Element Plus 的 `el-card` 组件实现卡片布局
    - _需求: 1.1, 1.2, 1.5_

  - [x] 3.4 创建子应用容器页组件
    - 创建 `frontend/src/views/SubAppContainer.vue`
    - 包含 `<div id="subapp-container"></div>` 作为 qiankun 子应用挂载点
    - 包含加载状态提示
    - _需求: 10.2_

  - [x] 3.5 修改 GitLabStats 页面支持导航返回
    - 在 `frontend/src/views/GitLabStats.vue` 中，已配置状态下添加「返回模块选择」按钮，点击跳转 `/`
    - 修改配置成功后的跳转逻辑：配置成功后跳转到 `/`（模块选择页）而非直接显示统计
    - _需求: 1.6, 1.7_

  - [x] 3.6 注册 qiankun 子应用
    - 在 `frontend/src/main.ts` 中引入 qiankun 的 `registerMicroApps` 和 `start`
    - 注册 React 子应用：name 为 `react-app`，entry 为 `//localhost:5174`（开发环境），container 为 `#subapp-container`，activeRule 为 `/commits`
    - 启用 JS 沙箱（`sandbox: { strictStyleIsolation: true }`）和样式隔离
    - 调用 `start()` 启动 qiankun
    - _需求: 10.1, 10.3, 10.7_

  - [ ]* 3.7 编写模块选择页组件测试
    - 测试两个卡片正确渲染及功能描述展示
    - 测试点击卡片触发正确的路由跳转
    - _需求: 1.2, 1.5_

- [x] 4. 检查点 - Vue 主应用验证
  - 确保 Vue 主应用编译通过，路由切换正常，模块选择页正确展示，如有问题请询问用户。

- [x] 5. React 子应用脚手架搭建
  - [x] 5.1 初始化 React 子应用项目
    - 在根目录下创建 `react-app/` 目录
    - 初始化 `package.json`，安装 React 18、TypeScript、Vite 核心依赖
    - 安装 `vite-plugin-qiankun` 或手动配置 qiankun 生命周期支持
    - 创建 `tsconfig.json`、`vite.config.ts`（开发端口 5174，API 代理到 `http://localhost:8080`）
    - 创建 `index.html` 入口文件
    - _需求: 11.1, 11.2, 11.3, 11.4_

  - [x] 5.2 配置 Vite 构建以支持 qiankun
    - 在 `react-app/vite.config.ts` 中配置：
      - `server.port` 为 5174
      - `server.cors` 为 true（允许主应用跨域加载）
      - `server.origin` 指向 `http://localhost:5174`（确保资源路径正确）
      - 配置 library 模式或 UMD 输出格式以支持 qiankun 加载
    - 配置 API 代理：`/api` → `http://localhost:8080`
    - _需求: 11.3, 11.4, 10.4_

  - [x] 5.3 实现 qiankun 生命周期钩子与独立运行模式
    - 创建 `react-app/src/main.tsx` 作为应用入口
    - 导出 `bootstrap`、`mount`、`unmount` 三个生命周期钩子
    - `mount` 钩子中将 React 应用渲染到 qiankun 提供的容器（`props.container`）或默认 `#root`
    - `unmount` 钩子中正确卸载 React 应用（`root.unmount()`）
    - 实现独立运行判断：当不在 qiankun 环境时（`window.__POWERED_BY_QIANKUN__` 为 false），自动渲染到 `#root`
    - _需求: 10.4, 10.5, 10.6_

  - [x] 5.4 创建基础 App 组件和类型定义
    - 创建 `react-app/src/App.tsx` 作为根组件，暂时渲染占位内容
    - 创建 `react-app/src/types/commit.ts`，定义 `CommitRecord` 接口（对应后端 CommitRecordDTO 的所有字段，包括 additions 和 deletions）
    - 创建 `react-app/src/services/api.ts`，封装 `fetchCommits(startDate, endDate)` 函数调用 `GET /api/gitlab/commits`
    - _需求: 3.1, 2.1, 11.2_

- [x] 6. 检查点 - React 子应用基础验证
  - 确保 React 子应用可独立启动（`npm run dev`），能正确渲染占位内容，如有问题请询问用户。

- [x] 7. React 子应用核心功能实现
  - [x] 7.1 实现 FilterPanel 筛选面板组件
    - 创建 `react-app/src/components/FilterPanel.tsx`
    - 实现日期范围选择器（startDate、endDate），用于触发 API 查询
    - 实现项目下拉框（从已加载数据中提取不重复 projectName）
    - 实现作者下拉框（从已加载数据中提取不重复 authorName）
    - 筛选变更通过回调通知父组件
    - _需求: 7.1, 7.2, 7.3, 7.6_

  - [x] 7.2 实现 useCommitData 自定义 Hook
    - 创建 `react-app/src/hooks/useCommitData.ts`
    - 管理数据获取状态（loading、error、data）
    - 实现客户端筛选逻辑：按 projectName、authorName 筛选（AND 逻辑）
    - 实现客户端搜索逻辑：按 title 或 authorName 模糊匹配（不区分大小写）
    - 实现客户端排序逻辑：支持按 committedDate、additions、deletions 升序/降序
    - 实现客户端分页逻辑：默认每页 20 条，支持 10/20/50 切换
    - 默认按 committedDate 降序排列
    - _需求: 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 7.4, 7.5, 7.7_

  - [ ]* 7.3 编写 useCommitData Hook 单元测试
    - 测试搜索过滤逻辑（大小写不敏感匹配 title 和 authorName）
    - 测试排序逻辑（升序/降序切换）
    - 测试分页逻辑（页码切换、每页条数变更后重置页码）
    - 测试多条件筛选 AND 逻辑
    - _需求: 4.2, 5.1, 5.2, 6.1, 6.4, 7.7_

  - [x] 7.4 实现 CommitTable 表格组件
    - 创建 `react-app/src/components/CommitTable.tsx`
    - 展示列：标题（title）、作者（authorName）、项目名（projectName）、提交时间（committedDate，格式化为 YYYY-MM-DD HH:mm）、新增行数（additions）、删除行数（deletions）
    - 可排序列（committedDate、additions、deletions）的列标题显示排序指示器，点击切换升序/降序
    - 空数据时显示「暂无数据」占位提示
    - 行点击触发详情展开/收起回调
    - _需求: 3.1, 3.2, 3.3, 5.1, 5.2_

  - [x] 7.5 实现 DetailPanel 详情展开面板
    - 创建 `react-app/src/components/DetailPanel.tsx`
    - 在表格行下方展开，显示完整 commit message 文本
    - 展示 shortId 和 authorEmail 作为补充信息
    - 新增行数用绿色展示，删除行数用红色展示
    - 可选：构造 GitLab 链接 `{serverUrl}/{projectPath}/-/commit/{commitId}`，在新标签页打开
    - 再次点击已展开行时收起面板
    - _需求: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3_

  - [x] 7.6 实现搜索输入框组件
    - 创建 `react-app/src/components/SearchBar.tsx`
    - 在表格上方提供搜索输入框
    - 输入关键词时通过回调通知父组件触发筛选
    - 清空输入框时恢复显示所有记录
    - _需求: 4.1, 4.2, 4.3_

  - [x] 7.7 实现 Pagination 分页组件
    - 创建 `react-app/src/components/Pagination.tsx`
    - 显示当前页码、总页数、导航按钮（上一页、下一页、首页、末页）
    - 提供每页条数选择器（10、20、50）
    - _需求: 6.1, 6.2, 6.3, 6.4_

  - [x] 7.8 组装 CommitBrowser 主页面
    - 修改 `react-app/src/App.tsx`，组装 FilterPanel、SearchBar、CommitTable、DetailPanel、Pagination
    - 使用 useCommitData Hook 管理所有状态
    - 处理 API 请求失败时的错误信息展示
    - 初始加载时使用默认日期范围（如近 30 天）调用 API
    - _需求: 3.4, 7.6_

  - [ ]* 7.9 编写 CommitTable 组件测试
    - 测试表格正确渲染各列数据
    - 测试日期格式化为 YYYY-MM-DD HH:mm
    - 测试空数据时显示「暂无数据」
    - 测试排序指示器点击切换
    - _需求: 3.1, 3.2, 3.3, 5.1_

- [x] 8. 检查点 - React 子应用功能验证
  - 确保 React 子应用独立运行时所有功能正常（表格、搜索、排序、分页、筛选、详情展开），如有问题请询问用户。

- [x] 9. qiankun 集成联调
  - [x] 9.1 联调主应用与子应用通信
    - 确保 Vue 主应用的 qiankun 注册配置与 React 子应用的生命周期钩子正确对接
    - 验证从模块选择页点击「提交详情」后，React 子应用正确加载到 `#subapp-container` 中
    - 验证从 `/commits` 路由切换回 `/` 或 `/stats` 时，React 子应用正确卸载
    - _需求: 10.2, 10.3, 10.4, 10.5_

  - [x] 9.2 处理样式隔离和路由冲突
    - 确保 React 子应用的样式不影响 Vue 主应用（qiankun 沙箱隔离）
    - 确保 React 子应用内部无路由冲突（子应用为单页面，无需内部路由）
    - 添加全局样式重置，防止子应用容器样式溢出
    - _需求: 10.7_

- [x] 10. 最终检查点 - 全流程验证
  - 确保所有测试通过，主应用与子应用联调正常，完整流程可用（配置 → 模块选择 → 代码统计/提交详情切换），如有问题请询问用户。

## 备注

- 标记 `*` 的子任务为可选测试任务，可跳过以加速 MVP 交付
- 每个任务引用了对应的需求编号，确保需求全覆盖
- 检查点任务用于阶段性验证，确保增量构建的正确性
- React 子应用的所有筛选、排序、分页均为客户端处理（API 已返回日期范围内全量数据）
