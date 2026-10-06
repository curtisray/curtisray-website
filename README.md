# Curtis Ray

Personal portfolio for Curtis Ray, designer and developer.

## Stack

Astro 7, Tailwind CSS 4, Motion's native JavaScript API, and Lenis. Pages are
statically generated and deployed through the existing Vercel adapter. No React
runtime is needed for the current interactions. Most visual styling is shared CSS;
Tailwind provides the theme and utility layer.

## Development

Node 22.12 or later is required.

```sh
npm install
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

The local preview normally runs at http://localhost:4321.

```sh
npm run check
npm run build
```

## Pages and content

The homepage combines the cloud introduction, developer links, selected work
shelf, and animated black footer. Six developer pages live in `src/pages/`.
The supplied coming-soon pages and empty agent skills list are preserved.

- `src/data/projects.ts`: selected work, images, captions, and book colors.
- `src/data/site.ts`: developer links, technology stacks, repositories, and skills.
- `src/components/`: shared brand, contact bars, footer, shelf, and technology list.
- `src/styles/global.css`: typography, desktop compositions, and mobile layouts.
- `src/scripts/site.ts`: contact composer, shelf navigation, Motion, and Lenis.
- `src/assets/`: production image sources; Astro generates responsive WebP images.
- `public/logos/`: technology logos.

The work shelf uses native `details`/`summary` elements and becomes a vertical
accordion on mobile. Lenis and animation respect reduced-motion preferences.
The contact composer prepares a `mailto:` draft in the visitor's email app;
it does not send email through a backend. Direct email and SMS links are also
available on every page.
