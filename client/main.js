'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const path = require('path');
const pm2 = require('pm2');
const { exec } = require('child_process');

let mainWindow = null;

const IMG_DIR = '/images/'

function execute(command, callback) {
  exec(command, (error, stdout, stderr) => { 
      callback(stdout); 
  });
};

// call the function
execute('pm2 start ../index.js', (output) => {
  console.log(output);
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