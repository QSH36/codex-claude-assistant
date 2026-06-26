import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "release", "win7-electron-plan");
const electronDir = path.join(root, "electron-win7");

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "README-win7.txt"),
  [
    "Codex+Claude Assistant Win7 compatibility package plan",
    "",
    "The Win10/Win11 production build uses Tauri v2.",
    "Windows 7 cannot reliably run the modern WebView2/Tauri stack, so the Win7 edition uses Electron 22 + React + TypeScript.",
    "",
    "Current package contents:",
    "- Shared frontend assets are produced by npm run build into ../dist.",
    `- Electron shell scaffold: ${electronDir}`,
    "- Install Electron dependencies inside electron-win7, then run npm run dist.",
    "- Output target: release/win7/",
    "",
  ].join("\n"),
  "utf8",
);

console.log(`Win7 package plan written to ${outputDir}`);
