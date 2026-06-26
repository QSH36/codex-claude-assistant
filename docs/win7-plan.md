# Win7 兼容版本计划

Win7 不适合作为 Tauri v2/WebView2 主版本目标，因此单独做 Electron 22 版本。

## 设计原则

- 复用 `src/domain`、`src/components` 和 `src/styles.css`。
- 动画降级，默认关闭 3D 背景。
- Node 运行时降级到 16.x portable。
- Python 降级到 3.8.x。
- 显示明确兼容提示：Codex/Claude 最新版本可能不保证 Win7 官方支持。

## 目录规划

```text
electron-win7/
  main/
    index.ts
    preload.ts
  package.json
  electron-builder.yml
```

## 打包目标

- `electron-builder --win nsis`
- 输出到 `release/win7/`

## 当前状态

当前仓库已提供 `electron-win7/` 子工程骨架，包含：

- Electron 22 main/preload。
- `electron-builder.yml` NSIS 配置。
- 复用主工程 `dist/` 产物。
- 写入 skill 索引和底层 MD 的 Win7 兼容 IPC。

构建方式：

```powershell
npm.cmd run build
Set-Location electron-win7
npm.cmd install
npm.cmd run dist
```

当前配置默认产出 portable 单文件：

```text
release/win7/Codex-Claude-Assistant-Win7-Portable-0.1.0-x64.exe
```

说明：NSIS 安装器签名流程在部分 Windows 环境会因为不能创建符号链接而失败，因此 Win7 版本默认关闭签名编辑并输出 portable 单文件。
