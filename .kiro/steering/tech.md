# 技术栈

## 前端

- Vue 3.5 (Composition API + script setup)
- TypeScript 5.9
- Vite 8 (构建工具)
- 样式：CSS/SCSS

## 后端

- Java 8
- Spring Boot 2.7.18
- Maven (构建工具)

## 构建系统

- 根目录：Maven 多模块项目
- 前端：npm/Vite
- 后端：Maven

## 常用命令

### 前端 (frontend 目录)

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

### 后端 (backend 目录)

```bash
mvn clean install           # 编译打包
mvn spring-boot:run         # 启动开发服务器
mvn test                    # 运行测试
```

### 全项目 (根目录)

```bash
mvn clean install           # 构建所有模块
```

## 服务端口

- 后端 API：8080
- 前端开发服务器：5173 (Vite 默认)
