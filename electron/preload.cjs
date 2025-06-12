const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveVideo: (buffer, fileName) => ipcRenderer.invoke('save-video', buffer, fileName),
  savePhotoStrip: (dataUrl, fileName) => ipcRenderer.invoke('save-photo-strip', dataUrl, fileName),
  printPhotoStrip: (filePath) => ipcRenderer.invoke('print-photo-strip', filePath),
}); 