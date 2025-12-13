const { contextBridge, ipcRenderer } = require("electron");

let bridge = {
  updateMessage: (callback) => ipcRenderer.on("updateMessage", callback),
  onUpdateProgress: (callback) => ipcRenderer.on("updateProgress", callback),
  requestInstall: () => ipcRenderer.send('request-install'),
  cancelUpdate: () => ipcRenderer.send('cancel-update'),
};

contextBridge.exposeInMainWorld("bridge", bridge);
