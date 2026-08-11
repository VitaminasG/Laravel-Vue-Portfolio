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
    alias: {
      // The full build, not the runtime-only one Vue's `module` field points
      // at. The layouts put <router-view> in the Blade markup rather than in a
      // render function, so Vue has to compile that template from the DOM at
      // runtime — which the runtime-only build cannot do. It fails silently:
      // the bundle loads, bootstrap runs, and #app is simply never populated.
      // Laravel Mix applied the same alias by default.
      vue: 'vue/dist/vue.esm.js',
    },

    // The components import each other without an extension — `./views/mHome`
    // rather than `./views/mHome.vue`. Laravel Mix resolved those through
    // webpack's default extension list; Vite has to be told.
    extensions: ['.mjs', '.js', '.json', '.vue'],
  },

  server: {
    // The dev server runs inside the node container, which publishes its 8080
    // to the host as 8091. Everything below exists to reconcile those two
    // numbers: the server listens on all interfaces inside the container,
    // while `origin` is what gets written into public/hot and therefore into
    // the page — so the browser is told the port it can actually reach, not
    // the one the container sees.
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    origin: 'http://localhost:8091',
    hmr: { host: 'localhost', clientPort: 8091 },
  },
});
