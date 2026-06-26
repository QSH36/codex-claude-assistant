import { create } from "zustand";
import { createDiagnosticReport, redactSecrets } from "../domain/diagnostics";
import {
  createInitialRuntimeChecks,
  createInitialState,
  createInstallActions,
  defaultTargets,
  wizardSteps,
} from "../domain/environment";
import { mergeDialogueMarkdown, recommendedDialogueMarkdown } from "../domain/dialogueTemplates";
import { buildSkillIndex, builtInSkillCatalog, makeRecommendedSkills } from "../domain/skillCatalog";
import {
  applyConfiguration,
  exportDiagnosticReport,
  loadLocalSkillCatalog,
  readKnownConfigStatus,
  scanEnvironment,
  type ConfigFileStatus,
} from "../services/tauriBackend";
import type {
  DialogueMode,
  InstallationState,
  InstallTarget,
  ProviderProfile,
  RuntimeId,
  SkillInstallMode,
  StepId,
  StepStatus,
  WizardStep,
} from "../domain/types";

interface InstallerStore extends InstallationState {
  configStatuses: ConfigFileStatus[];
  getActiveStepIndex: () => number;
  setMode: (mode: InstallationState["mode"]) => void;
  setActiveStep: (stepId: StepId) => void;
  nextStep: () => void;
  previousStep: () => void;
  toggleRuntimeInstall: (id: RuntimeId | InstallTarget) => void;
  toggleInstallTarget: (target: InstallTarget) => void;
  updateLocation: (target: RuntimeId | InstallTarget, selectedPath: string) => void;
  updateProvider: (id: string, patch: Partial<ProviderProfile>) => void;
  addProvider: () => void;
  setSkillMode: (mode: SkillInstallMode) => void;
  toggleSkill: (id: string) => void;
  getGeneratedSkillIndex: () => string;
  setDialogueMode: (mode: DialogueMode) => void;
  setDialogueAppendix: (appendix: string) => void;
  setDialogueCustomMarkdown: (markdown: string) => void;
  startSimulatedInstall: () => void;
  createDiagnosticPreview: () => string;
  resetWizard: () => void;
  scanLocalEnvironment: () => Promise<void>;
  loadLocalSkills: () => Promise<void>;
  loadConfigStatuses: () => Promise<void>;
  exportDiagnostics: () => Promise<void>;
  applyGeneratedConfiguration: () => Promise<void>;
}

const stepOrder = wizardSteps.map((step) => step.id);

function createLog(message: string, level: InstallationState["logs"][number]["level"] = "info") {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    level,
    message: redactSecrets(message),
  };
}

function syncSteps(activeStep: StepId, completedUntilIndex: number): WizardStep[] {
  return wizardSteps.map((step, index) => ({
    ...step,
    status: (
      step.id === activeStep
        ? "active"
        : index < completedUntilIndex
          ? "done"
          : "pending"
    ) satisfies StepStatus,
  }));
}

function recalculateRuntimeChecks(targets: InstallationState["installTargets"]) {
  return createInitialRuntimeChecks(targets);
}

function recalculateInstallActions(state: Pick<InstallationState, "runtimeChecks" | "installTargets">) {
  return createInstallActions(state.runtimeChecks, state.installTargets);
}

function applySkillMode(mode: SkillInstallMode, skills: InstallationState["skills"]) {
  if (mode === "all") {
    return skills.map((skill) => ({ ...skill, selected: true }));
  }

  if (mode === "recommended") {
    const recommendedIds = new Set(makeRecommendedSkills(skills).map((skill) => skill.id));
    return skills.map((skill) => ({
      ...skill,
      selected: recommendedIds.has(skill.id),
      recommended: recommendedIds.has(skill.id) || skill.recommended,
    }));
  }

  return skills;
}

