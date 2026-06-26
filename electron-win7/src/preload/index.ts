import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("codexClaudeWin7", {
  getVersion: () => ipcRenderer.invoke("win7:get-version"),
  writeGeneratedFiles: (payload: { skillIndex: string; dialogue: string }) =>
    ipcRenderer.invoke("win7:write-generated-files", payload),
  openPath: (targetPath: string) => ipcRenderer.invoke("win7:open-path", targetPath),
});
