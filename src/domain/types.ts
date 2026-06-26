export type OperatingSystemFamily = "win7" | "win10" | "win11" | "unknown";

export type CpuArchitecture = "x64" | "x86" | "arm64" | "unknown";

export type InstallerMode = "beginner" | "expert";

export type InstallTarget =
  | "codex-cli"
  | "codex-desktop"
  | "codex-plus-plus"
  | "claude-cli"
  | "claude-desktop"
  | "cc-switch";

export type RuntimeId =
  | "python"
  | "node"
  | "git"
  | "powershell"
  | "vcpp-runtime"
  | "webview2"
  | "tls-certs"
  | "pnpm"
  | "yarn"
  | "bun"
  | "uv"
  | "pipx"
  | "github-cli"
  | "sevenzip"
  | "winget"
  | "scoop"
  | "chocolatey";

export type RuntimePolicy = "system-shared" | "isolated" | "optional";

export type DownloadSourceKind =
  | "official"
  | "github-release"
  | "github-proxy"
  | "npm-mirror"
  | "custom"
  | "offline-cache";

export type StepId =
  | "environment"
  | "product-selection"
  | "install-location"
  | "installation"
  | "api-config"
  | "skill-config"
  | "dialogue-config";

export type StepStatus = "pending" | "active" | "done" | "warning" | "error";

export type SkillInstallMode = "recommended" | "all" | "custom";

export type DialogueMode = "recommended" | "extend" | "custom";

export type InstallActionStatus = "queued" | "running" | "done" | "warning" | "error";

export interface DownloadSource {
  id: string;
  label: string;
  kind: DownloadSourceKind;
  url: string;
  priority: number;
  sha256?: string;
  regionHint?: "global" | "china-mainland" | "offline";
}

export interface ToolManifestItem {
  id: RuntimeId | InstallTarget;
  label: string;
  category: "runtime" | "agent" | "manager" | "system" | "helper";
  requiredFor: InstallTarget[];
  defaultVersion: string;
  win7Version?: string;
  policy: RuntimePolicy;
  detectionCommands: string[];
  installNotes: string;
  sources: DownloadSource[];
}

export interface RuntimeCheck {
  id: RuntimeId | InstallTarget;
  label: string;
  detected: boolean;
  version?: string;
  path?: string;
  required: boolean;
  selectedForInstall: boolean;
  status: "ok" | "missing" | "outdated" | "unsupported" | "optional";
  message: string;
}

export interface InstallLocation {
  target: InstallTarget | RuntimeId;
  label: string;
  defaultPath: string;
  selectedPath: string;
  userWritable: boolean;
}

export interface ProviderProfile {
  id: string;
  displayName: string;
  protocol: "openai-compatible" | "anthropic-compatible" | "codex-responses";
  baseUrl: string;
  apiKey: string;
  modelFetchPath?: string;
  selectedModel?: string;
  appliesTo: Array<"codex" | "claude">;
}

export interface SkillDescriptor {
  id: string;
  name: string;
  description: string;
  category: string;
  sourcePath: string;
  recommended: boolean;
  selected: boolean;
}

export interface DialogueConfig {
  mode: DialogueMode;
  baseMarkdown: string;
  userAppendix: string;
  finalMarkdown: string;
}

export interface WizardStep {
  id: StepId;
  title: string;
  summary: string;
  status: StepStatus;
}

export interface InstallAction {
  id: string;
  title: string;
  detail: string;
  targetId: RuntimeId | InstallTarget | "config" | "skills" | "dialogue";
  status: InstallActionStatus;
  progress: number;
}

export interface InstallLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
}

export interface SourcePreference {
  chinaMirrorFirst: boolean;
  allowOfficialFallback: boolean;
  offlineCachePath: string;
  retryCount: number;
}

export interface InstallationState {
  os: OperatingSystemFamily;
  architecture: CpuArchitecture;
  mode: InstallerMode;
  activeStep: StepId;
  steps: WizardStep[];
  runtimeChecks: RuntimeCheck[];
  installTargets: Record<InstallTarget, boolean>;
  locations: InstallLocation[];
  providers: ProviderProfile[];
  skills: SkillDescriptor[];
  skillMode: SkillInstallMode;
  dialogue: DialogueConfig;
  sourcePreference: SourcePreference;
  installActions: InstallAction[];
  logs: InstallLogEntry[];
}
