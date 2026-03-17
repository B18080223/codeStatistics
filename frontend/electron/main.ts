import { app, BrowserWindow, dialog } from 'electron'
import path from 'node:path'
import { spawn, ChildProcess } from 'node:child_process'
import http from 'node:http'

const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null
let backendProcess: ChildProcess | null = null

const BACKEND_PORT = 8080
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`

/**
 * 获取后端 JAR 文件路径
 * 开发模式：直接引用 backend/target 下的 JAR
 * 生产模式：从 extraResources 中获取
 */
function getJarPath(): string {
  if (isDev) {
    return path.join(__dirname, '../../backend/target/backend-1.0.0.jar')
  }
  return path.join(process.resourcesPath, 'backend', 'backend-1.0.0.jar')
}

/**
 * 检测后端是否已就绪
 */
function waitForBackend(timeout = 30000): Promise<void> {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`${BACKEND_URL}/api/hello`, (res) => {
        if (res.statusCode === 200) {
          resolve()
        } else {
          retry()
        }
      })
      req.on('error', retry)
      req.setTimeout(2000, () => {
        req.destroy()
        retry()
      })
    }
    const retry = () => {
      if (Date.now() - start > timeout) {
        reject(new Error('后端服务启动超时'))
      } else {
        setTimeout(check, 500)
      }
    }
    check()
  })
}

/**
 * 启动后端 Java 进程
 */
function startBackend(): void {
  if (isDev) {
    // 开发模式下假设后端已手动启动
    return
  }

  const jarPath = getJarPath()
  console.log('Starting backend JAR:', jarPath)

  backendProcess = spawn('java', ['-jar', jarPath], {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  })

  backendProcess.stdout?.on('data', (data: Buffer) => {
    console.log('[Backend]', data.toString())
  })

  backendProcess.stderr?.on('data', (data: Buffer) => {
    console.error('[Backend]', data.toString())
  })

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err.message)
    dialog.showErrorBox(
      '启动失败',
      '无法启动后端服务，请确保已安装 Java 8 或更高版本。\n\n' + err.message
    )
  })

  backendProcess.on('exit', (code) => {
    console.log('Backend process exited with code:', code)
    backendProcess = null
  })
}

/**
 * 停止后端进程
 */
function stopBackend(): void {
  if (backendProcess && !backendProcess.killed) {
    console.log('Stopping backend process...')
    // Windows 下需要用 taskkill 杀进程树
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(backendProcess.pid), '/f', '/t'])
    } else {
      backendProcess.kill('SIGTERM')
    }
    backendProcess = null
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'Code Statistics',
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (isDev) {
    const devUrl = process.env['VITE_DEV_SERVER_URL'] ?? 'http://localhost:3000'
    mainWindow.loadURL(devUrl)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  startBackend()

  if (!isDev) {
    try {
      await waitForBackend()
      console.log('Backend is ready')
    } catch (err) {
      console.error('Backend failed to start:', err)
      dialog.showErrorBox('启动失败', '后端服务启动超时，请检查 Java 环境。')
    }
  }

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopBackend()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
