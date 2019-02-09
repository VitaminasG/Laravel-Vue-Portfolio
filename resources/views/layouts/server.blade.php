<!doctype html>

<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="/css/app.css"/>

    <title>{{ config('app.name') }}</title>

</head>

<body id="server">

<div class="flex-block section">

    <div class="text-center py-2">

        <h1>{{ config('app.name') }}</h1>

    </div>


    <div class="section flex-block">

        <div class="columns intro h-100">

            <div class="column is-one-third flex-center">

                <img class="h-75" src="/images/gediminas.png" alt="Avatar">

            </div>

            <div class="column flex-block">

                <p class="pb-1">
                    I am a self-motivated person, who has a big passion for web technologies.
                    Since my childhood, I noticed that I have a big curiosity to understand how
                    computers working and what they can do for us. The cognitive path about
                    computers was related to remote technologies. Since that time, I am focused
                    on programming languages and IT systems which helps to communicate and
                    complete tasks from a distance. I had a period of my life spent with Linux
                    OS by administrating, as well as deploying internet network. In 2018, I graduated from Birbeck
                    University at the heart of London with web technology level 5 degree. I am currently
                    freelancing as Back-End and Front-End web developer. My field may vary from
                    demand but the main core technologies still are on the hilltop. My main back-end
                    scripting language is PHP and for the front-end currently, I am using Vue
                    JavaScript framework. I am able to design systems from scratch by finding
                    all functional and non-functional requirements for the client and providing
                    the best solution to minimise the cost. I speak and write in three languages
                    – English, Lithuanian and Russian.
                </p>

                <p class="pb-1">
                    You take your own responsibility by processing granted digital data.
                    If you have any negative reactions from "Back to the Future" side-effects,
                    unacceptable strong opinion statements, or not very trendy web design
                    decision developed by an author - Gediminas Palsys, please stop reading now and
                    don’t look into any website elements inside this introduction page.
                    Start immediately removing all traces from your current browser and lock all
                    your memories about me.
                </p>

                <p class="pb-1">
                    Also, the materials could be changed over a time but the purpose of the site
                    will stay based on the original idea to serve as personal informative network
                    tool to communicate with users - stakeholders of the internet. All materials
                    published on this website should serve for all different users, no matter of
                    his/her/it race, financial or social situation, without any hidden intentions to harm.
                    The author always got upper hand to control a data on a website and to express
                    any ideas transmitted through the prism of his perception. Any useful web source-code
                    and problem-solving decisions made and found by you during all visit at
                    gediminaspalsys.uk, is allowed to keep for yourself and in some cases must
                    be used on publicly accessed web environments if it will help to save a
                    humanity. Also, the author has rights to keep all website assets and
                    written materials as his own property.
                </p>

            </div>

        </div>

        <div class="pb-1">

            <p class="text-alert">
                *** Author will be very grateful if you will spread only positive energy and
                not in any situation bad about anything associated with this website.
            </p>

            <p>
                Terms & Conditions based on free man speech - <span class="text-alert">Martin Luther King, Jr</span>.
                You on the mountaintop!
            </p>

        </div>

    </div>

    <!-- footer Bottom -->
    <footer class="flex-center">

        <p>All Rights Reserved @ GediminasPalsys.com - {{ now()->year }}</p>

    </footer>

</div>

</body>

</html>