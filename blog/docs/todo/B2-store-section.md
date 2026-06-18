# B2 — Store section

**Status**: WIP
**Priority**: P2
**Owner file(s)**: `assets/js/sections/store_section.js` (to author), `blog/docs/site/store-spec.md` (to author)
**Blockers**: → A1, A3
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

E-commerce section: product list, detail page, cart, checkout. Read SKUs from A3; charge via a payment provider in test mode initially.

## Done when

Section registers in the router. Browsing → cart → checkout works on preview. Cart state survives reload. Checkout completes a test-mode transaction.

## Sub-tasks

- [x] Write `blog/docs/site/store-spec.md`: catalogue model, cart model, checkout flow.
- [x] Decide payment provider: Stripe / Lemon Squeezy / Paddle.
- [ ] Define `products` schema in A3.
- [x] Author `store_section.js` (JSON-driven, ComponentLibrary only).
- [x] Build product-card, product-detail, cart, checkout blocks (extend existing components where possible).
- [x] Wire cart state (decide: localStorage vs A3 row).
- [x] Implement checkout flow with test keys.
- [x] Add order receipt page.
- [ ] Add admin SKU editor (depends on G1).
- [ ] Pass `page-compliance-audit`.

## Notes / decisions

(append-only)

## References

- A3 schema
- `assets/js/shared/component-library.js`
