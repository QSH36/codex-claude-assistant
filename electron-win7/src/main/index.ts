import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const isDev = !app.isPackaged;

function getFrontendEntry() {
  if (isDev) {
    return path.resolve(__dirname, "..", "..", "..", "dist", "index.html");
  }

  return path.resolve(process.resourcesPath, "dist", "index.html");
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 940,
    minHeight: 640,
    title: "Codex+Claude 助手 Win7",
    backgroundColor: "#080a0f",
    webPreferences: {
      preload: path.resolve(__dirname, "..", "preload", "index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile(getFrontendEntry());
}

function userPath(...parts: string[]) {
  return path.join(os.homedir(), ...parts);
}

function writeWithBackup(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  let backupPath: string | null = null;
  if (fs.existsSync(filePath)) {
    backupPath = `${filePath}.bak.${Math.floor(Date.now() / 1000)}`;
    fs.copyFileSync(filePath, backupPath);
  }

  fs.writeFileSync(filePath, content, "utf8");
  return { path: filePath, backupPath };
}

ipcMain.handle("win7:get-version", () => ({
  electron: process.versions.electron,
  chrome: process.versions.chrome,
  node: process.versions.node,
}));

ipcMain.handle("win7:write-generated-files", async (_event, payload: { skillIndex: string; dialogue: string }) => {
  const results = [
    writeWithBackup(userPath(".codex", "skill-routing.generated.zh-CN.md"), payload.skillIndex),
    writeWithBackup(userPath(".claude", "skill-routing.generated.zh-CN.md"), payload.skillIndex),
    writeWithBackup(userPath(".codex", "AGENTS.generated.md"), payload.dialogue),
    writeWithBackup(userPath(".claude", "CLAUDE.generated.md"), payload.dialogue),
  ];

  return results;
});

ipcMain.handle("win7:open-path", async (_event, targetPath: string) => {
  const result = await shell.openPath(targetPath);
  return { ok: !result, message: result };
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

process.on("uncaughtException", (error) => {
  dialog.showErrorBox("Codex+Claude 助手 Win7", error.message);
});
