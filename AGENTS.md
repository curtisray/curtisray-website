## Development

### Animation stack

- Use the full Motion library (formerly Framer Motion). Use `motion/react` for animated React components; do not use `motion/mini` or legacy Motion One packages.
- Keep Astro 7, Tailwind CSS 4, and Lenis. Use Astro's React integration for animated islands, with hydration appropriate to each interaction.
- Consult `.agents/skills/awwwards-animations/SKILL.md` and `.agents/skills/motion-design/SKILL.md` for animation work. Motion is the default animation library; add other animation libraries only when the requested effect warrants them.
- Define purpose, timing, easing, and choreography before implementing motion. Prefer transforms and opacity, clean up animation subscriptions, and preserve reduced-motion, keyboard, touch, and normal page scrolling behavior.
- Adapt skill examples to Astro and check current official APIs. Some references use older library versions or Next.js-specific setup.

### Design system

- Read `docs/design-system.md` before changing visual styles or interactions. Reuse `src/styles/tokens.css` and `src/design/motion.ts`; keep feature styles with their owning component.
- Preserve the right-aligned shelf, native page scrolling over it, single-line Aleli menu label, and thin shelf borders.

### Project skills

Project skills live in `.agents/skills/`. In addition to the animation skills:

- `tailwind-4-docs`: Tailwind v4 documentation and implementation guidance. Follow its initialization and license-acceptance requirements before using the local documentation snapshot.
- `web-design-guidelines`: Review interfaces against the latest upstream guidelines.
- `writing-guidelines`: Review prose against the latest upstream writing guidelines.
- `explain-interface`: On request, explain an interface or effect using browser/source evidence, distinguishing measured facts from inference.
- `deploy-to-vercel`: Follow the project-aware Vercel deployment workflow; default to preview unless production is requested.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
