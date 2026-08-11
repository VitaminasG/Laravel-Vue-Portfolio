import depot from './depot';

/**
 * Everything that governs how long the boot sequence takes, and whether a
 * given visitor sits through it at all.
 *
 * The timings used to live as magic numbers inside loadingOne, loadingTwo and
 * Home — an 8000 here, a `delay: 3` there — which is how they quietly added up
 * to a 37-second wait before anyone saw the desktop. Keeping them together
 * makes the total legible: it is the sum of what is written below, and nothing
 * else.
 *
 * Durations in seconds belong to GSAP tweens. Durations in milliseconds belong
 * to setTimeout and lodash throttle. The suffix on each key says which.
 */
export const TIMING = {

  // The BIOS header — the first thing on screen, so it starts immediately.
  // Anything that delays this is time the page spends looking broken.
  bios: {
    fadeIn: 0.6,
    stagger: 1,
  },

  // The memory test. Its counter running up to 131072 is the one moment of
  // the sequence that reads as a machine doing work, so it keeps a duration
  // long enough to see the digits move.
  memory: {
    fadeIn: 0.25,
    stagger: 0.15,
    gap: '+=0.05',
    counter: 0.6,
    target: 131072,
  },

  // The scrambled text that resolves into readable words, letter by letter.
  scramble: {
    reveal: 0.15,
    stagger: 0.05,
    settle: 0.4,
  },

  // Throttle window collapsing one after-appear per letter into a single
  // step. It is also, in effect, how long the finished BIOS screen is held
  // before the sequence moves on.
  biosHoldMs: 700,

  // The logo screen.
  logo: {
    fadeIn: 1,
    stagger: 0.4,
    riseFrom: -150,
  },

  // How long the logo screen is held before the desktop replaces it.
  logoHoldMs: 1400,

  // The intro terminal on `/`.
  //
  // settleMs dominates the total. The prompt appears once countStep reaches 7,
  // and the throttle it is fed through advances that counter at most once per
  // window — so the intro costs roughly six times this number no matter how
  // fast the text itself types. The lines are short (9 to 38 characters), so
  // the window only has to outlast the gap between letters, not a whole line.
  intro: {
    charDelayMs: 25,
    revealChar: 0.1,
    settleMs: 400,
    afterMessageMs: 600,
    beforePromptMs: 350,
    fadeIn: 0.5,
  },

  // The social icons in the footer. They used to wait 22 seconds.
  footer: {
    fadeIn: 0.6,
    delay: 1.2,
    stagger: 0.15,
    riseFrom: 50,
  },
};

const SEEN_KEY = 'bootSeen';

/**
 * Has this visitor already sat through the boot sequence?
 *
 * Nobody should watch the same animation twice. A returning visitor goes
 * straight to the desktop.
 */
export function hasSeenBoot() {
  return depot.getLoc(SEEN_KEY) === true;
}

/**
 * Record that the desktop has been reached, however the visitor got there —
 * by watching the sequence or by skipping it. Skipping is a deliberate signal
 * that they do not want it, so it counts just as much as watching.
 */
export function rememberBoot() {
  depot.setLoc(SEEN_KEY, true);
}

/**
 * Does the visitor's system ask for reduced motion?
 *
 * The sequence is almost entirely motion, so honouring this means skipping it
 * rather than shortening it.
 */
export function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * `/OS?boot=1` replays the sequence for someone who has already seen it, and
 * gives the e2e specs a way to exercise the full chain regardless of what is
 * in localStorage.
 */
export function bootWasRequested() {
  return new URLSearchParams(window.location.search).get('boot') === '1';
}

/**
 * Should this visit go straight to the desktop?
 */
export function shouldSkipBoot() {
  if (bootWasRequested()) {
    return false;
  }

  return prefersReducedMotion() || hasSeenBoot();
}
