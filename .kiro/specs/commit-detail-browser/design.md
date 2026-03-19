# 设计文档：提交记录明细浏览器（Commit Detail Browser）

## 概述

本设计文档描述如何在现有全栈应用中引入一个基于 React 的提交记录明细浏览器子应用，并通过 qiankun 微前端框架与现有 Vue 主应用集成。

核心变更包括三个层面：

1. **后端 DTO 补全**：在 `CommitRecordDTO` 中添加 `additions` 和 `deletions` 字段，使 API 返回完整的代码变更统计
2. **Vue 主应用改造**：引入 qiankun，增加模块选择页面和路由管理，注册 React 子应用
3. **React 子应用构建**：在 `react-app/` 目录下创建独立的 React 应用，实现提交记录的表格展示、搜索、排序、分页、筛选和详情展开功能

### 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 微前端框架 | qiankun | 需求明确指定；成熟的 single-spa 封装，支持 JS 沙箱和样式隔离 |
| 前端筛选/排序/分页 | 客户端处理 | `GET /api/gitlab/commits` 已返回日期范围内全量数据，无需后端分页 |
| React 子应用构建工具 | Vite | 与现有 Vue 前端保持一致的构建工具链 |
| 状态管理 | React hooks（useState/useReducer） | 应用状态简单，无需引入 Redux 等外部状态库 |
| 日期范围查询 | 子应用独立调用 API | 子应用拥有自己的 Filter_Panel，独立管理日期范围参数 |

## 架构

### 整体架构图

```mermaid
graph TB
    subgraph Browser["浏览器"]
        subgraph VueMain["Vue 主应用（基座）"]
            Router["路由管理"]
            ModuleSelect["模块选择页"]
            StatsPage["代码统计页"]
            SubAppContainer["子应用挂载容器<br/>#subapp-container"]
        end
        subgraph ReactSub["React 子应用（qiankun 沙箱内）"]
            CommitBrowser["CommitBrowser"]
            FilterPanel["FilterPanel"]
            CommitTable["CommitTable"]
            DetailPanel["DetailPanel"]
        end
    end
    subgraph Backend["Spring Boot 后端"]
        GitLabController["GitLabController"]
        CommitsAPI["GET /api/gitlab/commits"]
        ConfigAPI["GET /api/gitlab/config/status"]
    end

    Router -->|"/"| ModuleSelect
    Router -->|"/stats"| StatsPage
    Router -->|"/commits"| SubAppContainer
    SubAppContainer -.->|"qiankun mount"| ReactSub
    CommitBrowser --> CommitsAPI
    StatsPage --> ConfigAPI
    VueMain --> ConfigAPI
