import { Check, Circle, CircleAlert } from "lucide-react";
import { clsx } from "clsx";
import { useInstallerStore } from "../state/useInstallerStore";

export function StepRail() {
  const steps = useInstallerStore((state) => state.steps);
  const activeStep = useInstallerStore((state) => state.activeStep);
  const setActiveStep = useInstallerStore((state) => state.setActiveStep);
  const mode = useInstallerStore((state) => state.mode);
  const setMode = useInstallerStore((state) => state.setMode);

  return (
    <nav className="step-rail" aria-label="安装步骤">
      <div className="mode-toggle" role="group" aria-label="模式切换">
        <button
          className={clsx("segmented-button", mode === "beginner" && "active")}
          type="button"
          onClick={() => setMode("beginner")}
        >
          小白
        </button>
        <button
          className={clsx("segmented-button", mode === "expert" && "active")}
          type="button"
          onClick={() => setMode("expert")}
        >
          专家
        </button>
      </div>

      <ol className="step-list">
        {steps.map((step, index) => {
          const isActive = activeStep === step.id;
          const icon =
            step.status === "done" ? (
              <Check size={16} />
            ) : step.status === "warning" || step.status === "error" ? (
              <CircleAlert size={16} />
            ) : (
              <Circle size={16} />
            );

          return (
            <li key={step.id}>
              <button
                className={clsx("step-button", isActive && "active", step.status)}
                type="button"
                onClick={() => setActiveStep(step.id)}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="step-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="step-icon" aria-hidden="true">
                  {icon}
                </span>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.summary}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
