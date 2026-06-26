import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const bundleRoot = path.join(root, "src-tauri", "target", "release", "bundle");
const outputDir = path.join(root, "release", "win10-win11");
const copied = [];

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await collectFiles(fullPath);
      continue;
    }

    if (!/\.(exe|msi)$/i.test(entry.name)) continue;

    await mkdir(outputDir, { recursive: true });
    const targetPath = path.join(outputDir, entry.name);
    await copyFile(fullPath, targetPath);
    const fileStat = await stat(targetPath);
    copied.push({ targetPath, bytes: fileStat.size });
  }
}

await collectFiles(bundleRoot);

if (!copied.length) {
  throw new Error(`No installer artifacts found under ${bundleRoot}`);
}

for (const item of copied) {
  console.log(`${item.targetPath} (${item.bytes} bytes)`);
}
