# GitLab 提交统计平台

基于 Vue 3 + Spring Boot 的全栈应用，用于连接 GitLab 实例并可视化展示个人提交统计数据。

## 功能概览

- **GitLab 连接配置**：填写 GitLab 服务器地址、用户名和 Personal Access Token，自动验证连接有效性
- **提交统计概览**：展示总提交次数、代码修改量、平均每日提交数、参与项目数量
- **提交趋势图表**：基于 ECharts 的折线图，展示每日提交趋势
- **项目分布分析**：饼图 + 表格双视图，展示各项目提交占比
- **日期范围筛选**：支持快捷选项（近 7 天、近 30 天等）和自定义日期范围
- **数据刷新**：支持手动刷新，后端使用 Caffeine 缓存优化性能

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3.5（Composition API + script setup） |
| 前端语言 | TypeScript 5.9 |
| 构建工具 | Vite 8 |
| UI 组件库 | Element Plus |
| 图表库 | ECharts 6 |
| 后端框架 | Spring Boot 2.7.18 |
| 后端语言 | Java 8 |
| 构建系统 | Maven 多模块 |
| 缓存 | Caffeine |
| 测试 | Vitest + Playwright |

## 项目结构

```
fullstack-app/
├── pom.xml                          # Maven 父 POM
├── backend/                         # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/
│       │   ├── Application.java     # 启动类
│       │   ├── client/              # GitLab API 客户端
│       │   ├── config/              # 配置类（缓存等）
│       │   ├── controller/          # REST 控制器
│       │   ├── dto/                 # 数据传输对象
│       │   ├── exception/           # 异常处理
│       │   ├── model/               # 实体类
│       │   └── service/             # 业务逻辑层
│       └── resources/
│           └── application.yml
└── frontend/                        # Vue 3 前端
    ├── package.json
    ├── vite.config.ts
    ├── e2e/                         # Playwright E2E 测试
    └── src/
        ├── main.ts
        ├── App.vue
        ├── views/                   # 页面组件
        ├── components/gitlab-stats/ # 业务组件
        ├── hooks/                   # 组合式函数
        ├── services/                # API 服务层
        ├── types/                   # TypeScript 类型定义
        └── const/                   # 常量定义
```

## 环境要求

- Java 8+
- Maven 3.6+
- Node.js 20+
- npm 10+

## 快速启动

### 1. 克隆项目

```bash
git clone <repository-url>
cd fullstack-app
```

### 2. 启动后端

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端服务启动在 `http://localhost:8080`。

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器启动在 `http://localhost:3000`，API 请求自动代理到后端 8080 端口。

### 4. 访问应用

浏览器打开 `http://localhost:3000`，填写 GitLab 配置信息即可开始使用。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/gitlab/config` | 保存并验证 GitLab 配置 |
| GET | `/api/gitlab/commits` | 获取提交记录列表 |
| GET | `/api/gitlab/stats` | 获取统计汇总数据 |

### 请求参数示例

**POST /api/gitlab/config**

```json
{
  "serverUrl": "https://gitlab.example.com",
  "username": "your-username",
  "token": "glpat-xxxxxxxxxxxxxxxxxxxx"
}
```

**GET /api/gitlab/stats**

```
?startDate=2026-03-01&endDate=2026-03-12
```

## 测试

### 单元测试

```bash
cd frontend
npm run test              # 单次执行
npm run test:watch        # 监听模式
npm run test:coverage     # 生成覆盖率报告
```

### E2E 测试

```bash
cd frontend
npm run test:e2e                                                          # 无头模式
npx playwright test e2e/connectConfigTest.spec.ts --headed --workers=1    # 可视化录屏模式
```

录屏视频输出在 `frontend/test-results/` 目录下。

## 构建生产版本

```bash
# 前端构建
cd frontend
npm run build

# 后端打包
cd backend
mvn clean package

# 或在根目录一键构建
mvn clean install
```
