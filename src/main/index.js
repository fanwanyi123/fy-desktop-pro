'use strict'

import express from 'express'
import '../renderer/store'
const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const app = electron.app
const ipcMain = electron.ipcMain
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const clearObj = {
  storages: ['appcache', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
}
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
function createWindow () {
  /**
     * Initial window options
     */
  mainWindow = new BrowserWindow({
    height: 900,
    width: 1300,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: false,
    maximizable: true,
    minimizable: true,
    resizable: true,
    icon: __static + '/common/icon.ico',
    webPreferences: {webSecurity: false} // 设置web安全性 实现跨域
  })
  mainWindow.maximize()
  mainWindow.show()
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('min', e => {
  mainWindow.minimize()
})
ipcMain.on('max', e => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
})
ipcMain.on('close', e => {
  mainWindow.close()
})

const apps = express()
// 设置允许跨域
apps.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*') // 访问控制允许来源：所有
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept') // 访问控制允许报头 X-Requested-With: xhr请求
  res.header('Access-Control-Allow-Metheds', 'PUT, POST, GET, DELETE, OPTIONS') // 访问控制允许方法
  res.header('X-Powered-By', 'nodejs') // 自定义头信息，表示服务端用nodejs
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

// 设置菜单
let dockMenu = Menu.buildFromTemplate([{
  label: '编辑',
  submenu: [
    {
      label: '撤销',
      accelerator: 'Ctrl+Z',
      role: 'undo'
    }, {
      type: 'separator'
    }, {
      label: '剪切',
      accelerator: 'Ctrl+X',
      role: 'cut'
    }, {
      label: '复制',
      accelerator: 'Ctrl+C',
      role: 'copy'
    }, {
      label: '粘贴',
      accelerator: 'Ctrl+V',
      role: 'paste'
    }, {
      label: '全选',
      accelerator: 'Ctrl+A',
      role: 'selectall'
    }]
}, {
  label: '查看',
  submenu: [ {
    label: '系统选择',
    accelerator: 'F1',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        mainWindow.webContents.send('showSelect', '1')
      }
    }
  },
  {
    label: '重载',
    accelerator: 'Ctrl+R',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        mainWindow.webContents.send('reloadIframe', true)
      }
    }
  },
  {
    label: '清除缓存数据',
    accelerator: 'CmdOrCtrl+Shift+Delete',
    click: (item, focusedWindow) => {
      if (focusedWindow) {
        focusedWindow.webContents.session.clearStorageData(clearObj)
      }
    }
  }, {
    label: '切换开发者工具',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I'
      } else {
        return 'Ctrl+I'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.toggleDevTools()
      }
    }
  }, {
    type: 'separator'
  }]
}, {
  label: '窗口',
  role: 'window',
  submenu: [ {
    label: '切换全屏',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F'
      } else {
        return 'F11'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
      }
    }
  }, {
    label: '最小化',
    accelerator: 'Ctrl+M',
    role: 'minimize'
  }, {
    label: '关闭',
    accelerator: 'Ctrl+W',
    role: 'close'
  }, {
    type: 'separator'
  }]
}, {
  label: '帮助',
  role: 'help',
  submenu: [{
    label: '学习更多',
    click: function () {
      electron.shell.openExternal('https://www.singkek.club')
    }
  }]
}])
Menu.setApplicationMenu(dockMenu)
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
