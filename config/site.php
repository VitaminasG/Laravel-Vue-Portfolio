<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Site Identity
    |--------------------------------------------------------------------------
    |
    | What this site says about itself to search engines and to anything that
    | renders a link preview. It lives here rather than in the layouts because
    | all three of them — desktop, mobile and crawler — need the same answers,
    | and previously none of them gave any.
    |
    | APP_NAME stays "Portfolio" because it names the Laravel application; this
    | is what a reader sees.
    |
    */

    'author' => env('SITE_AUTHOR', 'Gediminas Palsys'),

    'title' => env('SITE_TITLE', 'Gediminas Palsys — Full-stack web developer'),

    /*
    | Kept under about 155 characters, which is where search results and most
    | link previews cut a description off.
    */
    'description' => env('SITE_DESCRIPTION', 'Freelance full-stack web developer working in PHP, Laravel and Vue. '
        . 'A portfolio built as a retro 90s desktop — boot it up and open ReadMe.txt.'),

    /*
    | The link preview image. 1200x630 is what the major platforms crop to.
    */
    'image' => env('SITE_IMAGE', '/images/og-card.png'),

    'image_alt' => env('SITE_IMAGE_ALT', 'A retro 90s desktop with ReadMe.txt, AboutMe.txt and ContactMe.exe icons'),

    /*
    | Profiles the crawler layout links out to. The audit found that page
    | offering no links at all, which leaves a crawler nothing to follow.
    */
    'profiles' => [
        'GitHub' => 'https://github.com/VitaminasG',
        'LinkedIn' => 'https://www.linkedin.com/in/gediminas-palsys-240999113',
    ],

];
