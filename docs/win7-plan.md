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

当前仓库已提供 `npm run bundle:win7` 生成兼容路线说明。下一阶段将新增 Electron 子工程并接入同一套前端构建产物。
