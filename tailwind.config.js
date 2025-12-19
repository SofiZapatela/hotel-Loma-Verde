// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aquí le decimos a Tailwind dónde escanear las clases
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      // Opcional: Si quieres que Tailwind sepa de tus colores personalizados 
      // para que los escanee mejor, aunque las clases directas ya deberían funcionar.
      colors: {
        'primary-dark': '#1F3333',
        'secondary-light': '#ECE4D5',
        'accent-brown': '#4F382B',
        'accent-green': '#8B9D6C',
      },
      fontFamily: {
        // Asegúrate de incluir la fuente si la usas
        cormorant: ['Cormorant', 'serif'], 
      }
    },
  },
  plugins: [],
}