# Frontend Build Modernisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Laravel Mix with Vite and refresh the browser-facing packages, with the site behaving exactly as it does today.

**Architecture:** The safety net comes first — four Playwright specs written and passing against the current Mix build, so any later regression is caught by a test rather than by eye. Then Node and the packages move, then the build tool, then Blade switches to `@vite()`. The Vue components and GSAP calls are not edited at any point.

**Tech Stack:** Vite 7, `laravel-vite-plugin`, Node 22 LTS, Vue 2.7.16, vue-router 3.6.5, vuex 3.6.2, axios 1.x, GSAP 2.1.2 (unchanged), Playwright.

## Global Constraints

- **All commands run inside Docker.** Node: `docker exec -i portfolio-node <cmd>`. PHP: `docker exec -i portfolio-php <cmd>`. Never run `npm` or `php` on the host.
- **Work on the branch `frontend-vite`.** Never commit to `master`.
- **All in-file content in English** — comments, commit messages, test names.
- **Do not edit any `.vue` file's `<template>` or `<script>` block, and do not change any GSAP call.** This pass changes how the code is built, not what it does. If a component genuinely must change to build at all, stop and report it rather than editing quietly.
- **Do not touch `app/`, `routes/`, `config/`, `database/` or `tests/Feature`.** The backend is finished.
- The PHP suite must stay at **37 tests, 169 assertions** throughout — it should be unaffected, and a change there means something went wrong.
- The site is reached at `https://gediminaspalsys.local:8443`. Allow ~28 seconds after loading `/OS` for the boot sequence.
- **Never commit with either suite red.**

---

## File Structure

**Created:**
- `tests/e2e/portfolio.spec.js` — the four Playwright specs
- `playwright.config.js`
- `vite.config.js`

**Modified:**
- `package.json` — dependencies and scripts
- `.docker/node/Dockerfile` or `docker-compose.yml` — Node 22
- `resources/views/layouts/master.blade.php`, `mobile.blade.php`, `server.blade.php`, `test.blade.php`
- `.gitignore` — `public/build/`, Playwright artifacts

**Deleted:**
- `webpack.mix.js`
- `public/js/app.js`, `public/js/mobile/mobile.js`, `public/css/app.css`, `public/css/mobile/mobileApp.css`, `public/mix-manifest.json`

**Untouched:** every file under `resources/js/` and `resources/sass/`.

---

### Task 1: Write the Playwright safety net against the current build

**Files:**
- Create: `tests/e2e/portfolio.spec.js`, `playwright.config.js`
- Modify: `package.json` (devDependency + script), `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm run test:e2e` running four specs green against the **current Mix build**.

These must pass before anything else changes. A safety net written after the change proves nothing.

- [ ] **Step 1: Install Playwright**

Run: `docker exec -i portfolio-node npm install --save-dev @playwright/test`

Node 12 may refuse the current Playwright. If it does, note the error and move Task 2 (Node 22) ahead of this one, then come back — the ordering matters less than having the specs before the *build* changes.

- [ ] **Step 2: Write the config**

Create `playwright.config.js`:

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // The boot sequence is deliberately slow — it is a retro-OS affectation, not
  // a performance problem — so specs need room to wait it out.
  timeout: 60_000,
  expect: { timeout: 40_000 },
  use: {
    baseURL: 'https://gediminaspalsys.local:8443',
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
  },
});
```

- [ ] **Step 3: Write the four specs**

Create `tests/e2e/portfolio.spec.js`:

```js
import { test, expect } from '@playwright/test';

// The desktop boot sequence runs on GSAP and takes roughly 25 seconds by
// design. These specs exist because the frontend has no other coverage: they
// are the safety net for build changes, so they assert what a visitor sees
// rather than how it is produced.

test('the OS boots through to the desktop', async ({ page }) => {
  await page.goto('/OS');
  await expect(page.getByText('Fierce Monkey BIOS')).toBeVisible();
  await expect(page.getByText('ReadMe.txt')).toBeVisible({ timeout: 45_000 });
});

