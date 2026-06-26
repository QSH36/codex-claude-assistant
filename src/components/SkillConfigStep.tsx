import { Boxes, CheckSquare, FileCode2, ListTree, Radar } from "lucide-react";
import { clsx } from "clsx";
import type { SkillInstallMode } from "../domain/types";
import { useInstallerStore } from "../state/useInstallerStore";

const modes: Array<{ id: SkillInstallMode; title: string; description: string; icon: typeof Boxes }> = [
  {
    id: "recommended",
    title: "精简安装",
    description: "每个领域保留最实用的一组，默认 30-50 个。",
    icon: CheckSquare,
  },
  {
    id: "all",
    title: "全部安装",
    description: "完整复制可用 skill，并生成完整索引。",
    icon: Boxes,
  },
  {
    id: "custom",
    title: "自定义",
    description: "按分类勾选，生成简易分类索引。",
    icon: ListTree,
  },
];

export function SkillConfigStep() {
  const skills = useInstallerStore((state) => state.skills);
  const skillMode = useInstallerStore((state) => state.skillMode);
  const setSkillMode = useInstallerStore((state) => state.setSkillMode);
  const toggleSkill = useInstallerStore((state) => state.toggleSkill);
  const getGeneratedSkillIndex = useInstallerStore((state) => state.getGeneratedSkillIndex);
  const loadLocalSkills = useInstallerStore((state) => state.loadLocalSkills);
  const selectedCount = skills.filter((skill) => skill.selected).length;
  const categories = Array.from(new Set(skills.map((skill) => skill.category)));

  return (
    <section className="step-layout">
      <div className="step-copy split-copy">
        <div>
          <p className="eyebrow">Step 06</p>
          <h2>安装 Skill 并生成索引</h2>
          <p>
            精简和全部安装都会生成专属路由索引。自定义模式会生成轻量分类模板，
            写清楚用户安装了哪些 skill，以及应该如何调用。
          </p>
        </div>
        <button className="primary-button" type="button" onClick={loadLocalSkills}>
          <Radar size={16} />
          读取本机 Skill
        </button>
      </div>

      <div className="mode-card-grid">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              className={clsx("mode-card", skillMode === mode.id && "selected")}
              type="button"
              onClick={() => setSkillMode(mode.id)}
              key={mode.id}
              aria-pressed={skillMode === mode.id}
            >
              <Icon size={20} />
              <strong>{mode.title}</strong>
              <small>{mode.description}</small>
            </button>
          );
        })}
      </div>

      <div className="skill-workspace">
        <div className="skill-picker">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Selected</p>
              <h3>{selectedCount} 个 skill</h3>
            </div>
          </div>

          {categories.map((category) => (
            <details open key={category}>
              <summary>{category}</summary>
              <div className="skill-list">
                {skills
                  .filter((skill) => skill.category === category)
                  .map((skill) => (
                    <label className="check-row skill-row" key={skill.id}>
                      <input
                        type="checkbox"
                        checked={skill.selected}
                        onChange={() => toggleSkill(skill.id)}
                      />
                      <span>
                        <strong>{skill.name}</strong>
                        <small>{skill.description}</small>
                      </span>
                    </label>
                  ))}
              </div>
            </details>
          ))}
        </div>

        <div className="index-preview">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Generated</p>
              <h3>skill-routing.md</h3>
            </div>
            <FileCode2 size={18} />
          </div>
          <pre>{getGeneratedSkillIndex()}</pre>
        </div>
      </div>
    </section>
  );
}
