# Design system

The visual identity is editorial: Garamond copy, monospaced annotations, a handwritten brand, overlapping photographs, thin rules, and colored book spines. Preserve that composition when extending the site.

## Sources of truth

- `src/styles/tokens.css`: type families, semantic colors, spacing, text sizes, line heights, and border rules.
- `src/design/motion.ts`: durations and easing. `BaseLayout.astro` derives CSS variables from these same values.
- `src/styles/fonts.css`: self-hosted Latin WOFF2 fonts, with swap rendering. Preload only the normal Garamond face.
- `src/styles/global.css`: resets, focus, brand, shared link behavior, and reduced-motion overrides.
- `contact.css`, `home.css`, `shelf.css`, `footer.css`, `editorial.css`: feature styles imported by their owning Astro component or layout.
- `src/data/projects.ts`: project colors, image crops, titles, and captions. Project colors are intentional variations, not alternate interface themes.

Tailwind scans only `src/`. Documentation, skills, build output, and examples must never generate site utilities. The licensed Tailwind documentation snapshot stays local and is gitignored.

## Typography

| Role    | Token            | Size     | Use                                 |
| ------- | ---------------- | -------- | ----------------------------------- |
| Caption | `--text-caption` | 12px     | Small annotations, mobile metadata  |
| Label   | `--text-label`   | 14px     | Mono navigation, controls, captions |
| Body    | `--text-body`    | 17–20px  | Editorial row descriptions          |
| Lead    | `--text-lead`    | 23–30px  | Intro copy and main navigation      |
| Title   | `--text-title`   | 32–44px  | Project and row titles              |
| Section | `--text-section` | 40–72px  | My work                             |
| Display | `--text-display` | 48–104px | Developer page titles               |

Sizes are expressed in rem with fluid interpolation. Body copy uses weight 400; headings use 500. Use Garamond for content, IBM Plex Mono for annotations and controls, and Reenie Beanie only for the brand. Form fields stay at 16px to avoid mobile focus zoom. Headings balance; paragraphs wrap naturally with a comfortable reading measure.

Use the shared line-height roles: heading 1.05, lead 1.3, body 1.45, detail 1.6. Large display headings retain their tighter 0.95 line height. Number columns use tabular figures.

## Spacing and layout

Use the 4px-based `--space-*` scale for component padding, margins, and gaps. `--gutter` defines page edges, `--inset` defines editorial panels, and `--section-space` defines content row rhythm. Avoid adding a new hardcoded value when an existing role fits.

The desktop composition uses 12 columns. At 760px and below, homepage artwork uses 6 columns, editorial rows stack, and the bookshelf becomes a vertical accordion. At 380px and below, the email address gets its own full-width contact row. These breakpoints are structural; keep related component rules aligned when changing one.

Artwork dimensions, crops, and overlap offsets remain local exceptions. They describe the composition rather than the global spacing system. Keep panels and paragraph measures bounded as screens widen. Do not hide page overflow to disguise sizing defects.

The bookshelf rail anchors to the right. Its open panel is capped by the space remaining after all spines; `--book-count` comes from project data. Preserve:

- rightward collapse, including the all-closed state;
- native page scrolling over both the rail and images;
- a single-line Aleli menu label;
- 1px top, bottom, and left rules on desktop, with continuous outer rules on mobile;
- native `details`/`summary` keyboard behavior and exclusive expansion.

## Color and controls

Use paper, ink, muted ink, black, and yellow, pink, or blue contact highlights drawn from the existing palette. Colored project surfaces remain defined in project data. Rules use `--rule`; avoid introducing unrelated grays or border thicknesses.

Every interaction needs a visible keyboard focus state. Small controls have at least a 36px height, increasing to 44px on coarse pointers; icon close buttons are 44px square. Links have underlines on hover and focus. The current project link stays underlined. Preserve normal anchor navigation, modifier clicks, and deep links.

## Motion

The personality is calm and deliberate, with no bounce or automatic decorative loops.

