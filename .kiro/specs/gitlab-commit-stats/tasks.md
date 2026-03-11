# Implementation Plan: GitLab Commit Stats

## Overview

全栈实现 GitLab 提交统计可视化功能。后端使用 Spring Boot 提供 RESTful API（含 GitLab API 集成、Caffeine 缓存），前端使用 Vue 3 + ECharts 构建交互式仪表盘。采用自底向上的实现顺序：后端数据模型 → 服务层 → 控制器 → 前端服务层 → 组件 → 页面集成。

## Tasks

- [x] 1. 后端数据模型与 DTO 定义
  - [x] 1.1 创建后端内部模型类
    - 创建 `backend/src/main/java/com/example/model/GitLabConfig.java`（serverUrl, username, token, userId 字段）
    - 创建 `backend/src/main/java/com/example/model/CommitRecord.java`（id, shortId, title, message, authorName, authorEmail, committedDate, projectId, projectName 字段）
    - 创建 `backend/src/main/java/com/example/model/CommitStats.java`（totalCommits, activeDays, avgDailyCommits, projectCount, dailyCommits, projectCommits 字段）
    - _Requirements: 2.3, 3.3_
  - [x] 1.2 创建请求和响应 DTO
    - 创建 `GitLabConfigRequest.java`，包含 @NotBlank 和 @Pattern 校验注解
    - 创建 `ConfigResponse.java`（success, message, userId, userName）
    - 创建 `CommitRecordDTO.java`、`CommitStatsResponse.java`、`DailyCommitDTO.java`、`ProjectCommitDTO.java`
    - _Requirements: 1.1, 1.2, 1.3, 1.7, 7.1, 7.2, 7.3_
  - [x] 1.3 创建 GitLab API 响应模型
    - 创建 `backend/src/main/java/com/example/client/dto/` 目录
    - 创建 `GitLabUserResponse.java`、`GitLabProjectResponse.java`、`GitLabCommitResponse.java`
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. 后端异常处理与缓存配置
  - [x] 2.1 创建自定义异常和全局异常处理器
    - 创建 `GitLabApiException.java`（包含 statusCode 字段）
    - 创建 `GlobalExceptionHandler.java`，处理 GitLabApiException（401→UNAUTHORIZED, 429→TOO_MANY_REQUESTS）、MethodArgumentNotValidException（400）、通用 Exception（500）
    - _Requirements: 1.5, 2.4, 7.4, 7.5_
  - [x] 2.2 配置 Caffeine 缓存
    - 添加 Caffeine 依赖到 `backend/pom.xml`
    - 创建 `CacheConfig.java`，配置 5 分钟过期的缓存
    - _Requirements: 7.6_
  - [ ]* 2.3 编写全局异常处理器单元测试
    - 测试 GitLabApiException 401 返回 UNAUTHORIZED
    - 测试 GitLabApiException 429 返回 TOO_MANY_REQUESTS
    - 测试参数校验异常返回 400
    - _Requirements: 7.4, 7.5_

- [x] 3. 后端 GitLab API 客户端
  - [x] 3.1 实现 GitLabApiClient
    - 创建 `backend/src/main/java/com/example/client/GitLabApiClient.java`
    - 使用 RestTemplate 实现：验证 Token 获取用户信息、获取用户项目列表（分页）、获取项目提交记录（按用户和日期范围过滤）
    - 处理 GitLab API 速率限制（429 状态码自动重试）
    - _Requirements: 1.4, 2.1, 2.2, 2.3, 2.5_
  - [ ]* 3.2 编写 GitLabApiClient 单元测试
    - Mock RestTemplate 测试各 API 调用
    - 测试 401 认证失败场景
    - 测试 429 速率限制重试逻辑
    - _Requirements: 1.4, 2.4, 2.5_

