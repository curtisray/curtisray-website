---
name: claude-design-port
description: Port Claude Design exports, generated pages, mockups, or components into an existing project using its native stack, documented design system, and motion conventions. Use when asked to port a Claude export, implement a Claude-generated page, or integrate a Claude design into a real project.
---

# Claude Design Porting Workflow

Translate the reference into working project code while preserving its visual intent and enforcing the project's design system. Verify the rendered result and functionality. Deploy only within the user's requested scope.

## 1. Establish Context and Require a Design System

1. Read applicable project instructions. Inspect the framework, package scripts, routes, component architecture, styling conventions, and existing integrations.
2. Locate and read `design-system.md`. Inspect the implementation it describes: tokens, CSS variables, theme configuration, shared components, typography utilities, representative pages, and motion presets.
3. **If `design-system.md` is missing, ask the user for a design system before building.** Do not treat inferred code conventions as a substitute for this requirement. Read-only inspection may continue to identify existing standards and make the request specific.

   Use a request such as:
   > This project needs a design-system.md before I build the port. Please provide the design system, or authorize me to document the existing standards and identify any decisions you need to make.

4. If authorized to prepare the document, consolidate the existing system into `design-system.md`, reference the actual implementation sources, and resolve material gaps with the user before building. Do not invent standards and label them approved.
5. Ensure the document gives agents and humans a collective view of typography, colors, spacing, layout, breakpoints, components, interaction states, accessibility, and motion. Include scroll-library settings only when the project uses such a library. Reference canonical tokens rather than creating competing definitions.
6. Identify the source reference, target routes or components, supplied assets, required interactions, and intended completion target: local implementation, preview deployment, or production deployment. If deployment is unspecified, complete and verify locally without publishing.

## 2. Map Visual Intent to Project Standards

1. Inspect the available export, screenshots, assets, and interaction references. If the source is inaccessible or essential material is missing, request it rather than guessing at its contents.
2. Identify composition, hierarchy, imagery, spacing relationships, component boundaries, responsive behavior, and distinctive visual ideas.
3. Apply the following precedence:
   - Follow explicit instructions for the current task and applicable project instructions.
   - Enforce the documented project design system and architectural conventions.
   - Preserve the reference's visual intent within those constraints.
4. Reuse existing components and tokens. Avoid flattening distinctive compositions into generic layouts merely because a convenient component exists.
5. Explain material conflicts and proposed resolutions. Ask for a decision when resolving one requires a new design-system rule or a material exception. Continue independent work that does not depend on that decision.
6. If only a desktop reference exists, derive mobile behavior from project conventions while retaining content hierarchy and usable interactions.

## 3. Translate Structure and Connect Functionality

1. Implement in the project's native architecture, such as Liquid sections and snippets, Astro components, or React components within the existing framework's server/client boundaries.
2. Translate exported markup and styles into project conventions. Use Tailwind, CSS, or inline styles where appropriate to the project; do not copy arbitrary values that conflict with its system.
3. Reuse supplied assets and established font, image, routing, and data-loading mechanisms. Avoid unnecessary dependencies, global changes, and unrelated refactors.
4. Connect interactions to existing APIs and business logic within the requested scope. Preserve cart behavior, form contracts, state management, validation, and relevant loading, empty, success, and error states.
5. Identify missing contracts or integrations. Do not invent endpoints, credentials, product data, or successful submission states. Report blocked functionality explicitly and request only the information needed to proceed.
6. Use semantic markup, accessible names, visible focus states, and keyboard-operable controls.

## 4. Harmonize Motion and Scroll Behavior

1. Compare the reference's motion with existing presets, triggers, easing, durations, and orchestration.
2. Reuse sitewide motion patterns. Do not assume clean duration multiples or proportional easing values produce coherent motion.
3. Introduce a distinct pattern only when the interaction or section warrants it. Explain the reason and document reusable additions in `design-system.md` with their implementation references.
4. Preserve the existing scroll controller and settings. Do not introduce Lenis or another scroll library unless required by the task; avoid duplicate controllers.
5. Respect reduced-motion preferences. Clean up listeners, observers, and animation instances, and avoid motion that interferes with navigation or reading.

## 5. Render, Compare, and Verify

1. Run the project's required checks appropriate to the change, including build, type, lint, and relevant existing tests. Add tests when meaningful behavior changes warrant them.
2. Render representative desktop and mobile views. Compare the implementation with the reference and surrounding site, and correct material differences in composition, typography, imagery, spacing, borders, radii, alignment, and scroll behavior.
3. Check responsive overflow, keyboard interaction, focus visibility, reduced motion, relevant interaction states, browser console errors, and failed network requests.
4. Exercise the affected user flows through their existing integration boundaries. Distinguish verified behavior from mocked, unavailable, or untested behavior.
5. Inspect the final diff for unintended changes. Update `design-system.md` when approved system changes were introduced, keeping its references consistent with the code.
6. If rendering or checks cannot run, state the limitation and remaining verification. Do not claim visual fidelity or production readiness without supporting evidence.

## 6. Complete the Requested Delivery

1. For local implementation, provide the completed changes and verification results.
2. For preview deployment, use the project's established deployment workflow and verify the resulting preview.
3. For production deployment, proceed only when publishing is within the user's authorization. Complete the implementation and checks before any required final approval. Verify the affected routes and interactions after deployment.
4. Do not equate a successful build with a successful deployment, or a successful deployment with a verified user flow.

## Final Report

Return a concise report grounded in the actual diff and observed checks:

- **Implemented:** Changed routes, components, functionality, and relevant files.
- **Intentional deviations:** Material differences from the reference and their design-system or architectural reasons.
- **Verification performed:** Checks run, viewports inspected, interactions exercised, and deployment status or URL when applicable.
- **Unresolved dependencies:** Missing assets, contracts, decisions, blocked checks, and unverified behavior. State when none remain.

Use concrete examples when helpful, such as replacing a reference heading size with an existing typography token or replacing an exported entrance animation with the project's established preset. Report actual changes rather than hypothetical substitutions.
