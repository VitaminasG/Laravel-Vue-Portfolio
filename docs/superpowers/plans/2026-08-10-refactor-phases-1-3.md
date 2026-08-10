# Refactor Phases 1–3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the correctness and security defects in the Laravel 5.7 API and Vue router guard, then simplify the backend, without changing what a visitor sees.

**Architecture:** Work proceeds in three phases — correctness, security, simplification — each task driven by a failing test first. The API keeps its existing JSON shapes except where a status code is explicitly corrected. Frontend source changes are committed separately from the compiled `public/` bundle, which is rebuilt once at the end.

**Tech Stack:** Laravel 5.7, PHP 7.3, PHPUnit 7.5, Vue 2, Vuex, vue-router, Laravel Mix 4, Docker.

## Global Constraints

- **All commands run inside Docker.** PHP: `docker exec -i portfolio-php <cmd>`. Node: `docker exec -i portfolio-node <cmd>`. Never run `php` or `npm` on the host.
- **PHP 7.3 syntax only.** No typed properties, no arrow functions, no `match`, no nullsafe `?->`. Array destructuring (`[$a, $b] = ...`) and return type declarations are available.
- **Composer must stay at 1.x.** Never run `composer update` or add dependencies — Packagist dropped Composer 1 support on 2025-09-01 and Composer 2 breaks Laravel 5.7's `PackageManifest`.
- **All in-file content in English** — code comments, docblocks, commit messages, test names.
- **Tests run against sqlite `:memory:`** (configured in `phpunit.xml`). The dev MySQL database is never touched.
- **The full suite must pass after every task:** `docker exec -i portfolio-php vendor/bin/phpunit`. Starting point is 17 passing tests.
- **Do not commit `public/`** until Task 14. Compiled assets are rebuilt once at the end.
- **Existing JSON contracts stay intact** unless a task explicitly changes them: `verify` → `{"check": bool}`, `login` → `{"name", "token", "status"}`, `register` → `{"message", "status"}`, `stats` → `{"data": [...]}`.

---

## File Structure

**Modified — backend:**
- `app/Http/Controllers/API/ApiController.php` — touched by Tasks 1, 2, 7, 9, 10, 11
- `app/Http/Controllers/IndexController.php` — Tasks 4, 6, 12, 13
- `app/Exceptions/Handler.php` — Task 3
- `app/User.php` — Task 10
- `app/Mail/ContactMe.php` — Task 12
- `routes/api.php` — Tasks 7, 8
- `database/migrations/2014_10_12_000000_create_users_table.php` — Task 10

**Created — backend:**
- `config/contact.php` — Task 6

**Modified — frontend:**
- `resources/js/routes.js` — Task 5
- `resources/js/app.js` — Task 5
- `resources/js/helpers/sorter.js` — Task 7
- `resources/js/store/vueStore.js` — Task 7

**Tests:**
- `tests/Feature/AdminAuthTest.php` — extended by Tasks 1, 2, 3, 7, 8, 9
- `tests/Feature/VisitTest.php` — extended by Task 4
- `tests/Feature/ContactTest.php` — created in Task 6, extended by Task 13

---

### Task 1: Guard `verify()` against a missing admin row

**Files:**
- Modify: `app/Http/Controllers/API/ApiController.php:20-35`
- Test: `tests/Feature/AdminAuthTest.php`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `verify()` keeps returning `{"check": bool}` with HTTP 200 in all cases, including an empty users table.

- [ ] **Step 1: Write the failing test**

Add to `tests/Feature/AdminAuthTest.php`, after `test_verify_returns_true_once_the_admin_is_verified`:

```php
    public function test_verify_returns_false_when_no_admin_row_exists()
    {
        User::query()->delete();

        $this->getJson('/api/verify')
            ->assertStatus(200)
            ->assertExactJson(['check' => false]);
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_verify_returns_false_when_no_admin_row_exists`

Expected: FAIL with a 500 response — `ErrorException: Trying to get property 'verified' of non-object`.

- [ ] **Step 3: Write minimal implementation**

Replace the whole `verify()` method body (lines 20-35) with:

```php
    public function verify()
    {
        $user = new User();

        $admin = User::where('type', $user->isAdmin())->first();

        return response()->json([
            'check' => (bool) optional($admin)->verified,
        ]);
    }
```

