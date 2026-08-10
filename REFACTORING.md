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

## Verification

After each phase: run the test suite and load the app at
`https://gediminaspalsys.local:8443` (or `https://localhost:8443`). Before
committing frontend changes, run `make node-prod` so `public/` does not carry
unminified dev builds.
