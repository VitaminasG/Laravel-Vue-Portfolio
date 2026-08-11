import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue2';

export default defineConfig({
  plugins: [
    laravel({
      // Two independent bundles: the desktop SPA and the much smaller mobile
      // app. IndexController picks between them server-side from the
      // User-Agent, so neither ever loads the other.
      input: [
        'resources/sass/app.scss',
        'resources/js/app.js',
        'resources/sass/mobileApp.scss',
        'resources/js/mobile.js',
      ],
      refresh: true,
    }),
    vue(),
  ],

  resolve: {
    // The components import each other without an extension — `./views/mHome`
    // rather than `./views/mHome.vue`. Laravel Mix resolved those through
    // webpack's default extension list; Vite has to be told.
    extensions: ['.mjs', '.js', '.json', '.vue'],
  },

  server: {
    // The dev server runs inside the node container, so it has to listen on
    // all interfaces and advertise a host the browser can actually reach.
    host: '0.0.0.0',
    port: 8080,
    hmr: { host: 'localhost', port: 8091 },
  },
});
