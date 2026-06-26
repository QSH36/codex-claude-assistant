import { recommendedDialogueMarkdown } from "./dialogueTemplates";
import { builtInSkillCatalog } from "./skillCatalog";
import { toolManifest } from "./toolManifest";
import type {
  InstallAction,
  InstallationState,
  InstallLocation,
  InstallTarget,
  RuntimeCheck,
  StepId,
  WizardStep,
} from "./types";

export const defaultTargets: Record<InstallTarget, boolean> = {
  "codex-cli": true,
  "codex-desktop": true,
  "codex-plus-plus": true,
  "claude-cli": true,
  "claude-desktop": false,
  "cc-switch": true,
};

export const wizardSteps: WizardStep[] = [
  {
    id: "environment",
    title: "环境检查",
    summary: "检测 Python、Node、Git、WebView2 和桌面运行库。",
    status: "active",
  },
  {
    id: "product-selection",
    title: "产品选择",
    summary: "选择 Codex、Claude CLI、Claude 桌面版和管理工具。",
    status: "pending",
  },
  {
    id: "install-location",
    title: "安装位置",
    summary: "自定义运行时、工具和离线缓存目录。",
    status: "pending",
  },
  {
    id: "installation",
    title: "安装执行",
    summary: "显示下载、换源、校验、安装和回滚进度。",
    status: "pending",
  },
  {
    id: "api-config",
    title: "API 配置",
    summary: "配置服务商地址、API Key 和 Claude 默认模型。",
    status: "pending",
  },
  {
    id: "skill-config",
    title: "Skill 配置",
    summary: "精简、全部或自定义安装 skill，并生成路由索引。",
    status: "pending",
  },
  {
    id: "dialogue-config",
    title: "底层 MD",
    summary: "写入推荐、追加或完全自定义的底层会话规则。",
    status: "pending",
  },
];

const detectedOnThisMachine = new Map<string, Partial<RuntimeCheck>>([
  ["python", { detected: true, status: "ok", version: "已发现 Python，安装器会校验是否满足 3.11 x64" }],
  ["node", { detected: true, status: "ok", version: "本机 Node 可用" }],
  ["git", { detected: true, status: "ok", version: "Git for Windows 可用" }],
  ["powershell", { detected: true, status: "ok", version: "PowerShell 可用" }],
  ["webview2", { detected: true, status: "ok", version: "WebView2/Edge Runtime 可用" }],
  ["codex-cli", { detected: true, status: "ok", version: "已发现 codex.exe" }],
  ["codex-desktop", { detected: true, status: "ok", version: "已发现 Codex 桌面版" }],
  ["codex-plus-plus", { detected: true, status: "ok", version: "1.2.18" }],
  ["claude-cli", { detected: true, status: "ok", version: "已发现 claude.exe" }],
  ["cc-switch", { detected: true, status: "ok", version: "3.16.3" }],
  ["github-cli", { detected: true, status: "ok", version: "gh 可用" }],
]);

export function createInitialRuntimeChecks(targets = defaultTargets): RuntimeCheck[] {
  const selectedTargets = Object.entries(targets)
    .filter(([, enabled]) => enabled)
    .map(([target]) => target);

  return toolManifest.map((tool) => {
    const targetEnabled = Boolean(targets[tool.id as InstallTarget]);
    const required =
      tool.category === "runtime" || tool.category === "system"
        ? tool.requiredFor.some((target) => selectedTargets.includes(target))
        : targetEnabled;
    const detected = detectedOnThisMachine.get(tool.id);
    const status = detected?.status ?? (required ? "missing" : "optional");

    return {
      id: tool.id,
      label: tool.label,
      detected: detected?.detected ?? false,
      version: detected?.version,
      path: detected?.path,
      required,
      selectedForInstall: required && status !== "ok",
      status,
      message:
        status === "ok"
          ? `${tool.label} 已可用。`
          : required
            ? `${tool.label} 是当前选择需要的组件，建议补齐。`
            : `${tool.label} 是可选组件。`,
    };
  });
}

