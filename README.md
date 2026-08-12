# Neo Commerce

Single-vendor ecommerce app with separate admin and user experiences, Midtrans Snap payments, and a webhook-driven order lifecycle.

Built with Next.js 16 (App Router), Prisma + PostgreSQL, TanStack Query/Form, Zod, and Radix UI — architecture and conventions modeled after `picedu-v1`.

## Features

**User**
- Public storefront (Tokopedia-style layout) — anyone can browse the catalog, search, and view product detail without logging in; login is only required to add to cart, checkout, or view orders
- Browse catalog with search + category filter, see live stock and sold-count per product
- Cart with quantity management and stock/availability guards
- Checkout with Midtrans Snap (popup) payment
- Order history and detail with live payment/order status, resume payment or cancel a pending order
- Customizable character avatar (6 mascot styles × 6 colors) shown in the header, profile, and empty states — editable from `/profile`

**Admin**
- Product & stock CRUD
- Order management: view all orders, progress status (paid → processing → shipped → completed), mark refunded
- Dashboard: revenue, available balance, low-stock alerts, recent orders
- Withdrawal ledger: record platform balance withdrawals (bookkeeping only, no bank integration)
- Same character avatar system, editable from `/admin/profile`

**Payments**
- Order creation deducts stock immediately and calls Midtrans Snap to create a transaction; nothing is committed to the database if the Midtrans call fails
- `POST /api/webhooks/midtrans` verifies the notification signature and drives the order lifecycle (paid / expired / cancelled / refunded), restoring stock on any non-paid terminal outcome

## Setup

1. **Start Postgres**
   ```
   docker compose up -d
   ```

2. **Configure environment**
   ```
   cp .env.example .env
   ```
   Fill in:
   - `SESSION_SECRET` — any long random string
   - `MIDTRANS_SERVER_KEY` / `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` — from the [Midtrans sandbox dashboard](https://dashboard.sandbox.midtrans.com/settings/config_info)
   - `APP_URL` — used to build the Snap `finish` redirect URL

3. **Install, migrate, seed**
   ```
   pnpm install
   pnpm exec prisma migrate dev
   pnpm exec tsx prisma/seed.ts
   ```

4. **Run**
   ```
   pnpm dev
   ```

### Seeded accounts

| Role  | Email                     | Password |
|-------|---------------------------|----------|
| Admin | admin@neocommerce.local   | password |
| User  | user@neocommerce.local    | password |

## Midtrans webhook setup

In the Midtrans dashboard → Settings → Configuration, set the **Payment Notification URL** to:

```
<APP_URL>/api/webhooks/midtrans
```

For local development, expose your dev server with a tunnel (e.g. `ngrok http 3000`) and use the tunnel URL. Without this configured, orders will stay in `pending_payment` after a successful Snap payment since nothing updates their status.

## Notes on scope

- Single vendor only — admin owns the whole catalog, no multi-seller support.
- The withdrawal ledger is bookkeeping only: it tracks `available balance = paid+ order revenue − refunds − withdrawals` and lets an admin log that money was withdrawn. It does not move money anywhere.
- Shipping is a flat fee (`SHIPPING_FEE` in `app/api/orders/route.ts`); no courier/rate integration.
