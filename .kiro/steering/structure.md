# 项目结构

```
fullstack-app/
├── pom.xml                    # Maven 父 POM（多模块管理）
├── backend/                   # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/
│       │   ├── Application.java        # 启动类
│       │   └── controller/             # REST 控制器
│       └── resources/
│           └── application.yml         # 配置文件
└── frontend/                  # Vue 3 前端
    ├── package.json
    ├── vite.config.ts         # Vite 配置
    ├── tsconfig.json          # TypeScript 配置
    ├── index.html             # 入口 HTML
    └── src/
        ├── main.ts            # 应用入口
        ├── App.vue            # 根组件
        ├── components/        # Vue 组件
        ├── assets/            # 静态资源
        └── style.css          # 全局样式
```

## 后端目录约定

| 目录 | 用途 |
|------|------|
| `controller/` | REST API 控制器 |
| `service/` | 业务逻辑层 |
| `repository/` | 数据访问层 |
| `model/` | 实体类 |
| `dto/` | 数据传输对象 |
| `config/` | 配置类 |

## 前端目录约定

| 目录 | 用途 |
|------|------|
| `components/` | Vue 组件 |
| `views/` | 页面组件 |
| `services/` | API 服务层 |
| `hooks/` | 组合式函数 |
| `const/` | 常量定义 |
| `assets/` | 静态资源 |