- [ ] **Step 4: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 18 tests.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/API/ApiController.php tests/Feature/AdminAuthTest.php
git commit -m "Return check:false instead of 500 when no admin row exists"
```

---

### Task 2: Stop mangling passwords with `htmlentities()`

**Files:**
- Modify: `app/Http/Controllers/API/ApiController.php:113`
- Test: `tests/Feature/AdminAuthTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: a password stored by `register()` is byte-identical to what `login()` later checks.

- [ ] **Step 1: Write the failing test**

Add to `tests/Feature/AdminAuthTest.php`:

```php
    public function test_a_password_with_html_characters_survives_register_and_login()
    {
        $password = 'p<a>&"\'ssw0rd';

        $this->postJson('/api/register', [
            'oldEmail' => 'admin@example.com',
            'oldPassword' => '12345678',
            'email' => 'new@example.com',
            'password' => $password,
        ])->assertStatus(201);

        $this->postJson('/api/login', [
            'email' => 'new@example.com',
            'password' => $password,
        ])->assertStatus(200);
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_a_password_with_html_characters_survives_register_and_login`

Expected: FAIL — register returns 201, but login returns 401 `Wrong password!`, because the stored hash covers `p&lt;a&gt;&amp;&quot;&#039;ssw0rd`.

- [ ] **Step 3: Write minimal implementation**

In `register()`, change line 113 from:

```php
        $user->password = Hash::make(htmlentities($validateData['password']));
```

to:

```php
        $user->password = Hash::make($validateData['password']);
```

- [ ] **Step 4: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 19 tests.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/API/ApiController.php tests/Feature/AdminAuthTest.php
git commit -m "Hash the raw password instead of its HTML-escaped form

login() has always checked the raw password, so a password containing
<>&\"' could never be used to sign in after being set through register()."
```

---

### Task 3: Answer 401 instead of 500 for unauthenticated API requests

**Files:**
- Modify: `app/Exceptions/Handler.php`
- Test: `tests/Feature/AdminAuthTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: any unauthenticated request to an `auth:api` route returns HTTP 401 with `{"message": "Unauthenticated."}`, regardless of the `Accept` header.

- [ ] **Step 1: Write the failing test**

Add to `tests/Feature/AdminAuthTest.php`:

```php
    public function test_unauthenticated_request_returns_401_without_a_json_accept_header()
    {
        $this->get('/api/stats')->assertStatus(401);
    }
```

