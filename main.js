// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const gEarthManager = require('./g-earth-manager');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');

    // Configurar los manejadores IPC
    ipcMain.handle('enviar-mensaje', (_, mensaje) => {
        gEarthManager.enviarMensaje(mensaje);
    });

    ipcMain.handle('mover-personaje', (_, x, y) => {
        gEarthManager.moverPersonaje(x, y);
    });
};

app.whenReady().then(async () => {
    await gEarthManager.init(); // Inicializa la extensión
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});