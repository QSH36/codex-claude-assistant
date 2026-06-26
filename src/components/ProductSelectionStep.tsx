import { Bot, Boxes, Check, MonitorDown, TerminalSquare } from "lucide-react";
import { clsx } from "clsx";
import type { InstallTarget } from "../domain/types";
import { useInstallerStore } from "../state/useInstallerStore";

const productCards: Array<{
  id: InstallTarget;
  title: string;
  description: string;
  icon: typeof Bot;
  accent: string;
}> = [
  {
    id: "codex-desktop",
    title: "Codex 桌面版",
    description: "面向日常开发的桌面体验，默认联动 Codex++。",
    icon: MonitorDown,
    accent: "cyan",
  },
  {
    id: "codex-cli",
    title: "Codex CLI",
    description: "终端工作流和自动化脚本入口，保留 .codex 配置。",
    icon: TerminalSquare,
    accent: "green",
  },
  {
    id: "claude-cli",
    title: "Claude Code 终端版",
    description: "通过 npm/镜像源安装，默认联动 CC Switch。",
    icon: Bot,
    accent: "amber",
  },
  {
    id: "claude-desktop",
    title: "Claude 桌面版",
    description: "可选桌面客户端，不阻塞 Claude CLI 配置。",
    icon: MonitorDown,
    accent: "violet",
  },
  {
    id: "codex-plus-plus",
    title: "Codex++",
    description: "Codex 管理增强工具，选择 Codex 时自动勾选。",
    icon: Boxes,
    accent: "blue",
  },
  {
    id: "cc-switch",
    title: "CC Switch",
    description: "Claude 服务商、模型和配置切换管理工具。",
    icon: Boxes,
    accent: "orange",
  },
];

export function ProductSelectionStep() {
  const installTargets = useInstallerStore((state) => state.installTargets);
  const toggleInstallTarget = useInstallerStore((state) => state.toggleInstallTarget);

  return (
    <section className="step-layout">
      <div className="step-copy">
        <p className="eyebrow">Step 02</p>
        <h2>选择要安装的产品</h2>
        <p>
          选择 Codex 时自动带上 Codex++；选择 Claude 终端版或桌面版时自动带上 CC Switch。
          两套工具可以同时安装，后续分别配置安装位置和 API。
        </p>
      </div>

      <div className="selection-grid">
        {productCards.map((product) => {
          const Icon = product.icon;
          const checked = installTargets[product.id];

          return (
            <button
              className={clsx("product-card", product.accent, checked && "selected")}
              type="button"
              key={product.id}
              onClick={() => toggleInstallTarget(product.id)}
              aria-pressed={checked}
            >
              <span className="product-icon">
                <Icon size={22} />
              </span>
              <span className="product-copy">
                <strong>{product.title}</strong>
                <small>{product.description}</small>
              </span>
              <span className="product-check" aria-hidden="true">
                {checked && <Check size={16} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="info-band">
        <Check size={18} />
        <span>默认组合：Codex 桌面版 + Codex CLI + Codex++ + Claude CLI + CC Switch。</span>
      </div>
    </section>
  );
}
