const mix = require('laravel-mix');

mix.webpackConfig({
    output: {
        chunkFilename: 'chunks/[name].[chunkhash].js',
        publicPath: '/',
    },
});

mix.js('resources/js/app.js', 'public/js')
    .js('resources/js/mobile.js', 'public/js/mobile')
    .sass('resources/sass/app.scss', 'public/css')
    .sass('resources/sass/mobileApp.scss', 'public/css/mobile')
    .version;

if (mix.inProduction()) {
    mix.version();
}