| Timing   | Seconds | Use                         |
| -------- | ------- | --------------------------- |
| Quick    | 0.16    | Control feedback            |
| Standard | 0.32    | Contact and project content |
| Slow     | 0.56    | Shelf expansion             |

The signature ease is `(0.2, 0.7, 0.2, 1)`. Use full Motion through `motion/react` for React islands and `motion` for progressive native DOM enhancement. Do not reintroduce `motion/mini`.

The homepage entrance reveals the sky from right to left over 0.56s. At 0.48s, the black Curtis box reveals upward and the white introduction box reveals downward together over 0.56s. Once both boxes finish at 1.04s, the top contact bar reveals from left to right over 0.56s. Clip masks keep their content and layout stationary. The sequence waits for the sky image to decode, runs only on initial load, and skips for reduced motion or a restored scroll position below the hero. Keyboard focus or contact bar interaction immediately reveals everything. Static content remains visible without JavaScript, and a timeout restores it if the enhancement cannot load.

The contact overlay is an Astro-owned sibling of the native disclosure, with a stable content wrapper. React owns only the form, so animation styles do not interfere with hydration and Safari does not need to hide an animated island inside a closed disclosure. Closing hides the whole overlay before restoring focus.

Contact grows its bordered overlay from the triggering button’s measured bounds, then reveals the fixed-width form with a small position change and opacity. Its chosen hover color persists as the form background. Only the absolutely positioned overlay animates dimensions; page layout stays fixed. Fields use an animated underline for keyboard and pointer focus, and autocomplete is disabled. The footer uses Motion scroll values and transforms, without React state updates on every scroll frame. The shelf content uses a small horizontal reveal.

The desktop shelf width transition is an intentional, bounded exception to transform-only animation: it preserves the established accordion geometry and unsquashed content. It runs only on user interaction, for five current books. Reassess it if the collection grows or profiling on target devices shows jank. The contact overlay is the other bounded exception, to maintain a continuous button-to-form border without stretching its rule or text.

On desktop, a 2px black scroll progress line grows from the top left, replacing the root scrollbar only when its enhancement loads. It reaches full viewport height as the footer enters, clips to the footer’s top edge, and disappears within the footer. It uses a passive scroll listener and one transform write per animation frame, with geometry measured only on layout changes. It directly tracks scroll without easing or additional dependencies. At 760px and below, both the page scrollbar and progress line are hidden, and progress animation updates are skipped. Native scrolling remains available. Nested form scrollbars remain native.

Reduced motion disables spatial transitions, Lenis smoothing, and footer line motion. Touch scrolling is native. Closing, switching, or rapidly reopening controls must remain responsive. Clean up global listeners and animation subscriptions.

## Delivery and progressive enhancement

Keep content, layouts, optimized images, and native disclosures in Astro. React is reserved for contact form behavior and animated footer lines. Contact hydrates only when opened; the footer hydrates near the viewport. Shelf animation is dynamically imported on interaction. Visitors can read, navigate, and open native disclosures without React or JavaScript.

The contact form posts directly to the Formspree endpoint in `src/data/site.ts`. Native POST submission remains available before hydration; React adds inline sending, success, and error feedback. Duplicate sends are blocked, failures retain the draft, and successful submissions clear the fields. Required fields use browser validation. Escape restores focus, clicking or tabbing outside dismisses, and form values survive dismissal. On touch devices, opening the form focuses its close control instead of summoning the keyboard.

Keep images in `src/assets` and let Astro produce delivery sizes. Small raster logos are generated at 80px for 40px display. The original high-resolution sources are build inputs, not files visitors download. Below-fold images remain lazy.

## Routine checks

Run `npm run format:check`, `npm run check`, and `npm run build`. For visual or interaction changes, check desktop, intermediate widths, 390px and 320px mobile, keyboard focus, reduced motion, and wheel scrolling over the shelf. Inspect production output when measuring transfer sizes; dev bundles do not represent production delivery.
