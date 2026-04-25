# Hermes Agent WebUI

Hermes Agent 的 Web 前端界面，基于 React + TypeScript + Tailwind CSS 构建。

## 功能特性

- **SSE 流式对话** — 通过 OpenAI Responses API 与 Hermes 后端实时通信
- **会话管理** — 本地持久化 + Web Dashboard 同步，支持多轮对话上下文
- **终端命令执行** — 输入 `/shell <command>` 执行 Shell 命令，结果以结构化卡片展示
- **权限审批** — 危险命令实时审批，记忆选择更便捷
- **右侧栏面板** — 文件浏览、差异对比、工具/MCP、记忆/技能、SOUL 上下文、属性面板
  - 支持在设置中自定义显示哪些面板
- **主题切换** — 暗色 / 亮色 / 跟随系统
- **命令面板** — `Ctrl+K` 快速访问所有功能

## 快速开始

### 环境要求

- Node.js >= 18
- Hermes Agent 后端运行中（默认端口 8642）
- Web Dashboard（可选，默认端口 9119）

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

## 配置

### Hermes 后端连接

在 Hermes Agent 的 `.env` 文件中启用 API Server：

```env
API_SERVER_ENABLED=true
API_SERVER_PORT=8642
API_SERVER_HOST=127.0.0.1
API_SERVER_CORS_ORIGINS=*
```

### Web Dashboard（可选）

启动 Dashboard 以同步会话和技能数据：

```bash
hermes dashboard
```

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+K` | 打开命令面板 |
| `Ctrl+N` | 新建会话 |
| `Ctrl+B` | 切换侧边栏 |
| `Ctrl+/` | 切换右侧栏 |
| `/` | 斜杠命令 |
| `@` | 文件搜索 |

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS 3
- **状态管理**: Zustand
- **图标**: Lucide React
- **路由**: React Router 7

## 项目结构

```
src/
├── app/              # 根组件和主题
├── features/
│   ├── messages/     # 聊天消息、输入框
│   ├── sessions/    # 会话列表、侧边栏
│   ├── panels/      # 右侧栏面板
│   ├── settings/    # 设置弹窗
│   ├── permissions/  # 权限审批卡片
│   └── ...
├── lib/              # API 客户端、SSE 连接、类型定义
└── ui/               # Toast、错误边界等通用组件
```

## License

MIT
