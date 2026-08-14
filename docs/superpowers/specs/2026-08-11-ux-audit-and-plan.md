# UX/UI Audit and Improvement Plan

Measured on 2026-08-11 against the running site, after the Laravel 12 and Vite
migrations. Every number below came from instrumenting the page in a real
browser, not from reading the code.

## The premise

The retro-OS concept is the site's strongest asset and this plan does not touch
it. A portfolio's job is to make someone want to hire the person who built it,
and a boot sequence that behaves like a 1998 desktop is a memorable way to do
that — far better than another card grid.

The problem is the **cost of entry**. Every finding below is a toll a visitor
pays before seeing a single piece of work.

---

## Findings

> **Phases A, B and D are delivered.** The journey to the desktop went from
> ~37 s to ~9 s and can now be skipped; the desktop is operable by keyboard and
> survives a short viewport; and every layout now carries a real title,
> description and link-preview card. Findings 1–3 and 6 below describe the
> state before that work, and the measured results are recorded at the end of
> this document. Findings 4 and 5 — the mobile experience — are unchanged and
> still open.

### 1. Thirty-seven seconds before a visitor can do anything

| Stage | Duration |
| --- | --- |
| `/` — intro text typing until "Press Enter to proceed" | ~9.7 s |
| `/OS` — boot sequence until the desktop is usable | ~27 s |
| **Total** | **~37 s** |

None of this is the application being slow. PHP answers in 10–60 ms and the
bundle is 170 KB. The time is hardcoded:

```
resources/js/components/loadingOne.vue:158   _.throttle(fn, 8000)      // 8 s
resources/js/components/loadingTwo.vue:56    setTimeout(fn, 6500)      // 6.5 s
resources/js/components/loadingOne.vue:130   delay: 3                  // ×several
```

Worse than the total is the shape of it: **for the first 10 seconds nothing on
screen moves.** The memory counter sits at `Memory Testing : 0` while a
`delay: 3` and an 8-second throttle elapse. A visitor has no way to tell a
deliberate animation from a hung page, and no way to skip it.

**Severity: high.** This is the single largest cause of visitors leaving.

### 2. The desktop cannot be used with a keyboard

Three of the four desktop icons are `<a>` elements with **no `href`**, so
browsers do not put them in the tab order. Measured on the live desktop:

```
focusable elements on the whole page:  2
```

Those two are the GitHub link and "Log off". `ReadMe.txt`, `AboutMe.txt` and
`ContactMe.exe` — the actual content — **cannot be opened without a mouse.**

The document also has no headings (`h1`–`h3`: none) and no landmarks (`main`,
`nav`, `header`, `footer`: none), so a screen reader is given a flat list of
text with no structure.

**Severity: high.** Anyone browsing by keyboard, and anyone using assistive
technology, cannot reach the content at all.

### 3. Content becomes unreachable below 667 px of viewport height

```
height the desktop content needs:  667 px
html / body overflow:              hidden
can the page scroll:               no
```

At a 600 px viewport the taskbar sits at y=627 — off screen — and `Github.link`
is cut in half. Because scrolling is disabled, **there is no way to reach
either.**

A 1366×768 laptop, still one of the most common screens, leaves roughly 668 px
after browser chrome. The site is balanced on the edge of breaking on the
hardware a large share of visitors use, and goes over it in any window that is
not full height.

**Severity: high**, and the cheapest of the three to fix.

### 4. The mobile site asks visitors to leave

The mobile experience currently says, verbatim:

> To be able to present a planned browsing experience, please use a Desktop or
> Laptop computer.

A portfolio link is usually opened from LinkedIn, a message or an email — on a
phone. That visitor is being asked to come back later on different hardware,
which most will not do.

Beyond the copy, the page is 1,456 px tall with content ending around 850 px:
roughly **600 px of empty space** before the footer, with a "Scroll Down" prompt
rendered in dark grey on a dark grey background that is nearly invisible. There
are no projects, no CV and no contact form — only social icons.

**Severity: high.** This is likely the majority of traffic, receiving the least.

### 5. The device split is decided by User-Agent, not by screen size

`IndexController` picks a layout from `jenssegers/agent`. Two consequences
measured directly:

- **iPads get the desktop OS.** iPadOS sends a Macintosh User-Agent, so a touch
  device receives an interface built for a mouse pointer.
- **A narrow desktop window still gets the full OS**, squeezed, because the
  viewport is never consulted.

**Severity: medium.** It misroutes a real slice of visitors, and it is the
root cause behind finding 3 having no fallback.

