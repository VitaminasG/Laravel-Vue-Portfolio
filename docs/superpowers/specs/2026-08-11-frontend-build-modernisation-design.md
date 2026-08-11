# Frontend Build Modernisation — Design

Scope agreed on 2026-08-11, directly after the Laravel 12 migration. Replaces
the asset build and refreshes the packages that reach a browser. The Vue
application itself is not rewritten.

## Why this, and why not more

With the backend on Laravel 12 / PHP 8.4, the frontend is the only part of the
project still on end-of-life tooling: Laravel Mix 4 (webpack 4), Node 12,
Vue 2.6.

`npm audit` reports 623 vulnerabilities, which sounds alarming and mostly is
not: over 600 of them are in the build toolchain — webpack, laravel-mix and
their transitive dependencies — which run inside a container at build time and
never reach a browser. Replacing the build removes them as a side effect
rather than as the goal.

The genuinely user-facing risk is narrow, and was identified by checking which
packages actually end up in the bundle rather than trusting the audit summary:

| Package | Installed | Issue |
| --- | --- | --- |
| axios | 0.18.0 | SSRF and DoS advisories; carries every API request |
| lodash | 4.17.13 | prototype pollution, fixed in 4.17.21 |
| vue | 2.6.10 | end of life since December 2023, no further patches |
| gsap | 2.1.2 | no advisories, simply an old line |

`npm audit --production` reports zero, which is misleading: this project keeps
`vue`, `axios`, `gsap` and `lodash` under `devDependencies` following Laravel's
own convention, because Mix bundles them at build time. They ship regardless of
which section they sit in.

**Vue 3 is deliberately out of scope**, and so is GSAP 3. GSAP drives the boot
sequence that is this site's whole character — 32 calls across 8 files — and
moving to GSAP 3 means rewriting every one of them (`TweenMax.to` → `gsap.to`,
`Power1.easeIn` → `"power1.in"`). Combining that with Vue 3's breaking changes
in exactly the animation-heavy components would make a failure hard to
attribute. This pass changes how the code is built, not what it does.

## What changes

| Piece | From | To |
| --- | --- | --- |
| Build tool | Laravel Mix 4 (webpack 4) | Vite 7 + `laravel-vite-plugin` |
| Node | 12 | 22 LTS |
| Vue | 2.6.10 | 2.7.16 |
| vue-router / vuex | 3.0.6 / 3.1.0 | 3.6.5 / 3.6.2 |
| axios | 0.18.0 | 1.x |
| lodash | 4.17.13 | 4.17.21 |
| GSAP | 2.1.2 | **unchanged** |
| Vue components | — | **unchanged** |

**Vue 2.7 is a requirement rather than a preference.** `@vitejs/plugin-vue2`
declares `vue: ^2.7.0-0`, so 2.6 cannot be used with it. Vue 2.7 is the final
Vue 2 release, published specifically as a compatibility bridge — it backports
the Composition API without removing anything — so the risk is a minor version
bump across 15 components, not a rewrite.

**GSAP stays on 2.1.2 and needs no changes.** Its package declares
`module: index.js`, so the ESM entry Vite needs already exists, and the
`gsap/all` and `gsap/TweenMax` paths the components import resolve to ES
modules in the package root rather than the CommonJS build under `umd/`.

## Asset serving moves to Laravel's convention

Today the Blade layouts hardcode `/js/app.js` and `/css/app.css`. That is why
the Laravel 12 migration could leave the frontend untouched — the two halves
were completely decoupled. This pass gives that up on purpose, in exchange for
cache busting that actually works.

Blade moves to the `@vite()` directive, and the build writes hashed filenames
under `public/build/` with a manifest. Four layouts change: `master`, `mobile`,
`server` and `test`.

Consequence worth stating plainly: `public/js/app.js`, `public/js/mobile/mobile.js`,
`public/css/app.css` and `public/css/mobile/mobileApp.css` are deleted from the
repository. Those files have been committed since 2019. Their replacement is
generated and hashed, which is what makes cache busting correct — the current
`mix-manifest.json` carries `?id=` hashes that no Blade template ever reads.

## Testing: a safety net before the change, not after

The backend migration was safe to attempt because 37 tests would catch a
regression. The frontend has no automated coverage at all, so the same
migration would be verified only by a person clicking through the site.

Four Playwright specs are therefore written **before** the build changes, and
run before and after:

| Spec | What a failure would mean |
| --- | --- |
| `/OS` boots through to the desktop | GSAP no longer runs — the largest risk in this change |
| Four icons and the taskbar render | asset paths or CSS broke |
| `ReadMe.txt` opens on click and shows its text | Vue component resolution broke |
| `/Dashboard` redirects to `/Login` | the router guard or Vuex broke |

They are committed as a permanent asset rather than thrown away, since the
frontend will need them again for any future Vue 3 attempt.

## Risks

**The Vite dev server inside Docker** needs `server.host` set to `0.0.0.0` and
an explicit HMR host, or the browser cannot reach it. The node container
already publishes port 8091, which the dev server can use.

**`npm install` on Node 22 will resolve a materially different tree** from the
2019 lockfile. The lockfile is regenerated rather than patched, and the
Playwright specs are what establish that the result still behaves.

**Vue 2.7 changes how `.vue` files are compiled** — it merges
`vue-template-compiler` into the main package. `vue-template-compiler` is
therefore removed rather than upgraded; leaving both installed causes a version
mismatch error at build time.

## Out of scope

- Vue 3, GSAP 3, and the Composition API.
- Bulma 0.7, which has no advisories and whose classes are used throughout the
  SCSS; upgrading it is a visual-regression exercise, not a build concern.
- The two-bundle split (desktop and mobile). It stays exactly as it is; Vite
  handles multiple entry points natively.
- Anything under `app/`, `routes/`, `config/` or `tests/Feature`. The backend
  is finished and this pass does not touch it.