export function createDefaultLocations(): InstallLocation[] {
  return [
    {
      target: "node",
      label: "隔离 Node.js 运行时",
      defaultPath: "%LOCALAPPDATA%\\CodexClaudeAssistant\\runtimes\\node",
      selectedPath: "%LOCALAPPDATA%\\CodexClaudeAssistant\\runtimes\\node",
      userWritable: true,
    },
    {
      target: "python",
      label: "Python",
      defaultPath: "系统默认位置",
      selectedPath: "系统默认位置",
      userWritable: true,
    },
    {
      target: "codex-desktop",
      label: "Codex 桌面版",
      defaultPath: "%LOCALAPPDATA%\\Programs\\Codex",
      selectedPath: "%LOCALAPPDATA%\\Programs\\Codex",
      userWritable: true,
    },
    {
      target: "claude-cli",
      label: "Claude CLI",
      defaultPath: "%APPDATA%\\npm",
      selectedPath: "%APPDATA%\\npm",
      userWritable: true,
    },
    {
      target: "codex-plus-plus",
      label: "Codex++",
      defaultPath: "%LOCALAPPDATA%\\Programs\\Codex++",
      selectedPath: "%LOCALAPPDATA%\\Programs\\Codex++",
      userWritable: true,
    },
    {
      target: "cc-switch",
      label: "CC Switch",
      defaultPath: "%LOCALAPPDATA%\\Programs\\CC Switch",
      selectedPath: "%LOCALAPPDATA%\\Programs\\CC Switch",
      userWritable: true,
    },
  ];
}

export function createInstallActions(runtimeChecks: RuntimeCheck[], targets = defaultTargets): InstallAction[] {
  const selectedRuntimeActions = runtimeChecks
    .filter((check) => check.selectedForInstall)
    .map<InstallAction>((check) => ({
      id: `install-${check.id}`,
      title: `补齐 ${check.label}`,
      detail: "自动选择国内镜像，失败后回退官方源和离线缓存。",
      targetId: check.id,
      status: "queued",
      progress: 0,
    }));

  const selectedTargetActions = Object.entries(targets)
    .filter(([, selected]) => selected)
    .map<InstallAction>(([target]) => ({
      id: `install-${target}`,
      title: `安装/校验 ${target}`,
      detail: "安装完成后创建桌面快捷方式，并保留用户原有配置。",
      targetId: target as InstallTarget,
      status: "queued",
      progress: 0,
    }));

  return [
    ...selectedRuntimeActions,
    ...selectedTargetActions,
    {
      id: "write-config",
      title: "写入配置",
      detail: "写入 Codex、Claude、Codex++、CC Switch 配置模板。",
      targetId: "config",
      status: "queued",
      progress: 0,
    },
    {
      id: "write-skills",
      title: "生成 skill 索引",
      detail: "按安装模式生成精简/完整/自定义 skill 路由索引。",
      targetId: "skills",
      status: "queued",
      progress: 0,
    },
    {
      id: "write-dialogue",
      title: "写入底层 MD",
      detail: "生成中文优先、skill 路由和安全确认规则。",
      targetId: "dialogue",
      status: "queued",
      progress: 0,
    },
  ];
}

export function createInitialState(activeStep: StepId = "environment"): InstallationState {
  const runtimeChecks = createInitialRuntimeChecks(defaultTargets);
  const steps = wizardSteps.map((step) => ({
    ...step,
    status: step.id === activeStep ? "active" : step.status,
  }));

  return {
    os: "win11",
    architecture: "x64",
    mode: "beginner",
    activeStep,
    steps,
    runtimeChecks,
    installTargets: { ...defaultTargets },
    locations: createDefaultLocations(),
    providers: [
      {
        id: "openai-compatible",
        displayName: "OpenAI 兼容服务商",
        protocol: "openai-compatible",
        baseUrl: "https://api.openai.com/v1",
        apiKey: "",
        modelFetchPath: "/models",
        appliesTo: ["codex"],
      },
      {
        id: "anthropic-compatible",
        displayName: "Anthropic/Claude 兼容服务商",
        protocol: "anthropic-compatible",
        baseUrl: "https://api.anthropic.com",
        apiKey: "",
        selectedModel: "claude-sonnet-4-5",
        appliesTo: ["claude"],
      },
    ],
    skills: builtInSkillCatalog,
    skillMode: "recommended",
    dialogue: {
      mode: "recommended",
      baseMarkdown: recommendedDialogueMarkdown,
      userAppendix: "",
      finalMarkdown: recommendedDialogueMarkdown,
    },
    sourcePreference: {
      chinaMirrorFirst: true,
      allowOfficialFallback: true,
      offlineCachePath: "%USERPROFILE%\\Downloads\\CodexClaudeAssistantCache",
      retryCount: 3,
    },
    installActions: createInstallActions(runtimeChecks),
    logs: [
      {
        id: "boot",
        timestamp: new Date().toISOString(),
        level: "info",
        message: "安装向导已准备就绪，默认使用中国大陆友好的镜像优先策略。",
      },
    ],
  };
}