test('the desktop shows its four icons and the taskbar', async ({ page }) => {
  await page.goto('/OS');
  for (const label of ['ReadMe.txt', 'AboutMe.txt', 'ContactMe.exe', 'Github.link']) {
    await expect(page.getByText(label)).toBeVisible({ timeout: 45_000 });
  }
  await expect(page.getByText('Log off')).toBeVisible();
});

test('ReadMe.txt opens and renders its content', async ({ page }) => {
  await page.goto('/OS');
  await page.getByText('ReadMe.txt').click({ timeout: 45_000 });
  await expect(page.getByText('textPad')).toBeVisible();
  await expect(page.getByText('Fierce Monkey OS')).toBeVisible();
});

test('the dashboard redirects a visitor with no session to the login form', async ({ page }) => {
  await page.goto('/Dashboard');
  await expect(page).toHaveURL(/\/Login$/);
  await expect(page.getByText('SignIn')).toBeVisible();
});
```

- [ ] **Step 4: Add the script and ignore the artifacts**

In `package.json` scripts, add `"test:e2e": "playwright test"`.

In `.gitignore`, add `/test-results/` and `/playwright-report/`.

- [ ] **Step 5: Run them against the current build**

Run: `docker exec -i portfolio-node npx playwright install --with-deps chromium`
Run: `docker exec -i portfolio-node npm run test:e2e`

Expected: 4 passed. If any fails now, the spec is wrong — fix the spec, not the site, because the site currently works.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e playwright.config.js package.json package-lock.json .gitignore
git commit -m "Add Playwright specs covering what the PHP suite cannot

The frontend has no automated coverage, so a build change would be verified
only by someone noticing something looked wrong. These four specs assert what
a visitor sees: the boot sequence completing, the desktop rendering, a window
opening, and the router guard redirecting.

They pass against the current Mix build. That is the point — a safety net
written after a change proves nothing about the change."
```

---

### Task 2: Move the node container to Node 22

**Files:**
- Modify: `docker-compose.yml` (the `node` service image)

**Interfaces:**
- Consumes: nothing.
- Produces: a `portfolio-node` container running Node 22 LTS.

- [ ] **Step 1: Change the image**

In `docker-compose.yml`, the `node` service uses `node:12-buster-slim`. Change it to `node:22-bookworm-slim`.

- [ ] **Step 2: Recreate and reinstall**

```bash
docker compose up -d --force-recreate node
docker exec -i portfolio-node node --version
```

Expected: `v22.x`.

The 2019 `node_modules` tree was built for Node 12 and will not work. Remove it and reinstall:

```bash
docker exec -i portfolio-node rm -rf node_modules
docker exec -i portfolio-node npm install
```

Expect noise, and possibly failure — `node-sass` is not in this project (it uses `sass`, which is pure JS), but `laravel-mix` 4 pulls a webpack 4 tree that predates Node 22. **If `npm install` fails outright, say so and move to Task 3 without a working Mix build** — Mix is being deleted anyway, and blocking on it would be repairing something on its way out.

- [ ] **Step 3: Record the state**

Report whether the Mix build still runs (`npm run prod`) on Node 22. Either answer is fine and neither blocks the next task; what matters is that the report says which it was.

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml package-lock.json
git commit -m "Move the node container to Node 22 LTS

Node 12 has been end-of-life since April 2022. The lockfile is regenerated
rather than patched: the 2019 tree was resolved for Node 12 and nothing about
it is worth preserving through the Vite migration that follows."
```

---

### Task 3: Install Vite and the updated packages

**Files:**
- Modify: `package.json`
- Create: `vite.config.js`
- Delete: `webpack.mix.js`

**Interfaces:**
- Consumes: Node 22 from Task 2.
- Produces: `npm run build` producing hashed assets under `public/build/`.

- [ ] **Step 1: Rewrite the dependency block**

Replace `devDependencies` and `dependencies` in `package.json` with:

```json
    "devDependencies": {
        "@playwright/test": "^1.48.0",
        "@vitejs/plugin-vue2": "^2.3.1",
        "axios": "^1.7.0",
        "gsap": "^2.1.2",
        "laravel-vite-plugin": "^1.0.0",
        "lodash": "^4.17.21",
        "sass": "^1.77.0",
        "vite": "^7.0.0",
        "vue": "^2.7.16"
    },
    "dependencies": {
        "bulma": "^0.7.4",
        "es6-promise": "^4.2.6",
        "mobile-device-detect": "^0.2.3",
        "vue-router": "^3.6.5",
        "vuex": "^3.6.2"
    }
