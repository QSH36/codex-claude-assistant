import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "release", "win7-electron-plan");

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "README-win7.txt"),
  [
    "Codex+Claude Assistant Win7 compatibility package plan",
    "",
    "The Win10/Win11 production build uses Tauri v2.",
    "Windows 7 cannot reliably run the modern WebView2/Tauri stack, so the Win7 edition should be built as Electron 22 + React + TypeScript.",
    "",
    "Current package contents:",
    "- Shared frontend domain model and UI assets are produced by npm run build.",
    "- This placeholder records the compatibility route and keeps release output under F:.",
    "- Next milestone: add electron-win7/ with Electron 22, reuse dist/ assets, and package with electron-builder nsis-web or nsis.",
    "",
  ].join("\n"),
  "utf8",
);

console.log(`Win7 package plan written to ${outputDir}`);
