import { FileWarning, Terminal } from "lucide-react";
import { useInstallerStore } from "../state/useInstallerStore";

export function LogPanel() {
  const logs = useInstallerStore((state) => state.logs);
  const createDiagnosticPreview = useInstallerStore((state) => state.createDiagnosticPreview);
  const exportDiagnostics = useInstallerStore((state) => state.exportDiagnostics);

  return (
    <section className="log-panel" aria-label="安装日志">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Live log</p>
          <h2>安装日志</h2>
        </div>
        <Terminal size={18} aria-hidden="true" />
      </div>
      <div className="log-list" role="log" aria-live="polite">
        {logs.slice(-9).map((entry) => (
          <article className={`log-entry ${entry.level}`} key={entry.id}>
            <time>{new Date(entry.timestamp).toLocaleTimeString()}</time>
            <span>{entry.message}</span>
          </article>
        ))}
      </div>
      <details className="diagnostic-preview">
        <summary>
          <FileWarning size={16} />
          脱敏诊断预览
        </summary>
        <button className="secondary-button full-width-button" type="button" onClick={exportDiagnostics}>
          导出诊断报告
        </button>
        <pre>{createDiagnosticPreview()}</pre>
      </details>
    </section>
  );
}
