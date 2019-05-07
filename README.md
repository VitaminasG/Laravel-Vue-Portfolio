# Laravel-Vue-Portfolio

My personal Single Page Application (SPA) with Laravel, Vuejs and GSAP - GreenSock.

## Disclaimer

You take your own responsibility by processing granted digital data.If you have any negative
reactions from "Back to the Future" side-effects, unacceptable strong opinion statements,
or not very trendy web design decision developed by an author - Gediminas Palsys, please
stop reading now and don’t look into any website elements inside this introduction page.
Start immediately removing all traces from your current browser and lock all your memories about me.

Also, the materials could be changed over a time but the purpose of the site will stay based
on the original idea to serve as personal informative network tool to communicate with users - stakeholders of
the internet. All materials published on this website should serve for all
different users, no matter of his/her/it race, financial or social situation, without any 
hidden intentions to harm. The author always got upper hand to control a data on a website
and to express any ideas transmitted through the prism of his perception. Any useful web 
source-code and problem-solving decisions made and found by you during all visit at
gediminaspalsys.uk, is allowed to keep for yourself and in some cases must be used on publicly
accessed web environments if it will help to save a humanity. Also, the author has rights
to keep all website assets and written materials as his own property.

## Update - Dashboard

Integrated a new feature to Log-in as Admin and get Web Statistics from Database. If user accessed
 Web Site on fresh migration, then will be asked to register and confirm new login credentials.
 
 Web and API routes:
 ```
 +--------+----------+--------------+------+-------------------------------------------------+--------------+
 |        | POST     | ContactMe    |      | App\Http\Controllers\IndexController@store      | web          |
 |        | POST     | api/login    |      | App\Http\Controllers\API\ApiController@login    | api,throttle |
 |        | GET|HEAD | api/register |      | App\Http\Controllers\API\ApiController@register | api          |
 |        | POST     | api/register |      | App\Http\Controllers\API\ApiController@register | api,throttle |
 |        | GET|HEAD | api/stats    |      | App\Http\Controllers\API\ApiController@stats    | api,auth:api |
 |        | GET|HEAD | api/verify   |      | App\Http\Controllers\API\ApiController@verify   | api          |
 |        | GET|HEAD | {Vue?}       |      | App\Http\Controllers\IndexController@index      | web          |
 +--------+----------+--------------+------+-------------------------------------------------+--------------+
```

## Official link to Page site

- Link to route: '/' [https://gediminaspalsys.uk/](https://gediminaspalsys.uk/).
- Link to route: '/OS' [https://gediminaspalsys.uk/OS](https://gediminaspalsys.uk/OS).
- Link to route: '/Dashboard' [https://gediminaspalsys.uk/Dashboard](https://gediminaspalsys.uk/Dashboard).

*If you using a mobile device, then you will be redirected to mobile site with modified content. 
All that content redirection made by using **jenseegers/agent** - follow the link to read more -> [jenssegers/agent](https://github.com/jenssegers/agent).*

## Re-using Code

```
git clone https://github.com/VitaminasG/Laravel-Vue-Portfolio.git
```
```
cd Laravel-Vue-Portfolio
```
```
composer update
```
```
npm install
```
*Edit, move and delete to your need's*

## Personal Statment

As you noticed this personal project tried to convey and give a feeling, as being a
person who used one of many computer systems existed almost three decades ago.
If someone was a curious kid during that period, they should know where I'm heading.
I didn't want to bring back everything in this project like it was age's ago and
replicate everything in very small details like Windows 98 used to be and to have
a same ugly low-resolution Graphical User Interface (GUI). Either, I am not a romantic
person, who still remembers the good old days spent with friends next to a computer
screen protected with a greenish cover from low refresh rate and playing DUNE from
a floppy disk. Ufff, that was very impressive. However, I still don't get it till now,
how they managed to fit all polyphonic soundtracks, graphical assets and code inside
one 2MB size floppy disk. I am still thinking it was made with Magic!
