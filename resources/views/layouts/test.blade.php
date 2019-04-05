<!doctype html>

<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="stylesheet" href="/css/app.css"/>

    <title>{{ config('app.name') }}</title>

</head>

<body>

<div id="app" class="flex-center h-100">

<testing-component></testing-component>

</div>

<script src="/js/app.js"></script>

</body>

</html>