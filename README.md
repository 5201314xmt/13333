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

## 📊 技术栈

- **前端框架:** Angular 20+ (TypeScript)
- **样式方案:** Tailwind CSS (深色主题)
- **图标库:** Lucide Icons (Inline SVG)
- **部署方式:** Docker + Nginx

## 🚀 部署指南

### 先决条件

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### 部署步骤

1.  **克隆或下载项目**
    ```bash
    git clone <repository_url>
    cd netcup-sentinel
    ```

2.  **配置环境变量**

    项目包含一个 `docker-compose.yml` 文件，用于前端服务的部署。此项目为纯前端应用，模拟了后端交互。在实际部署中，您需要一个后端服务来处理 API 请求。

3.  **使用一键部署脚本 (推荐)**

    脚本将自动停止旧服务、拉取最新代码（如果存在git仓库）并构建和启动新服务。

    ```bash
    chmod +x deploy.sh
    ./deploy.sh
    ```

4.  **手动部署**

    如果您希望手动控制部署过程，可以执行以下命令：

    ```bash
    docker-compose up -d --build
    ```

5.  **访问应用**

    部署成功后，您可以通过浏览器访问前端界面：
    **http://localhost:74674**

### Docker Compose 命令

- **查看日志:**
  ```bash
  docker-compose logs -f
  ```

- **停止服务:**
  ```bash
  docker-compose down
  ```

- **查看服务状态:**
  ```bash
  docker-compose ps
  ```

## 🐳 Docker 配置示例

### docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "74674:80"
    # 在实际部署中，您需要将 VITE_API_BASE_URL 指向您的后端服务
    environment:
      - VITE_API_BASE_URL=http://backend:8000/api
    restart: unless-stopped
    networks:
      - netcup-network

# networks:
#   netcup-network:
#     driver: bridge
```
*注意: `frontend` 目录和 `Dockerfile` 需要您根据实际的前端项目（如 React, Vue, Angular）进行创建和配置。*