Note the plain `get()`, not `getJson()` — that is the whole point of the test.

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_unauthenticated_request_returns_401_without_a_json_accept_header`

Expected: FAIL with 500 — `Route [login] not defined`.

- [ ] **Step 3: Write minimal implementation**

In `app/Exceptions/Handler.php`, add the import after line 6:

```php
use Illuminate\Auth\AuthenticationException;
```

and add this method after `render()`:

```php
    /**
     * Convert an authentication exception into a response.
     *
     * Every guarded route in this project is an API endpoint, so there is no
     * login page to redirect to.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Auth\AuthenticationException  $exception
     * @return \Illuminate\Http\JsonResponse
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
```

- [ ] **Step 4: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 20 tests.

- [ ] **Step 5: Commit**

```bash
git add app/Exceptions/Handler.php tests/Feature/AdminAuthTest.php
git commit -m "Return 401 JSON for unauthenticated API requests

The default handler redirected to a login route that does not exist,
turning every non-JSON unauthenticated request into a 500."
```

---

### Task 4: Give `index()` a default layout

**Files:**
- Modify: `app/Http/Controllers/IndexController.php:19-54`
- Test: `tests/Feature/VisitTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `index()` always returns a view; no request can produce an empty 200.

**Note for the implementer:** this is a safety net, not a reproducible bug. `Agent::isDesktop()` is `!isMobile() && !isTablet() && !isRobot()`, so one branch always matches today — verified against tablets, smart TVs, consoles, `curl`, `wget` and an empty User-Agent. The test below pins the empty-User-Agent behaviour so the fallback cannot silently regress.

- [ ] **Step 1: Write the failing test**

Add to `tests/Feature/VisitTest.php`:

```php
    public function test_an_empty_user_agent_still_receives_a_layout()
    {
        $this->visit('')
            ->assertStatus(200)
            ->assertSee('/js/app.js', false);
    }
```

- [ ] **Step 2: Run the test**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_an_empty_user_agent_still_receives_a_layout`

Expected: PASS already — it documents current behaviour. If it fails, stop and report, because that contradicts the measurement this task is based on.

- [ ] **Step 3: Add the fallback**

In `IndexController::index()`, replace the closing of the method (the `isRobot()` block and the final brace at lines 49-54) with:

```php
		if ( $agent->isRobot() ) {

			return view( 'layouts.server' );
		}

		// No detector matched — fall back to the full desktop experience.
		return view( 'layouts.master' );
	}
```

- [ ] **Step 4: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 21 tests.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/IndexController.php tests/Feature/VisitTest.php
git commit -m "Fall back to the desktop layout when no agent check matches"
```

---

### Task 5: Rewrite the router guard and wire Vuex correctly

**Files:**
- Modify: `resources/js/routes.js:56-101`
- Modify: `resources/js/app.js:11`

**Interfaces:**
- Consumes: nothing.
- Produces: `beforeEach` calls `next()` exactly once per navigation. Redirect targets are unchanged: `/Register` when unverified, `/Login` when unconfirmed.

**Note:** no PHPUnit coverage exists for the frontend, so Step 4 is a manual browser check. Do not commit `public/` — Task 14 rebuilds it.

- [ ] **Step 1: Rewrite the guard**

Replace lines 56-101 of `resources/js/routes.js` entirely with:

```js
router.beforeEach(async (to, from, next) => {

    if (to.matched.some(record => record.meta.freshLogin)) {

        await store.dispatch('setTarget', {
            list: store.getters.list,
            method: 'get',
            route: 'verify'
        });

        await store.dispatch('freshB', store.getters.target);

        if (!store.getters.verified) {
            return next({ path: '/Register' });
        }
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {

        await store.dispatch('checkStorage');

        if (!store.getters.confirmed) {
            return next({ path: '/Login' });
        }
    }

    next();
});
```

The `redirect: to.fullPath` property is dropped on purpose — nothing in the codebase reads it.

- [ ] **Step 2: Fix the Vuex option name**

In `resources/js/app.js`, change line 11 from:

```js
    vueStore : vueStore,
```

to:

```js
    store : vueStore,
```

- [ ] **Step 3: Rebuild the dev bundle**

Run: `docker exec -i portfolio-node npm run dev`

Expected: `Compiled successfully`.

- [ ] **Step 4: Verify in the browser**

Open `https://gediminaspalsys.local:8443` and check all three paths:

1. `/OS` — boot animation runs through to the desktop.
2. `/Dashboard` with empty localStorage — redirects to `/Login`.
3. `/Login` — the SignIn form renders.

Open DevTools console and confirm there is no `vue-router` warning about `next()` being called multiple times.

- [ ] **Step 5: Commit (source only)**

```bash
git add resources/js/routes.js resources/js/app.js
git commit -m "Call next() exactly once per navigation and wire Vuex as store

The guard ran two independent if/else blocks, so a route matching only one
of them hit a synchronous next() before its async check resolved."
```

---

### Task 6: Move the contact recipient into config

**Files:**
- Create: `config/contact.php`
- Modify: `app/Http/Controllers/IndexController.php:85`
- Modify: `.env.example`
- Test: `tests/Feature/ContactTest.php` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: `config('contact.recipient')` resolves the destination address, defaulting to the previously hardcoded value.

- [ ] **Step 1: Write the failing test**

Create `tests/Feature/ContactTest.php`:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Mail\ContactMe;
use Illuminate\Support\Facades\Mail;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Covers POST /ContactMe: persistence, mail dispatch and the response.
 */
class ContactTest extends TestCase
{
    use RefreshDatabase;

    private function payload()
    {
        return [
            'name' => 'Tester',
            'from' => 'tester@example.com',
            'message' => 'Hello there',
        ];
    }

