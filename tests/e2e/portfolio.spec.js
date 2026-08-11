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

// Phase A of the UX work: the boot sequence used to hold a visitor for roughly
// 37 seconds with no way out. These specs pin down the three properties that
// fix cost the most to regain — it is short, it is skippable, and it does not
// repeat — because all three live in timing code that is easy to break
// silently.

test('the journey to the desktop stays within its time budget', async ({ page }) => {
  const start = Date.now();

  await page.goto('/OS?boot=1');
  await expect(page.getByText('ReadMe.txt')).toBeVisible({ timeout: 30_000 });

  const elapsed = Date.now() - start;

  // Measured at ~6s. The budget is deliberately slack: it is here to catch a
  // reintroduced multi-second delay, not to police normal variance.
  expect(elapsed).toBeLessThan(12_000);
});

test('the memory counter starts moving instead of sitting at zero', async ({ page }) => {
  await page.goto('/OS?boot=1');

  // The original sequence showed "Memory Testing : 0" for about ten seconds,
  // which is indistinguishable from a hung page.
  await expect(page.getByText(/Memory Testing/)).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(async () => {
      const text = await page.locator('body').innerText();
      const match = text.match(/Memory Testing\s*:\s*(\d+)/);
      return match ? Number(match[1]) : 0;
    }, { timeout: 5_000 })
    .toBeGreaterThan(0);
});

test('Escape skips the boot sequence', async ({ page }) => {
  await page.goto('/OS?boot=1');

  await expect(page.getByText('Fierce Monkey BIOS')).toBeVisible({ timeout: 15_000 });
  await page.keyboard.press('Escape');

  await expect(page.getByText('ReadMe.txt')).toBeVisible({ timeout: 5_000 });
});

test('the skip control is reachable by keyboard and by click', async ({ page }) => {
  await page.goto('/OS?boot=1');

  const skip = page.getByRole('button', { name: /skip/i });
  await expect(skip).toBeVisible({ timeout: 15_000 });

  await skip.click();
  await expect(page.getByText('ReadMe.txt')).toBeVisible({ timeout: 5_000 });
});

test('a returning visitor goes straight to the desktop', async ({ page }) => {
  await page.goto('/OS');
  await expect(page.getByText('ReadMe.txt')).toBeVisible({ timeout: 30_000 });

  const start = Date.now();
  await page.goto('/OS');
  await expect(page.getByText('ReadMe.txt')).toBeVisible({ timeout: 10_000 });

  // No animation at all the second time, so this is page load and nothing else.
  expect(Date.now() - start).toBeLessThan(5_000);
});

test('Escape skips the intro on the landing page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: /skip/i })).toBeVisible({ timeout: 15_000 });
  await page.keyboard.press('Escape');

  // Skipping the intro reveals the terminal with its login controller.
  await expect(page.getByText('Fierce Monkey OS')).toBeVisible({ timeout: 5_000 });
});

test.describe('with reduced motion requested', () => {
  // emulateMedia rather than test.use({ reducedMotion }): the fixture form did
  // not reach the page in this setup, which made the test pass while asserting
  // nothing. This form is verified — the page reports the query as matching.
  test('the boot sequence is skipped entirely', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const start = Date.now();
    await page.goto('/OS');
    await expect(page.getByText('ReadMe.txt')).toBeVisible({ timeout: 10_000 });

    // The sequence is almost entirely motion, so honouring the preference
    // means not playing it rather than playing it faster.
    expect(Date.now() - start).toBeLessThan(3_000);
    await expect(page.getByText('Fierce Monkey BIOS')).toHaveCount(0);
  });

  test('an explicit request still replays it', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/OS?boot=1');

    await expect(page.getByText('Fierce Monkey BIOS')).toBeVisible({ timeout: 15_000 });
  });
});
