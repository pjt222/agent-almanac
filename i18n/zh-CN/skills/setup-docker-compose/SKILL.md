---
name: setup-docker-compose
description: >
  为多容器 R 开发环境配置 Docker Compose。涵盖服务定义、卷挂载、网络、
  环境变量以及开发与生产配置。适用于将 R 与其他服务（数据库、API）一起运行、
  设置可重现的 R 开发环境、编排基于 R 的 MCP 服务器容器，或为 R 项目管理
  环境变量和卷挂载。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker-compose, orchestration, development, volumes
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 配置 Docker Compose

为 R 开发和部署环境配置 Docker Compose。

## 适用场景

- 将 R 与其他服务（数据库、API）一起运行
- 设置可重现的开发环境
- 编排基于 R 的 MCP 服务器容器
- 管理环境变量和卷挂载

## 输入

- **必需**：R 服务的 Dockerfile
- **必需**：要挂载的项目目录
- **可选**：附加服务（数据库、缓存、Web 服务器）
- **可选**：环境变量配置

## 步骤

### 第 1 步：创建 docker-compose.yml

```yaml
version: '3.8'

services:
  r-dev:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: r-dev
    image: r-dev:latest

    volumes:
      - .:/workspace
      - renv-cache:/workspace/renv/cache

    stdin_open: true
    tty: true

    environment:
      - TERM=xterm-256color
      - R_LIBS_USER=/workspace/renv/library
      - RENV_PATHS_CACHE=/workspace/renv/cache

    command: R

    restart: unless-stopped

volumes:
  renv-cache:
    driver: local
```

**预期结果：** `docker-compose.yml` 文件存在，定义了 R 服务，包含项目目录和 renv 缓存的卷挂载，以及 R 库路径的环境变量。

**失败处理：** 如果 YAML 语法无效，使用 `docker compose config` 验证。确保缩进使用空格（不是制表符），所有包含特殊字符的字符串值都加引号。

### 第 2 步：添加附加服务（如需要）

```yaml
services:
  r-dev:
    # ... as above
    depends_on:
      - postgres
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432

  postgres:
    image: postgres:16
    container_name: r-postgres
    environment:
      POSTGRES_DB: analysis
      POSTGRES_USER: ruser
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  renv-cache:
  pgdata:
```

**预期结果：** 附加服务（如 PostgreSQL）已定义，具有自己的卷、环境变量和端口映射。R 服务的 `depends_on` 引用了新服务。

**失败处理：** 如果数据库服务启动失败，检查 `docker compose logs postgres` 获取初始化错误。验证 `POSTGRES_PASSWORD_FILE` 等环境变量指向有效的密钥，或在开发中切换到 `POSTGRES_PASSWORD`。

### 第 3 步：配置网络

对于需要 localhost 访问的服务（如 MCP 服务器）：

```yaml
services:
  r-dev:
    network_mode: "host"
```

对于隔离网络：

```yaml
services:
  r-dev:
    networks:
      - app-network
    ports:
      - "3000:3000"

networks:
  app-network:
    driver: bridge
```

**预期结果：** 网络配置适当：需要 localhost 访问的服务（MCP 服务器）使用 `host` 模式，或使用桥接网络加显式端口映射实现隔离服务。

**失败处理：** 如果服务无法通信，验证它们在同一网络上。使用桥接网络时，使用服务名作为主机名（如 `postgres` 而非 `localhost`）。使用 host 模式时，使用 `localhost` 并确保端口不冲突。

### 第 4 步：管理环境变量

创建 `.env` 文件（加入 git 忽略）：

```
R_VERSION=4.5.0
GITHUB_PAT=your_token_here
```

在 compose 中引用：

```yaml
services:
  r-dev:
    build:
      args:
        R_VERSION: ${R_VERSION}
    env_file:
      - .env
```

**预期结果：** `.env` 文件存在（已 git 忽略）包含项目特定变量，`docker-compose.yml` 通过 `env_file` 或变量插值（`${VAR}`）引用它。

**失败处理：** 如果变量未解析，确保 `.env` 文件与 `docker-compose.yml` 在同一目录。运行 `docker compose config` 查看所有变量展开后的解析配置。

### 第 5 步：构建和运行

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Attach to R session
docker compose exec r-dev R

# View logs
docker compose logs -f r-dev

# Stop services
docker compose down
```

**预期结果：** 所有服务启动。R 会话可访问。

**失败处理：** 检查 `docker compose logs` 获取启动错误。常见问题：端口冲突、缺少环境变量。

### 第 6 步：创建开发覆盖文件

创建 `docker-compose.override.yml` 用于本地开发设置：

```yaml
services:
  r-dev:
    volumes:
      - /path/to/local/packages:/extra-packages
    environment:
      - DEBUG=true
```

这会自动与 `docker-compose.yml` 合并。

**预期结果：** `docker-compose.override.yml` 文件存在，包含开发特定设置（额外卷、调试标志），运行 `docker compose up` 时自动应用。

**失败处理：** 如果覆盖未生效，验证文件名完全是 `docker-compose.override.yml`。运行 `docker compose config` 确认合并。对于显式覆盖文件，使用 `docker compose -f docker-compose.yml -f custom-override.yml up`。

## 验证清单

- [ ] `docker compose build` 无错误完成
- [ ] `docker compose up` 启动所有服务
- [ ] 卷挂载正确地在主机和容器间共享文件
- [ ] 环境变量在容器内可用
- [ ] 服务之间可以互相通信
- [ ] `docker compose down` 干净地停止所有服务

## 常见问题

- **卷挂载权限**：Linux 容器可能以 root 身份创建文件。使用 `user:` 指令或修复权限。
- **端口冲突**：检查主机上是否已有服务使用相同端口
- **Docker Desktop 与 CLI**：`docker compose`（v2）与 `docker-compose`（v1）。使用 v2。
- **WSL 路径挂载**：从 WSL 挂载 Windows 目录时使用 `/mnt/c/...` 路径
- **命名卷与绑定挂载**：命名卷在重建后保持；绑定挂载立即反映主机更改

## 相关技能

- `create-r-dockerfile` - 创建 compose 引用的 Dockerfile
- `containerize-mcp-server` - MCP 服务器的 compose 配置
- `optimize-docker-build-cache` - 加速 compose 构建