    public function test_the_message_is_mailed_to_the_configured_recipient()
    {
        Mail::fake();
        config(['contact.recipient' => 'configured@example.com']);

        $this->post('/ContactMe', $this->payload())->assertSuccessful();

        Mail::assertSent(ContactMe::class, function ($mail) {
            return $mail->hasTo('configured@example.com');
        });
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_the_message_is_mailed_to_the_configured_recipient`

Expected: FAIL — the mail goes to the hardcoded `vitaminas.g@gmail.com`, so `hasTo` returns false.

- [ ] **Step 3: Create the config file**

Create `config/contact.php`:

```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Contact Form Recipient
    |--------------------------------------------------------------------------
    |
    | Where messages submitted through the desktop ContactMe.exe window are
    | delivered. The default preserves the address this project shipped with.
    |
    */

    'recipient' => env('CONTACT_RECIPIENT', 'vitaminas.g@gmail.com'),

];
```

- [ ] **Step 4: Use the config value**

In `app/Http/Controllers/IndexController.php`, change line 85 from:

```php
		Mail::to("vitaminas.g@gmail.com")->send(new ContactMe($request));
```

to:

```php
		Mail::to(config('contact.recipient'))->send(new ContactMe($request));
```

- [ ] **Step 5: Document the key**

In `.env.example`, add after the `SSL_KEY=` line:

```
# Where contact form submissions are delivered
CONTACT_RECIPIENT=
```

- [ ] **Step 6: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 22 tests.

- [ ] **Step 7: Commit**

```bash
git add config/contact.php app/Http/Controllers/IndexController.php .env.example tests/Feature/ContactTest.php
git commit -m "Move the contact form recipient into config"
```

---

### Task 7: Add server-side logout

**Files:**
- Modify: `app/Http/Controllers/API/ApiController.php`
- Modify: `routes/api.php`
- Modify: `resources/js/helpers/sorter.js:77-80`
- Modify: `resources/js/store/vueStore.js:143-152`
- Test: `tests/Feature/AdminAuthTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `POST /api/logout` behind `auth:api`, returning `{"message": "Logged out."}` with HTTP 200 and setting `users.api_token` to `null`. Frontend: `sorter` exposes `apiList.post.logout` → `/api/logout`.

- [ ] **Step 1: Write the failing test**

Add to `tests/Feature/AdminAuthTest.php`:

```php
    public function test_logout_clears_the_token_and_invalidates_it()
    {
        $token = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => '12345678',
        ])->json('token');

        $this->postJson('/api/logout', [], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200)
            ->assertJson(['message' => 'Logged out.']);

        $this->assertNull(User::where('email', 'admin@example.com')->first()->api_token);

        $this->getJson('/api/stats', ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(401);
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_logout_clears_the_token_and_invalidates_it`

Expected: FAIL with 405 — the route does not exist.

- [ ] **Step 3: Add the controller method**

In `app/Http/Controllers/API/ApiController.php`, add after the `stats()` method:

```php
    /**
     * Invalidate the current API token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        $user = auth('api')->user();

        $user->api_token = null;
        $user->save();

        return response()->json([
            'message' => 'Logged out.',
        ], 200);
    }
```

- [ ] **Step 4: Register the route**

In `routes/api.php`, change the last line from:

```php
Route::middleware('auth:api')->get('/stats','API\ApiController@stats');
```

to:

```php
Route::middleware('auth:api')->group(function () {
    Route::get('/stats', 'API\ApiController@stats');
    Route::post('/logout', 'API\ApiController@logout');
});
```

- [ ] **Step 5: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 23 tests.

- [ ] **Step 6: Expose the endpoint to the frontend**

In `resources/js/helpers/sorter.js`, change the `post` block (lines 77-80) from:

```js
            post: {
                register: apiP + 'register',
                verify: apiP + 'login',
            },
```

to:

```js
            post: {
                register: apiP + 'register',
                verify: apiP + 'login',
                logout: apiP + 'logout',
            },
```

- [ ] **Step 7: Call it from the Vuex logout action**

In `resources/js/store/vueStore.js`, replace the `logout` action (lines 143-152) with:

```js
        logout({commit, getters}){

            // Clear the local session even if the request fails, so the user is
            // never stuck in a half-logged-in state.
            return axios.post(getters.list.post.logout)
                .catch(() => {})
                .then(() => {
                    depot.clearStore();
                    delete window.axios.defaults.headers.common['Authorization'];
                    commit('setStorage');
                });
        }
```

- [ ] **Step 8: Rebuild and verify in the browser**

Run: `docker exec -i portfolio-node npm run dev`

Then sign in at `https://gediminaspalsys.local:8443/Login` with the current admin credentials, open `/Dashboard`, click **Logout**, and confirm in DevTools → Network that `POST /api/logout` returns 200 and that you land on `/`.

- [ ] **Step 9: Commit**

```bash
git add app/Http/Controllers/API/ApiController.php routes/api.php tests/Feature/AdminAuthTest.php resources/js/helpers/sorter.js resources/js/store/vueStore.js
git commit -m "Invalidate the API token on logout

Logging out only cleared localStorage; the token stayed valid on the server
forever. The new endpoint clears it, and the client calls it before wiping
its own state."
```

---

### Task 8: Tighten the API routes

**Files:**
- Modify: `routes/api.php`
- Test: `tests/Feature/AdminAuthTest.php`

**Interfaces:**
- Consumes: the `auth:api` group from Task 7.
- Produces: `POST /api/login` and `POST /api/register` limited to 10 requests per minute; `GET /api/register` no longer routed; `GET /api/verify` unchanged.

- [ ] **Step 1: Write the failing tests**

Add both to `tests/Feature/AdminAuthTest.php`:

```php
    public function test_register_is_not_reachable_over_get()
    {
        $this->getJson('/api/register')->assertStatus(405);
    }

    public function test_login_is_throttled_after_ten_attempts()
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/login', [
                'email' => 'admin@example.com',
                'password' => 'wrong',
            ])->assertStatus(401);
        }

        $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong',
        ])->assertStatus(429);
    }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_register_is_not_reachable_over_get`

Expected: FAIL — returns 401, because `GET /api/register` is routed to `register()`.

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_login_is_throttled_after_ten_attempts`

Expected: FAIL — the 11th attempt returns 401, because bare `throttle` means 60 requests per minute.

- [ ] **Step 3: Rewrite the route file**

Replace the entire contents of `routes/api.php` with:

```php
<?php

Route::get('/verify', 'API\ApiController@verify');

Route::post('/register', 'API\ApiController@register')->middleware('throttle:10,1');
Route::post('/login', 'API\ApiController@login')->middleware('throttle:10,1');

Route::middleware('auth:api')->group(function () {
    Route::get('/stats', 'API\ApiController@stats');
    Route::post('/logout', 'API\ApiController@logout');
});
```

`GET /register` is gone: a GET request must never invoke a credential change. `GET /verify` stays — `sorter.js` uses it.

- [ ] **Step 4: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 25 tests.

- [ ] **Step 5: Commit**

```bash
git add routes/api.php tests/Feature/AdminAuthTest.php
git commit -m "Throttle auth endpoints to 10/min and drop GET /api/register

A GET request invoked the credential change; bare throttle allowed 60/min."
```

---

### Task 9: Return 403 from `stats()` for a non-admin

**Files:**
- Modify: `app/Http/Controllers/API/ApiController.php:130-150`
- Test: `tests/Feature/AdminAuthTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `GET /api/stats` returns 403 for an authenticated non-admin; the admin response `{"data": [...]}` with HTTP 200 is unchanged.

**Note for the implementer:** `isAdmin()` currently returns the *string* `'admin'`, not a boolean, so `! $user->isAdmin()` would always be false. This task keeps the existing comparison style; Task 10 converts it to a real boolean.

- [ ] **Step 1: Write the failing test**

Add to `tests/Feature/AdminAuthTest.php`. `App\User` and `Illuminate\Support\Facades\Hash` are already imported at the top of the file; `Str` is referenced by its fully qualified name below, so no new import is needed:

```php
    public function test_stats_returns_403_for_an_authenticated_non_admin()
    {
        $visitor = User::create([
            'name' => 'visitor',
            'email' => 'visitor@example.com',
            'password' => Hash::make('password123'),
            'type' => User::default(),
            'api_token' => \Illuminate\Support\Str::random(80),
        ]);

        $this->getJson('/api/stats', ['Authorization' => 'Bearer ' . $visitor->api_token])
            ->assertStatus(403);
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_stats_returns_403_for_an_authenticated_non_admin`

Expected: FAIL — returns 200 with `{"message": "You are not Admin!"}`.

- [ ] **Step 3: Write minimal implementation**

Replace the whole `stats()` method (lines 130-150) with:

```php
    public function stats()
    {
        $user = new User();

        if (auth('api')->user()->type !== $user->isAdmin()) {

            return response()->json([
                'message' => 'You are not Admin!',
            ], 403);
        }

        return response()->json([
            'data' => StatResource::collection(Stats::latest()->take(5)->get()),
        ], 200);
    }
```

- [ ] **Step 4: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 26 tests.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/API/ApiController.php tests/Feature/AdminAuthTest.php
git commit -m "Return 403 instead of 200 when a non-admin requests stats"
```

---

### Task 10: Replace the role map with constants

**Files:**
- Modify: `app/User.php:31-69`
- Modify: `app/Http/Controllers/API/ApiController.php` (three call sites)
- Modify: `database/migrations/2014_10_12_000000_create_users_table.php:21,31`
- Modify: `tests/Feature/AdminAuthTest.php` (the Task 9 test)

**Interfaces:**
- Consumes: the `stats()` shape from Task 9.
- Produces: `User::ROLE_ADMIN` (`'admin'`), `User::ROLE_DEFAULT` (`'user'`), and `isAdmin(): bool`. The methods `returnRole()`, `admin()`, `default()` and the `$roles` property no longer exist.

**Note:** safe because `'su'` appears nowhere outside `User.php`, and the database contains only `type='admin'`. This changes no stored data.

- [ ] **Step 1: Write the failing test**

Add to `tests/Feature/AdminAuthTest.php`:

```php
    public function test_is_admin_returns_a_real_boolean()
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $this->assertTrue($admin->isAdmin());

