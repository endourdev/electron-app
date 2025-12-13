const { contextBridge, ipcRenderer } = require("electron");

let bridge = {
    updateMessage: (callback) => ipcRenderer.on("updateMessage", callback),
    onUpdateProgress: (callback) => ipcRenderer.on("updateProgress", callback),
  };
  
  contextBridge.exposeInMainWorld("bridge", bridge);