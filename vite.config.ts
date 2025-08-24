import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/<Slime-Planner>/',  // 👈 replace <REPO_NAME> with your GitHub repo name
})
