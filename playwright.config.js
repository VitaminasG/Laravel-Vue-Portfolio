import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  // The desktop boot sequence is deliberately slow — it is a retro-OS
  // affectation, not a performance problem — so specs need room to wait it out.
  timeout: 90_000,
  expect: { timeout: 60_000 },

  // The boot animation is driven by requestAnimationFrame, which browsers
  // throttle in background tabs. Running one worker keeps the page in the
  // foreground so the sequence actually advances.
  workers: 1,

  use: {
    // These run inside the node container, so the site is reached over the
    // compose network on nginx's internal port 443 — not the 8443 the host
    // publishes. The hostname resolves because the nginx service declares
    // `gediminaspalsys.local` as a network alias.
    baseURL: process.env.E2E_BASE_URL ?? 'https://gediminaspalsys.local',
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',

    // IndexController picks a layout from the User-Agent, and jenssegers/agent
    // classifies HeadlessChrome as a robot — correctly, since it is one. Left
    // alone, these specs would be served the static crawler layout with no Vue
    // at all, and every assertion about the SPA would fail for the wrong
    // reason. Presenting as a desktop browser is what puts them on the page
    // they are meant to test.
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  },
});
