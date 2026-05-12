SiteBoy is the site itself — not just a portfolio container but a designed system with its own engineering philosophy. The architecture is a single-page application built from first principles: a custom router, a component system, a shared algorithm library, and a formal design law that governs every visual decision. No framework, no build toolchain, no component library imported from npm.

The design doctrine is a single PDF-weight principle: every visible element is a partition of a parent rectangle, not an object placed in space. Borders are shared boundaries between adjacent partitions. Size and spacing derive from a single global constant `F = 14px`. The colour palette for UI surfaces is four variables: `--c-bg`, `--c-text`, `--c-border`, `--c-accent`. No gradients, no shadows, no rounded corners.

The engineering follows a file ownership map: each concern — routing, animation, GPU compute, layout math — has exactly one authoritative file. No other file may implement the same concern. This is enforced by code-review rules, not convention.

The result is a system that can host 69 composable image-effect modules, a generative art gallery, typography measurement tools, audio synthesis tools, physics simulations, and a 3D print calibration workflow — all rendered from a single `index.html`, with a router that never reloads the page.

This page documents the design law, the component architecture, the border and typography systems, and the coding standards that make the system coherent across all of these use cases.
