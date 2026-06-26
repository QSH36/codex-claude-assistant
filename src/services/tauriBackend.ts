import { invoke } from "@tauri-apps/api/core";

export interface CommandProbe {
  id: string;
  label: string;
  command: string;
  detected: boolean;
  exit_code?: number;
  output: string;
  path?: string;
  message: string;
}

export interface ConfigFileStatus {
  id: string;
  label: string;
  path: string;
  exists: boolean;
  redacted_preview?: string;
}

export interface LocalSkill {
  name: string;
  description: string;
  source_path: string;
  category_hint: string;
}

export interface DownloadPlanItem {
  id: string;
  label: string;
  source: string;
  fallback: string;
  target_path: string;
  notes: string;
}

export interface ApplyProviderConfig {
  id: string;
  display_name: string;
  protocol: string;
  base_url: string;
  api_key: string;
  selected_model?: string;
  applies_to: string[];
}

export interface WriteResult {
  id: string;
  path: string;
  backup_path?: string;
  bytes: number;
  message: string;
}

function canInvokeTauri() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function scanEnvironment() {
  if (!canInvokeTauri()) return [];
  return invoke<CommandProbe[]>("scan_environment");
}

export async function readKnownConfigStatus() {
  if (!canInvokeTauri()) return [];
  return invoke<ConfigFileStatus[]>("read_known_config_status");
}

export async function loadLocalSkillCatalog() {
  if (!canInvokeTauri()) return [];
  return invoke<LocalSkill[]>("load_local_skill_catalog");
}

export async function buildDownloadPlan(selectedTargets: string[], chinaMirrorFirst: boolean, offlineCachePath: string) {
  if (!canInvokeTauri()) return [];
  return invoke<DownloadPlanItem[]>("build_download_plan", {
    request: {
      selected_targets: selectedTargets,
      china_mirror_first: chinaMirrorFirst,
      offline_cache_path: offlineCachePath,
    },
  });
}

export async function exportDiagnosticReport(content: string) {
  if (!canInvokeTauri()) return { path: "" };
  return invoke<{ path: string }>("export_diagnostic_report", {
    request: {
      content,
    },
  });
}

export async function applyConfiguration(request: {
  providers: ApplyProviderConfig[];
  skillIndexMarkdown: string;
  dialogueMarkdown: string;
  initializeCodex: boolean;
  initializeClaude: boolean;
  initializeSkills: boolean;
  initializeDialogue: boolean;
}) {
  if (!canInvokeTauri()) return [];
  return invoke<WriteResult[]>("apply_configuration", {
    request: {
      providers: request.providers,
      skill_index_markdown: request.skillIndexMarkdown,
      dialogue_markdown: request.dialogueMarkdown,
      initialize_codex: request.initializeCodex,
      initialize_claude: request.initializeClaude,
      initialize_skills: request.initializeSkills,
      initialize_dialogue: request.initializeDialogue,
    },
  });
}
