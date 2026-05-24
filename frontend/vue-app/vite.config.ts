import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 学习注释：Vite 配置文件运行在 Node 环境中。
// fileURLToPath + import.meta.url 可以可靠地拿到当前配置文件所在目录。
const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // root 指定前端项目根目录，Vite 会从这里寻找 index.html。
  root: projectRoot,
  // vue() 插件让 Vite 能解析 .vue 单文件组件。
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        // 手动拆包：把常用第三方库分到独立 chunk，便于浏览器缓存。
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-element': ['element-plus'],
          'vendor-http': ['axios'],
        },
      },
    },
  },
  server: {
    // 监听 0.0.0.0 时，局域网或容器环境也能访问开发服务器。
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        // 开发环境中，前端请求 /api 会被 Vite 转发到本地 Nest 后端。
        // 这样浏览器看到的是同源请求，少处理很多 CORS 细节。
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      // @ 指向 src，导入时可写 @/api，而不用写 ../../api。
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
