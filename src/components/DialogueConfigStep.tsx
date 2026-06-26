import { FileText, Layers, PencilLine } from "lucide-react";
import { clsx } from "clsx";
import type { DialogueMode } from "../domain/types";
import { useInstallerStore } from "../state/useInstallerStore";

const dialogueModes: Array<{ id: DialogueMode; title: string; description: string; icon: typeof FileText }> = [
  {
    id: "recommended",
    title: "推荐配置",
    description: "直接使用当前 Codex 底层规则，中文优先并带 skill 路由。",
    icon: FileText,
  },
  {
    id: "extend",
    title: "推荐基础上追加",
    description: "展示原规则，用户追加自己的项目偏好。",
    icon: Layers,
  },
  {
    id: "custom",
    title: "完全自定义",
    description: "空白 MD，由用户自行填写。",
    icon: PencilLine,
  },
];

export function DialogueConfigStep() {
  const dialogue = useInstallerStore((state) => state.dialogue);
  const setDialogueMode = useInstallerStore((state) => state.setDialogueMode);
  const setDialogueAppendix = useInstallerStore((state) => state.setDialogueAppendix);
  const setDialogueCustomMarkdown = useInstallerStore((state) => state.setDialogueCustomMarkdown);

  return (
    <section className="step-layout">
      <div className="step-copy">
        <p className="eyebrow">Step 07</p>
        <h2>底层会话 MD 配置</h2>
        <p>
          推荐规则包含中文默认回复、任务开场分类、skill 路由、高风险确认和凭据脱敏。
          Claude 也会复用这一套底层规则。
        </p>
      </div>

      <div className="mode-card-grid">
        {dialogueModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              className={clsx("mode-card", dialogue.mode === mode.id && "selected")}
              type="button"
              onClick={() => setDialogueMode(mode.id)}
              key={mode.id}
              aria-pressed={dialogue.mode === mode.id}
            >
              <Icon size={20} />
              <strong>{mode.title}</strong>
              <small>{mode.description}</small>
            </button>
          );
        })}
      </div>

      {dialogue.mode === "extend" && (
        <label className="editor-label">
          <span>追加规则</span>
          <textarea
            value={dialogue.userAppendix}
            onChange={(event) => setDialogueAppendix(event.target.value)}
            placeholder="在推荐配置基础上追加你的规则..."
          />
        </label>
      )}

      {dialogue.mode === "custom" && (
        <label className="editor-label">
          <span>自定义 Markdown</span>
          <textarea
            value={dialogue.finalMarkdown}
            onChange={(event) => setDialogueCustomMarkdown(event.target.value)}
            placeholder="# 自定义底层规则"
          />
        </label>
      )}

      <div className="markdown-preview">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Preview</p>
            <h3>最终写入内容</h3>
          </div>
          <FileText size={18} />
        </div>
        <pre>{dialogue.finalMarkdown}</pre>
      </div>
    </section>
  );
}