### 6. Almost nothing for search engines or link previews

What a crawler receives:

```
<title>Portfolio</title>
<h1>Portfolio</h1>
2,783 characters of text
links to other pages:    0
meta description:        absent
og: / twitter: tags:     absent
```

Sharing the URL anywhere produces a bare link with no image, no title beyond
"Portfolio", and no description. The name "Gediminas Palsys" does not appear in
the title.

**Severity: medium.** Costs reach rather than usability.

---

## Proposed changes

### Phase A — Entry cost (highest return, lowest risk)

**A1. Cut the journey from ~37 s to under 10 s.** Reduce the hardcoded waits
rather than removing the sequence: the 8-second throttle and the 6.5-second
timeout are the two largest, and the `delay: 3` values can come down together.
Target roughly 6–8 seconds of boot, which still reads as a boot.

**A2. Add a skip control.** A quiet "Skip →" affordance, and Enter/Escape/click
anywhere jumping straight to the desktop. First-time visitors get the effect;
returning visitors and impatient recruiters get the content.

**A3. Remember that a visitor has seen it.** Store a flag; on later visits go
straight to the desktop with the boot available on request. Nobody should watch
the same animation twice.

**A4. Make the first ten seconds move.** Whatever the final duration, something
must be visibly progressing from the first frame — the memory counter should
start immediately rather than after a three-second delay.

### Phase B — Access and layout

**B1. Make the icons real controls.** `<button>` elements, or anchors with an
`href`, so they are focusable and operable by Enter/Space. This is the single
change that makes the content reachable without a mouse.

**B2. Add document structure.** One `h1` naming the person, headings inside the
windows, and `main`/`footer` landmarks.

**B3. Fix the 667 px cliff.** Either allow the desktop to scroll when it does
not fit, or scale the icon grid to the available height. The taskbar should be
pinned so it is never the thing that disappears.

**B4. Visible focus styles.** The dashed retro aesthetic suits focus rings
unusually well — this is a place where accessibility and the theme agree.

### Phase C — Mobile as a first-class experience

**C1. Rewrite the copy.** Remove the request to switch devices. A phone visitor
should be told what they are looking at, not what they are missing.

**C2. Give it content.** The same material the desktop windows hold — the
introduction, the background, a way to make contact — laid out for a phone.
The retro styling carries over; the OS metaphor does not need to.

**C3. Remove the empty space** and either fix or drop the invisible "Scroll
Down" prompt.

**C4. Consider viewport-aware routing.** Keeping the User-Agent split but
adding a viewport check would stop iPads and narrow windows receiving a
mouse-only interface.

### Phase D — Reach

**D1. A real `<title>`** — the person's name and what they do, not "Portfolio".

**D2. Meta description and Open Graph tags**, including an image, so a shared
link looks like something worth opening.

**D3. Give the crawler layout real content and internal links.** It already
renders server-side; it just has nothing in it.

---

## Suggested order

1. **Phase A** — the entry cost is what loses visitors before anything else can
   matter.
2. **Phase B** — mechanical, well-understood, and makes the content reachable
   for everyone.
3. **Phase D** — small, and it increases how many people arrive at all.
4. **Phase C** — the largest piece and the one needing real design decisions,
   worth doing when there is time to do it properly.

## Out of scope

- The retro-OS concept, the wallpaper, the colour scheme and the typeface. They
  work, and they are the reason the site is memorable.
- Vue 3 and GSAP 3. Unrelated to any finding here.
- The boot sequence's existence. Only its duration and its skippability are in
  question.

## How this was measured

Chromium via Playwright against the running site: DOM polling at 150–250 ms for
the animation timeline, `getBoundingClientRect` and `getComputedStyle` for the
layout cliff, direct queries for focusable elements and document structure, a
real iPhone 13 device profile for the mobile capture, and plain `curl` for what
a crawler receives. The four e2e specs added during the Vite migration cover
the paths this work would change.

---

## Phase A result

Measured the same way as the original audit, on the same machine.

| Stage | Before | After |
| --- | --- | --- |
| `/` intro until "Press Enter" | 9.7 s | 3.4 s |
| `/OS` boot until the desktop | 27 s | 5.9 s |
| **Total** | **~37 s** | **~9.3 s** |
| Counter starts moving | ~10 s | 0.7 s |
| Way to skip | none | Escape, or a button |
| Second visit | full sequence again | straight to the desktop |

