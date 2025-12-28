import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  // 移除开发环境的proxy配置
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})