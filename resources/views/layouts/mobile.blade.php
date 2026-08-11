<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        @vite(['resources/sass/mobileApp.scss', 'resources/js/mobile.js'])

        <title>{{ config('app.name') }}</title>

    </head>

    <body>

    <div class="a-box a-line" id="boxLine"></div>

    <div id="mobApp"></div>

    </body>

</html>