```

`vue-template-compiler` is removed on purpose: Vue 2.7 merges it into the main package, and leaving both installed produces a version mismatch at build time.

`gsap` stays at `^2.1.2`. It already ships an ESM entry, which is all Vite needs.

Replace the `scripts` block's Mix entries with:

```json
        "dev": "vite",
        "build": "vite build",
        "test:e2e": "playwright test"
```

- [ ] **Step 2: Write the Vite config**

Create `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue2';

export default defineConfig({
  plugins: [
    laravel({
      // Two independent bundles: the desktop SPA and the much smaller mobile
      // app, chosen server-side by IndexController.
      input: [
        'resources/js/app.js',
        'resources/js/mobile.js',
        'resources/sass/app.scss',
        'resources/sass/mobileApp.scss',
      ],
      refresh: true,
    }),
    vue(),
  ],
  server: {
    // The dev server runs inside the node container, so it must listen on all
    // interfaces and tell the browser a host it can actually reach.
    host: '0.0.0.0',
    port: 8080,
    hmr: { host: 'localhost', protocol: 'ws', port: 8091 },
  },
});
```

- [ ] **Step 3: Install and delete the old config**

```bash
docker exec -i portfolio-node rm -rf node_modules package-lock.json
docker exec -i portfolio-node npm install
git rm webpack.mix.js
```

- [ ] **Step 4: Build**

Run: `docker exec -i portfolio-node npm run build`

Expected: a successful build writing to `public/build/` with a `manifest.json`.

This is where a genuine incompatibility would surface — most likely GSAP's `gsap/all` import or `resources/js/app.js`'s `require('./bootstrap')`, which is CommonJS in an ESM build. **If `require()` is the problem, changing that one line to `import './bootstrap';` is within scope** — it is build syntax, not application behaviour. Anything larger, stop and report.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Replace Laravel Mix with Vite

Mix 4 is webpack 4 and carries most of the 600-odd advisories npm reports, none
of which ever reached a browser. Vite replaces it with a fraction of the tree.

Vue moves 2.6 to 2.7.16 because @vitejs/plugin-vue2 will not accept 2.6; 2.7 is
the final Vue 2 release and exists as a compatibility bridge.
vue-template-compiler is removed rather than upgraded — 2.7 merges it in, and
keeping both causes a version mismatch.

axios 0.18 to 1.x and lodash 4.17.13 to 4.17.21 close the only advisories that
actually shipped to browsers. GSAP stays at 2.1.2: it already provides an ESM
entry, so Vite needs nothing from it, and rewriting 32 calls is a separate job."
```

---

### Task 4: Point Blade at the Vite manifest

**Files:**
- Modify: `resources/views/layouts/master.blade.php`, `mobile.blade.php`, `server.blade.php`, `test.blade.php`
- Delete: `public/js/app.js`, `public/js/mobile/mobile.js`, `public/css/app.css`, `public/css/mobile/mobileApp.css`, `public/mix-manifest.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: a working `npm run build` from Task 3.
- Produces: pages served with hashed asset URLs resolved through the manifest.

- [ ] **Step 1: Switch each layout**

`master.blade.php` currently has `<link rel="stylesheet" href="/css/app.css"/>` in the head and `<script src="/js/app.js"></script>` before `</body>`. Replace both with a single directive in the head:

```blade
    @vite(['resources/sass/app.scss', 'resources/js/app.js'])