The timings that produced the original number were scattered across three
components as magic numbers. They now live in
`resources/js/helpers/bootSequence.js`, which also holds the seen-it flag and
the reduced-motion check — so the total is legible as the sum of what that file
says, and tuning it further does not mean hunting through GSAP calls.

Eight e2e specs cover the result: the time budget, the counter moving, both
skip paths, the returning visitor, and reduced motion. The reduced-motion pair
uses `page.emulateMedia` — the `test.use({ reducedMotion })` fixture form did
not reach the page here, and a spec written that way passed while asserting
nothing.

`/OS?boot=1` replays the sequence for anyone who wants to see it again.

### Not done in Phase A

Reducing the wait made the sequence tolerable; it did not make the desktop
reachable. Findings 2 and 3 — the keyboard trap and the 667 px cliff — still
stand, and a visitor who now arrives in 9 seconds instead of 37 arrives at the
same unreachable content. Phase B is the one that fixes that.

---

## Phase B result

| | Before | After |
| --- | --- | --- |
| Focusable elements on the desktop | 2 | 5 |
| Icons openable without a mouse | 1 of 4 | 4 of 4 |
| `h1` / landmarks | 0 / 0 | 1 / 2 |
| Taskbar at a 600 px viewport | off screen at y=627 | fully visible |
| `Github.link` at a 600 px viewport | cut in half, unreachable | in view |

Three of the four icons were `<a>` elements with no `href`, which is why
browsers left them out of the tab order. They are `<button>` now — buttons for
what they do, not for how they look, so every style selects a shared `.d-icon`
class rather than the element and the desktop renders exactly as before.

The height cliff is fixed by wrapping rather than scrolling. Four icons in one
column need 667 px; `flex-wrap` starts a second column when the viewport cannot
give them that, which is what the desktop this borrows from did for the same
reason. The taskbar no longer relies on `margin-top: auto` to find the bottom
of a container that could grow past the screen.

Making the icons reachable meant also making the windows they open closable, or
the fix would have replaced one trap with another. Escape closes a window, the
close button has an accessible name, and focus returns to the icon that opened
it instead of dropping the visitor at the top of the document.

The focus ring reuses the hover treatment — a dotted outline offset from the
icon, which is how the original marked a selected item. Keyboard visibility and
the period look are the same thing here.

Nine e2e specs cover it: tab order across all five controls, the open/close/
return-focus cycle, document structure, every control staying in view at
900×600, and the close button's name. Seventeen specs in total now.

### Not done in Phase B

No focus trap inside an open window — Tab can still leave it for the desktop
behind. Closing works from anywhere, so this is a rough edge rather than a
trap, and a real trap is a larger piece of work than the findings called for.

Findings 4, 5 and 6 stand: the mobile site still asks visitors to leave, the
device split still ignores viewport size, and crawlers still receive almost
nothing.

---

## Phase D result

| | Before | After |
| --- | --- | --- |
| `<title>` | `Portfolio` | `Gediminas Palsys — Full-stack web developer` |
| Meta description | absent | present, under 155 characters |
| `og:` / `twitter:` tags | 0 | 14 |
| Link preview image | none | 1200×630, absolute URL |
| `<h1>` on the crawler page | `Portfolio` | `Gediminas Palsys` |
| Links a crawler can follow | 0 | 3 |

The three layouts each had the same gap, so the fix is one partial
(`resources/views/partials/meta.blade.php`) that all three include, reading
from `config/site.php`. Putting the values in config rather than in Blade means
the title exists in one place instead of three, and can be overridden per
environment.

The preview image is a screenshot of the desktop itself at exactly 1200×630.
It is the honest picture of what the link leads to, it reads at thumbnail size,
and it needed no illustration work — the site already looks like its own poster.

`APP_NAME` stays `Portfolio`: it names the Laravel application, which is a
different question from what a reader should see.

### Found while doing this

The crawler page asked for `/images/gediminas.png` while the file is
`Gediminas.png`. macOS resolves that; a Linux server does not, so the only
image on the only page a search engine ever saw was a broken one in production.
Fixed, and covered by a test that asserts the real filename.

Fifteen PHPUnit tests cover the result, running the title, description,
preview-card and absolute-URL checks against all three layouts rather than
whichever one happened to be checked by hand.

### Not done in Phase D

No structured data (JSON-LD `Person`), no sitemap, no `robots.txt`. Each is
worth having and none was among the findings.

Findings 4 and 5 stand: the mobile site still asks visitors to leave, and the
device split still ignores viewport size. That is Phase C, the one piece that
needs real design decisions rather than mechanical fixes.
