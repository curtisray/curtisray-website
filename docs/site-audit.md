# Site audit and refinement

Completed locally on October 6, 2026. Baseline: commit `88473b4`, the version previously deployed to GitHub and Vercel. The original Claude prototype folder had already been deleted during the earlier cleanup, so this review used the implemented design, retained image sources, pre-change screenshots, and all seven routes. It does not claim a comparison against unavailable original prototype files.

## Result

The site now has a documented design system, smaller initial delivery, consistent shared controls, and feature-owned styles and scripts. The cloud/meadow composition, editorial pages, colored bookshelf, image crops, and black penguin footer remain recognizable. Audit changes are released through the repository’s main branch and existing Vercel production integration.

## Resolved findings

Locations below point to the maintained implementation, not deleted baseline code.

- `src/styles/tokens.css:1` — fixed: scattered font families, spacing, sizes, colors, and border values now have shared roles and scales.
- `src/styles/global.css:1` — fixed: Tailwind scanned skill examples and generated unused utilities; scanning is now limited to application source.
- `src/design/motion.ts:2` — fixed: unrelated transition durations/easing now share one timing palette in CSS and Motion.
- `src/components/Contact.tsx:12` — fixed: manual width/height measurement, global composer handlers, small form text, undersized close targets, and focus stealing on outside dismissal.
- `src/components/Contact.astro:1` — fixed: native disclosure renders immediately; its full Motion/React enhancement loads when opened.
- `src/design/useReducedMotionPreference.ts:1` — fixed: the installed Motion 13 hook captures an initial preference; the shared subscription responds to live preference changes.
- `src/styles/shelf.css:38` — fixed: an open book could exceed the remaining rail width at intermediate sizes. The panel now accounts for rail width and project count.
- `src/scripts/shelf.ts:1` — fixed: selection links previously prevented normal hash navigation and lacked an active indicator. Native anchors, deep links, modifier clicks, and selected states now work together.
- `src/components/FooterLines.tsx:24` — fixed: the shared script performed footer layout reads during page scrolling. Footer-only Motion values now drive transforms without scroll-triggered React state updates.
- `src/components/TechList.astro:3` — fixed: full-size raster logos were downloaded for 40px icons. Astro now generates 80px WebP assets.
- `src/styles/fonts.css:1` — fixed: external Google Fonts stylesheet and font connections. Font files are local, with swap rendering and a targeted serif preload.
- `src/layouts/BaseLayout.astro:24` — fixed: canonical and Open Graph URLs were absent.
- `src/pages/agent-skills.astro:1` — removed unused install-command rendering, styles, clipboard listeners, and empty data scaffolding. The published page retains its honest coming-soon state.
- `src/scripts/site.ts:1` — removed unrelated contact, shelf, clipboard, hover-color, and footer work from the global script. It now owns only scrolling and lifecycle cleanup.
- `public/favicon.svg:1` — replaced the Astro scaffold icon with a small monochrome C mark.
- `.agents/skills/deploy-to-vercel/Archive.zip` — removed unused archived skill resources; installed skill files remain.
- `package.json` — patched dependency audit findings. A scoped `path-to-regexp` 6.3.0 override preserves the current Astro adapter.

Source, styles, and markup are formatted consistently. README and AGENTS now point future work to the design system.

## Delivery measurements

Measured from local production build artifacts against the baseline build. KB below means decimal kilobytes. Gzip values are local compression estimates, not measured CDN transfer sizes.

| Asset group                           |                            Before |        After | Change            |
| ------------------------------------- | --------------------------------: | -----------: | ----------------- |
| Generated CSS, total raw              |                           36.2 KB |      20.0 KB | About 45% smaller |
| Generated CSS, summed gzip            |                           8.46 KB |      5.95 KB | About 30% smaller |
| Initial homepage external JS, gzip    |                           9.41 KB | About 7.1 KB | About 25% smaller |
| Three raster logo delivery files, raw |                          378.8 KB |       4.0 KB | About 99% smaller |
| External font origins                 |                                 2 |            0 | Fonts self-hosted |
| npm audit vulnerabilities             | 7 found during dependency refresh |            0 | Resolved          |

The JavaScript comparison excludes inline Astro bootstrap code. Full Motion and React increase the total JavaScript available after interaction compared with the original mini API; that is a deliberate stack change, not a total bundle-size reduction. Production browser resource checks confirm React is absent from the initial load. The contact panel requests it when opened; footer code loads near the viewport; shelf Motion enhancement loads on interaction. These measurements do not establish a Lighthouse score or real-user Core Web Vitals.

High-resolution image sources remain in the repository as build inputs. Their file sizes are not the sizes delivered to visitors.

## Verification

- Astro type check: zero errors, warnings, or hints.
- Production build: all seven pages generated successfully.
- Dependency audit: zero vulnerabilities.
- Production routes at 1440px, 390px, and 320px: one H1 each, main landmark, correct canonical, no horizontal page overflow, and no external font requests.
- Axe WCAG 2 A/AA and 2.1 AA scans: no violations on all seven pages at desktop and mobile widths. Open contact panels also passed at 1440px, 390px, and 320px.
- Shelf geometry at 1440px, 1024px, 900px, and 768px: visible first spine, right edge aligned to viewport, no page overflow.
- Desktop shelf collapse: left edge moved from approximately 490px to 1008px at 1440px; the right edge stayed at 1440px.
- Real wheel input over the shelf: page moved downward and upward; rail vertical scroll remained zero.
- Shelf keyboard activation, exclusive expansion, hash selection, active menu state, and mobile project selection passed.
- Contact keyboard opening, Escape/focus restoration, tab dismissal, outside click dismissal, and retained drafts passed.
- Touch emulation: native scrolling, 16px form inputs, and opening the form without automatically focusing a text field passed.
- Reduced-motion changes applied without reloading: Lenis disabled, shelf transitions disabled, footer lines removed; restoring the preference restored the footer effect.
- JavaScript disabled: native shelf and contact disclosures opened and page content remained available.
- Browser interaction checks completed with no page errors. Desktop/mobile screenshots were visually reviewed.

These checks used Chromium, including touch and viewport emulation. They are not a substitute for physical iOS/Android or Safari testing, assistive-technology testing, or production field measurements.

## Intentional limits

- `src/styles/shelf.css` retains a short desktop width transition for the established accordion geometry. It is the documented exception to the transform/opacity preference. Reassess if the project list grows or device profiling shows dropped frames.
- Contact still prepares a mailto draft. There is no email-delivery backend, and no message was sent during testing.
- AI preparedness, approach/process, learn agentic development, and agent skills still need published content. This audit does not invent that content or remove those routes.
- A dedicated social preview image has not been supplied.
- The locally licensed Tailwind documentation snapshot is initialized and gitignored.
- Release status is tracked by the GitHub commit and its Vercel production deployment.

## Review references

The interface review followed the [current Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), with the project's visual direction taking precedence over generic stylistic preferences. Island delivery follows [Astro's framework component guidance](https://docs.astro.build/en/guides/framework-components/). Animation uses [full Motion for React](https://motion.dev/docs/react) and the project's animation skills. Tailwind source detection was checked against the initialized local official documentation snapshot.
