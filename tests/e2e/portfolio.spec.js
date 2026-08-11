import { test, expect } from '@playwright/test';

// The frontend has no other automated coverage, so these specs are the safety
// net for build changes. They assert what a visitor sees rather than how it is
// produced, which is what makes them survive a change of build tool.
//
// The desktop boot sequence runs on GSAP and takes roughly 25 seconds by
// design, so the waits here are long on purpose.

test('the OS boots through to the desktop', async ({ page }) => {
  await page.goto('/OS');

  // The BIOS screen is the first thing GSAP animates in; if this never
  // appears, the bundle did not load or Vue did not mount.
  await expect(page.getByText('Fierce Monkey BIOS')).toBeVisible();

  // Reaching the desktop means the whole animation chain ran to completion,
  // including the scramble text that drives the final step.
  await expect(page.getByText('ReadMe.txt')).toBeVisible({ timeout: 60_000 });
});

test('the desktop shows its four icons and the taskbar', async ({ page }) => {
  await page.goto('/OS');

  for (const label of ['ReadMe.txt', 'AboutMe.txt', 'ContactMe.exe', 'Github.link']) {
    await expect(page.getByText(label)).toBeVisible({ timeout: 60_000 });
  }

  await expect(page.getByText('Log off')).toBeVisible();
});

test('ReadMe.txt opens and renders its content', async ({ page }) => {
  await page.goto('/OS');

  await page.getByText('ReadMe.txt').click({ timeout: 60_000 });

  // The window chrome and its text come from separate components, so checking
  // both catches a lazily-imported component failing to resolve.
  await expect(page.getByText('textPad')).toBeVisible();
  await expect(page.getByText('Fierce Monkey OS')).toBeVisible();
});

test('the dashboard redirects a visitor with no session to the login form', async ({ page }) => {
  await page.goto('/Dashboard');

  // Exercises the router guard and the Vuex session state together.
  await expect(page).toHaveURL(/\/Login$/);
  await expect(page.getByText('SignIn')).toBeVisible();
});
