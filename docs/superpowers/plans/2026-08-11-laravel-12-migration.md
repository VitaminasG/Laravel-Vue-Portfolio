# Laravel 12 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the backend from Laravel 5.7 / PHP 7.3 to Laravel 12 / PHP 8.4 with all 37 tests green and no change to what a visitor sees.

**Architecture:** The environment moves first (PHP and Composer), then the framework, then the application structure Laravel 11 replaced. The frontend build is untouched throughout — Blade references assets by static path, so Mix and Vue 2 keep producing the same files. The suite is expected to be red between Task 2 and Task 8; that window is the migration, and it closes before the branch is done.

**Tech Stack:** Laravel 12.65, PHP 8.4, Composer 2, PHPUnit 11, MariaDB 10.6, Docker. Frontend stays on Laravel Mix 4 / Vue 2 / Node 12.

## Global Constraints

- **All commands run inside Docker.** PHP: `docker exec -i portfolio-php <cmd>`. Node: `docker exec -i portfolio-node <cmd>`. Never run `php`, `composer` or `npm` on the host.
- **Work on the branch `laravel-12-migration`.** Never commit to `master`.
- **All in-file content in English** — comments, docblocks, commit messages, test names.
- Tests run against sqlite `:memory:`; the dev MariaDB database is never touched.
- **Do not modify anything under `resources/js`, `resources/sass`, `package.json`, `webpack.mix.js`, or the `node` service.** The frontend is out of scope.
- **Do not modify `public/`.** No rebuild is needed; no frontend source changes.
- **Do not modify `.env`** — it is gitignored and holds the developer's live settings. `.env.example` is fair game.
- The app must keep answering: `/` and `/OS` serve the desktop SPA shell, `/` with a mobile User-Agent serves the mobile shell, `GET /api/verify` returns `{"check": bool}`, `POST /api/login` issues a token, `GET /api/stats` needs an admin token.
- **Baseline: 37 tests, 169 assertions, all passing on `master`.** That is the number to get back to.

---

## File Structure

**Environment:**
- Modify: `.docker/php/Dockerfile` — PHP 8.4, Composer 2

**Deleted (Laravel 11 removed these):**
- `app/Http/Kernel.php`, `app/Console/Kernel.php`, `app/Exceptions/Handler.php`
- `app/Http/Middleware/CheckForMaintenanceMode.php`, `TrimStrings.php`, `TrustProxies.php`, `RedirectIfAuthenticated.php`, `Authenticate.php`, `EncryptCookies.php`, `VerifyCsrfToken.php` — all now framework defaults
- `app/Providers/AuthServiceProvider.php`, `EventServiceProvider.php`, `RouteServiceProvider.php` — routing and events move to `bootstrap/app.php`

**Rewritten:**
- `bootstrap/app.php` — the new application entry point, carrying middleware, routing and exceptions
- `composer.json`, `phpunit.xml`, all 14 files under `config/`

