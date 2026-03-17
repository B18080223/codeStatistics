import { build } from 'esbuild'

// 使用 esbuild 编译 Electron 主进程和预加载脚本
const shared = {
  bundle: true,
  platform: 'node',
  external: ['electron'],
  format: 'cjs',
  outdir: 'electron-dist',
  outExtension: { '.js': '.cjs' },
  sourcemap: false
}

await Promise.all([
  build({
    ...shared,
    entryPoints: ['electron/main.ts']
  }),
  build({
    ...shared,
    entryPoints: ['electron/preload.ts']
  })
])

console.log('Electron main process built successfully.')
