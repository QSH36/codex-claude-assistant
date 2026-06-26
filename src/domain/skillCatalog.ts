import type { SkillDescriptor } from "./types";

export const skillCategories = [
  "UI、UX、产品设计",
  "CLI、浏览器、桌面自动化",
  "Agent 编排与评估",
  "Skill、插件、MCP 管理",
  "编码、框架、测试",
  "DevOps、云、网络",
  "研究、写作、知识",
  "安全、合规、金融风险",
  "文档、媒体、文件",
  "数据、分析、可视化",
] as const;

const recommendedSkillNames = new Set([
  "application",
  "dashboard",
  "browser-qa",
  "accessibility",
  "animation-choreography",
  "coding-standards",
  "backend-patterns",
  "api-design",
  "codebase-onboarding",
  "code-tour",
  "check",
  "check-cross-layer",
  "skill-installer",
  "skill-creator",
  "plugin-creator",
  "openai-docs",
  "deep-research",
  "anysearch",
  "anti-hallucination",
  "citation-verifier",
  "deployment-patterns",
  "cloudflare-deploy",
  "database-migrations",
  "data-visualization",
  "browser-qa",
  "chrome:control-chrome",
  "browser:control-in-app-browser",
  "computer-use:computer-use",
  "cost-tracking",
  "agent-introspection-debugging",
  "blueprint",
  "checkpoint",
  "ck",
  "co-agent",
  "consult",
  "dashboard-design",
  "dark-mode-design",
  "button-design",
  "data-table-design",
  "command-palette",
  "color-accessibility",
  "content-hierarchy",
]);

export const builtInSkillCatalog: SkillDescriptor[] = [
  {
    id: "application",
    name: "application",
    description: "应用级界面设计、信息架构和开发者工作流。",
    category: "UI、UX、产品设计",
    sourcePath: "C:/Users/timpr/.agents/skills/design-application/SKILL.md",
    recommended: true,
    selected: true,
  },
  {
    id: "animation-choreography",
    name: "animation-choreography",
    description: "页面切换、交错动效、操作反馈节奏。",
    category: "UI、UX、产品设计",
    sourcePath: "C:/Users/timpr/.agents/skills/dtt-animation-choreography/SKILL.md",
    recommended: true,
    selected: true,
  },
  {
    id: "accessibility",
    name: "accessibility",
    description: "WCAG 2.2 AA、键盘可达、焦点与语义。",
    category: "UI、UX、产品设计",
    sourcePath: "C:/Users/timpr/.agents/skills/accessibility/SKILL.md",
    recommended: true,
    selected: true,
  },
  {
    id: "browser-qa",
    name: "browser-qa",
    description: "浏览器自动化、截图、交互和响应式验收。",
    category: "CLI、浏览器、桌面自动化",
    sourcePath: "C:/Users/timpr/.agents/skills/browser-qa/SKILL.md",
    recommended: true,
    selected: true,
  },
  {
    id: "coding-standards",
    name: "coding-standards",
    description: "跨项目编码规范、命名、测试和可维护性。",
    category: "编码、框架、测试",
    sourcePath: "C:/Users/timpr/.agents/skills/coding-standards/SKILL.md",
    recommended: true,
    selected: true,
  },
  {
    id: "backend-patterns",
    name: "backend-patterns",
    description: "后端服务、命令层、配置写入和错误处理模式。",
    category: "编码、框架、测试",
    sourcePath: "C:/Users/timpr/.agents/skills/backend-patterns/SKILL.md",
    recommended: true,
    selected: true,
  },
  {
    id: "skill-installer",
    name: "skill-installer",
    description: "安装、复制、索引和管理本地 skill。",
    category: "Skill、插件、MCP 管理",
    sourcePath: "C:/Users/timpr/.codex/skills/.system/skill-installer/SKILL.md",
    recommended: true,
    selected: true,
  },
  {
    id: "openai-docs",
    name: "openai-docs",
    description: "OpenAI/Codex 相关官方文档查询和配置参考。",
    category: "研究、写作、知识",
    sourcePath: "C:/Users/timpr/.codex/skills/.system/openai-docs/SKILL.md",
    recommended: true,
    selected: true,
  },
  {
    id: "cloudflare-deploy",
    name: "cloudflare-deploy",
    description: "Cloudflare DNS、Pages、Workers 和部署流程。",
    category: "DevOps、云、网络",
    sourcePath: "C:/Users/timpr/.agents/skills/cloudflare-deploy/SKILL.md",
    recommended: true,
    selected: true,
  },
  {
    id: "deep-research",
    name: "deep-research",
    description: "联网研究、资料比对和来源核验。",
    category: "研究、写作、知识",
    sourcePath: "C:/Users/timpr/.agents/skills/deep-research/SKILL.md",
    recommended: true,
    selected: true,
  },
];

export function normalizeSkillName(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9:+_-]+/g, "-");
}

