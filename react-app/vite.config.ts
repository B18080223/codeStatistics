import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import qiankun from 'vite-plugin-qiankun'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * 移除 React 插件注入到 HTML 中的 Fast Refresh preamble script。
 *
 * qiankun 的 import-html-entry 用 eval() 执行子应用 HTML 中的 script，
 * 但 preamble 是 <script type="module"> 包含 import 语句，eval() 无法处理。
 * 通过 transformIndexHtml 钩子在 HTML 输出前移除该 script。
 *
 * 同时移除每个 JSX/TSX 文件 transform 后注入的 preamble 检测代码，
 * 避免在 qiankun 沙箱环境下因全局变量访问问题导致检测失败。
 */
const removeReactRefreshPreamble = (): Plugin => ({
  name: 'remove-react-refresh-preamble',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      return html.replace(
        /<script type="module">[\s\S]*?@react-refresh[\s\S]*?<\/script>/g,
        ''
      )
    }
  },
  transform(code, id) {
    // 只处理 JSX/TSX 文件中注入的 preamble 检测
    if (!/\.[jt]sx?$/.test(id) || id.includes('node_modules')) return
    if (!code.includes("can't detect preamble")) return

    // 移除 preamble 检测的 throw 语句，保留其余 HMR 逻辑
    const transformed = code.replace(
      /if\s*\(\s*!window\.\$RefreshReg\$\s*\)\s*\{[^}]*can't detect preamble[^}]*\}/g,
      ''
    )
    if (transformed !== code) {
      return { code: transformed, map: null }
    }
  }
})

export default defineConfig({
  plugins: [
    react(),
    qiankun('react-app', {
      useDevMode: true
    }),
    removeReactRefreshPreamble()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    cors: true,
    origin: 'http://localhost:5174',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
