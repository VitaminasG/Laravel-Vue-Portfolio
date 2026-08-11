# Laravel 5.7 → 12 Migration — Design

Scope agreed on 2026-08-11. Moves the backend from Laravel 5.7 / PHP 7.3 to
Laravel 12 / PHP 8.4, leaving the frontend build untouched.

## Why now

This started as a request to make the app faster. Measuring first showed the
perceived slowness was not the application at all:

| Measurement | DNS | Time to first byte |
| --- | --- | --- |
| `https://gediminaspalsys.local:8443/` | **5.007 s** | 5.084 s |
| `https://localhost:8443/` | 0.00001 s | 0.023 s |
| same host, `curl --ipv4` | 0.005 s | 0.018 s |

`/etc/hosts` maps the domain to `127.0.0.1` only. macOS also asks for an AAAA
record, gets no answer from hosts, queries DNS and waits out a 5-second
timeout — on every request. Adding `::1 gediminaspalsys.local` removes it. PHP
itself answers in 10–60 ms with OPcache already enabled, so there is no
meaningful performance work to do in the application.

The real problem surfaced while measuring: **the project can no longer install
its own dependencies.** Packagist ended Composer 1 support on 2025-09-01, and
Laravel 5.7 cannot run under Composer 2 — its `PackageManifest` chokes on
Composer 2's `installed.json` format. `vendor/` only survives because it was
committed and built before the shutdown. A fresh clone cannot be set up.

PHP 7.3 has been end-of-life since December 2021 and Laravel 5.7 since 2019.

## Target: Laravel 12, and only Laravel 12

Every intermediate version was tested by resolving dependencies against the
real `composer.json`, not assumed:

| Target | Result |
| --- | --- |
| PHP 7.4 + Laravel 5.7 | Fails. The bundled `symfony/console` throws `Trying to access array offset on value of type int` in `ArrayInput.php:135`, breaking every artisan command including migrations. |
| Laravel 10 (any version to 10.50.2) | Composer refuses to install: 5 security advisories. |
| Laravel 11 (any version to v11.55.0) | Composer refuses to install: 7 security advisories. |
| **Laravel 12.65.0** | Resolves and installs cleanly. |

There is no stepping-stone release. The choice is to stay on 5.7 or go to 12.

Composer resolves Laravel 12 against PHP 8.4, and the resulting lock requires
`>= 8.4.1`, so the container moves to PHP 8.4. Pinning `config.platform.php`
to 8.3 is possible but buys nothing here.

## What the migration does not touch

**The frontend is fully decoupled and stays as it is.** The Blade layouts
reference assets by static path (`/js/app.js`, `/css/app.css`) rather than
through the `mix()` helper, and neither `app/` nor `config/` mentions Mix. The
backend does not care what produces those files.

So Laravel Mix 4, Vue 2, the SCSS, the GSAP animations, `resources/js`,
`resources/sass` and the `node:12` container are all out of scope. Migrating
them to Vite and Vue 3 is a separate project with its own risks — the boot
animation, two independent bundles, and Vue 2 → 3 breaking changes — and
mixing it into a framework upgrade would make both harder to verify.

## What changes

**Environment**

- `.docker/php/Dockerfile`: PHP 7.3 → 8.4, Composer 1.10.27 → 2.x. The
  Composer 1 pin exists solely because of Laravel 5.7 and goes away with it.
- Extensions stay as they are; all of them exist for 8.4.

**Application structure.** Laravel 11 replaced the Kernel classes with a single
`bootstrap/app.php`. Four files disappear and their contents move:

| File | Lines | Where it goes |
| --- | --- | --- |
| `app/Http/Kernel.php` | 89 | `bootstrap/app.php` → `withMiddleware()` |
| `app/Exceptions/Handler.php` | 67 | `bootstrap/app.php` → `withExceptions()` |
| `app/Console/Kernel.php` | 42 | `routes/console.php` |
| `bootstrap/app.php` | 55 | rewritten in the new form |

Two pieces of earlier work must survive this move intact, because both were
added deliberately and both are covered by tests:

- `App\Http\Middleware\ThrottlePerRoute` and its placement **ahead of**
  `Authenticate` in the middleware priority list. In Laravel 12 this is
  expressed as `$middleware->prependToGroup()` / `$middleware->priority([...])`
  inside `withMiddleware()`.
- `Handler::unauthenticated()` returning JSON 401 rather than redirecting to a
  non-existent `login` route, which becomes a `withExceptions()` renderable.

**Dependencies**

- Dropped: `fideloper/proxy` (Laravel ships `TrustProxies` since 9),
  `beyondcode/laravel-dump-server` (superseded), `fzaninotto/faker`
  (unmaintained; `fakerphp/faker` replaces it).
- Kept: `jenssegers/agent`, which resolves to v2.6.4 with
  `mobiledetect/mobiledetectlib` 2.8.47 — newer than the currently installed
  v2.6.3 / 2.8.33. The device detection question raised separately is answered
  by this upgrade rather than needing its own change.
- `laravel/tinker` moves to ^2.8, `nunomaduro/collision` to ^8.

**Tests.** PHPUnit 7 → 11. `phpunit.xml` needs the current schema, and
`ContactTest` uses `assertContains()` on strings in four places, which PHPUnit
removed in favour of `assertStringContainsString()`.

**Config.** All 14 files under `config/` are regenerated from the Laravel 12
skeleton, with this project's own values carried across — notably
`config/auth.php`'s `api` guard using the `token` driver, and
`config/contact.php`, which is this project's own file and simply moves over.

## Risks, and what was done about them

**The `Index` model has no `$table` property**, so its table name comes from
the pluralizer. If Laravel 12's inflector turned `Index` into `indexes`, the
contact form would silently write to a table that does not exist. Checked
directly against Laravel 12.65.0: `Index → indices`, `Stats → stats`,
`User → users`. The risk does not materialise, and no code change is needed.

**The `auth:api` token guard** is the whole authentication mechanism here.
`Illuminate\Auth\TokenGuard` still ships in Laravel 12, so the approach
survives; `config/auth.php` carries the guard definition across.

**37 tests are the safety net.** They cover the auth flow, throttling, device
detection, visit logging and the contact form. Every step of the migration is
measured against them rather than judged by inspection. The frontend has no
automated coverage, so `/OS`, `/Login` and `/Dashboard` are checked in a real
browser at the end — but since no frontend file changes, this is a regression
check on the backend's HTML output, not a frontend review.

## Approach

A dedicated branch, and the environment moves first: PHP 8.4 and Composer 2
before any Laravel code changes, so that "the framework upgrade broke it" and
"the PHP version broke it" stay distinguishable. The test suite will be red in
the middle of this — that is expected and stated, not a surprise — and must be
green again before the branch is considered done.

`master` keeps working throughout. If the migration turns out worse than
expected, the branch is abandoned and nothing is lost.

## Out of scope

- Frontend: Vite, Vue 3, SCSS, the two bundles, the node container.
- The `/etc/hosts` IPv6 entry, which needs `sudo` and belongs to the
  developer's machine rather than the repository.
- Application-level performance work. There is nothing to gain: PHP answers in
  10–60 ms and OPcache is already enabled with 128 MB and 10 000 slots.
