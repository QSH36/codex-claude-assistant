import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, RotateCcw, Sparkles } from "lucide-react";
import { ApiConfigStep } from "./components/ApiConfigStep";
import { DialogueConfigStep } from "./components/DialogueConfigStep";
import { EnvironmentStep } from "./components/EnvironmentStep";
import { InstallLocationStep } from "./components/InstallLocationStep";
import { InstallationStep } from "./components/InstallationStep";
import { LightScene } from "./components/LightScene";
import { LogPanel } from "./components/LogPanel";
import { ProductSelectionStep } from "./components/ProductSelectionStep";
import { SkillConfigStep } from "./components/SkillConfigStep";
import { StepRail } from "./components/StepRail";
import { WizardShell } from "./components/WizardShell";
import { useInstallerStore } from "./state/useInstallerStore";

const stepComponents = {
  environment: EnvironmentStep,
  "product-selection": ProductSelectionStep,
  "install-location": InstallLocationStep,
  installation: InstallationStep,
  "api-config": ApiConfigStep,
  "skill-config": SkillConfigStep,
  "dialogue-config": DialogueConfigStep,
};

export function App() {
  const activeStep = useInstallerStore((state) => state.activeStep);
  const activeStepIndex = useInstallerStore((state) => state.getActiveStepIndex());
  const canGoBack = activeStepIndex > 0;
  const canGoForward = activeStepIndex < useInstallerStore.getState().steps.length - 1;
  const previousStep = useInstallerStore((state) => state.previousStep);
  const nextStep = useInstallerStore((state) => state.nextStep);
  const startSimulatedInstall = useInstallerStore((state) => state.startSimulatedInstall);
  const resetWizard = useInstallerStore((state) => state.resetWizard);
  const ActiveStepComponent = stepComponents[activeStep];

  return (
    <div className="app-root">
      <LightScene />
      <WizardShell
        header={
          <header className="topbar">
            <div className="brand-lockup">
              <span className="brand-mark" aria-hidden="true">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="eyebrow">Windows 安装配置器</p>
                <h1>Codex+Claude 助手</h1>
              </div>
            </div>
            <div className="topbar-actions">
              <button className="ghost-button" type="button" onClick={resetWizard}>
                <RotateCcw size={16} />
                重置
              </button>
              <button className="primary-button" type="button" onClick={startSimulatedInstall}>
                <Play size={16} />
                预演安装
              </button>
            </div>
          </header>
        }
        rail={<StepRail />}
        logPanel={<LogPanel />}
        footer={
          <footer className="wizard-footer">
            <button className="secondary-button" type="button" onClick={previousStep} disabled={!canGoBack}>
              <ChevronLeft size={16} />
              上一步
            </button>
            <button className="primary-button" type="button" onClick={nextStep} disabled={!canGoForward}>
              下一步
              <ChevronRight size={16} />
            </button>
          </footer>
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            className="step-stage"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <ActiveStepComponent />
          </motion.div>
        </AnimatePresence>
      </WizardShell>
    </div>
  );
}
