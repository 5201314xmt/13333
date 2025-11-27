# Netcup VPS Sentinel

一个基于 Web 的自动化管理系统，专门用于监控 Netcup VPS 的流量限速状态，并联动控制 qBittorrent 和 Vertex 下载器。

## 📋 功能模块

- **仪表盘 (Dashboard)**
  - 全局统计卡片（VPS总数、受限实例、实时速度、活跃种子）。
  - SCP 监控模块，实时显示 VPS 的健康状态 (Healthy/Throttled)。
  - qBittorrent 控制模块，监控实例状态、速度和流量，并提供一键暂停/恢复功能。
  - Vertex 下载器模块，显示下载器状态并提供启用/禁用功能。
  - 当 VPS 被限速时，系统会自动暂停关联的 qBittorrent 实例并禁用 Vertex 下载器。

- **流量统计 (Traffic Stats)**
  - 聚合所有受控实例的 qBittorrent 历史流量数据。
  - 提供日期范围和关键词筛选功能。
  - 数据可视化卡片，自动换算流量单位 (GB/TB)。

- **系统日志 (System Logs)**
  - 集中展示来自 SCP、qBittorrent、Vertex 和系统的操作日志。
  - 提供关键词搜索和日志级别分类显示。

- **配置管理 (Settings)**
  - 支持添加/删除多个 Netcup SCP 账号。
  - 配置 Telegram 通知机器人。
  - 设置自动化策略，如监控频率和限速后的自动动作。
  - 统一管理 qBittorrent 和 Vertex 的集成凭证与路径。
  - **所有设置都会自动保存到浏览器的 `localStorage` 中**，刷新页面后配置不会丢失。

## 🏗️ 项目架构

本项目是一个功能完善的**纯前端应用原型**。为了能够独立开发和测试用户界面与自动化逻辑，所有的后端交互都在前端内部进行了**模拟**。

- **核心服务:** `src/services/api.service.ts`
- **配置服务:** `src/services/settings.service.ts`

在实际生产环境中，`ApiService` 将被修改，移除所有模拟数据，并替换为真实的 HTTP 请求，指向一个您自己开发的后端服务器。

---

## 🚀 在 Debian 12 上通过 Git 和 Docker 部署 (小白教程)

本指南将引导您从一个全新的 Debian 12 服务器开始，一步步部署此应用程序。此方法使用 Docker，它会将应用程序及其所有依赖项打包到一个隔离的“容器”中，这是最简单、最可靠的部署方式。

### 第 1 步：准备您的服务器

首先，通过 SSH 连接到您的 Debian 12 VPS。然后，更新您的系统软件包列表：

```bash
sudo apt update && sudo apt upgrade -y
```

### 第 2 步：安装 Git 和 Docker

您需要 `git` 来从仓库下载代码，以及 `docker` 来运行应用程序。

```bash
# 安装 Git
sudo apt install git -y

# 安装 Docker 和 Docker Compose
sudo apt install docker.io docker-compose -y

# 启动并设置 Docker 开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

### 第 3 步：克隆项目代码

从 GitHub (或您的代码仓库) 克隆项目到您的服务器上。

```bash
git clone <你的项目仓库URL>
cd <你的项目目录名>
```
*注意：请将 `<你的项目仓库URL>` 和 `<你的项目目录名>` 替换为实际的地址和名称。*

### 第 4 步：创建部署所需的文件

在项目根目录（与 `index.html` 文件同级）中，您需要手动创建以下四个文件。

#### 1. 创建 `Dockerfile`
这个文件告诉 Docker 如何构建应用程序的镜像。

```bash
nano Dockerfile
```

将以下内容**完整复制**并粘贴到文件中：

```dockerfile
# 使用轻量级的 Nginx 镜像
FROM nginx:alpine

# 将当前目录下的所有文件复制到 Nginx 的 web 根目录
COPY . /usr/share/nginx/html

# 复制自定义的 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露容器的 80 端口
EXPOSE 80

# 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]
```
按 `Ctrl+X`，然后按 `Y`，最后按 `Enter` 保存并退出。

#### 2. 创建 `docker-compose.yml`
这个文件用于定义和管理 Docker 容器。

```bash
nano docker-compose.yml
```

将以下内容**完整复制**并粘贴到文件中：

```yaml
version: '3.8'

services:
  frontend:
    build: .
    container_name: netcup_sentinel_frontend
    ports:
      - "74674:80"
    restart: unless-stopped
```
保存并退出 (`Ctrl+X`, `Y`, `Enter`)。

#### 3. 创建 `nginx.conf`
这是 Nginx Web 服务器的配置文件。

```bash
nano nginx.conf
```

将以下内容**完整复制**并粘贴到文件中：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
保存并退出 (`Ctrl+X`, `Y`, `Enter`)。

#### 4. 创建 `deploy.sh` (一键部署脚本)
这个脚本将自动化整个部署过程。

```bash
nano deploy.sh
```

将以下内容**完整复制**并粘贴到文件中：

```bash
#!/bin/bash
set -e

echo "🚀 开始部署 Netcup VPS Sentinel..."

echo "🛑 停止并删除旧的容器..."
docker-compose down

echo "🔨 构建并启动新的容器..."
docker-compose up --build -d

echo "✅ 部署成功！"
echo "🌐 应用正在运行在 http://YOUR_SERVER_IP:74674"
echo "   请将 YOUR_SERVER_IP 替换为你的服务器公网IP地址。"
echo "📊 使用 'docker-compose logs -f' 查看实时日志。"
```
保存并退出 (`Ctrl+X`, `Y`, `Enter`)。

### 第 5 步：运行部署脚本！

现在，您拥有了所有需要的文件。只需一个命令即可完成部署。

```bash
# 首先，给部署脚本添加执行权限
chmod +x deploy.sh

# 然后，运行脚本
./deploy.sh
```

脚本会自动完成所有工作。完成后，您就可以通过浏览器访问 `http://<你的服务器IP>:74674` 来使用 Netcup VPS Sentinel 了！

### 更新应用程序

当您需要更新代码时，只需：
1.  在项目目录中运行 `git pull` 拉取最新的代码。
2.  再次运行 `./deploy.sh` 重新部署。
Docker 会自动使用最新的代码重建镜像并启动新的容器。
