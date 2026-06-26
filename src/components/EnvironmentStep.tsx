import { CheckCircle2, CircleAlert, Download, HardDrive, Network, Radar, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";
import { toolManifest } from "../domain/toolManifest";
import { useInstallerStore } from "../state/useInstallerStore";

export function EnvironmentStep() {
  const runtimeChecks = useInstallerStore((state) => state.runtimeChecks);
  const sourcePreference = useInstallerStore((state) => state.sourcePreference);
  const toggleRuntimeInstall = useInstallerStore((state) => state.toggleRuntimeInstall);
  const scanLocalEnvironment = useInstallerStore((state) => state.scanLocalEnvironment);
  const missingCount = runtimeChecks.filter((check) => check.status === "missing").length;
  const selectedCount = runtimeChecks.filter((check) => check.selectedForInstall).length;

  return (
    <section className="step-layout">
      <div className="step-copy split-copy">
        <div>
          <p className="eyebrow">Step 01</p>
          <h2>检查并补齐运行环境</h2>
          <p>
            默认把 Python 作为系统共用运行时，把 Node.js 作为隔离运行时。用户可以只勾选需要补齐的项目，
            也可以进入专家模式补齐 pnpm、uv、GitHub CLI 等辅助工具。
          </p>
        </div>
        <button className="primary-button" type="button" onClick={scanLocalEnvironment}>
          <Radar size={16} />
          扫描本机
        </button>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <CheckCircle2 size={20} />
          <strong>{runtimeChecks.length - missingCount}</strong>
          <span>已可用/可选</span>
        </div>
        <div className="metric-card warning">
          <Download size={20} />
          <strong>{selectedCount}</strong>
          <span>将补齐</span>
        </div>
        <div className="metric-card">
          <Network size={20} />
          <strong>{sourcePreference.retryCount}</strong>
          <span>自动换源重试</span>
        </div>
      </div>

      <div className="tool-grid">
        {runtimeChecks.map((check) => {
          const manifest = toolManifest.find((tool) => tool.id === check.id);
          return (
            <article className={clsx("tool-card", check.status)} key={check.id}>
              <div className="tool-card-header">
                <div>
                  <span className="tool-kind">{manifest?.category ?? "tool"}</span>
                  <h3>{check.label}</h3>
                </div>
                <span className="status-pill">
                  {check.status === "ok" ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
                  {check.status}
                </span>
              </div>
              <p>{check.message}</p>
              {check.version && <small className="mono-text">{check.version}</small>}
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={check.selectedForInstall}
                  onChange={() => toggleRuntimeInstall(check.id)}
                  disabled={check.status === "ok" && !check.required}
                />
                <span>{check.selectedForInstall ? "安装器会补齐" : "不补齐此项"}</span>
              </label>
              <details>
                <summary>
                  <ShieldCheck size={15} />
                  下载源
                </summary>
                <ul className="source-list">
                  {manifest?.sources.map((source) => (
                    <li key={source.id}>
                      <span>{source.label}</span>
                      <small>{source.regionHint}</small>
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          );
        })}
      </div>

      <aside className="info-band">
        <HardDrive size={18} />
        <span>安装缓存默认写入用户下载目录，源码和打包产物保留在 F 盘工程目录。</span>
      </aside>
    </section>
  );
}
