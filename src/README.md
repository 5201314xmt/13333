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
  - **所有设置都会在您修改后自动保存到浏览器的 `localStorage` 中**，刷新页面后配置不会丢失。

## 🏗️ 项目架构

本项目是一个功能完善的**纯前端应用原型**。为了能够独立开发和测试用户界面与自动化逻辑，所有的后端交互都在前端内部进行了**模拟**。

- **核心服务:** `src/services/api.service.ts`
- **配置服务:** `src/services/settings.service.ts`

在实际生产环境中，`ApiService` 将被修改，移除所有模拟数据，并替换为真实的 HTTP 请求，指向一个您自己开发的后端服务器。

---

## 🚀 一键部署 (Debian 12 推荐)

使用以下单行命令即可在全新的 Debian 12 服务器上完成所有部署工作。此脚本会自动处理所有依赖安装、文件创建和服务启动。

### 操作步骤

1.  **通过 SSH 登录到您的服务器**。
2.  **执行以下命令** (请确保以 `root` 用户身份运行):

```bash
bash <(wget -qO- https://raw.githubusercontent.com/guowanghushifu/Dedicated-Seedbox-Mod/main/Install.sh) <你的项目仓库URL>
```

**重要提示：**
-   请将 `<你的项目仓库URL>` 替换为您自己项目的 **HTTPS** Git 地址。
-   脚本会自动安装 `git` 和 `docker`。
-   脚本会自动创建部署所需的 `Dockerfile`, `docker-compose.yml` 和 `nginx.conf`。

部署成功后，您可以通过浏览器访问 `http://<你的服务器IP>:7467` 来使用 Netcup VPS Sentinel。

### 更新应用程序

当您需要更新代码时，只需登录服务器并进入项目目录（默认为 `/opt/netcup-sentinel`），然后执行以下命令：

```bash
# 1. 拉取最新的代码
git pull

# 2. 重建并重启服务
docker compose up --build -d
```
Docker 会自动使用最新的代码重建镜像并启动新的容器。