import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import basicSsl from '@vitejs/plugin-basic-ssl';

// export default defineConfig({
//   plugins: [react(), basicSsl()],
//   server: {
//     host: true, // Permite conexiones en red
//   }
// });