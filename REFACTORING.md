# Refactoring Plan

Full-project code review + simplification of the Laravel 5.7 / Vue 2 portfolio.
Each item lists `file:line` and the intended fix. Check items off as they land.

## Phase 0 — Safety net (tests first)

- [ ] Feature tests for the admin auth flow: `GET /api/verify`, `POST /api/login`,
      `POST /api/register` (credential change), `GET /api/stats` (auth + non-auth).
- [ ] Feature test for `IndexController`: desktop / mobile / robot layout selection
      and that a visit records a `Stats` row.
- [ ] Tests run against an isolated database (sqlite :memory:) so the dev DB is untouched.

## Phase 1 — Correctness bugs

- [ ] `resources/js/routes.js:56-101` — `beforeEach` calls `next()` twice (two
      independent if/else blocks, plus sync/async race on `freshLogin` routes).
      Rewrite as a single guard with correct async flow.
- [ ] `app/Http/Controllers/API/ApiController.php:20-35` — `verify()` crashes (500)
      when no admin row exists (`$admin->verified` on null). Guard for null.
- [ ] `resources/js/app.js:11` — `vueStore: vueStore` should be `store: vueStore`
      so Vuex is wired to `$store`.
- [ ] `ApiController.php:113` — drop `htmlentities()` around the password before
      `Hash::make()` (it mangles passwords containing `<>&"'`).
- [ ] `app/Http/Controllers/IndexController.php:19-54` — `index()` returns nothing
      for unmatched agents (empty 200); add a default. Decide whether robots should
      be recorded in `Stats`.

## Phase 2 — Security

- [ ] `IndexController.php:85` — hardcoded recipient `vitaminas.g@gmail.com` →
      move to `config`/`.env` (e.g. `CONTACT_RECIPIENT`).
- [ ] `vueStore.js` logout + `ApiController` — server keeps the `api_token` valid
      forever; logout only clears localStorage. Add server-side token invalidation.
- [ ] `routes/api.php:10-11` — set explicit throttle (e.g. `throttle:10,1`) and drop
      the pointless `GET /register` / `GET /verify` duplicates where unused.

## Phase 3 — Backend simplification

- [ ] `app/User.php:31-69` — `isAdmin()` returns a string (misleading); `admin()` /
      `default()` duplicate the `$roles` map. Consolidate role logic (bool `isAdmin()`
      + clear role constants).
- [ ] `ApiController.php` — extract the repeated "find user + check password" block;
      remove the empty resource stubs `store/show/update/destroy` (158-195).
- [ ] `app/Mail/ContactMe.php` — stop passing the whole `Request`; pass a plain
      payload (name/from/message/agent) so the mailable is queue-safe.
- [ ] `IndexController.php:74` — read the User-Agent header directly instead of
      assigning the dynamic `$request->agent` property.

## Phase 4 — Frontend simplification

- [ ] `resources/js/components/testing.vue` — delete (dead code, never imported).
- [ ] Remove leftover `console.log` calls (~31 across `.vue`/`.js`).
- [ ] Consolidate state: `state-man.js` vs `store/vueStore.js` — keep one source of truth.
- [ ] `helpers/sorter.js:78` — rename the misleading `post.verify` key (→ `login`);
      simplify the `apiList` / `setTarget` / `target` indirection for a few endpoints.
- [ ] Extract the duplicated dashed-box SCSS (statistics, ApiLogin, ApiRegister,
      textEditor) into shared classes.
- [ ] `views/Dashboard.vue:18-22,36` — remove the always-rendered "Access Denied"
      leftover; make `username` reactive (computed instead of `data`).

## Out of scope (separate, risky track)

- Dependency upgrades (axios 0.18, Vue 2 → 3, laravel-mix 4). Not mixed with this refactor.
- `login.vue` hardcoded `visitor`/`visiting` is an intentional retro-OS easter egg
  (documented in `Home.vue:176`) — left as-is.

## Verification

After each phase: run the test suite and load the app at `https://localhost:8443`.