export const useInstallerStore = create<InstallerStore>((set, get) => ({
  ...createInitialState(),
  configStatuses: [],

  getActiveStepIndex: () => stepOrder.indexOf(get().activeStep),

  setMode: (mode) => {
    set((state) => ({
      mode,
      logs: [...state.logs, createLog(`已切换到${mode === "beginner" ? "小白" : "专家"}模式。`)],
    }));
  },

  setActiveStep: (stepId) => {
    const nextIndex = stepOrder.indexOf(stepId);
    set({
      activeStep: stepId,
      steps: syncSteps(stepId, nextIndex),
    });
  },

  nextStep: () => {
    const currentIndex = get().getActiveStepIndex();
    const next = stepOrder[Math.min(currentIndex + 1, stepOrder.length - 1)];
    get().setActiveStep(next);
  },

  previousStep: () => {
    const currentIndex = get().getActiveStepIndex();
    const previous = stepOrder[Math.max(currentIndex - 1, 0)];
    get().setActiveStep(previous);
  },

  toggleRuntimeInstall: (id) => {
    set((state) => ({
      runtimeChecks: state.runtimeChecks.map((check) =>
        check.id === id ? { ...check, selectedForInstall: !check.selectedForInstall } : check,
      ),
    }));
    set((state) => ({
      installActions: recalculateInstallActions(state),
      logs: [...state.logs, createLog(`已更新 ${id} 的补齐选择。`)],
    }));
  },

  toggleInstallTarget: (target) => {
    set((state) => {
      const installTargets = {
        ...state.installTargets,
        [target]: !state.installTargets[target],
      };

      if (target === "codex-cli" || target === "codex-desktop") {
        installTargets["codex-plus-plus"] = installTargets["codex-cli"] || installTargets["codex-desktop"];
      }

      if (target === "claude-cli" || target === "claude-desktop") {
        installTargets["cc-switch"] = installTargets["claude-cli"] || installTargets["claude-desktop"];
      }

      const runtimeChecks = recalculateRuntimeChecks(installTargets);

      return {
        installTargets,
        runtimeChecks,
        installActions: createInstallActions(runtimeChecks, installTargets),
        logs: [...state.logs, createLog(`已更新安装目标：${target}。`)],
      };
    });
  },

  updateLocation: (target, selectedPath) => {
    set((state) => ({
      locations: state.locations.map((location) =>
        location.target === target ? { ...location, selectedPath } : location,
      ),
    }));
  },

  updateProvider: (id, patch) => {
    set((state) => ({
      providers: state.providers.map((provider) =>
        provider.id === id ? { ...provider, ...patch } : provider,
      ),
    }));
  },

  addProvider: () => {
    set((state) => ({
      providers: [
        ...state.providers,
        {
          id: `custom-${state.providers.length + 1}`,
          displayName: "自定义服务商",
          protocol: "openai-compatible",
          baseUrl: "",
          apiKey: "",
          modelFetchPath: "/models",
          appliesTo: ["codex", "claude"],
        },
      ],
    }));
  },

  setSkillMode: (mode) => {
    set((state) => ({
      skillMode: mode,
      skills: applySkillMode(mode, state.skills.length ? state.skills : builtInSkillCatalog),
      logs: [...state.logs, createLog(`Skill 安装模式已切换为 ${mode}。`)],
    }));
  },

  toggleSkill: (id) => {
    set((state) => ({
      skills: state.skills.map((skill) =>
        skill.id === id ? { ...skill, selected: !skill.selected } : skill,
      ),
      skillMode: "custom",
    }));
  },

  getGeneratedSkillIndex: () => buildSkillIndex(get().skills),

  setDialogueMode: (mode) => {
    set((state) => {
      const finalMarkdown =
        mode === "recommended"
          ? recommendedDialogueMarkdown
          : mode === "extend"
            ? mergeDialogueMarkdown(recommendedDialogueMarkdown, state.dialogue.userAppendix)
            : "";

      return {
        dialogue: {
          ...state.dialogue,
          mode,
          finalMarkdown,
        },
      };
    });
  },

  setDialogueAppendix: (appendix) => {
    set((state) => ({
      dialogue: {
        ...state.dialogue,
        userAppendix: appendix,
        finalMarkdown:
          state.dialogue.mode === "extend"
            ? mergeDialogueMarkdown(state.dialogue.baseMarkdown, appendix)
            : state.dialogue.finalMarkdown,
      },
    }));
  },

  setDialogueCustomMarkdown: (markdown) => {
    set((state) => ({
      dialogue: {
        ...state.dialogue,
        mode: "custom",
        finalMarkdown: markdown,
      },
    }));
  },

  startSimulatedInstall: () => {
    const now = Date.now();
    set((state) => ({
      activeStep: "installation",
      steps: syncSteps("installation", stepOrder.indexOf("installation")),
      installActions: state.installActions.map((action, index) => ({
        ...action,
        status: index < 2 ? "done" : index === 2 ? "running" : "queued",
        progress: index < 2 ? 100 : index === 2 ? 48 : 0,
      })),
      logs: [
        ...state.logs,
        createLog("开始安装预演：镜像源优先，官方源作为回退。"),
        {
          id: `${now}-mirror`,
          timestamp: new Date().toISOString(),
          level: "success",
          message: "已完成 Python/Node/Git 检查预演，未执行真实系统修改。",
        },
      ],
    }));
  },

  createDiagnosticPreview: () => JSON.stringify(createDiagnosticReport(get()), null, 2),

  scanLocalEnvironment: async () => {
    set((state) => ({
      logs: [...state.logs, createLog("开始调用本机后端扫描运行环境。")],
    }));

    try {
      const probes = await scanEnvironment();
      if (!probes.length) {
        set((state) => ({
          logs: [...state.logs, createLog("当前运行在浏览器预览模式，后端扫描命令不可用。", "warning")],
        }));
        return;
      }

      set((state) => ({
        runtimeChecks: state.runtimeChecks.map((check) => {
          const probe = probes.find((item) => item.id === check.id || item.id === `${check.id}-cli`);
          if (!probe) return check;

          return {
            ...check,
            detected: probe.detected,
            version: probe.output || probe.message,
            path: probe.path,
            status: probe.detected ? "ok" : check.required ? "missing" : "optional",
            selectedForInstall: check.required && !probe.detected,
            message: probe.message,
          };
        }),
        logs: [
          ...state.logs,
          createLog(`后端扫描完成：${probes.filter((probe) => probe.detected).length}/${probes.length} 项可用。`, "success"),
        ],
      }));
      set((state) => ({ installActions: recalculateInstallActions(state) }));
    } catch (error) {
      set((state) => ({
        logs: [...state.logs, createLog(`环境扫描失败：${String(error)}`, "error")],
      }));
    }
  },

  loadLocalSkills: async () => {
    set((state) => ({
      logs: [...state.logs, createLog("开始读取本机 Codex/Claude skill 目录。")],
    }));

    try {
      const localSkills = await loadLocalSkillCatalog();
      if (!localSkills.length) {
        set((state) => ({
          logs: [...state.logs, createLog("未从 Tauri 后端读取到本机 skill，继续使用内置推荐目录。", "warning")],
        }));
        return;
      }

      const skills = localSkills.slice(0, 320).map((skill) => ({
        id: `${skill.name}-${skill.source_path}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: skill.name,
        description: skill.description,
        category: skill.category_hint,
        sourcePath: skill.source_path,
        recommended: builtInSkillCatalog.some((item) => item.name === skill.name),
        selected: builtInSkillCatalog.some((item) => item.name === skill.name),
      }));

      set((state) => ({
        skills: applySkillMode(state.skillMode, skills),
        logs: [...state.logs, createLog(`已加载 ${skills.length} 个本机 skill。`, "success")],
      }));
    } catch (error) {
      set((state) => ({
        logs: [...state.logs, createLog(`读取本机 skill 失败：${String(error)}`, "error")],
      }));
    }
  },

  loadConfigStatuses: async () => {
    set((state) => ({
      logs: [...state.logs, createLog("开始读取 Codex、Claude、Codex++ 和 CC Switch 配置状态。")],
    }));

    try {
      const configStatuses = await readKnownConfigStatus();
      if (!configStatuses.length) {
        set((state) => ({
          logs: [...state.logs, createLog("当前运行在浏览器预览模式，配置文件状态由 Tauri 版本读取。", "warning")],
        }));
        return;
      }

      set((state) => ({
        configStatuses,
        logs: [...state.logs, createLog(`已读取 ${configStatuses.length} 个配置位置。`, "success")],
      }));
    } catch (error) {
      set((state) => ({
        logs: [...state.logs, createLog(`读取配置状态失败：${String(error)}`, "error")],
      }));
    }
  },

  exportDiagnostics: async () => {
    const content = get().createDiagnosticPreview();

    try {
      const result = await exportDiagnosticReport(content);
      set((state) => ({
        logs: [
          ...state.logs,
          createLog(result.path ? `诊断报告已导出：${result.path}` : "浏览器预览模式不会写入诊断报告。", result.path ? "success" : "warning"),
        ],
      }));
    } catch (error) {
      set((state) => ({
        logs: [...state.logs, createLog(`诊断报告导出失败：${String(error)}`, "error")],
      }));
    }
  },

  applyGeneratedConfiguration: async () => {
    set((state) => ({
      activeStep: "installation",
      steps: syncSteps("installation", stepOrder.indexOf("installation")),
      installActions: state.installActions.map((action) =>
        ["write-config", "write-skills", "write-dialogue"].includes(action.id)
          ? { ...action, status: "running", progress: 35 }
          : action,
      ),
      logs: [...state.logs, createLog("开始写入生成配置：会自动备份已存在文件。")],
    }));

    const state = get();
    const hasCodex = state.installTargets["codex-cli"] || state.installTargets["codex-desktop"];
    const hasClaude = state.installTargets["claude-cli"] || state.installTargets["claude-desktop"];

    try {
      const results = await applyConfiguration({
        providers: state.providers.map((provider) => ({
          id: provider.id,
          display_name: provider.displayName,
          protocol: provider.protocol,
          base_url: provider.baseUrl,
          api_key: provider.apiKey,
          selected_model: provider.selectedModel,
          applies_to: provider.appliesTo,
        })),
        skillIndexMarkdown: state.getGeneratedSkillIndex(),
        dialogueMarkdown: state.dialogue.finalMarkdown,
        initializeCodex: hasCodex,
        initializeClaude: hasClaude,
        initializeSkills: true,
        initializeDialogue: true,
      });

      if (!results.length) {
        set((currentState) => ({
          installActions: currentState.installActions.map((action) =>
            ["write-config", "write-skills", "write-dialogue"].includes(action.id)
              ? { ...action, status: "warning", progress: 0 }
              : action,
          ),
          logs: [...currentState.logs, createLog("浏览器预览模式不会写入本机配置，请使用打包后的 Tauri 版本执行。", "warning")],
        }));
        return;
      }

      set((currentState) => ({
        installActions: currentState.installActions.map((action) =>
          ["write-config", "write-skills", "write-dialogue"].includes(action.id)
            ? { ...action, status: "done", progress: 100 }
            : action,
        ),
        logs: [
          ...currentState.logs,
          ...results.map((result) =>
            createLog(`已写入 ${result.path}${result.backup_path ? `，备份：${result.backup_path}` : ""}`, "success"),
          ),
        ],
      }));
      await get().loadConfigStatuses();
    } catch (error) {
      set((currentState) => ({
        installActions: currentState.installActions.map((action) =>
          ["write-config", "write-skills", "write-dialogue"].includes(action.id)
            ? { ...action, status: "error", progress: 100 }
            : action,
        ),
        logs: [...currentState.logs, createLog(`配置写入失败：${String(error)}`, "error")],
      }));
    }
  },

  resetWizard: () => {
    set({
      ...createInitialState(),
      configStatuses: [],
      installTargets: { ...defaultTargets },
    });
  },
}));