        $visitor = new User(['type' => User::ROLE_DEFAULT]);

        $this->assertFalse($visitor->isAdmin());
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_is_admin_returns_a_real_boolean`

Expected: FAIL — `Undefined class constant 'ROLE_DEFAULT'`.

- [ ] **Step 3: Rewrite the role logic**

In `app/User.php`, delete the `$roles` property, `returnRole()`, `isAdmin()`, `admin()` and `default()` — everything from `protected $roles = [` to the end of `default()` — and replace with:

```php
    const ROLE_ADMIN = 'admin';
    const ROLE_DEFAULT = 'user';

    /**
     * Check if the user has the admin role.
     *
     * @return boolean
     */
    public function isAdmin()
    {
        return $this->type === self::ROLE_ADMIN;
    }
```

- [ ] **Step 4: Update the three controller call sites**

In `app/Http/Controllers/API/ApiController.php`:

`verify()` becomes:

```php
    public function verify()
    {
        $admin = User::where('type', User::ROLE_ADMIN)->first();

        return response()->json([
            'check' => (bool) optional($admin)->verified,
        ]);
    }
```

In `login()`, replace the `$admin = new User();` line (near the top of the method) by deleting it, and change:

```php
        if($user->type === $admin->isAdmin()){
```

to:

```php
        if($user->isAdmin()){
```

In `stats()`, replace the guard:

```php
    public function stats()
    {
        if (! auth('api')->user()->isAdmin()) {

            return response()->json([
                'message' => 'You are not Admin!',
            ], 403);
        }

        return response()->json([
            'data' => StatResource::collection(Stats::latest()->take(5)->get()),
        ], 200);
    }
```

- [ ] **Step 5: Update the migration**

In `database/migrations/2014_10_12_000000_create_users_table.php`, change line 21 from `User::default()` to `User::ROLE_DEFAULT`, and line 31 from `User::admin()` to `User::ROLE_ADMIN`.

- [ ] **Step 6: Update the Task 9 test**

In `tests/Feature/AdminAuthTest.php`, in `test_stats_returns_403_for_an_authenticated_non_admin`, change `'type' => User::default(),` to `'type' => User::ROLE_DEFAULT,`.

- [ ] **Step 7: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 27 tests.

- [ ] **Step 8: Commit**

```bash
git add app/User.php app/Http/Controllers/API/ApiController.php database/migrations/2014_10_12_000000_create_users_table.php tests/Feature/AdminAuthTest.php
git commit -m "Replace the role map with constants and a boolean isAdmin()

isAdmin() returned the string 'admin' under a @return boolean docblock, so
every caller had to compare it against a type column by hand."
```

---

### Task 11: Deduplicate credential checking and drop the empty stubs

**Files:**
- Modify: `app/Http/Controllers/API/ApiController.php`

**Interfaces:**
- Consumes: `User::ROLE_ADMIN` and `isAdmin()` from Task 10.
- Produces: private `findUser($emailKey, $passwordKey)` returning `[User|null, JsonResponse|null]`. The 401 bodies (`Wrong email address!` / `Wrong password!`) are unchanged.

- [ ] **Step 1: Confirm the existing tests cover this**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter AdminAuthTest`

Expected: PASS. `test_login_fails_with_an_unknown_email`, `test_login_fails_with_a_wrong_password` and `test_register_rejects_wrong_old_credentials` already pin the behaviour this refactor must preserve — no new test is needed for a pure extraction.

- [ ] **Step 2: Add the private helper**

In `app/Http/Controllers/API/ApiController.php`, add before `verify()`:

```php
    /**
     * Resolve a user from request credentials.
     *
     * @param  string  $emailKey
     * @param  string  $passwordKey
     * @return array  [User|null, JsonResponse|null]
     */
    private function findUser($emailKey, $passwordKey)
    {
        $user = User::where('email', request($emailKey))->first();

        if (! $user) {
            return [null, response()->json([
                'message' => 'Wrong email address!',
                'status' => 401,
            ], 401)];
        }

        if (! Hash::check(request($passwordKey), $user->password)) {
            return [null, response()->json([
                'message' => 'Wrong password!',
                'status' => 401,
            ], 401)];
        }

        return [$user, null];
    }
```

- [ ] **Step 3: Use it in `login()`**

Replace the body of `login()` down to (and including) the `Hash::check` block with:

```php
    public function login()
    {
        list($user, $error) = $this->findUser('email', 'password');

        if ($error) {
            return $error;
        }

        if ($user->isAdmin()) {
```

so the method reads: helper call, early return, admin check, token issue, else-branch unchanged.

- [ ] **Step 4: Use it in `register()`**

Replace the opening of `register()` down to (and including) its `Hash::check` block with:

```php
    public function register()
    {
        list($user, $error) = $this->findUser('oldEmail', 'oldPassword');

        if ($error) {
            return $error;
        }
```

The validation block and everything after it stay as they are.

- [ ] **Step 5: Delete the empty stubs**

Delete the `store()`, `show()`, `update()` and `destroy()` methods entirely (the four `//`-bodied methods at the end of the class). No route references them.

Then remove the now-unused import at the top of the file:

```php
use Illuminate\Http\Request;
```

- [ ] **Step 6: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 27 tests — the same count as Task 10, since this is a pure refactor.

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/API/ApiController.php
git commit -m "Extract the shared credential lookup and drop the empty stubs"
```

---

### Task 12: Make `ContactMe` queue-safe

**Files:**
- Modify: `app/Mail/ContactMe.php`
- Modify: `app/Http/Controllers/IndexController.php:85`
- Test: `tests/Feature/ContactTest.php`

**Interfaces:**
- Consumes: `config('contact.recipient')` from Task 6.
- Produces: `new ContactMe(array $payload)` where `$payload` has keys `name`, `from`, `body`, `agent`. The Blade view `emails.contactMe` receives exactly those variables, as it does today.

- [ ] **Step 1: Write the failing test**

Add to `tests/Feature/ContactTest.php`:

```php
    public function test_the_mailable_carries_a_plain_payload()
    {
        Mail::fake();

        $this->post('/ContactMe', $this->payload(), ['User-Agent' => 'TestAgent/1.0'])
            ->assertSuccessful();

        Mail::assertSent(ContactMe::class, function ($mail) {
            return $mail->payload['name'] === 'Tester'
                && $mail->payload['from'] === 'tester@example.com'
                && $mail->payload['body'] === 'Hello there'
                && $mail->payload['agent'] === 'TestAgent/1.0';
        });
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_the_mailable_carries_a_plain_payload`

Expected: FAIL — `Undefined property: App\Mail\ContactMe::$payload`.

- [ ] **Step 3: Rewrite the mailable**

Replace `app/Mail/ContactMe.php` entirely with:

```php
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactMe extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @var array
     */
    public $payload;

    /**
     * Create a message instance.
     *
     * @param  array  $payload  keys: name, from, body, agent
     * @return void
     */
    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.contactMe')->with($this->payload);
    }
}
```

- [ ] **Step 4: Update the caller**

In `app/Http/Controllers/IndexController.php`, change the `Mail::to(...)` line to:

```php
		Mail::to(config('contact.recipient'))->send(new ContactMe([
			'name' => $request->name,
			'from' => $request->from,
			'body' => $request->message,
			'agent' => $request->header('User-Agent'),
		]));
```

- [ ] **Step 5: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 28 tests.

- [ ] **Step 6: Commit**

```bash
git add app/Mail/ContactMe.php app/Http/Controllers/IndexController.php tests/Feature/ContactTest.php
git commit -m "Pass a plain payload to ContactMe instead of the whole Request

A Request cannot be serialised onto a queue, so the mailable could never
be queued as its Queueable trait suggests."
```

---

### Task 13: Clean up `IndexController@store`

**Files:**
- Modify: `app/Http/Controllers/IndexController.php:62-87`
- Test: `tests/Feature/ContactTest.php`

**Interfaces:**
- Consumes: the `ContactMe` payload shape from Task 12.
- Produces: `POST /ContactMe` returns HTTP 200 with `{"message": "Message sent."}`. `mailMe.vue` checks `response.status === 200`, so the client is unaffected.

- [ ] **Step 1: Write the failing tests**

Add both to `tests/Feature/ContactTest.php`:

```php
    public function test_a_submission_is_stored_and_answered_with_json()
    {
        Mail::fake();

        $this->postJson('/ContactMe', $this->payload(), ['User-Agent' => 'TestAgent/1.0'])
            ->assertStatus(200)
            ->assertExactJson(['message' => 'Message sent.']);

        $this->assertSame(1, \DB::table('indices')->count());
    }

    public function test_a_submission_without_a_message_is_rejected()
    {
        Mail::fake();

        $this->postJson('/ContactMe', ['name' => 'Tester', 'from' => 'tester@example.com'])
            ->assertStatus(422);

        Mail::assertNothingSent();
    }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker exec -i portfolio-php vendor/bin/phpunit --filter test_a_submission_is_stored_and_answered_with_json`

Expected: FAIL — the response body is empty, so `assertExactJson` fails.

- [ ] **Step 3: Rewrite `store()`**

Replace the whole `store()` method (lines 62-87) with:

```php
    public function store(Request $request){

		$this->validate($request, [

			'name' => 'required',

			'from' => 'required',

			'message' => 'required'

			]);

		$agent = $request->header('User-Agent');

		$data = new Index;

		$data->name = $request->name;
		$data->from = $request->from;
		$data->message = $request->message;
		$data->agent = $agent;

		$data->save();

		Mail::to(config('contact.recipient'))->send(new ContactMe([
			'name' => $request->name,
			'from' => $request->from,
			'body' => $request->message,
			'agent' => $agent,
		]));

		return response()->json([
			'message' => 'Message sent.',
		], 200);
	}
```

The dynamic `$request->agent = ...` assignment is gone; the header is read into a local variable used in both places.

- [ ] **Step 4: Run the full suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 30 tests.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/IndexController.php tests/Feature/ContactTest.php
git commit -m "Return a JSON response from the contact endpoint

Also drops the dynamic \$request->agent property in favour of a local
variable read from the header."
```

---

### Task 14: Rebuild the production bundle

**Files:**
- Modify: `public/js/app.js`, `public/css/app.css`, `public/js/mobile/mobile.js`, `public/css/mobile/mobileApp.css`, `public/mix-manifest.json`

**Interfaces:**
- Consumes: the frontend source changes from Tasks 5 and 7.
- Produces: `public/` back in minified production form, matching the committed source.

- [ ] **Step 1: Build**

Run: `docker exec -i portfolio-node npm run prod`

Expected: `Compiled successfully`. `public/js/app.js` should be roughly 400–450 KB, not ~2 MB, and `public/mix-manifest.json` entries carry `?id=` hashes again.

- [ ] **Step 2: Verify the app end to end**

Open `https://gediminaspalsys.local:8443` and confirm:

1. `/` — boot sequence runs.
2. `/OS` — desktop appears; `ReadMe.txt` opens on double-click.
3. `/Login` → sign in → `/Dashboard` shows stats.
4. Logout → `POST /api/logout` returns 200 → back at `/`.
5. Re-opening `/Dashboard` redirects to `/Login`.

- [ ] **Step 3: Run the full suite one final time**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: PASS, 30 tests.

- [ ] **Step 4: Commit**

```bash
git add public/
git commit -m "Rebuild production assets"
```

- [ ] **Step 5: Check off the plan**

In `REFACTORING.md`, mark every Phase 1, 2 and 3 item `- [x]`. Phase 4 stays unchecked.

```bash
git add REFACTORING.md
git commit -m "Check off phases 1-3 in the refactoring plan"
```

---

## Notes for the implementer

- **Test count checkpoints:** 17 at the start, then 18, 19, 20, 21 (Task 4), 22 (Task 6), 23 (Task 7), 25 (Task 8), 26 (Task 9), 27 (Task 10), 27 (Task 11 — pure refactor), 28 (Task 12), 30 (Task 13). If a count does not match, stop and investigate before continuing.
- **Task 11 adds no test on purpose.** It is a pure extraction covered by three existing tests; adding a test for a private helper would pin an implementation detail.
- **Tasks 5 and 7 touch the frontend** and have no automated coverage. Their browser checks are not optional — they are the only verification those changes get.
- **If the throttle test in Task 8 turns out to be flaky** because the array cache carries a rate-limit counter between tests, add `$this->artisan('cache:clear');` at the start of that test rather than weakening the assertion.
