import type { InstallationState } from "./types";

const secretPatterns = [
  /sk-[A-Za-z0-9_-]{10,}/g,
  /github_pat_[A-Za-z0-9_]+/g,
  /ghp_[A-Za-z0-9_]+/g,
  /cfat_[A-Za-z0-9_-]+/g,
  /LTAI[A-Za-z0-9]+/g,
  /AKIA[A-Za-z0-9]+/g,
  /(?<key>api[_-]?key|token|secret|password|access[_-]?key|secret[_-]?key)(?<sep>["'\s:=]+)(?<value>[^"',\s}]+)/gi,
];

export function redactSecrets(input: string) {
  return secretPatterns.reduce((text, pattern) => {
    return text.replace(pattern, (...args: unknown[]) => {
      const match = args[0] as string;
      const groups = args.at(-1) as { key?: string; sep?: string } | undefined;
      if (groups?.key) {
        return `${groups.key}${groups.sep ?? "="}<REDACTED>`;
      }
      if (match.startsWith("github_pat_")) return "github_pat_<REDACTED>";
      if (match.startsWith("cfat_")) return "cfat_<REDACTED>";
      if (match.startsWith("LTAI")) return "LTAI<REDACTED>";
      if (match.startsWith("AKIA")) return "AKIA<REDACTED>";
      if (match.startsWith("ghp_")) return "ghp_<REDACTED>";
      return "<REDACTED>";
    });
  }, input);
}

export function createDiagnosticReport(state: InstallationState) {
  return {
    generatedAt: new Date().toISOString(),
    app: "Codex+Claude 助手",
    os: state.os,
    architecture: state.architecture,
    mode: state.mode,
    activeStep: state.activeStep,
    runtimeChecks: state.runtimeChecks.map((check) => ({
      id: check.id,
      label: check.label,
      detected: check.detected,
      version: check.version,
      required: check.required,
      selectedForInstall: check.selectedForInstall,
      status: check.status,
      message: check.message,
    })),
    installTargets: state.installTargets,
    sourcePreference: {
      ...state.sourcePreference,
      offlineCachePath: state.sourcePreference.offlineCachePath,
    },
    logs: state.logs.map((entry) => ({
      ...entry,
      message: redactSecrets(entry.message),
    })),
  };
}
