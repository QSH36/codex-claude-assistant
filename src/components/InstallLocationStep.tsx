import { FolderCog, FolderOpen, HardDriveDownload } from "lucide-react";
import { useInstallerStore } from "../state/useInstallerStore";

export function InstallLocationStep() {
  const locations = useInstallerStore((state) => state.locations);
  const updateLocation = useInstallerStore((state) => state.updateLocation);
  const sourcePreference = useInstallerStore((state) => state.sourcePreference);

  return (
    <section className="step-layout">
      <div className="step-copy">
        <p className="eyebrow">Step 03</p>
        <h2>设置安装位置</h2>
        <p>
          配置文件仍保留在各工具默认目录，例如 <code>.codex</code>、<code>.claude</code>、
          <code>.cc-switch</code>。这里主要控制程序本体、运行时和离线缓存位置。
        </p>
      </div>

      <div className="location-list">
        {locations.map((location) => (
          <label className="location-row" key={location.target}>
            <span className="location-icon">
              <FolderCog size={18} />
            </span>
            <span className="location-copy">
              <strong>{location.label}</strong>
              <small>默认：{location.defaultPath}</small>
            </span>
            <input
              value={location.selectedPath}
              onChange={(event) => updateLocation(location.target, event.target.value)}
              aria-label={`${location.label} 安装位置`}
            />
          </label>
        ))}
      </div>

      <div className="cache-panel">
        <div>
          <p className="eyebrow">Offline cache</p>
          <h3>离线缓存与镜像策略</h3>
          <p>中国大陆用户默认镜像优先；失败后自动回退官方源；也可以提前把安装包放进离线缓存目录。</p>
        </div>
        <div className="cache-stats">
          <span>
            <HardDriveDownload size={17} />
            {sourcePreference.offlineCachePath}
          </span>
          <span>
            <FolderOpen size={17} />
            镜像优先：{sourcePreference.chinaMirrorFirst ? "开启" : "关闭"}
          </span>
        </div>
      </div>
    </section>
  );
}
