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
