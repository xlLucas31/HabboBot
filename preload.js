const { contextBridge, ipcRenderer } = require('electron');

// Expone de forma segura la función al frontend
contextBridge.exposeInMainWorld('electronAPI', {
  ejecutarAccion: () => ipcRenderer.invoke('accion-desde-frontend')
});