```

`mobile.blade.php` — same shape, with `resources/sass/mobileApp.scss` and `resources/js/mobile.js`.

`server.blade.php` — CSS only, no JS: `@vite(['resources/sass/app.scss'])`.

`test.blade.php` — same as `master`.

- [ ] **Step 2: Remove the committed build output**

```bash
git rm public/js/app.js public/js/mobile/mobile.js public/css/app.css public/css/mobile/mobileApp.css public/mix-manifest.json
```

In `.gitignore`, add `/public/build/`.

These files have been in the repository since 2019. They are generated output, and with hashed filenames they cannot be meaningfully tracked.

- [ ] **Step 3: Verify each device path**

```bash
UA_DESK='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
UA_MOB='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
curl -sk -A "$UA_DESK" https://localhost:8443/ | grep -oE '/build/assets/[^"]+'
curl -sk -A "$UA_MOB"  https://localhost:8443/ | grep -oE '/build/assets/[^"]+'
curl -sk https://localhost:8443/ | grep -c 'id="server"'
```

Expected: desktop and mobile reference different hashed bundles, and the crawler layout still renders.

Then confirm the hashed files are actually served — a 404 here means nginx is not serving `public/build/`:

```bash
ASSET=$(curl -sk -A "$UA_DESK" https://localhost:8443/ | grep -oE '/build/assets/[^"]+\.js' | head -1)
curl -sk -o /dev/null -w "%{http_code}\n" "https://localhost:8443$ASSET"
```

Expected: 200.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Serve assets through the Vite manifest

The Blade layouts hardcoded /js/app.js and /css/app.css, which is why the
Laravel 12 migration could leave the frontend untouched. That decoupling is
given up here in exchange for cache busting that works: @vite() resolves
hashed filenames through the manifest, where the old mix-manifest.json carried
?id= hashes no template ever read.

The compiled bundles committed since 2019 are deleted. They are generated
output, and hashed filenames cannot be tracked meaningfully."
```

---

### Task 5: Prove the site still behaves

**Files:** none — verification only.

**Interfaces:**
- Consumes: everything above.
- Produces: evidence, from the specs written in Task 1.

- [ ] **Step 1: Run the safety net**

Run: `docker exec -i portfolio-node npm run test:e2e`

Expected: the same 4 passed as in Task 1. This is the whole reason those specs were written first.

If the boot spec fails, GSAP is not running under Vite — report it with the console output rather than working around it.

- [ ] **Step 2: Run the PHP suite**

Run: `docker exec -i portfolio-php vendor/bin/phpunit`

Expected: 37 tests, 169 assertions. It should be untouched; a change means this pass reached further than intended.

- [ ] **Step 3: Look at the site**

Take a screenshot of `/OS` after the boot sequence and compare it against what the site looked like before this branch. The wallpaper, the four icons, the taskbar clock and the dashed panels on `/Login` should be pixel-identical — no CSS was edited, so any visual difference means the SCSS pipeline changed something.

- [ ] **Step 4: Check the dev server**

Run `docker exec -i portfolio-node npm run dev` in the background, load the site, and confirm the page loads with the dev server rather than the built assets. This is the part most likely to be misconfigured inside Docker, and it is worth knowing now rather than the next time someone tries to work on the frontend.

Report whether HMR actually applies a change without a reload. If it does not, say so plainly — it is a known rough edge of running Vite in a container, not a blocker.

- [ ] **Step 5: Commit any fixes, then update the docs**

`CLAUDE.md` describes the frontend commands as `npm run dev` / `watch` / `prod` under a "Laravel Mix / webpack" heading, and the architecture section names Mix. Update both, and note that `public/build/` is generated.

```bash
git add -A
git commit -m "Update the docs for the Vite build"
```

---

## Notes for the implementer

- **Task 1 must pass before Task 3 changes anything.** If the specs are written after the build changes, they encode whatever the new build does, including its bugs.
- **Do not edit `.vue` files.** The single exception is `resources/js/app.js`'s `require('./bootstrap')` if the ESM build rejects it; that is build syntax, not behaviour. Anything else, stop and report.
- **`npm install` failing on Node 22 with the old Mix tree is expected and fine.** Mix is deleted in the next task. Do not spend time repairing it.
- **The PHP suite is a canary, not a target.** It should read 37/169 at every point. If it moves, this pass touched something it should not have.
