{{--
    Everything a search engine or a link preview needs, in one place.

    All three layouts — desktop, mobile and crawler — include this, because the
    audit found the same gap in each: a bare "Portfolio" title, no description,
    and nothing at all for Open Graph or Twitter. Sharing the URL anywhere
    produced a link with no image, no summary and no name on it.
--}}

<title>{{ config('site.title') }}</title>

<meta name="description" content="{{ config('site.description') }}">
<meta name="author" content="{{ config('site.author') }}">

<link rel="canonical" href="{{ url()->current() }}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="{{ config('site.author') }}">
<meta property="og:title" content="{{ config('site.title') }}">
<meta property="og:description" content="{{ config('site.description') }}">
<meta property="og:url" content="{{ url()->current() }}">
<meta property="og:image" content="{{ url(config('site.image')) }}">
<meta property="og:image:alt" content="{{ config('site.image_alt') }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ config('site.title') }}">
<meta name="twitter:description" content="{{ config('site.description') }}">
<meta name="twitter:image" content="{{ url(config('site.image')) }}">
<meta name="twitter:image:alt" content="{{ config('site.image_alt') }}">
