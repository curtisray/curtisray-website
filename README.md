# Curtis Ray

Personal portfolio for Curtis Ray, designer and developer.

## Stack

Astro 7, Tailwind CSS 4, full Motion, React islands, and Lenis. All seven pages are statically generated and deployed through the existing Vercel adapter.

Most content stays in Astro. Native disclosures work immediately. The contact panel loads React and Motion when opened, and the animated footer loads near the viewport. Full Motion's DOM API enhances the shelf on interaction. Touch and reduced-motion scrolling stay native.

## Development

Node 22.12 or later is required.

```sh
npm install
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

The local server normally runs at http://localhost:4321.

```sh
npm run format:check
npm run check
npm run build
```

Use `npm run format` to format project source and documentation.

## Design and code

Read [the design system](docs/design-system.md) before changing visual styles or interactions. The [site audit](docs/site-audit.md) records the cleanup, measurements, verification, and remaining limitations.

- `src/styles/tokens.css`: spacing, typography, colors, and rules.
- `src/design/motion.ts`: shared CSS and Motion timing values.
- `src/styles/`: global foundation and styles owned by individual features.
- `src/data/projects.ts`: selected work, images, captions, and book colors.
- `src/data/site.ts`: contact details, developer links, technology stacks, and repositories.
- `src/components/`: shared Astro components and the contact/footer React islands.
- `src/scripts/site.ts`: scrolling lifecycle; `shelf.ts`: shelf navigation and enhancement.
- `src/assets/`: image and raster logo sources; Astro generates delivery variants.
- `public/logos/`: vector technology logos.

The homepage combines the cloud introduction, developer links, selected work shelf, and black footer. Six developer pages live in `src/pages/`. Pages awaiting content show their coming-soon states.

The contact composer prepares a `mailto:` draft in the visitor's email app; it does not send email through a backend. Direct email and SMS links are available on every page.

## Dependency maintenance

`@vercel/routing-utils` pins an older `path-to-regexp`. The scoped override in `package.json` selects its patched 6.3.0 release without downgrading the Astro adapter. Revisit the override when the adapter updates. Run `npm audit` after dependency changes.

The Tailwind documentation snapshot is initialized locally under `.agents/skills/tailwind-4-docs/references/` and excluded from git under its upstream license. It is not part of the application or deployment.
