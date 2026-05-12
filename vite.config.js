import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // ⭐️ 核心魔法：告诉 Vite，看到 '@' 就去指向 'src' 目录！
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})