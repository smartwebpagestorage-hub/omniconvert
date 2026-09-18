/**
 * OmniConvert Studio - Electron Desktop Application Entry Point
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 650,
    title: "OmniConvert Studio - Developed by Niraj Kumar, Section Supervisor, RO, Faridabad",
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    backgroundColor: '#090d16',
    autoHideMenuBar: false
  });

  // Custom Application Menu
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'About',
      submenu: [
        {
          label: 'About Creator',
          click: async () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About OmniConvert Studio',
              message: 'OmniConvert Studio v1.0.0',
              detail: 'Developed by: Niraj Kumar, Section Supervisor, RO, Faridabad.\n\nUniversal Offline Document & Media Converter for Windows 10 & 11.\n\nAll operations run 100% locally and privately on this device.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Load offline index.html
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
