# Refactoring Plan

Full-project code review + simplification of the Laravel 5.7 / Vue 2 portfolio.
Each item lists `file:line` and the intended fix. Check items off as they land.

Phases 1–3 were verified against the code on 2026-08-10 and designed in
`docs/superpowers/specs/2026-08-10-refactor-phases-1-3-design.md`. Where the
original wording turned out to be inaccurate, the item below is corrected and
the correction is marked.

## Phase 0 — Safety net (tests first)

- [x] Feature tests for the admin auth flow: `GET /api/verify`, `POST /api/login`,
      `POST /api/register` (credential change), `GET /api/stats` (auth + non-auth).
- [x] Feature test for `IndexController`: desktop / mobile / robot layout selection
      and that a visit records a `Stats` row.
- [x] Tests run against an isolated database (sqlite :memory:) so the dev DB is untouched.

## Phase 1 — Correctness bugs

- [x] `resources/js/routes.js:56-101` — `beforeEach` calls `next()` twice (two
      independent if/else blocks, plus sync/async race on `freshLogin` routes).
      Rewrite as a single guard with correct async flow.
      *Corrected: redirects do work in practice (`/Dashboard` lands on `/Login`),
      so this is a race and a fragility, not an open auth hole.*
- [x] `app/Http/Controllers/API/ApiController.php:20-35` — `verify()` crashes (500)
      when no admin row exists (`$admin->verified` on null). Guard for null.
- [x] `resources/js/app.js:11` — `vueStore: vueStore` should be `store: vueStore`
      so Vuex is wired to `$store`.
      *Corrected: harmless today — no component uses `this.$store`; all four
      consumers import `store` directly. A misleading line, not a defect.*
- [x] `ApiController.php:113` — drop `htmlentities()` around the password before
      `Hash::make()` (it mangles passwords containing `<>&"'`).
      *Note: this is a fix, not a regression — `login()` already checks the raw
      password, so such a password cannot work today.*
- [x] `app/Http/Controllers/IndexController.php:19-54` — `index()` returns nothing
      for unmatched agents; add a desktop default. Robots keep being recorded.
      *Corrected: theoretical. `isDesktop()` is `!isMobile() && !isTablet() &&
      !isRobot()`, so a branch always matches — verified against tablets, smart
      TVs, consoles, curl, wget and an empty User-Agent. Default added as a
      safety net only.*
- [x] `app/Exceptions/Handler.php` — an unauthenticated API request returns 500,
      not 401: the handler redirects to a `login` route that does not exist.
      Masked in practice because axios sends `Accept: application/json`.

## Phase 2 — Security

- [x] `IndexController.php:85` — hardcoded recipient `vitaminas.g@gmail.com` →
      move to `config`/`.env` (`CONTACT_RECIPIENT`), keeping the current address
      as the fallback.
- [x] `vueStore.js` logout + `ApiController` — server keeps the `api_token` valid
      forever; logout only clears localStorage. Add `POST /api/logout` behind
      `auth:api` that clears `users.api_token`.
- [x] `routes/api.php:10-11` — set explicit `throttle:10,1` and drop `GET /register`.
      *Corrected: `GET /verify` is used by `sorter.js` and must stay. `GET /register`
      is worse than "pointless" — a GET request invokes the credential change.*
- [x] `ApiController::stats()` — returns 200 with an error message for a non-admin;
      should be 403.

## Phase 3 — Backend simplification

- [x] `app/User.php:31-69` — `isAdmin()` returns a string (misleading); `admin()` /
      `default()` duplicate the `$roles` map. Consolidate role logic (bool `isAdmin()`
      + clear role constants).
      *Safe: `'su'` appears only inside `User.php`, and the database contains only
      `type='admin'`.*
- [x] `ApiController.php` — extract the repeated "find user + check password" block;
      remove the empty resource stubs `store/show/update/destroy` (158-195).
- [x] `app/Mail/ContactMe.php` — stop passing the whole `Request`; pass a plain
      payload (name/from/message/agent) so the mailable is queue-safe.
- [x] `IndexController.php:74` — read the User-Agent header directly instead of
      assigning the dynamic `$request->agent` property.
- [x] `IndexController@store` — returns no response at all (empty 200); return JSON.

## Phase 4 — Frontend simplification

- [ ] `resources/js/components/testing.vue` — delete (dead code, never imported).
- [ ] Remove leftover `console.log` calls (31 across `.vue`/`.js`).
- [ ] `helpers/sorter.js:78` — rename the misleading `post.verify` key (→ `login`);
      simplify the `apiList` / `setTarget` / `target` indirection for a few endpoints.
- [ ] Extract the duplicated dashed-box SCSS (statistics, ApiLogin, ApiRegister,
      textEditor) into shared classes.
- [ ] `views/Dashboard.vue:18-22,36` — remove the always-rendered "Access Denied"
      leftover; make `username` reactive (computed instead of `data`).

### Carried over from the phases 1-3 pass

Minor findings raised during phases 1-3 and triaged as non-blocking by the final
whole-branch review. None of them affects behaviour today; they are recorded so
they are not rediscovered from scratch.

Cleanups worth folding into whichever Phase 4 item touches the same file:

- [ ] `resources/js/helpers/sorter.js` — `get.register` still maps to
      `/api/register`, which returns 405 since the GET route was dropped. Dead
      entry; remove it alongside the `post.verify` rename above.
- [ ] `tests/Feature/AdminAuthTest.php` — unused `use Illuminate\Support\Facades\Cache;`
      import (the class uses `$this->artisan('cache:clear')` instead).
