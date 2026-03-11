# Requirements Document

## Introduction

GitLab 提交统计可视化功能，用于展示个人用户在 GitLab 上的提交活动数据。系统通过调用 GitLab API 获取用户提交记录，并以图表形式直观呈现提交趋势和统计信息。

## Glossary

- **Commit_Stats_System**: 提交统计系统，负责获取、处理和展示 GitLab 提交数据的完整系统
- **GitLab_API_Service**: GitLab API 服务层，负责与 GitLab API 进行通信获取提交数据
- **Stats_Dashboard**: 统计仪表盘，前端页面组件，用于展示提交统计图表
- **Commit_Record**: 提交记录，包含提交时间、提交信息、项目等信息的数据结构
- **Date_Range_Selector**: 日期范围选择器，用于筛选特定时间段的提交数据
- **Chart_Component**: 图表组件，使用 ECharts 或 AntV 渲染的可视化图表

## Requirements

### Requirement 1: GitLab 连接配置

**User Story:** As a 用户, I want 配置 GitLab 服务器地址、用户名和访问令牌, so that 系统能够访问我的 GitLab 提交数据。

#### Acceptance Criteria

1. THE Commit_Stats_System SHALL 提供 GitLab 服务器 URL 配置输入框
2. THE Commit_Stats_System SHALL 提供 GitLab 用户名配置输入框
3. THE Commit_Stats_System SHALL 提供 GitLab Personal Access Token 配置输入框
4. WHEN 用户提交配置信息, THE GitLab_API_Service SHALL 验证连接是否有效
5. IF 连接验证失败, THEN THE Commit_Stats_System SHALL 显示具体的错误信息
6. WHEN 连接验证成功, THE Commit_Stats_System SHALL 保存配置信息并显示成功提示
7. IF 用户名输入为空, THEN THE Commit_Stats_System SHALL 显示用户名必填的提示信息

### Requirement 2: 获取用户提交数据

**User Story:** As a 用户, I want 系统自动获取我的 GitLab 提交记录, so that 我可以查看自己的提交活动。

#### Acceptance Criteria

1. WHEN 用户完成 GitLab 配置, THE GitLab_API_Service SHALL 获取当前用户的基本信息
2. THE GitLab_API_Service SHALL 获取用户有权限访问的所有项目列表
3. THE GitLab_API_Service SHALL 获取每个项目中该用户的提交记录
4. WHEN 获取数据过程中发生网络错误, THE Commit_Stats_System SHALL 显示错误信息并提供重试选项
5. IF GitLab API 返回速率限制错误, THEN THE GitLab_API_Service SHALL 等待适当时间后自动重试

### Requirement 3: 提交数据统计展示

**User Story:** As a 用户, I want 以图表形式查看我的提交统计, so that 我可以直观了解自己的提交活动趋势。

#### Acceptance Criteria

1. THE Stats_Dashboard SHALL 展示提交次数按日期分布的折线图或柱状图
2. THE Stats_Dashboard SHALL 展示提交次数按项目分布的饼图或柱状图
3. THE Stats_Dashboard SHALL 展示总提交次数、活跃天数、平均每日提交数等汇总指标
4. WHEN 提交数据更新, THE Chart_Component SHALL 在 500 毫秒内完成图表重新渲染
5. THE Chart_Component SHALL 支持鼠标悬停显示详细数据提示

### Requirement 4: 日期范围筛选

**User Story:** As a 用户, I want 按日期范围筛选提交数据, so that 我可以查看特定时间段的提交活动。

#### Acceptance Criteria

1. THE Date_Range_Selector SHALL 提供开始日期和结束日期选择器
2. THE Date_Range_Selector SHALL 提供快捷选项：最近 7 天、最近 30 天、最近 90 天、今年
3. WHEN 用户选择日期范围, THE Stats_Dashboard SHALL 仅展示该范围内的提交数据
4. IF 用户选择的结束日期早于开始日期, THEN THE Date_Range_Selector SHALL 显示日期范围无效的提示
5. THE Date_Range_Selector SHALL 默认显示最近 30 天的数据

### Requirement 5: 数据刷新

**User Story:** As a 用户, I want 手动刷新提交数据, so that 我可以获取最新的提交记录。

#### Acceptance Criteria

1. THE Stats_Dashboard SHALL 提供手动刷新按钮
2. WHEN 用户点击刷新按钮, THE GitLab_API_Service SHALL 重新获取提交数据
3. WHILE 数据刷新进行中, THE Stats_Dashboard SHALL 显示加载状态指示器
4. WHEN 数据刷新完成, THE Stats_Dashboard SHALL 显示最后更新时间
5. IF 刷新过程中发生错误, THEN THE Commit_Stats_System SHALL 保留之前的数据并显示错误提示

### Requirement 6: 响应式布局

**User Story:** As a 用户, I want 在不同设备上正常使用统计功能, so that 我可以随时查看提交数据。

#### Acceptance Criteria

1. THE Stats_Dashboard SHALL 在桌面端（宽度大于 1024 像素）以多列布局展示图表
2. THE Stats_Dashboard SHALL 在平板端（宽度 768-1024 像素）以双列布局展示图表
3. THE Stats_Dashboard SHALL 在移动端（宽度小于 768 像素）以单列布局展示图表
4. WHEN 浏览器窗口大小改变, THE Chart_Component SHALL 自动调整图表尺寸

### Requirement 7: 后端 API 接口

**User Story:** As a 前端开发者, I want 后端提供统一的 API 接口, so that 前端可以获取处理后的提交统计数据。

#### Acceptance Criteria

1. THE GitLab_API_Service SHALL 提供 POST /api/gitlab/config 接口用于保存和验证 GitLab 配置
2. THE GitLab_API_Service SHALL 提供 GET /api/gitlab/commits 接口用于获取提交记录列表
3. THE GitLab_API_Service SHALL 提供 GET /api/gitlab/stats 接口用于获取统计汇总数据
4. WHEN API 请求参数无效, THE GitLab_API_Service SHALL 返回 400 状态码和错误详情
5. WHEN GitLab 认证失败, THE GitLab_API_Service SHALL 返回 401 状态码和错误信息
6. THE GitLab_API_Service SHALL 对 GitLab API 响应数据进行缓存，缓存有效期为 5 分钟