export function inferSkillCategory(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();

  if (/(ui|ux|design|dashboard|button|color|accessibility|animation|visual|product)/.test(text)) {
    return "UI、UX、产品设计";
  }
  if (/(browser|chrome|computer|desktop|cli|automation|terminal|shell|powershell)/.test(text)) {
    return "CLI、浏览器、桌面自动化";
  }
  if (/(agent|eval|orchestrat|memory|prompt|workflow|introspection|harness)/.test(text)) {
    return "Agent 编排与评估";
  }
  if (/(skill|plugin|mcp|openai-docs|installer)/.test(text)) {
    return "Skill、插件、MCP 管理";
  }
  if (/(code|typescript|backend|api|testing|angular|react|rust|python|java|go|csharp)/.test(text)) {
    return "编码、框架、测试";
  }
  if (/(cloud|deploy|devops|docker|network|dns|server|database|migration|nginx|ecs)/.test(text)) {
    return "DevOps、云、网络";
  }
  if (/(research|search|citation|writing|knowledge|hallucination|article)/.test(text)) {
    return "研究、写作、知识";
  }
  if (/(security|privacy|finance|risk|compliance|auth|payment)/.test(text)) {
    return "安全、合规、金融风险";
  }
  if (/(document|pdf|image|media|file|slides|excel|word|video)/.test(text)) {
    return "文档、媒体、文件";
  }
  if (/(data|analytics|chart|visualization|report|d3)/.test(text)) {
    return "数据、分析、可视化";
  }

  return "通用/未分类";
}

export function createSkillDescriptor(name: string, description: string, sourcePath: string): SkillDescriptor {
  const normalizedName = normalizeSkillName(name);
  const category = inferSkillCategory(name, description);
  const recommended = recommendedSkillNames.has(name) || recommendedSkillNames.has(normalizedName);

  return {
    id: normalizedName,
    name,
    description,
    category,
    sourcePath,
    recommended,
    selected: recommended,
  };
}

export function buildSkillIndex(skills: SkillDescriptor[]) {
  const selectedSkills = skills.filter((skill) => skill.selected);
  const byCategory = selectedSkills.reduce<Record<string, SkillDescriptor[]>>((acc, skill) => {
    acc[skill.category] ??= [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const lines = [
    "# Skill 路由索引",
    "",
    "此文件由 Codex+Claude 助手生成。它描述当前已安装 skill、分类和调用建议。",
    "",
    "## 使用规则",
    "",
    "- 每次任务开始时先判断任务类型、项目类型、风险等级，以及是否需要代码库上下文。",
    "- 只读取本次任务真正需要的 `SKILL.md`，不要一次性加载全部 skill。",
    "- 简单文本搜索优先使用 `rg`；符号关系、调用链和影响分析再使用 CodeGraph。",
    "- 默认使用中文回复，除非用户明确要求其他语言。",
    "- 涉及凭据、生产环境、系统/网络修改、全局安装和破坏性删除时再次确认。",
    "",
    "## 快速路由",
    "",
    "| 任务类型 | 建议 skill | 说明 |",
    "|---|---|---|",
    "| 前端/应用界面 | `application`、`accessibility`、`animation-choreography`、`browser-qa` | 设计、实现、动效和验收闭环。 |",
    "| 代码理解/审查 | `codebase-onboarding`、`code-tour`、`check`、`coding-standards` | 快速定位结构、风险和测试缺口。 |",
    "| Skill/插件 | `skill-installer`、`skill-creator`、`plugin-creator` | 管理本地 skill、插件和索引。 |",
    "| 当前信息/联网研究 | `deep-research`、`anysearch`、`anti-hallucination` | 需要最新资料或直接来源时使用。 |",
    "",
  ];

  for (const category of Object.keys(byCategory).sort((a, b) => a.localeCompare(b, "zh-CN"))) {
    lines.push(`## ${category}`, "");
    for (const skill of byCategory[category].sort((a, b) => a.name.localeCompare(b.name))) {
      const description = skill.description || "暂无描述";
      lines.push(`- \`${skill.name}\`：${description}。路径：\`${skill.sourcePath}\``);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

export function makeRecommendedSkills(candidates: SkillDescriptor[]) {
  const picked = new Map<string, SkillDescriptor>();

  for (const skill of candidates) {
    if (skill.recommended || recommendedSkillNames.has(skill.name) || recommendedSkillNames.has(normalizeSkillName(skill.name))) {
      picked.set(skill.id, { ...skill, recommended: true, selected: true });
    }
  }

  for (const category of skillCategories) {
    if ([...picked.values()].some((skill) => skill.category === category)) continue;
    const fallback = candidates.find((skill) => skill.category === category);
    if (fallback) {
      picked.set(fallback.id, { ...fallback, recommended: true, selected: true });
    }
  }

  return [...picked.values()].slice(0, 50);
}
