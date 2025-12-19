// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon'; 
import vercel from '@astrojs/vercel';   



// https://astro.build/config
export default defineConfig({

  output: 'server', 
    
    // ⭐ Clave: Usa el adaptador de Vercel ⭐
    adapter: vercel(),
    vite: {
      plugins: [tailwindcss()]
    },
    integrations: [
      icon({
        // ⭐ AGREGAR ESTO: Indicamos que necesitamos el set 'tabler' ⭐
        include: {
          tabler: ['*'], // Incluye todos los iconos del set Tabler
        },
      }),
  ], 
});