const { app, BrowserWindow, ipcMain, ipcRenderer } = require("electron");
const MainScreen = require("./screens/main/mainScreen");
const UpdateScreen = require("./screens/update/updateScreen");
const Globals = require("./globals");
const { autoUpdater, AppUpdater } = require("electron-updater");

let mainWindow;
let updateWindow;

//Basic flags
autoUpdater.autoDownload = false; // we'll trigger download when available
autoUpdater.autoInstallOnAppQuit = true;

function createMainWindow() {
  mainWindow = new MainScreen();
}

function createUpdateWindow() {
  updateWindow = new UpdateScreen();
}

app.whenReady().then(() => {
  createUpdateWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length == 0) createMainWindow();
  });

  autoUpdater.checkForUpdates();
  if (updateWindow && updateWindow.showMessage)
    updateWindow.showMessage(`Checking for updates. Current version ${app.getVersion()}`);
});

// IPC actions from update window
ipcMain.on('request-install', () => {
  try {
    console.log('install requested from renderer');
    autoUpdater.quitAndInstall(true, true);
  } catch (e) {
    console.log('request-install error', e);
  }
});

ipcMain.on('cancel-update', () => {
  try {
    if (updateWindow && updateWindow.close) updateWindow.close();
  } catch (e) {}
  // open main app
  createMainWindow();
});

/*New Update Available*/
autoUpdater.on("update-available", (info) => {
  if (updateWindow && updateWindow.showMessage)
    updateWindow.showMessage(`Update available. Current version ${app.getVersion()}`);
  autoUpdater.downloadUpdate();
});

// Download progress events
autoUpdater.on("download-progress", (progressObj) => {
  try {
    console.log('download-progress', progressObj);
    // compute percent if not provided
    let percent = 0;
    if (typeof progressObj.percent === 'number') {
      percent = Math.floor(progressObj.percent);
    } else if (progressObj.transferred && progressObj.total) {
      percent = Math.floor((progressObj.transferred / progressObj.total) * 100);
    }

    const payload = {
      percent,
      transferred: progressObj.transferred || 0,
      total: progressObj.total || 0,
      bytesPerSecond: progressObj.bytesPerSecond || 0,
    };

    if (updateWindow && updateWindow.showProgress) updateWindow.showProgress(payload);
    if (updateWindow && updateWindow.showMessage) updateWindow.showMessage(`Downloading update: ${payload.percent}%`);
  } catch (e) {
    console.log('Progress send error', e);
  }
});

autoUpdater.on("update-not-available", (info) => {
  if (updateWindow && updateWindow.showMessage)
    updateWindow.showMessage(`No update available. Current version ${app.getVersion()}`);

  // Close update window and open main app
  setTimeout(() => {
    try {
      if (updateWindow && updateWindow.close) updateWindow.close();
    } catch (e) {}
    createMainWindow();
  }, 800);
});

/*Download Completion Message*/
autoUpdater.on("update-downloaded", (info) => {
  if (updateWindow && updateWindow.showMessage)
    updateWindow.showMessage(`Update downloaded. Installing...`);

  // apply the update immediately
  setTimeout(() => {
    try {
      autoUpdater.quitAndInstall(true, true);
    } catch (e) {
      console.log('quitAndInstall error', e);
    }
  }, 1000);
});

autoUpdater.on("error", (info) => {
  if (updateWindow && updateWindow.showMessage)
    updateWindow.showMessage(`Update error: ${info}`);

  // fallback to main app after short delay
  setTimeout(() => {
    try {
      if (updateWindow && updateWindow.close) updateWindow.close();
    } catch (e) {}
    createMainWindow();
  }, 1200);
});




//Global exception handler
process.on("uncaughtException", function (err) {
  console.log(err);
});

app.on("window-all-closed", function () {
  if (process.platform != "darwin") app.quit();
});