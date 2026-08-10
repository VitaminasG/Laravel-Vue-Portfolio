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

## Summoning the Admin (the Fresh Migration Ritual)

On a freshly migrated database the system trusts absolutely no one - not even you,
its creator. So the very first page that greets a brave new soul is **/Register**.
Yes, you have *been forced to do it*. This is by design: whoever resurrects this
project must first claim the throne before being allowed to peek at the Dashboard.

The migration quietly plants a placeholder admin into the database for exactly
this purpose (it is not a secret, it is hardcoded in `create_users_table` for the
whole internet to admire):

| Field | Value |
| --- | --- |
| **Old Email** | `admin@example.com` |
| **Old Password** | `12345678` |

On the **/Register** page hand those over as the *old* credentials, then declare
your own *new* email and a *new* password (8 characters minimum - the bar is on
the floor, please do clear it) and press **Verify**. The placeholder is overthrown,
the secret `verified` flag flips to `true`, and you are politely escorted towards
the **/Login** door.

From there, sign in with your shiny new credentials and the **Dashboard** - a humble
shrine of web statistics harvested from every visitor's IP and User-Agent - finally
opens its gates. The relentless `/Register` redirect will never bother you again.

## Official link to Page site

- Link to route: '/' [https://gediminaspalsys.uk/](https://gediminaspalsys.uk/).
- Link to route: '/OS' [https://gediminaspalsys.uk/OS](https://gediminaspalsys.uk/OS).
- Link to route: '/Dashboard' [https://gediminaspalsys.uk/Dashboard](https://gediminaspalsys.uk/Dashboard).

*If you using a mobile device, then you will be redirected to mobile site with modified content. 
All that content redirection made by using **jenseegers/agent** - follow the link to read more -> [jenssegers/agent](https://github.com/jenssegers/agent).*

## Re-using Code (a.k.a. Local Resurrection)

So you cloned a relic from the past and now expect it to breathe again? Bold move.
This thing was forged in the age of Laravel 5.7 and PHP 7.x, so to keep the ancient
spirits contained we wrap the whole circus in Docker. No, your shiny brand-new system
PHP and Node will *not* be invited to the party - they would only frighten the locals.

You will need **Docker** and **mkcert** (`brew install mkcert nss`). The latter forges
a locally-trusted SSL certificate, because even nostalgia deserves a green padlock.

```
git clone https://github.com/VitaminasG/Laravel-Vue-Portfolio.git
```
```
cd Laravel-Vue-Portfolio
```

One incantation to rule them all:

```
make setup
```

That single spell will forge the mkcert certificate for `gediminaspalsys.local`,
inject it into `.env`, build the containers (nginx + php + mariadb + node), install
the dependencies, generate the app key, fix the permissions and finally run the
migrations - which, as you now know, quietly crown the placeholder admin.

Suspicious of magic and prefer to suffer step by step? The mortal sequence:

```
make generate-certs    # forge the locally-trusted certificate
make update-ssl        # write SSL_CERT / SSL_KEY into .env
make rebuild           # build & start the containers
make composer-install  # PHP dependencies (Composer 1.x, because 5.7 is fussy)
make key-generate      # APP_KEY, or nothing will decrypt
make permissions       # let Laravel write to storage/
make migrate           # run migrations and plant the admin
```

When the dust settles, open the temple at:

- **https://localhost:8443** - works immediately, no sudo, no excuses.
- **https://gediminaspalsys.local:8443** - only after you whisper to `/etc/hosts`:
  ```
  echo '127.0.0.1   gediminaspalsys.local' | sudo tee -a /etc/hosts
  ```

Mind the **`:8443`** - the project lives there on purpose. Ports are kept in `.env`
(`HTTP_PORT`, `SSL_PORT`) so this old soul does not start a turf war with your other
containers squatting on port 443.

Useful spells for the daily grind: `make help`, `make logs`, `make node-watch`
(recompile the Vue/SCSS), `make php-shell`, `make db-shell`.

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
