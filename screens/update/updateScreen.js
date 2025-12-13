const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");

class UpdateScreen {
  window;

  constructor() {
    this.window = new BrowserWindow({
      width: 380,
      height: 460,
      resizable: false,
      title: "Mise à jour",
      show: false,
      frame: true,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, "./updatePreload.js"),
      },
    });

    this.window.once("ready-to-show", () => {
      this.window.show();
    });

    const file = path.join(__dirname, "update.html");
    this.window.loadFile(file);
  }

  showMessage(message) {
    this.window.webContents.send("updateMessage", message);
  }

  showProgress(percent) {
    this.window.webContents.send("updateProgress", percent);
  }

  close() {
    try {
      this.window.close();
    } catch (e) {}
  }
}

module.exports = UpdateScreen;
