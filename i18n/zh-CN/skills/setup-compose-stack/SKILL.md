---
name: setup-compose-stack
description: >
  为常见应用模式配置通用 Docker Compose 栈。涵盖 Web 应用 + 数据库 +
  缓存 + 工作进程服务、命名卷、网络、健康检查、depends_on、环境管理和
  profiles。适用于运行带数据库或缓存的 Web 应用、设置多服务开发环境、
  在 API 旁编排后台工作进程，或跨团队创建可重现的多服务环境。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker-compose, orchestration, postgres, redis, multi-service, health-checks
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 配置 Compose 栈

为包含数据库、缓存和工作进程的多服务应用栈配置 Docker Compose。

## 适用场景

- 运行带数据库和/或缓存的 Web 应用
- 设置包含多个服务的开发环境
- 在 API 旁编排后台工作进程
- 需要跨团队的可重现多服务环境

## 输入

- **必需**：应用服务（语言、端口、入口点）
- **必需**：所需的支持服务（数据库、缓存、队列等）
- **可选**：开发与生产配置
- **可选**：自定义服务的现有 Dockerfile

## 步骤

### 第 1 步：定义核心栈

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://appuser:apppass@postgres:5432/appdb
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

**预期结果：** `docker compose up` 启动所有服务，应用等待数据库健康就绪。

### 第 2 步：添加健康检查

健康检查支持 `depends_on` 使用 `condition: service_healthy`：

```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
```

### 第 3 步：配置网络

```yaml
services:
  app:
    networks:
      - frontend
      - backend

  postgres:
    networks:
      - backend

  nginx:
    networks:
      - frontend
    ports:
      - "80:80"

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

这将数据库与直接外部访问隔离，同时应用桥接两个网络。

### 第 4 步：管理环境变量

创建 `.env` 文件（加入 git 忽略）：

```
POSTGRES_PASSWORD=secure_password_here
APP_SECRET=your_secret_key
```

在 compose 中引用：

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  app:
    env_file:
      - .env
```

创建 `.env.example`（提交到 git）：

```
POSTGRES_PASSWORD=changeme
APP_SECRET=changeme
```

### 第 5 步：添加工作进程服务

```yaml
services:
  worker:
    build:
      context: .
      dockerfile: Dockerfile
    command: ["node", "src/worker.js"]
    environment:
      DATABASE_URL: postgres://appuser:apppass@postgres:5432/appdb
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    deploy:
      replicas: 2
```

### 第 6 步：使用 Profiles 管理可选服务

```yaml
services:
  app:
    # always starts
    build: .

  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"
    profiles:
      - dev

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    profiles:
      - dev
```

```bash
# Start core services only
docker compose up

# Start with dev tools
docker compose --profile dev up
```

### 第 7 步：创建开发覆盖文件

`docker-compose.override.yml` 会自动合并：

```yaml
services:
  app:
    build:
      target: dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
    command: ["npm", "run", "dev"]
```

### 第 8 步：构建和运行

```bash
# Build all images
docker compose build

# Start in background
docker compose up -d

# View logs
docker compose logs -f app

# Check service status
docker compose ps

# Stop and remove
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v
```

**预期结果：** 所有服务启动，健康检查通过，应用连接到数据库和缓存。

**失败处理：** 检查 `docker compose logs <service>`。常见问题：端口冲突、缺少环境变量、健康检查超时。

## 验证清单

- [ ] `docker compose up` 无错误启动所有服务
- [ ] 数据库和缓存的健康检查通过
- [ ] 应用连接到所有依赖服务
- [ ] 命名卷在重启后持久化数据
- [ ] `.env` 已加入 git 忽略；`.env.example` 已提交
- [ ] `docker compose down` 干净地停止所有服务
- [ ] Profiles 将开发工具与生产服务分离

## 常见问题

- **无健康检查**：没有 `condition: service_healthy` 的 `depends_on` 仅等待容器启动，而非就绪。
- **compose 中硬编码密码**：使用 `.env` 文件或 Docker secrets。永远不要提交密码。
- **卷挂载覆盖**：挂载 `.:/app` 会覆盖镜像中构建的 `node_modules`。使用匿名卷：`/app/node_modules`。
- **端口冲突**：检查 `docker compose ps` 和 `lsof -i :<port>` 查找冲突。
- **`version:` 键**：Compose V2 忽略 `version:` 键。现代设置中可省略。
- **WSL 路径问题**：从 WSL 挂载 Windows 目录时使用 `/mnt/c/...` 路径。

## 相关技能

- `setup-docker-compose` - R 特定的 Docker Compose 配置
- `create-dockerfile` - 编写 compose 引用的 Dockerfile
- `create-multistage-dockerfile` - 为栈构建优化镜像
- `configure-nginx` - 向栈添加 Nginx 反向代理
