import { FileCog, KeyRound, ListPlus, RefreshCw, ShieldCheck } from "lucide-react";
import { useInstallerStore } from "../state/useInstallerStore";

export function ApiConfigStep() {
  const providers = useInstallerStore((state) => state.providers);
  const configStatuses = useInstallerStore((state) => state.configStatuses);
  const updateProvider = useInstallerStore((state) => state.updateProvider);
  const addProvider = useInstallerStore((state) => state.addProvider);
  const loadConfigStatuses = useInstallerStore((state) => state.loadConfigStatuses);

  return (
    <section className="step-layout">
      <div className="step-copy split-copy">
        <div>
          <p className="eyebrow">Step 05</p>
          <h2>配置 API 服务商</h2>
          <p>
            Codex 使用 Codex++ 的服务商配置，不强制选择模型；Claude 需要指定默认模型。
            用户也可以选择不初始化，后续自行配置。
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={addProvider}>
          <ListPlus size={16} />
          新服务商
        </button>
        <button className="primary-button" type="button" onClick={loadConfigStatuses}>
          <FileCog size={16} />
          读取现有配置
        </button>
      </div>

      {configStatuses.length > 0 && (
        <div className="config-status-grid">
          {configStatuses.map((status) => (
            <article className="config-status-card" key={status.id}>
              <strong>{status.label}</strong>
              <small>{status.path}</small>
              <span className={status.exists ? "status-ok" : "status-missing"}>
                {status.exists ? "已存在" : "未发现"}
              </span>
              {status.redacted_preview && <pre>{status.redacted_preview}</pre>}
            </article>
          ))}
        </div>
      )}

      <div className="provider-list">
        {providers.map((provider) => (
          <article className="provider-card" key={provider.id}>
            <div className="provider-title">
              <span className="product-icon">
                <KeyRound size={19} />
              </span>
              <div>
                <input
                  className="plain-input title-input"
                  value={provider.displayName}
                  onChange={(event) => updateProvider(provider.id, { displayName: event.target.value })}
                  aria-label="服务商名称"
                />
                <small>{provider.protocol}</small>
              </div>
            </div>

            <label>
              <span>请求地址</span>
              <input
                value={provider.baseUrl}
                onChange={(event) => updateProvider(provider.id, { baseUrl: event.target.value })}
                placeholder="https://api.example.com/v1"
              />
            </label>

            <label>
              <span>API Key</span>
              <input
                type="password"
                value={provider.apiKey}
                onChange={(event) => updateProvider(provider.id, { apiKey: event.target.value })}
                placeholder="写入前会再次确认，日志自动脱敏"
              />
            </label>

            <label>
              <span>Claude 默认模型</span>
              <input
                value={provider.selectedModel ?? ""}
                onChange={(event) => updateProvider(provider.id, { selectedModel: event.target.value })}
                placeholder="例如 claude-sonnet-4-5"
              />
            </label>

            <div className="provider-footer">
              <span>
                <ShieldCheck size={15} />
                应用到：{provider.appliesTo.join(", ")}
              </span>
              <button className="ghost-button" type="button">
                <RefreshCw size={15} />
                从上游获取模型
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
