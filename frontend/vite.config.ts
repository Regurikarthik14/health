import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

function spaFallbacksPlugin() {
  return {
    name: 'spa-fallbacks',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, 'dist')
      const indexPath = path.join(distDir, 'index.html')
      if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, 'utf-8')

        // 1. 404.html (Vercel automatic fallback for any unmapped route)
        fs.writeFileSync(path.join(distDir, '404.html'), html)

        // 2. doctor.html (clean static match for /doctor)
        fs.writeFileSync(path.join(distDir, 'doctor.html'), html)

        // 3. doctor/index.html (clean static match for /doctor/ directory requests)
        const doctorDir = path.join(distDir, 'doctor')
        if (!fs.existsSync(doctorDir)) fs.mkdirSync(doctorDir, { recursive: true })
        fs.writeFileSync(path.join(doctorDir, 'index.html'), html)

        // 4. doctor-portal fallbacks
        fs.writeFileSync(path.join(distDir, 'doctor-portal.html'), html)
        const docPortalDir = path.join(distDir, 'doctor-portal')
        if (!fs.existsSync(docPortalDir)) fs.mkdirSync(docPortalDir, { recursive: true })
        fs.writeFileSync(path.join(docPortalDir, 'index.html'), html)

        // 5. admin fallbacks
        fs.writeFileSync(path.join(distDir, 'admin.html'), html)
        const adminDir = path.join(distDir, 'admin')
        if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir, { recursive: true })
        fs.writeFileSync(path.join(adminDir, 'index.html'), html)

        console.log('✓ SPA Fallbacks successfully generated: /doctor, /doctor-portal, /admin, 404.html')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallbacksPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

