import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages (repo name)
  base: '/rn-vs-native-decision-helper/'
})
