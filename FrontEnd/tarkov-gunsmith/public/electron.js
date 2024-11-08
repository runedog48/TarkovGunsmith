import { app, BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({width: 1920, height: 1024});
    const url = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;
    mainWindow.loadURL(url);
    mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});