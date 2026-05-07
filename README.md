# Knowledge Base

本地知识库桌面应用 - 全文搜索、双向链接、知识图谱

基于 Tauri 2.x 构建的轻量级桌面应用，支持 Markdown 文件管理。

## 功能特点

- 🔍 **全文搜索** - 原生 FTS5 毫秒级全文搜索
- 🔗 **双向链接** - 支持文档间的双向链接
- 🕸️ **知识图谱** - 可视化知识网络
- 🤖 **本地 RAG 问答** - 基于本地文档的智能问答
- 💾 **数据本地化** - SQLite + Markdown，不上云
- ⚡ **轻量高效** - 内存占用约 50MB

## 支持平台

- Windows
- macOS
- Linux（计划中）

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm tauri dev
```

## 构建

```bash
# 构建生产版本
pnpm tauri build
```

## 技术栈

- **框架**: Tauri 2.x
- **前端**: React + TypeScript
- **后端**: Rust
- **数据库**: SQLite + FTS5

## 贡献

欢迎贡献代码、报告 Bug、提建议！

- 🐛 [报告 Bug](../../issues/new?template=bug_report.md)
- ✨ [功能建议](../../issues/new?template=feature_request.md)
- 🔨 [提交 Pull Request](../../compare)

## 许可证

本项目采用 **MIT** 许可证开源。
