// qiankun 沙箱环境下，React 插件注入的 preamble script 已在 HTML 层面被移除，
// 需要手动设置全局变量，避免 JSX 文件中的 preamble 检测报错。
// 同时挂载到 globalThis 确保在 qiankun 沙箱的 proxy 环境下也能被检测到。
const g = typeof globalThis !== 'undefined' ? globalThis : window
;(g as any).$RefreshReg$ = () => {}
;(g as any).$RefreshSig$ = () => (type: any) => type
;(g as any).__vite_plugin_react_preamble_installed__ = true
;(window as any).$RefreshReg$ = () => {}
;(window as any).$RefreshSig$ = () => (type: any) => type
;(window as any).__vite_plugin_react_preamble_installed__ = true

import React from 'react'
import ReactDOM from 'react-dom/client'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import App from './App'

let root: ReactDOM.Root | null = null

function render(container?: HTMLElement) {
  const mountNode = container
    ? (container.querySelector('#root') || container) as HTMLElement
    : document.getElementById('root')!
  root = ReactDOM.createRoot(mountNode)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

renderWithQiankun({
  bootstrap() {
    // 子应用初始化，可用于预加载等
  },
  mount(props) {
    render(props.container as HTMLElement)
  },
  unmount() {
    root?.unmount()
    root = null
  },
  update() {
    // 可选：主应用传递 props 更新时触发
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
