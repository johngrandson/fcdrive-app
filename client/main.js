'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const path = require('path');
const pm2 = require('pm2');

let mainWindow = null;

const IMG_DIR = '/images/'

pm2.connect(function(err) {
  if (err) {
    console.error('pm2 error: ', err);
    process.exit(2);
  }
  
  console.log('Connected to pm2');
  
  pm2.start({
    script    : '/home/joaonetto/FCamara/projects/fcdriveProject/index.js', // Script to be run
    exec_mode : 'cluster',        // Allows your app to be clustered
    instances : 4,                // Optional: Scales your app by 4
    max_memory_restart : '100M'   // Optional: Restarts your app if it reaches 100Mo
  }, function(err, apps) {
    pm2.disconnect();   // Disconnects from PM2
    if (err) throw err
  });
});

function createWindow() {
  let display = electron.screen.getPrimaryDisplay();
  let width = display.bounds.width;
  let height = display.bounds.height;
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // resizable: false,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    width: 362,
    height: 628,
    x: width - 382,
    y: height - 628,
    icon: path.join(__dirname, IMG_DIR, 'icone-branco.png')
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/views/index.html');

  // Emmited when the window is minimized.
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', createWindow);