- [x] 4. 后端 Service 层实现
  - [x] 4.1 创建 GitLabService 接口
    - 定义 validateAndSaveConfig、getCommits、getStats、refreshCache 方法
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 4.2 实现 GitLabServiceImpl
    - 实现配置验证与保存逻辑（调用 GitLabApiClient 验证 Token）
    - 实现提交记录获取逻辑（遍历所有项目获取用户提交）
    - 实现统计数据计算逻辑（totalCommits, activeDays, avgDailyCommits, projectCount, dailyCommits, projectCommits）
    - 集成 Caffeine 缓存，缓存 commits 和 stats 数据
    - 实现 refreshCache 清除缓存
    - _Requirements: 1.4, 1.6, 2.1, 2.2, 2.3, 3.3, 5.2, 7.6_
  - [ ]* 4.3 编写统计计算属性测试 (jqwik)
    - **Property 5: Statistics Calculation Correctness**
    - 生成随机 CommitRecord 列表，验证 totalCommits == commits.size()、activeDays == 唯一日期数、avgDailyCommits == totalCommits / activeDays、projectCount == 唯一项目数
    - **Validates: Requirements 3.3**
  - [ ]* 4.4 编写日期范围过滤属性测试 (jqwik)
    - **Property 6: Date Range Filtering**
    - 生成随机提交列表和日期范围，验证过滤结果中所有提交日期都在范围内，且范围内的提交都被包含
    - **Validates: Requirements 4.3**
  - [ ]* 4.5 编写 GitLabServiceImpl 单元测试
    - Mock GitLabApiClient 测试配置验证成功/失败
    - 测试空项目列表场景
    - 测试缓存命中和未命中场景
    - _Requirements: 1.4, 1.5, 1.6, 7.6_

- [x] 5. 后端 Controller 层实现
  - [x] 5.1 实现 GitLabController
    - 创建 `backend/src/main/java/com/example/controller/GitLabController.java`
    - 实现 POST /api/gitlab/config（@Valid 校验请求体）
    - 实现 GET /api/gitlab/commits（startDate, endDate 参数，@DateTimeFormat 注解）
    - 实现 GET /api/gitlab/stats（startDate, endDate 参数）
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ]* 5.2 编写 Controller 集成测试
    - 使用 @WebMvcTest 测试各端点
    - 测试参数校验失败返回 400
    - 测试认证失败返回 401
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. Checkpoint - 后端功能验证
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. 前端类型定义与常量
  - [x] 7.1 创建 TypeScript 类型定义
    - 创建 `frontend/src/types/gitlab.ts`
    - 定义 GitLabConfig、ConfigResponse、DateRangeParams、CommitRecord、CommitStats、DailyCommitData、ProjectCommitData 接口
    - _Requirements: 1.1, 1.2, 1.3, 3.3_
  - [x] 7.2 创建常量定义
    - 创建 `frontend/src/const/gitlabStats.ts`
    - 定义日期快捷选项（最近 7 天、30 天、90 天、今年）
    - 定义默认日期范围（最近 30 天）
    - _Requirements: 4.2, 4.5_

