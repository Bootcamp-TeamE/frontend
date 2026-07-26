import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 카카오 JS SDK 도메인(localhost:5173)과 일치하도록 포트 고정.
  // 5173이 사용 중이면 조용히 다른 포트로 뜨지 않고 에러를 낸다.
  server: { port: 5173, strictPort: true },
})
