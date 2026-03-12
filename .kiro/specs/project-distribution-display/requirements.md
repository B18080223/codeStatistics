# 需求文档

## 简介

完善 GitLab 提交统计中的项目分布展示功能。当前实现仅提供一个简单的饼图展示项目提交次数分布，缺少详细的数据表格、排序能力、项目占比信息以及空数据状态处理。本需求旨在增强项目分布展示的信息密度、交互体验和数据可读性，使用户能更直观地了解各项目的提交贡献情况。

## 术语表

- **ProjectDistribution_Component**：项目分布展示组件，负责以图表和表格形式展示各项目的提交统计数据
- **PieChart**：饼图区域，使用 ECharts 渲染的环形饼图，展示项目提交次数占比
- **ProjectTable**：项目数据表格，以列表形式展示每个项目的详细提交统计信息
- **ProjectCommitData**：项目提交数据，包含项目 ID、项目名称和提交次数的数据结构
- **CommitStats_API**：后端统计汇总接口，返回包含项目提交分布在内的统计数据

## 需求

### 需求 1：项目数据表格展示

**用户故事：** 作为一名开发者，我希望在饼图下方看到项目提交数据的详细表格，以便快速查看每个项目的具体提交次数和占比。

#### 验收标准

1. THE ProjectDistribution_Component SHALL 在饼图下方展示一个包含项目名称、提交次数和提交占比三列的数据表格
2. WHEN ProjectCommitData 列表包含数据时，THE ProjectTable SHALL 按提交次数从高到低排序展示所有项目
3. THE ProjectTable SHALL 将每个项目的提交占比以百分比格式展示，保留一位小数
4. WHEN 用户将鼠标悬停在 ProjectTable 的某一行时，THE ProjectDistribution_Component SHALL 高亮对应的表格行

### 需求 2：饼图交互增强

**用户故事：** 作为一名开发者，我希望饼图能展示更丰富的信息并支持交互，以便更直观地理解项目分布。

#### 验收标准

1. THE PieChart SHALL 在饼图中心区域展示项目总数和总提交次数的汇总信息
2. WHEN 用户将鼠标悬停在饼图的某个扇区时，THE PieChart SHALL 在 tooltip 中展示项目名称、提交次数和占比百分比
3. WHEN 项目数量超过 10 个时，THE PieChart SHALL 将提交次数最少的项目合并为"其他"类别展示

### 需求 3：空数据与少量数据状态处理

**用户故事：** 作为一名开发者，我希望在没有项目数据或数据较少时看到合适的提示，以便了解当前数据状态。

#### 验收标准

1. WHEN ProjectCommitData 列表为空时，THE ProjectDistribution_Component SHALL 展示"暂无项目数据"的空状态提示，并隐藏饼图和表格
2. WHEN ProjectCommitData 列表仅包含一个项目时，THE ProjectDistribution_Component SHALL 正常展示饼图和表格，饼图显示为完整圆环

### 需求 4：视图切换功能

**用户故事：** 作为一名开发者，我希望能在图表视图和纯表格视图之间切换，以便根据需要选择最合适的数据查看方式。

#### 验收标准

1. THE ProjectDistribution_Component SHALL 在标题栏右侧提供"图表"和"表格"两个视图切换按钮
2. WHEN 用户点击"图表"按钮时，THE ProjectDistribution_Component SHALL 展示饼图和表格的组合视图
3. WHEN 用户点击"表格"按钮时，THE ProjectDistribution_Component SHALL 仅展示完整的数据表格，隐藏饼图
4. THE ProjectDistribution_Component SHALL 默认展示"图表"组合视图

### 需求 5：响应式布局适配

**用户故事：** 作为一名开发者，我希望项目分布展示在不同屏幕尺寸下都能正常显示，以便在移动设备上也能查看数据。

#### 验收标准

1. WHILE 屏幕宽度小于 768px，THE ProjectDistribution_Component SHALL 将饼图和表格纵向排列展示
2. WHILE 屏幕宽度小于 768px，THE PieChart SHALL 将图例从右侧垂直布局调整为底部水平布局
3. WHILE 屏幕宽度小于 768px，THE ProjectTable SHALL 隐藏提交占比列，仅展示项目名称和提交次数

### 需求 6：加载状态展示

**用户故事：** 作为一名开发者，我希望在数据加载过程中看到合适的加载动画，以便了解数据正在获取中。

#### 验收标准

1. WHILE 数据处于加载状态，THE ProjectDistribution_Component SHALL 在饼图区域展示骨架屏动画
2. WHILE 数据处于加载状态，THE ProjectTable SHALL 展示 3 行骨架屏占位行
