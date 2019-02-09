<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body>

<style>

    body{
        background-color: rgba(133,133,133,0.8);
        height: 100%;
    }

    .header {
        padding: 2em 0;
        height: 25%;
        width: 100%;
        background-color: rgba(105,105,105,0.8);
        border-bottom: 2px solid #97c51d;
    }

    footer {
        padding: 2em 0;
        height: 25%;
        width: 100%;
        background-color: rgba(105,105,105,0.8);
        border-top: 2px solid #97c51d;
    }

    .text-center{
        text-align: center;
    }

</style>

<nav>

    <p class="header">
        Visitor with name - <strong>{{ $name }}</strong> send message. His email address - {{ $from }}
    </p>

</nav>

{{ $body  }}

<footer class="text-center">

    <p>Browser Agent Header : {{ $agent }}</p>

</footer>

</body>
</html>