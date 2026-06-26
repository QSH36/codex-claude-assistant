# Codex+Claude 助手

Windows 桌面安装与配置向导，用于检查并配置 Codex、Claude、Codex++、CC Switch、运行环境、API、skill 索引和底层会话 MD。

## 架构

- Win10/Win11 主版本：Rust + Tauri v2 + React + TypeScript + Vite。
- Win7 兼容版本：规划为 Electron 22 + React + TypeScript，复用前端和领域模型。
- UI：7 步安装向导、轻 3D 背景、动效、键盘可达和脱敏日志。
- 后端：Tauri 命令白名单，当前提供环境扫描、配置状态读取、本机 skill 读取、下载计划预览和诊断导出。

## 功能

- 环境检查：Python、Node.js、Git、PowerShell、WebView2、winget、Codex CLI、Claude CLI 等。
- 产品选择：Codex 桌面版/CLI、Claude CLI/桌面版、Codex++、CC Switch。
- 安装位置：程序、隔离 Node 运行时和离线缓存位置。
- 安装进度：下载、换源、校验、配置、skill 和底层 MD 写入的状态流。
- API 配置：OpenAI 兼容、Anthropic 兼容、自定义服务商和模型字段。
- Skill 配置：精简、全部、自定义三种模式，并生成 `skill-routing.md`。
- 底层 MD：推荐、追加、自定义三种模式，默认中文优先。

## 开发

```powershell
npm.cmd install
npm.cmd run dev
```

## 验证

```powershell
npm.cmd run test
npm.cmd run build
$env:RUSTUP_HOME='F:\rustup'; $env:CARGO_HOME='F:\cargo'; cargo check --manifest-path src-tauri\Cargo.toml
```

## 打包

Win10/Win11：

```powershell
$env:RUSTUP_HOME='F:\rustup'; $env:CARGO_HOME='F:\cargo'; npm.cmd run bundle:win10
```

Win7 兼容包路线记录：

```powershell
npm.cmd run bundle:win7
```

Win7 portable 单文件：

```powershell
npm.cmd run build
Set-Location electron-win7
npm.cmd install
npm.cmd run dist
```

## 安全策略

- 不把 API Key、Token、密码写入日志。
- 诊断报告会脱敏常见密钥格式。
- 真实写配置前应展示预览、创建备份，并允许用户跳过初始化。
- 安装器后端采用白名单命令，不暴露任意 shell 执行入口。
