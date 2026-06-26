import { Activity, CheckCircle2, Loader2, RotateCw, ShieldAlert } from "lucide-react";
import { clsx } from "clsx";
import { useInstallerStore } from "../state/useInstallerStore";

function ActionIcon({ status }: { status: string }) {
  if (status === "done") return <CheckCircle2 size={18} />;
  if (status === "running") return <Loader2 className="spin" size={18} />;
  if (status === "warning" || status === "error") return <ShieldAlert size={18} />;
  return <RotateCw size={18} />;
}

export function InstallationStep() {
  const installActions = useInstallerStore((state) => state.installActions);
  const startSimulatedInstall = useInstallerStore((state) => state.startSimulatedInstall);
  const doneCount = installActions.filter((action) => action.status === "done").length;
  const totalProgress = Math.round(
    installActions.reduce((sum, action) => sum + action.progress, 0) / Math.max(installActions.length, 1),
  );

  return (
    <section className="step-layout">
      <div className="step-copy split-copy">
        <div>
          <p className="eyebrow">Step 04</p>
          <h2>执行安装与配置</h2>
          <p>
            真实版本会在这里显示下载、校验、安装、创建快捷方式、配置写入和回滚进度。
            当前预演不会修改系统，只用于验证交互和状态流。
          </p>
        </div>
        <button className="primary-button" type="button" onClick={startSimulatedInstall}>
          <Activity size={16} />
          运行预演
        </button>
      </div>

      <div className="progress-card">
        <div className="progress-heading">
          <span>总进度</span>
          <strong>{totalProgress}%</strong>
        </div>
        <div className="progress-track" aria-label="总进度">
          <span style={{ width: `${totalProgress}%` }} />
        </div>
        <small>{doneCount}/{installActions.length} 个动作完成</small>
      </div>

      <div className="action-timeline">
        {installActions.map((action, index) => (
          <article className={clsx("action-row", action.status)} key={action.id}>
            <span className="timeline-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="action-icon" aria-hidden="true">
              <ActionIcon status={action.status} />
            </span>
            <div className="action-copy">
              <strong>{action.title}</strong>
              <small>{action.detail}</small>
              <div className="mini-progress" aria-label={`${action.title} 进度`}>
                <span style={{ width: `${action.progress}%` }} />
              </div>
            </div>
            <span className="status-pill">{action.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
