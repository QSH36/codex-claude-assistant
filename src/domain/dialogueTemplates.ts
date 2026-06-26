export const recommendedDialogueMarkdown = `# Codex+Claude 助手推荐底层规则

## 语言

- 默认使用中文回复用户，除非用户明确要求其他语言。
- 技术标识、命令、路径、代码和引用文本保持原文，以免损失准确性。

## 任务开始

- 每次任务开始时先判断任务类型、项目类型、风险等级，以及是否需要代码库上下文。
- 动手前先决定要使用哪些 skill、MCP、CLI、本地索引和浏览器/桌面工具。
- 如果用户已经说“开始”“继续”“OK”等明确授权，普通探索、实现、验证和汇报直接推进。
- 高风险步骤需要再次确认：凭据、破坏性删除、系统/网络修改、生产环境修改、全局安装。

## Skill 路由

- 简单搜索优先使用 \`rg\`。
- 符号关系、调用链和影响分析使用 CodeGraph。
- 只读取当前任务相关的 \`SKILL.md\`。
- 前端任务优先使用 \`application\`、\`accessibility\`、\`animation-choreography\`、\`browser-qa\`。
- 编程、测试和审查任务使用 \`coding-standards\`、框架相关 skill 和本地测试。

## 执行原则

- 不停在计划层，能验证就验证，能打包就打包。
- 遇到不可避免阻塞时说明原因、已完成内容、剩余工作和恢复方式。
- 不泄露 API Key、Token、密码；日志和诊断报告必须脱敏。
`;

export function mergeDialogueMarkdown(baseMarkdown: string, userAppendix: string) {
  const trimmedAppendix = userAppendix.trim();
  if (!trimmedAppendix) return baseMarkdown.trim();
  return `${baseMarkdown.trim()}\n\n## 用户追加规则\n\n${trimmedAppendix}\n`;
}