- [x] 8. 前端 API 服务层
  - [x] 8.1 实现 gitlabService.ts
    - 创建 `frontend/src/services/gitlabService.ts`
    - 实现 saveGitLabConfig、getCommitList、getCommitStats 函数
    - 使用 fetch 或 axios 封装 HTTP 请求
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 9. 前端组合式函数
  - [x] 9.1 实现 useGitLabStats.ts
    - 创建 `frontend/src/hooks/useGitLabStats.ts`
    - 管理状态：statsData, isLoading, errorMessage, canRetry, lastUpdated, dateRange, isConfigured
    - 实现 fetchStats（获取统计数据，错误处理保留旧数据）
    - 实现 refreshData（清除缓存并重新获取）
    - 实现 handleConfigSuccess（配置成功后自动获取数据）
    - 实现日期范围变更处理
    - _Requirements: 2.4, 3.3, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. 前端组件实现
  - [x] 10.1 实现 ConfigForm.vue
    - 创建 `frontend/src/components/gitlab-stats/ConfigForm.vue`
    - 包含 serverUrl、username、token 输入框
    - 实现前端表单校验（空值检查、URL 格式校验）
    - 提交时调用 saveGitLabConfig，显示成功/失败提示
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [x] 10.2 实现 DateRangeSelector.vue
    - 创建 `frontend/src/components/gitlab-stats/DateRangeSelector.vue`
    - 包含开始日期和结束日期选择器
    - 包含快捷选项按钮（最近 7 天、30 天、90 天、今年）
    - 校验结束日期不早于开始日期，无效时显示提示
    - 默认选中最近 30 天
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 10.3 实现 StatsOverview.vue
    - 创建 `frontend/src/components/gitlab-stats/StatsOverview.vue`
    - 展示总提交次数、活跃天数、平均每日提交数、项目数量卡片
    - 支持 loading 状态骨架屏
    - _Requirements: 3.3_
  - [x] 10.4 实现 CommitLineChart.vue
    - 创建 `frontend/src/components/gitlab-stats/CommitLineChart.vue`
    - 使用 ECharts 渲染提交次数按日期分布的折线图
    - 支持鼠标悬停显示详细数据 tooltip
    - 监听窗口 resize 事件自动调整图表尺寸
    - _Requirements: 3.1, 3.4, 3.5, 6.4_
  - [ ] 10.5 实现 ProjectPieChart.vue
    - 创建 `frontend/src/components/gitlab-stats/ProjectPieChart.vue`
    - 使用 ECharts 渲染提交次数按项目分布的饼图
    - 支持鼠标悬停显示详细数据 tooltip
    - 监听窗口 resize 事件自动调整图表尺寸
    - _Requirements: 3.2, 3.4, 3.5, 6.4_

- [x] 11. Checkpoint - 前端组件验证
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. 前端页面集成与响应式布局
  - [x] 12.1 实现 GitLabStats.vue 主页面
    - 创建 `frontend/src/views/GitLabStats.vue`
    - 集成 ConfigForm、DateRangeSelector、StatsOverview、CommitLineChart、ProjectPieChart 组件
    - 使用 useGitLabStats 组合式函数管理状态
    - 包含手动刷新按钮和最后更新时间显示
    - 未配置时显示配置表单，已配置时显示统计仪表盘
    - _Requirements: 5.1, 5.3, 5.4_
  - [x] 12.2 实现响应式布局样式
    - 桌面端（>1024px）：多列布局展示图表
    - 平板端（768-1024px）：双列布局
    - 移动端（<768px）：单列布局
    - 使用 CSS Grid 或 Flexbox 实现
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 12.3 配置前端路由和入口
    - 在 App.vue 或路由配置中添加 GitLabStats 页面入口
    - 配置 Vite 代理将 /api 请求转发到后端 8080 端口
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 13. 前端属性测试与单元测试
  - [ ]* 13.1 编写统计计算属性测试 (fast-check)
    - **Property 5: Statistics Calculation Correctness**
    - 生成随机 CommitRecord 数组，验证 totalCommits、activeDays、avgDailyCommits、projectCount 计算正确性
    - **Validates: Requirements 3.3**
  - [ ]* 13.2 编写日期范围过滤属性测试 (fast-check)
    - **Property 6: Date Range Filtering**
    - 生成随机提交列表和日期范围，验证过滤结果正确性
    - **Validates: Requirements 4.3**
  - [ ]* 13.3 编写日期范围校验属性测试 (fast-check)
    - **Property 7: Invalid Date Range Rejection**
    - 生成 endDate < startDate 的日期对，验证校验拒绝无效范围
    - **Validates: Requirements 4.4**
  - [ ]* 13.4 编写 ConfigForm 单元测试
    - 测试空用户名显示错误提示
    - 测试无效 URL 格式显示错误提示
    - 测试提交成功后触发 success 事件
    - _Requirements: 1.5, 1.7_
  - [ ]* 13.5 编写 DateRangeSelector 单元测试
    - 测试默认选中最近 30 天
    - 测试快捷选项切换
    - 测试无效日期范围提示
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 14. Final checkpoint - 全部功能验证
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 后端使用 Java 8，前端使用 TypeScript 5.9 + Vue 3.5
- 属性测试后端使用 jqwik，前端使用 fast-check
- 每个属性测试至少运行 100 次迭代
- Checkpoints ensure incremental validation
