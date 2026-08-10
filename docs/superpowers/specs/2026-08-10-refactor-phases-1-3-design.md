# Refactor Phases 1–3 — Design

Scope agreed on 2026-08-10. Covers correctness, security and backend
simplification from `REFACTORING.md`, plus three findings discovered while
verifying that document against the current code. Frontend simplification
(Phase 4) stays out of this pass.

## Verification of the original plan

Every claim in `REFACTORING.md` was checked against the code before planning.
Most held; four were inaccurate and are restated here so the plan is built on
what the code actually does.

| Original claim | Actual finding |
| --- | --- |
| `app.js:11` — Vuex is not wired to `$store` | True, but harmless: no component uses `this.$store`. All four consumers import `store` directly. It is a misleading line, not a defect. |
| `routes.js` — `beforeEach` calls `next()` twice | The double call is real, but redirects still work in practice (`/Dashboard` without a token does land on `/Login`). This is a race and a fragility, not an open auth hole. |
| `state-man.js` vs `vueStore.js` — keep one source of truth | They do not overlap: `state-man` is UI show/hide (3 components), `vueStore` is session + stats (3 components + router). Merging is debatable and stays out of scope. |
| Drop the pointless `GET /register` / `GET /verify` duplicates | `GET /verify` **is** used by `sorter.js` and must stay. `GET /register` is worse than pointless: a GET request invokes the credential change. |

`index()` returning nothing for an unmatched agent is **theoretical**. Since
`isDesktop()` is `!isMobile() && !isTablet() && !isRobot()`, at least one branch
always matches — verified against tablets, smart TVs, consoles, `curl`, `wget`
and an empty User-Agent. A default is still added as a safety net.

Confirmed without correction: `verify()` crashing on a missing admin row,
`htmlentities()` around the password, the hardcoded recipient, `isAdmin()`
returning a string under a `@return boolean` docblock, `testing.vue` being
unreferenced, exactly 31 `console.log` calls, the always-rendered "Access
Denied" block, and `ContactMe` receiving the whole `Request`.

### Findings not in the original plan

1. `GET /api/stats` without a token returns **500, not 401** — the exception
   handler tries to redirect to a `login` route that does not exist. Masked in
   practice because axios sends `Accept: application/json`.
2. `ApiController::stats()` returns **200 with an error message** for a
   non-admin; it should be 403.
3. `IndexController@store` (`POST /ContactMe`) returns **no response** at all.

## Approach

Work is sliced **by phase**, following the existing document: correctness, then
security, then simplification. Bugs land first, so stopping at any point still
leaves a working result. `ApiController` is touched in three separate passes;
each change is small and independent, so the cost is low.

Each item is driven by a test: a failing test first, then the fix. The existing
`AdminAuthTest` and `VisitTest` already cover the auth and visit flows, so most
changes get immediate feedback.

## Phase 1 — Correctness

**1.1 `resources/js/routes.js`** — rewrite the guard as a single `async`
function where `next()` is called exactly once on every path:

```js
router.beforeEach(async (to, from, next) => {
    if (to.matched.some(r => r.meta.freshLogin)) {
        await store.dispatch('setTarget', { list: store.getters.list, method: 'get', route: 'verify' });
        await store.dispatch('freshB', store.getters.target);
        if (!store.getters.verified) return next({ path: '/Register' });
    }
    if (to.matched.some(r => r.meta.requiresAuth)) {
        await store.dispatch('checkStorage');
        if (!store.getters.confirmed) return next({ path: '/Login' });
    }
    next();
});
```

Observable behaviour is unchanged; the race disappears. `redirect: to.fullPath`
is dropped — nothing reads it.

**1.2 `ApiController::verify()`** — guard against a missing admin row so an
empty table yields `{"check": false}` instead of a 500.

**1.3 `resources/js/app.js:11`** — `vueStore:` becomes `store:`. Nothing breaks
(no component uses `$store`), but Vuex is wired correctly.

