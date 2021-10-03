const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
var mainWindow

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('public/index.html')

  ipcMain.on('toMain', (event, args) => {
    if(args.action == "load files from folder") {
      readFolder(args.folder)
    }
  })
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

const isMac = process.platform === 'darwin'

const template = [
  isMac ? { role: 'appMenu' } : {},
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Folder...',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          getFolder();
        }
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  { role: 'editMenu' },
  { role: 'viewMenu' },
  { role: 'windowMenu' }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

function getFolder() {
  dialog.showOpenDialog(mainWindow, {
    title: "Ordner mit GPX Dateien auswählen",
    properties: ['openDirectory']
  }).then(result => {
    if(result.canceled) {
      console.log("No folder selected");
      return;
    }
    mainWindow.webContents.send("fromMain", {action: "set folder to local storage", folder: result.filePaths[0]})
    readFolder(result.filePaths[0])
  });
}

function readFolder(folder) {
  var tracks = []
  fs.readdir(folder, {withFileTypes: true}, (err, files) => {
    if (err) {
      console.log(err)
      return
    }
    else {
      files.forEach((file) => {
        if(file.isFile() && file.name.indexOf(".gpx") >= 0) {
          tracks.push(folder + "/" + file.name)
        }
      });
      mainWindow.webContents.send("fromMain", {action: "send tracks", tracks: tracks})
    }
  });
}
