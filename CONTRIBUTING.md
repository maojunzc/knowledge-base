# 贡献指南

感谢你考虑为 **Knowledge Base** 做出贡献！

---

## 贡献流程

### 🐛 Bug 报告 / ✨ 功能建议

1. 先搜索 [已有 Issue](../../issues)，避免重复提交
2. 使用对应模板创建 Issue（Bug / Feature）
3. 提供完整信息：复现步骤、环境、期望行为、截图/日志

### 🔨 代码贡献

```bash
# 1. Fork 本仓库
# 2. 克隆到本地
git clone https://github.com/你的用户名/knowledge-base.git
cd knowledge-base

# 3. 创建功能/修复分支
git checkout -b feature/xxx    # 新功能
# 或
git checkout -b fix/xxx        # Bug 修复

# 4. 安装依赖
pnpm install

# 5. 本地开发
pnpm tauri dev

# 6. 提交遵循 Conventional Commits
git commit -m "feat(rust): 添加 XXX 功能"
git commit -m "fix(react): 修复 YYY 问题"

# 7. 推送到你的 Fork
git push origin feature/xxx

# 8. 在 GitHub 创建 Pull Request
```

## ✅ PR 合并前检查清单

- [ ] Rust 通过编译检查：`cd src-tauri && cargo check`
- [ ] Rust 通过代码检查：`cd src-tauri && cargo clippy`
- [ ] TypeScript 通过类型检查：`npx tsc --noEmit`
- [ ] 本地运行无报错：`pnpm tauri dev`
- [ ] 相关功能已手动验证
- [ ] commit 信息符合 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)

## 🚫 不接受的 PR

- 引入可疑第三方依赖（非主流包、无人维护、无明确理由）
- 大规模重构但**无事先 Issue 讨论对齐方向**
- 含有广告、无关外链、未声明来源的代码段

## 📐 代码规范

- **Rust**：遵循 [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)，通过 `cargo clippy` 无警告
- **TypeScript**：严格模式，禁用 `any`
- **错误处理**：Rust 用 `AppError` + `Result<T, String>`；React 用 `ErrorBoundary` + `try-catch`
- **IPC 命名**：Rust 函数 snake_case，TypeScript 调用 snake_case（Tauri 自动转换参数命名）

## 🔀 分支策略

| 分支 | 用途 |
|------|------|
| `master` | 主分支，**受保护**，只能通过 PR 合并 |
| `feature/xxx` | 新功能开发分支 |
| `fix/xxx` | Bug 修复分支 |
| `docs/xxx` | 文档更新分支 |

## ❓ 问题反馈

- **技术问题 / Bug**：提 [Issue](../../issues/new/choose)

## 🙏 致谢

感谢每一位贡献者让这个项目变得更好！
