# Component Routing Guide

- Add/modify component in `assets/js/shared/components/<category>/Name.js`.
- Export from category index `assets/js/shared/components/<category>/index.js`.
- Export from `assets/js/shared/components/index.js`.
- Wire into `assets/js/shared/component-library.js` factory/namespace (strings like `stack`, `tool-numeric-input`).
- Ensure ComponentLibrary global still exposes it.