- [ ] No trailing newline at EOF in `AdminAuthTest.php`, `ContactTest.php`,
      `VisitTest.php`, `routes.js`, `vueStore.js`, `sorter.js`. House-wide; fix
      in one sweep or not at all.
- [ ] `ApiController.php` — two conditional styles now coexist: `if (! $user) {`
      in the refactored code against `if($user->isAdmin()){` in the older code.
      A formatting pass would settle it.
- [ ] `app/Http/Controllers/Auth/RegisterController.php` — stock `make:auth`
      scaffolding, unreachable from any route. Delete rather than maintain.

Test coverage gaps for code this refactor changed:

- [ ] `ApiController::login()` — the non-admin rejection branch has no
      end-to-end test, and its comparison changed when `isAdmin()` became a
      boolean.
- [ ] `POST /api/logout` without a token (expected 401) is untested.
- [ ] `throttle:10,1` is tested on `/api/login` but not on `/api/register`.
- [ ] The throttle-before-`auth:api` ordering on the guarded group was verified
      by reading `SortedMiddleware`, not by an executable test — driving
      `/api/stats` past 60 anonymous requests would prove it, at real cost.
- [ ] `ContactMe`'s Blade view is never rendered by a test, so a variable-name
      typo there would go unnoticed. The four payload keys were checked by hand
      and match.

Judgement calls left as they are, with reasons:

- `Handler::unauthenticated()` hardcodes `'Unauthenticated.'` rather than using
  `$exception->getMessage()` — identical output today.
- The router guard's redirect `next()` calls sit inside the same `try` as the
  fail-open `catch`, so a synchronous throw from `next()` itself could
  double-fire. Not reachable: `next` is a plain callback called with static args.
- `findUser()` returns a `[User|null, JsonResponse|null]` tuple destructured with
  `list()`. Unusual for a Laravel controller; an `HttpResponseException` would
  drop the `if ($error)` boilerplate, but changing it now is churn.
- `ThrottlePerRoute` folds `$route->getName() ?: $request->path()` into the key,
  but no route in `routes/api.php` is named, so the `path()` fallback is what
  actually does the work. Correct either way.
- `ThrottlePerRoute`'s authenticated branch calls `$request->user()` with the
  default guard, which is always null on these token-guarded routes — same as
  the parent class. `/api/stats` and `/api/logout` are therefore keyed by
  IP+path, not by admin identity.
- The logout request has no explicit timeout; a hung request delays local
  session clearing but never blocks it.
- `verify()` is untested for "an admin row exists but with the wrong type", and
  `config/contact.php`'s `env()` default branch is untested. Both would test the
  framework more than the code.

## Out of scope (separate, risky track)

- Dependency upgrades (axios 0.18, Vue 2 → 3, laravel-mix 4). Not mixed with this
  refactor.
- **Device detection specifically.** Measured 2026-08-10: `jenssegers/agent`
  v2.6.3 / `mobiledetect` 2.8.33 (both 2019) still classify iOS 18, Android 15,
  Chrome 140, iPadOS 18 and the modern crawler fleet (Googlebot, Bingbot, GPTBot,
  ClaudeBot, PerplexityBot) correctly, so an upgrade buys nothing. It is also
  blocked: Packagist dropped Composer 1 support on 2025-09-01, Composer 2 breaks
  Laravel 5.7's `PackageManifest`, and Mobile-Detect 3.x needs PHP 7.4+. Upgrading
  cascades into PHP → Laravel → full framework migration.
- **State consolidation** (`state-man.js` vs `store/vueStore.js`). *Removed from
  Phase 4: they do not overlap — `state-man` is UI show/hide (3 components),
  `vueStore` is session + stats (3 components + router).*
- `login.vue` hardcoded `visitor`/`visiting` is an intentional retro-OS easter egg
  (documented in `Home.vue:176`) — left as-is.

## Found during the final whole-branch review (fixed, not planned)

A review of the completed branch surfaced four issues that none of the per-task
reviews could see, because each of them only looked at one task's diff. All four
were fixed before merge.

- **Rate limiting was keyed per IP, not per route.** Laravel 5.7 builds the
  limiter key from `sha1($route->getDomain().'|'.$request->ip())`, so every
  unauthenticated API route shared one counter. Since the router guard calls
  `GET /api/verify` on each visit to `/` or `/Login`, ten page loads a minute
  exhausted the 10/min budget on `POST /api/login` and locked users out with a
  429. Fixed with `App\Http\Middleware\ThrottlePerRoute`, which folds the route
  into the key; every route in `routes/api.php` now uses the `throttle.route`
  alias.
- **`/api/stats` and `/api/logout` were effectively unthrottled.** Their group
  declared `auth:api` before the throttle, so anonymous requests were rejected
  by the guard before the limiter ever ran. The throttle now comes first.
- **A credential change did not revoke the existing API token.** `register()`
  updated the password but left `users.api_token` intact, so an admin changing
  their password after a suspected leak stayed compromised.
- **Logout could fail silently.** The client posted without an explicit
  `Authorization` header, relying on an axios default that is never rehydrated
  from localStorage on page load; a logout fired before that default existed
  went out unauthenticated, was swallowed by an empty `catch`, and left the
  server-side token valid while the UI reported success.

## Verification

After each phase: run the test suite and load the app at
`https://gediminaspalsys.local:8443` (or `https://localhost:8443`). Before
committing frontend changes, run `make node-prod` so `public/` does not carry
unminified dev builds.
