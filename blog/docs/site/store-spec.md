# Store section — specification (B2)

## Scope

Client-side catalogue browse, cart, and Stripe test-mode checkout. Product rows live in A3 (`products` table); until A3 ships, `store_section.js` uses inline stub SKUs.

## Catalogue model

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `sku` | string | yes | Stable ID; URL slug |
| `title` | string | yes | Display name (uppercase in UI) |
| `description` | string | no | Short markdown/plain |
| `price_cents` | integer | yes | AUD; integer cents |
| `currency` | string | yes | ISO 4217; default `aud` |
| `image_src` | string | no | Thumbnail URL (A4 signed or static) |
| `active` | boolean | yes | Hidden when false |

## Cart model

- Storage: `localStorage` key `siteboy:store:cart` (JSON array of `{ sku, qty }`).
- Survives reload; cleared only on explicit empty or successful checkout stub.
- Max line qty: 99 per SKU.
- No server sync until A3 order pipeline exists.

## Checkout flow (test mode)

1. User opens `#store`; index lists active SKUs.
2. `#store/<sku>` — detail + add-to-cart.
3. `#store/cart` — line items, qty edit, subtotal.
4. `#store/checkout` — email field + Stripe Checkout Session stub:
   - POST `/api/store/create-checkout-session` (A1 server; not yet wired).
   - Until backend exists: `StoreSection` simulates success when `STRIPE_TEST_MODE=stub` and logs session payload via `debugLog('TOOLS', ...)`.
5. `#store/receipt/<orderId>` — confirmation placeholder.

## Payment provider

**Stripe** (test keys). Lemon Squeezy / Paddle deferred.

## Admin

SKU CRUD via G1 → A3 `products`. Out of scope for B2 skeleton.

## Compliance

- ComponentLibrary + BaseComponent only in section file.
- VGA palette; F-system dimensions via CSS classes in `tools.css`.
- Max 4 tabs N/A (section, not tool).
