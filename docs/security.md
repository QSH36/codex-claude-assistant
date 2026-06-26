# 安全与凭据处理

## 凭据原则

- 不把用户 API Key、Token、密码、云厂商 AccessKey 写入日志。
- 诊断报告导出前执行脱敏。
- 配置写入必须先预览、备份，再执行。
- GitHub PAT 只能通过环境变量或 `gh auth login --with-token` 临时使用，不能写入仓库文件。

## 已覆盖脱敏格式

- `github_pat_...`
- `ghp_...`
- `cfat_...`
- `sk-...`
- `LTAI...`
- `AKIA...`
- 常见 `api_key`、`token`、`secret`、`password` 字段。

## 后续要求

- 配置写入适配器增加原子写入。
- 安装包下载增加 SHA256 校验。
- 所有可能修改系统的命令都需要 UI 二次确认。
