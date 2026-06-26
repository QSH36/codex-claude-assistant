# 架构说明

## 目标

做一个面向中国大陆 Windows 用户的 Codex/Claude 安装、配置和 skill 管理向导。用户应能在一个界面内完成环境补齐、产品安装、API 配置、skill 安装和底层会话规则生成。

## 技术选型

主版本使用 Tauri v2，因为它适合 Win10/Win11 上的小体积安装器，也能用 Rust 后端安全调用系统能力。前端使用 React + TypeScript，方便做复杂向导状态和精细 UI。动效使用 Framer Motion，3D 背景使用 Three.js/React Three Fiber。

Win7 单独版本规划为 Electron 22。原因是现代 WebView2/Tauri 对 Win7 支持不足，而 Electron 22 是更现实的兼容线。

## 模块

- `src/domain`：纯 TypeScript 领域模型，包含工具清单、环境状态、skill 索引、底层 MD 和诊断脱敏。
- `src/state`：Zustand 状态机，管理 7 步向导、安装目标、日志和后端调用。
- `src/components`：界面组件，包含步骤页、日志面板、步骤导航和 3D 背景。
- `src/services`：Tauri 后端调用封装，浏览器预览模式自动降级。
- `src-tauri`：Rust 后端，包含环境扫描、配置读取、skill 目录读取、下载计划和诊断导出。
- `tests`：领域模型和脱敏策略单元测试。

## 风险控制

第一阶段后端只做扫描和预览，不直接修改系统。后续真实安装和写配置需要增加：

- 文件备份。
- 写入前 diff。
- 管理员权限检查。
- 失败回滚。
- 安装包哈希校验。
- 代理和镜像源连通性测试。

## 打包形态

- Win10/Win11：Tauri `nsis` 和 `msi`。
- Win7：Electron 22 + `electron-builder` NSIS。

## 后续里程碑

1. 接入真实下载器和镜像源探测。
2. 增加 Codex++ 与 CC Switch 配置写入适配器。
3. 生成桌面快捷方式。
4. 增加 Win7 Electron 子工程。
5. 用 Playwright 做桌面和移动宽度的视觉验收。
