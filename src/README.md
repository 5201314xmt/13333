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
  - **功能:** 这个服务扮演了一个虚拟后端。它负责模拟 Netcup SCP API、qBittorrent 和 Vertex 实例的状态，并根据 `SettingsService` 中的配置来执行自动化逻辑。

- **配置服务:** `src/services/settings.service.ts`
  - **功能:** 这是所有应用配置的“唯一真实来源”。它负责：
    1.  **管理配置状态:** 使用 Angular Signals 保存所有配置项（通知、自动化策略等）。
    2.  **持久化:** 在应用启动时从 `localStorage` 加载配置，并在用户点击“保存”时将当前配置写回 `localStorage`。

在实际生产环境中，`ApiService` 将被修改，移除所有模拟数据，并替换为真实的 HTTP 请求，指向一个您自己开发的后端服务器。

## 📊 技术栈

- **前端框架:** Angular 20+ (TypeScript)
- **状态管理:** Angular Signals
- **样式方案:** Tailwind CSS (通过 CDN 加载)
- **核心逻辑:** 所有后端交互均在 `src/services/api.service.ts` 中进行模拟。

## 🚀 运行项目

该项目被配置为在支持 Web-based IDE 的环境中直接运行，无需本地编译或部署步骤。当您打开项目时，它应该会自动启动并显示应用程序界面。所有代码的更改都会实时反映在预览中。
