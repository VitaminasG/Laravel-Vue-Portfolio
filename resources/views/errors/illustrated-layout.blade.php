<!doctype html>
<html lang="en">
    <head>

        <title>@yield('title')</title>

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

        <link rel="stylesheet" href="/css/app.css"/>

    </head>

    <body>

        <div class="container is-fluid h-100">

            <div class="flex-center h-100">

                <div>

                    <div class="fontSize-3">

                        <p class="text-center">

                            @yield('code', __('Oh no'))

                        </p>

                    </div>

                    <p class="fontSize-2 py-2 text-center">

                        @yield('message')

                    </p>

                    <div class="fontSize-2 flex-center text-underline pt-2">

                        <a href="{{ url('/') }}">

                            {{ __('Go to Main') }}

                        </a>

                    </div>

                </div>

            </div>

        </div>

    </body>

</html>