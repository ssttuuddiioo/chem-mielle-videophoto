const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 1920,
    kiosk: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  if (isDev) {
    const devUrl = 'http://localhost:5173';
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('save-video', async (_event, buffer, fileName) => {
  const saveDir = app.getPath('videos');
  const filePath = path.join(saveDir, fileName);
  await fs.writeFile(filePath, Buffer.from(buffer));
  return filePath;
});

ipcMain.handle('save-photo-strip', async (_event, dataUrl, fileName) => {
  const saveDir = app.getPath('pictures');
  const filePath = path.join(saveDir, fileName);
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  await fs.writeFile(filePath, buffer);
  return filePath;
});

ipcMain.handle('print-photo-strip', async (_event, filePath) => {
  const printWin = new BrowserWindow({ show: false });
  await printWin.loadURL(`file://${filePath}`);
  await new Promise((resolve, reject) => {
    printWin.webContents.print({ silent: true, printBackground: true }, (success, err) => {
      if (!success) return reject(err);
      resolve();
    });
  });
  printWin.close();
}); 