**1.4 `ApiController::register()`** — drop `htmlentities()` around the password
before `Hash::make()`. This is a fix, not a regression: `login()` already checks
the raw password, so a password containing `<>&"'` cannot work today.

**1.5 `IndexController::index()`** — return the desktop layout as the default
for an unmatched agent. Robot visits keep being recorded in `Stats`.

**1.6 `app/Exceptions/Handler.php`** — always answer 401 JSON for an
unauthenticated API request instead of redirecting to a non-existent route.

## Phase 2 — Security

**2.1** Hardcoded recipient moves to `config/contact.php`, reading
`env('CONTACT_RECIPIENT', 'vitaminas.g@gmail.com')`. The current address stays
as the fallback so nothing breaks; `.env.example` documents the key.

**2.2** New `POST /api/logout` behind `auth:api`, clearing `users.api_token`.
The Vuex `logout` action calls it before clearing localStorage and the
`Authorization` header. If the request fails, localStorage is cleared anyway —
a user must never end up stuck in a half-logged-in state.

**2.3 `routes/api.php`** — `throttle:10,1` on `login` and `register` (bare
`throttle` currently means 60/min); remove `GET /register`; keep `GET /verify`.

**2.4 `ApiController::stats()`** — 403 for a non-admin instead of 200 with an
error message.

## Phase 3 — Backend simplification

**3.1 `app/User.php`** — replace `$roles`, `returnRole()`, `admin()` and
`default()` with constants, and make `isAdmin()` match its docblock:

```php
const ROLE_ADMIN = 'admin';
const ROLE_DEFAULT = 'user';

public function isAdmin(): bool
{
    return $this->type === self::ROLE_ADMIN;
}
```

Safe: `'su'` appears only inside `User.php`, and the database contains only
`type='admin'`. The users migration and three `ApiController` call sites move to
the constants.

**3.2 `ApiController`** — extract the repeated "find user + check password"
block shared by `login()` and `register()` into a private method; delete the
four empty resource stubs, which no route references.

**3.3 `app/Mail/ContactMe.php`** — accept a plain payload array
(name/from/message/agent) instead of the whole `Request`, making the mailable
queue-safe.

**3.4 `IndexController`** — replace the dynamic `$request->agent` property with
a local variable, and return a JSON response from `store()`. `mailMe.vue`
checks `response.status === 200`, so the contract holds.

## Testing

Each change starts with a failing test. New coverage needed:

- `verify()` against an empty users table.
- A password containing HTML characters surviving register → login.
- `POST /api/logout` clearing the token, and the cleared token being rejected.
- `stats()` returning 403 for a non-admin.
- Throttling rejecting the 11th login attempt within a minute.
- `POST /ContactMe` returning a JSON body.

The suite runs against sqlite `:memory:`, so no change touches the dev database.

## Out of scope

**Dependency upgrades**, including the device-detection package. Measured on
2026-08-10, `jenssegers/agent` v2.6.3 (2019) still classifies iOS 18, Android
15, Chrome 140, iPadOS 18 and the modern crawler fleet (Googlebot, Bingbot,
GPTBot, ClaudeBot, PerplexityBot) correctly, so an upgrade buys nothing. It is
also blocked: Packagist dropped Composer 1 support on 2025-09-01, Composer 2
breaks Laravel 5.7's `PackageManifest`, and Mobile-Detect 3.x needs PHP 7.4+.
Upgrading would cascade into PHP → Laravel → full framework migration, which is
its own project.

**Phase 4 (frontend simplification)** — the 31 `console.log` calls, dead
`testing.vue`, duplicated dashed-box SCSS, the `sorter.js` `post.verify`
naming, and the Dashboard "Access Denied" leftover. Deferred because it is the
one area the test suite does not cover, so it needs manual browser verification.

**State consolidation** (`state-man.js` vs `vueStore.js`) — the two serve
different purposes, as established above.

## Verification

After each phase: run `vendor/bin/phpunit` and load the app at
`https://gediminaspalsys.local:8443`. Before committing frontend changes, run
`make node-prod` so `public/` does not carry unminified dev builds.