**Kept as-is (this project's own code):**
- `app/Http/Controllers/`, `app/Http/Middleware/ThrottlePerRoute.php`, `app/User.php`, `app/Index.php`, `app/Stats.php`, `app/Mail/ContactMe.php`, `app/Http/Resources/Stats.php`
- `routes/web.php`, `routes/api.php`, `database/`, `resources/views/`, `tests/`

---

### Task 1: Move the container to PHP 8.4 and Composer 2

**Files:**
- Modify: `.docker/php/Dockerfile`

**Interfaces:**
- Consumes: nothing.
- Produces: a `portfolio-php` container running PHP 8.4 with Composer 2 on the path.

**Expect the app and the suite to break in this task.** Laravel 5.7 does not run on PHP 8.4, and its `PackageManifest` cannot read Composer 2's `installed.json`. That is the point: this task isolates "the environment moved" from "the framework moved", so a later failure is attributable.

- [ ] **Step 1: Rewrite the Dockerfile**

Replace the whole file with:

```dockerfile
# Laravel 12 requires PHP >= 8.2; the resolved dependency set asks for >= 8.4.1.
FROM php:8.4-fpm

# Required system libraries
RUN apt-get update && apt-get install -y \
        git \
        unzip \
        libzip-dev \
        libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions required by Laravel (mbstring, bcmath, pdo_mysql) + opcache, zip, gd
RUN docker-php-ext-install pdo_mysql mbstring bcmath zip gd opcache

# Composer 2. The old 1.x pin existed only because Laravel 5.7's PackageManifest
# could not read Composer 2's installed.json; Packagist dropped Composer 1
# support on 2025-09-01, so 1.x can no longer resolve dependencies at all.
RUN curl -sS https://getcomposer.org/installer | php -- --2 --filename=composer --install-dir=/usr/local/bin

# Custom php-fpm config (unix socket shared with nginx)
COPY templates/php.conf /usr/local/etc/php-fpm.d/zzz-custom.conf

WORKDIR /var/www/portfolio

CMD ["php-fpm"]
```

- [ ] **Step 2: Rebuild the container**

Run: `docker compose up --build -d php`

Then confirm both versions:

Run: `docker exec -i portfolio-php php -v`
Expected: `PHP 8.4.x`

Run: `docker exec -i portfolio-php composer --version`
Expected: `Composer version 2.x`

- [ ] **Step 3: Record the breakage**

Run: `docker exec -i portfolio-php vendor/bin/phpunit 2>&1 | tail -20`

Expected: failure. Capture the actual output verbatim in your report — it is the evidence that the next task has something to fix, and it distinguishes environment breakage from framework breakage later.

- [ ] **Step 4: Commit**

```bash
git add .docker/php/Dockerfile
git commit -m "Move the PHP container to 8.4 and Composer 2

The Composer 1 pin existed only to keep Laravel 5.7 bootable. Packagist ended
Composer 1 support on 2025-09-01, so it can no longer resolve dependencies at
all, and PHP 7.3 has been end-of-life since 2021.

The suite is red as of this commit: Laravel 5.7 runs on neither PHP 8.4 nor
Composer 2. The framework upgrade in the next commits is what makes it green
again. This is split out so that a later failure can be attributed to the
framework rather than the environment."
```

---

### Task 2: Install Laravel 12 and its dependency set

**Files:**
- Modify: `composer.json`
- Regenerate: `composer.lock`, `vendor/`

**Interfaces:**
- Consumes: PHP 8.4 and Composer 2 from Task 1.
- Produces: `laravel/framework` 12.65.x installed, `jenssegers/agent` at v2.6.4.

- [ ] **Step 1: Rewrite the dependency block**

In `composer.json`, replace `require` and `require-dev` with:

```json
    "require": {
        "php": "^8.2",
        "guzzlehttp/guzzle": "^7.2",
        "jenssegers/agent": "^2.6",
        "laravel/framework": "^12.0",
        "laravel/tinker": "^2.8"
    },
    "require-dev": {
        "fakerphp/faker": "^1.9.1",
        "mockery/mockery": "^1.4.4",
        "nunomaduro/collision": "^8.0",
        "phpunit/phpunit": "^11.0"
    },
```

Dropped on purpose: `fideloper/proxy` (Laravel ships `TrustProxies` since 9), `beyondcode/laravel-dump-server` (superseded by the framework), `fzaninotto/faker` (unmaintained, replaced by `fakerphp/faker`), `barryvdh/laravel-ide-helper` and `filp/whoops` (dev conveniences, not needed to get green — they can come back later).

Also set stability, so Composer picks tagged releases:

```json
    "minimum-stability": "stable",
    "prefer-stable": true,
```

- [ ] **Step 2: Install**

Run: `docker exec -i portfolio-php composer update --no-scripts`

`--no-scripts` matters: the post-autoload-dump hook runs `php artisan package:discover`, and the application cannot boot until Task 3 rewrites `bootstrap/app.php`.

Expected: resolves and installs. If Composer refuses over security advisories, stop and report — that would mean 12.x has picked up an advisory since this plan was written, and the target needs rethinking.

- [ ] **Step 3: Confirm what landed**

Run:
```bash
docker exec -i portfolio-php php -r '
$p = json_decode(file_get_contents("vendor/composer/installed.json"), true)["packages"];
foreach ($p as $x) { if (in_array($x["name"], ["laravel/framework","jenssegers/agent","mobiledetect/mobiledetectlib","phpunit/phpunit"])) echo $x["name"]." ".$x["version"]."\n"; }
'
```

Expected: `laravel/framework v12.65.x`, `jenssegers/agent v2.6.4`, `mobiledetect/mobiledetectlib 2.8.47`, `phpunit/phpunit 11.x`.

- [ ] **Step 4: Commit**

```bash
git add composer.json composer.lock
git commit -m "Install Laravel 12 and drop the packages it absorbed

fideloper/proxy, beyondcode/laravel-dump-server and fzaninotto/faker are
either shipped by the framework now or unmaintained. jenssegers/agent stays
and moves from v2.6.3 to v2.6.4, bringing mobiledetect 2.8.47 with it.

Installed with --no-scripts because package discovery cannot run until
bootstrap/app.php is rewritten."
```

---

### Task 3: Rewrite the application bootstrap

**Files:**
- Rewrite: `bootstrap/app.php`
- Delete: `app/Http/Kernel.php`, `app/Console/Kernel.php`, `app/Exceptions/Handler.php`

**Interfaces:**
- Consumes: Laravel 12 from Task 2.
- Produces: an application that boots. `php artisan --version` works.

Two behaviours from earlier work must survive verbatim, and both are covered by tests:

1. `ThrottlePerRoute` registered as the `throttle.route` alias, and placed **ahead of** `Authenticate` in the middleware priority list. Without the priority entry, Laravel hoists `Authenticate` above the throttle and anonymous traffic to `/api/stats` is never counted — `test_anonymous_traffic_to_a_guarded_route_is_throttled_not_just_rejected` exists to catch exactly that.
2. Unauthenticated API requests answer JSON 401 rather than redirecting to a `login` route that does not exist — covered by `test_unauthenticated_request_returns_401_without_a_json_accept_header`.

- [ ] **Step 1: Write the new bootstrap**

Replace `bootstrap/app.php` entirely with:

```php
<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'throttle.route' => \App\Http\Middleware\ThrottlePerRoute::class,
        ]);

        // Throttling is listed ahead of Authenticate so anonymous traffic to a
        // guarded route is counted before it is rejected. Declaring the order
        // in routes/api.php is not enough: this list outranks it.
        $middleware->priority([
            \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\ThrottlePerRoute::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class,
            \Illuminate\Auth\Middleware\Authenticate::class,
            \Illuminate\Session\Middleware\AuthenticateSession::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Illuminate\Auth\Middleware\Authorize::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Every guarded route in this project is an API endpoint, so there is
        // no login page to redirect to.
        $exceptions->render(function (AuthenticationException $e, $request) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        });
    })->create();
```

- [ ] **Step 2: Delete the files Laravel 11 removed**

```bash
git rm app/Http/Kernel.php app/Console/Kernel.php app/Exceptions/Handler.php
```

- [ ] **Step 3: Verify the application boots**

Run: `docker exec -i portfolio-php composer dump-autoload`

Expected: package discovery now succeeds.

Run: `docker exec -i portfolio-php php artisan --version`
Expected: `Laravel Framework 12.65.x`

If artisan still fails, the error names what is missing — report it rather than guessing.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Rewrite the bootstrap and drop the Kernel classes

Laravel 11 replaced the HTTP, console and exception Kernels with a single
bootstrap/app.php, so those three files go and their contents move.

Two pieces of earlier work are carried across deliberately: ThrottlePerRoute
keeps its alias and its position ahead of Authenticate in the priority list,
without which anonymous traffic to guarded routes goes uncounted; and
unauthenticated API requests keep answering JSON 401 rather than redirecting
to a login route this app does not have. Both are covered by tests."
```

---

### Task 4: Regenerate the config files

**Files:**
- Rewrite: everything under `config/`
- Keep: `config/contact.php` (this project's own file)

**Interfaces:**
- Consumes: a bootable application from Task 3.
- Produces: config in Laravel 12 form, with this project's values preserved.

- [ ] **Step 1: Publish the Laravel 12 defaults**

Run: `docker exec -i portfolio-php php artisan config:publish --all --force`

If that command does not exist in this version, take the files from
`vendor/laravel/framework/config/` instead and copy them into `config/`.

- [ ] **Step 2: Carry this project's own values across**

Three things must survive; check each against git:

1. `config/auth.php` — the `api` guard using the `token` driver:
   ```php
   'api' => [
       'driver' => 'token',
       'provider' => 'users',
       'hash' => false,
   ],
   ```
   This is the entire authentication mechanism. `Illuminate\Auth\TokenGuard` still ships in Laravel 12.
2. `config/contact.php` — this project's own file. It is not part of the skeleton, so make sure the publish step did not delete it.
3. `config/app.php` — `'name' => env('APP_NAME', 'Portfolio')`, and confirm no provider entry references a deleted class.

Run `git diff config/` and read it before committing. Anything this project set that the skeleton does not know about must be re-applied by hand.

- [ ] **Step 3: Verify config loads**

Run: `docker exec -i portfolio-php php artisan config:clear && docker exec -i portfolio-php php artisan about`

Expected: the environment summary prints without error, showing Laravel 12.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Regenerate config for Laravel 12

Carries three project-specific pieces across the regeneration: the api guard's
token driver, which is this app's whole authentication mechanism; the app name;
and config/contact.php, which is this project's own file rather than part of
the skeleton."
```

---

### Task 5: Delete the middleware and providers the framework now supplies

**Files:**
- Delete: `app/Http/Middleware/CheckForMaintenanceMode.php`, `TrimStrings.php`, `TrustProxies.php`, `RedirectIfAuthenticated.php`, `Authenticate.php`, `EncryptCookies.php`, `VerifyCsrfToken.php`
- Delete: `app/Providers/AuthServiceProvider.php`, `EventServiceProvider.php`, `RouteServiceProvider.php`
- Keep: `app/Http/Middleware/ThrottlePerRoute.php`, `app/Providers/AppServiceProvider.php`

**Interfaces:**
- Consumes: the bootstrap from Task 3.
- Produces: `app/Http/Middleware/` containing only this project's own middleware.

- [ ] **Step 1: Check each file is genuinely stock before deleting**

For each candidate, confirm it has no project-specific customisation:

```bash
for f in CheckForMaintenanceMode TrimStrings TrustProxies RedirectIfAuthenticated Authenticate EncryptCookies VerifyCsrfToken; do
  echo "=== $f ==="; cat app/Http/Middleware/$f.php 2>/dev/null | grep -vE "^\s*(\*|/\*|//|$)" | head -20
done
```

Anything with a non-default body — a custom `$except` list in `VerifyCsrfToken`, a real `$proxies` value in `TrustProxies`, a changed redirect path — must be carried into `bootstrap/app.php` instead of dropped. Report what you found.

- [ ] **Step 2: Delete the stock files**

```bash
git rm app/Http/Middleware/CheckForMaintenanceMode.php \
       app/Http/Middleware/TrimStrings.php \
       app/Http/Middleware/TrustProxies.php \
       app/Http/Middleware/RedirectIfAuthenticated.php \
       app/Http/Middleware/Authenticate.php \
       app/Http/Middleware/EncryptCookies.php \
       app/Http/Middleware/VerifyCsrfToken.php
git rm app/Providers/AuthServiceProvider.php \
       app/Providers/EventServiceProvider.php \
       app/Providers/RouteServiceProvider.php
```

Note `ThrottlePerRoute.php` extends `Illuminate\Routing\Middleware\ThrottleRequests` and stays.

- [ ] **Step 3: Verify the app still boots**

Run: `docker exec -i portfolio-php php artisan about`
Expected: prints without error.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Delete the stock middleware and providers Laravel now supplies

All seven middleware and three providers were unmodified scaffolding, checked
file by file before removal. ThrottlePerRoute and AppServiceProvider stay:
they carry this project's own behaviour."
```

---

### Task 6: Bring the test suite to PHPUnit 11

**Files:**
- Rewrite: `phpunit.xml`
- Modify: `tests/Feature/ContactTest.php`

**Interfaces:**
- Consumes: PHPUnit 11 from Task 2.
- Produces: a suite that runs, whatever its pass rate.

- [ ] **Step 1: Rewrite phpunit.xml in the current schema**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true"
>
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory>tests/Feature</directory>
        </testsuite>
    </testsuites>
    <source>
        <include>
            <directory>app</directory>
        </include>
    </source>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="BCRYPT_ROUNDS" value="4"/>
        <env name="CACHE_STORE" value="array"/>
        <env name="MAIL_MAILER" value="array"/>
        <env name="QUEUE_CONNECTION" value="sync"/>
        <env name="SESSION_DRIVER" value="array"/>
        <!-- Isolated in-memory DB so tests never touch the dev database -->
        <env name="DB_CONNECTION" value="sqlite"/>
        <env name="DB_DATABASE" value=":memory:"/>
    </php>
</phpunit>
```

Note `CACHE_DRIVER` became `CACHE_STORE` and `MAIL_DRIVER` became `MAIL_MAILER` in modern Laravel. Getting these wrong makes the throttle tests behave unpredictably, because the rate limiter would use a different cache store.

- [ ] **Step 2: Replace the removed assertion**

In `tests/Feature/ContactTest.php`, `test_the_mail_body_renders_every_field` uses `assertContains` on a string in four places. PHPUnit removed that for strings. Change each to `assertStringContainsString`:

```php
        $this->assertStringContainsString('Tester', $rendered);
        $this->assertStringContainsString('tester@example.com', $rendered);
        $this->assertStringContainsString('Hello there', $rendered);
        $this->assertStringContainsString('TestAgent/1.0', $rendered);
```

- [ ] **Step 3: Run the suite and record the state**

Run: `docker exec -i portfolio-php vendor/bin/phpunit 2>&1 | tail -40`

The suite will very likely still fail here — that is expected, and Task 7 is where it gets fixed. Capture the failures verbatim: their number and kind is the input to the next task.

- [ ] **Step 4: Commit**

```bash
git add phpunit.xml tests/
git commit -m "Update the test configuration for PHPUnit 11

The config schema changed, and assertContains no longer accepts strings.
CACHE_DRIVER and MAIL_DRIVER are now CACHE_STORE and MAIL_MAILER; getting
those wrong would quietly point the rate limiter at a different cache store
and make the throttle tests unpredictable."
```

---

### Task 7: Fix what the suite reports until it is green

**Files:**
- Unknown until Task 6 reports. Likely candidates: `app/Http/Controllers/API/ApiController.php`, `app/Http/Controllers/IndexController.php`, `app/User.php`, `database/migrations/*`, `tests/*`.

**Interfaces:**
- Consumes: the failure list from Task 6.
- Produces: **37 tests, 169 assertions, all passing.**

This is the one task whose contents cannot be written in advance, because it depends on what actually breaks. Work it as a loop, not a batch.

- [ ] **Step 1: Take the failures one at a time**

For each failure, in order:

1. Read the actual error and stack trace. Do not pattern-match on the test name.
2. Decide whether the *test* or the *application* is wrong. A test asserting Laravel 5.7 behaviour that Laravel 12 deliberately changed should be updated; application code that a framework change broke should be fixed.
3. Make the smallest change that addresses it.
4. Re-run that one test: `docker exec -i portfolio-php vendor/bin/phpunit --filter <name>`
5. Move to the next.

Known things to expect, from the design work:

- `Str::random`, `optional()`, `auth('api')->user()` all still exist — no change needed.
- The `Index` model relies on the pluralizer for its `indices` table. Verified against Laravel 12.65.0 that `Index → indices` still holds, so this should not break. If it does, add `protected $table = 'indices';` and say so in the report.
- `$this->app->forgetInstance('auth')` in two tests is a harness workaround for the shared application instance; it should still be needed and still work.
- Migrations using `$table->increments('id')` still run; no need to modernise them in this task.

- [ ] **Step 2: Run the whole suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: `OK (37 tests, 169 assertions)`.

If the count is not 37, something was deleted or skipped — investigate rather than accepting a smaller green suite.

- [ ] **Step 3: Commit**

Commit with a message that lists what actually broke and why, one line each. Do not write a generic "fix tests" message — the list is the useful record of what the upgrade cost.

---

### Task 8: Verify the running application end to end

**Files:** none — verification only.

**Interfaces:**
- Consumes: a green suite from Task 7.
- Produces: evidence the app behaves as it did on `master`.

The suite covers the API and the layout selection. It does not cover what a visitor actually sees, and no frontend file changed, so this step is checking that the Laravel 12 backend still serves the same HTML to the same clients.

- [ ] **Step 1: Check every route and both device paths**

```bash
UA_DESK='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
UA_MOB='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
for p in / /OS /Login /Dashboard; do printf "%-12s " "$p"; curl -sk -A "$UA_DESK" -o /dev/null -w "%{http_code}\n" "https://localhost:8443$p"; done
printf "%-12s " "mobile /"; curl -sk -A "$UA_MOB" -o /dev/null -w "%{http_code}\n" https://localhost:8443/
printf "%-12s " "mobile /OS"; curl -sk -A "$UA_MOB" -o /dev/null -w "%{http_code}\n" https://localhost:8443/OS
printf "%-12s " "api/verify"; curl -sk -o /dev/null -w "%{http_code}\n" https://localhost:8443/api/verify
printf "%-12s " "api/stats"; curl -sk -o /dev/null -w "%{http_code}\n" https://localhost:8443/api/stats
```

Expected: desktop routes 200; mobile `/` 200 and mobile `/OS` **404**; `api/verify` 200; `api/stats` **401**.

Note `https://localhost:8443`, not the `.local` hostname — the latter costs a 5-second DNS timeout per request on this machine.

- [ ] **Step 2: Confirm the right shell is served to each device**

```bash
curl -sk -A "$UA_DESK" https://localhost:8443/ | grep -E 'script src|link rel'
curl -sk -A "$UA_MOB" https://localhost:8443/ | grep -E 'script src|link rel'
curl -sk https://localhost:8443/ | grep -c 'id="server"'
```

Expected: desktop gets `/js/app.js`, mobile gets `/js/mobile/mobile.js`, and a plain curl (treated as a crawler) gets the static `server` layout.

- [ ] **Step 3: Drive the SPA in a browser**

Use the Playwright MCP tools against `https://gediminaspalsys.local:8443`, allowing ~28 s after loading `/OS` for the boot animation. Confirm:

1. `/OS` boots through to the desktop with all four icons and the taskbar.
2. `/Dashboard` with empty localStorage redirects to `/Login`.
3. The browser console shows no errors.

- [ ] **Step 4: Commit the verification record**

Nothing to commit unless a fix was needed. If everything passed, say so in the report and move on.

---

### Task 9: Update the documentation to match reality

**Files:**
- Modify: `CLAUDE.md`, `README.md`, `.env.example`

**Interfaces:**
- Consumes: a verified application from Task 8.
- Produces: documentation that describes Laravel 12, not 5.7.

- [ ] **Step 1: Fix the statements that are now false**

`CLAUDE.md` opens by describing the project as "Laravel 5.7 (PHP `^7.1.3`)" and documents `app/Http/Kernel.php` and the Composer 1 constraint. Every such claim needs updating. Grep for the specifics rather than trusting a read-through:

```bash
grep -rn "5\.7\|7\.1\.3\|7\.3\|Composer 1\|Http/Kernel\|Exceptions/Handler" CLAUDE.md README.md .env.example
```

- [ ] **Step 2: Keep what is still true**

The two-Vue-apps architecture, the device-based layout selection, the token guard, the `verified` flag gating first use, the localStorage session — all unchanged. Do not rewrite those sections.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md .env.example
git commit -m "Update the docs for Laravel 12

The framework version, the PHP version and the Composer 1 constraint were all
stated as fact and are all now wrong. The architecture sections stay: the two
Vue apps, the device-based layout selection and the token guard are unchanged
by this migration."
```

---

## Notes for the implementer

- **The suite is red from Task 1 to Task 7.** That is the design, not a problem to route around. Do not skip ahead to make it green early, and do not delete a failing test to reach a smaller green suite.
- **37 tests, 169 assertions is the target.** A green run with fewer tests means something was lost.
- **`--no-scripts` is required in Task 2** and not afterwards. Once `bootstrap/app.php` is rewritten, package discovery works normally.
- **If a task's premise turns out to be wrong** — Composer refuses Laravel 12, the inflector changes the table name, a middleware turns out to be customised — stop and report it rather than improvising a workaround. The design records what was verified; a surprise means the design was wrong and should be corrected rather than papered over.
