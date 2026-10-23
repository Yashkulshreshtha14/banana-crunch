# Banana Crunch storefront

A mobile-first Next.js storefront and admin starter for Banana Crunch. It includes the customer shop, cart, guest checkout, customer accounts, order tracking, PostgreSQL/Prisma data model, protected admin APIs and dashboard, and a Razorpay Standard Checkout integration that verifies signatures and captured status on the server.

## Important launch status

This source is configured for Razorpay **test mode**. A real merchant account, approved live credentials, webhook setup, production database, courier serviceability, registered business information, and support email are not supplied. This project does not claim that any payment or deployment is live. Never set live keys until merchant KYC and gateway approval are complete.

Before publishing, replace the sample brand story, product/ingredient facts, contact details and policy copy with the business's verified information. Have the privacy, returns and terms pages reviewed for the seller's actual practices and applicable Indian requirements. The contact form is a starter and needs a real customer-support destination.

## Requirements

- Node.js 20 or newer
- PostgreSQL 15 or newer
- A Razorpay test account for payment testing
- A deploy target that supports Next.js server routes and environment variables

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `APP_URL`, and a random `SESSION_SECRET` of at least 32 characters. Keep `.env` private.
2. Install packages with `pnpm install` (or `npm install`).
3. Generate Prisma Client and apply the first migration: `pnpm db:deploy`.
4. Add sample catalog and store defaults: `pnpm db:seed`.
5. Create the first owner from a trusted local terminal: `pnpm admin:create`. There is no public admin registration.
6. Add Razorpay **test** values to `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Configure the webhook URL as `https://YOUR-DEV-HOST/api/payments/webhook` with the `payment.captured` and `payment.failed` events.
7. Run `pnpm dev` and open `http://localhost:3000`. Admin sign-in is at `/admin`.

You can also create the initial owner once through `/api/admin/setup` by setting a random `ADMIN_SETUP_TOKEN` (at least 32 characters), posting it with owner name, email and a 12+ character password, then removing the token. The CLI setup is preferred.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `APP_URL` | Canonical origin for metadata and sitemap |
| `SESSION_SECRET` | Signs secure, HTTP-only session cookies; use a unique 32+ character secret |
| `ADMIN_SETUP_TOKEN` | Optional one-time owner bootstrap token |
| `RAZORPAY_KEY_ID` | Razorpay test key ID, safe to return to the checkout browser |
| `RAZORPAY_KEY_SECRET` | Server-only Razorpay API/signature secret |
| `RAZORPAY_WEBHOOK_SECRET` | Server-only webhook HMAC secret |
| `COD_ENABLED` | Set `true` only when COD operations are configured; defaults off |
| `RESEND_API_KEY`, `ORDER_EMAIL_FROM` | Reserved for transactional email provider setup |
| `SMS_PROVIDER_URL`, `SMS_PROVIDER_TOKEN` | Reserved for an authorized SMS/WhatsApp provider |
| `IMAGE_STORAGE_URL` | Reserved for secure object storage configuration |

Never use a `NEXT_PUBLIC_` prefix for private credentials. Keep development, staging and production secrets and databases separate.

## Payment and order safety

- Browser checkout submits product identifiers and quantities only. The server reloads current prices/stock, validates coupon rules and computes tax/shipping.
- The server reserves stock transactionally while creating the order. Failed payments and cancellations release reserved units once, using `stockRestoredAt` as an idempotency guard.
- Razorpay orders are created server-to-server in INR paise. The browser receives only the public key ID and gateway order ID.
- The callback signature is checked against the gateway order ID stored in PostgreSQL, then payment status and order association are fetched from Razorpay. An order is marked paid only when the payment is captured for the expected amount.
- Webhooks are verified over the original raw body using `RAZORPAY_WEBHOOK_SECRET`. Unique event IDs prevent duplicate processing.
- The payment handler never receives or stores card numbers or CVVs.
- Subscribe the Razorpay webhook to `payment.captured` and `payment.failed`; use the same webhook secret as the server environment variable.

Payment flow follows [Razorpay Standard Checkout verification](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/checkout-form/) and [Razorpay webhook guidance](https://razorpay.com/docs/webhooks/validate-test/).

## Admin and permissions

- Admin entry point: `/admin`.
- Owner creation: `pnpm admin:create` on a trusted machine.
- API routes check the server-managed signed session and role. Roles are Owner, Admin, Order Manager and Customer; customer registration cannot create staff accounts.
- Admin API writes are audited. Refund requests call Razorpay and are available only to Owner/Admin roles. Paid orders cannot be marked cancelled until refunded.
- Product stock is reserved at order creation. Failed/cancelled pre-dispatch orders release stock once. Refunds after dispatch or delivery do not automatically restock food products. Add a scheduled expiry worker that releases stock for abandoned pending payments before production.
- The in-memory rate limiter is suitable only for a single local instance. Replace it with a shared Redis-backed limiter for horizontally scaled production.

## Database and operations

Schema source: `prisma/schema.prisma`. Migrations are under `prisma/migrations/`; deploy with `pnpm db:deploy`. Sample data is safe to rerun with `pnpm db:seed`.

Use managed PostgreSQL with TLS, least-privilege credentials, automated daily backups and point-in-time recovery. Test a restore before launch and periodically thereafter. Configure centralized error logging and alerts; do not log payment secrets or full customer payment credentials. Add a retention policy for webhook payloads and audit history.

Product records include SKU, category, weight, images, ingredients, allergens, nutrition JSON, shelf life, tax, MRP, price, stock and publication state. Admin APIs support product create/update/archive, category listing, order filtering/status/tracking, CSV export in the dashboard, coupons, store settings and full captured-payment refunds. `StoreSetting.shipping.serviceablePincodes` can hold a serviceability allow-list; connect this to the courier provider before accepting orders.

## Deployment and custom domain

### Publish from GitHub

GitHub stores the source and runs the build check in `.github/workflows/ci.yml`. It does not host this dynamic application on GitHub Pages. To make the storefront public, push this project to a GitHub repository and import that repository into Vercel (Next.js is detected automatically). Provision a managed PostgreSQL database separately, then add the production `DATABASE_URL`, `APP_URL`, and a unique 32+ character `SESSION_SECRET` in Vercel Project Settings → Environment Variables. Add Razorpay test secrets only when ready to test payments. Never upload `.env` or set secrets in GitHub source files.

Before the first production use, apply the schema to the production database with `pnpm db:deploy` from a trusted environment configured with the production `DATABASE_URL`. Seed reviewed catalog data and create the Owner account once (`pnpm db:seed`, then `pnpm admin:create`). Use a separate database and environment variables for Vercel preview deployments. Connect Razorpay's webhook to `https://YOUR-VERCEL-DOMAIN/api/payments/webhook` and set the same webhook secret in Vercel. The Vercel URL can run the site before a custom domain is purchased.

1. Deploy the application to a Next.js-compatible host and create a separate managed PostgreSQL database for production.
2. Set production environment variables through the host's secret manager. Do not upload `.env` or commit credentials.
3. Run `pnpm db:deploy` as a release step, then seed only if the production catalog is empty and reviewed.
4. Add the custom domain in the hosting dashboard, apply the exact DNS records it provides at your registrar, wait for DNS propagation, then confirm HTTPS/SSL is active.
5. Set `APP_URL` to the HTTPS domain, configure Razorpay live-mode webhook at `/api/payments/webhook`, then perform a low-value live transaction only after KYC, approval and production review.
6. Check the domain at the registrar immediately before purchase. On 24 October 2026, the registry RDAP lookup returned a registration record for `banana-crunch.com`; `banana-crunch.in` returned no registry record. Availability and price can change, so confirm both directly with a registrar before purchasing.

## Pre-launch checklist

- [ ] Verify sample product prices, pack weights, ingredients, allergen statements, nutrition facts, shelf-life and product photography.
- [ ] Review company identity, GST/FSSAI details, contact information and all policy content.
- [ ] Configure shipping carrier serviceability, tracking IDs/links, dispatch notifications and delivery status workflow.
- [ ] Configure transactional email and authorized SMS/WhatsApp provider; send order confirmation only after verified payment, and shipping/delivery updates after status changes.
- [ ] Configure approved Razorpay test credentials and webhook, then test successful, failed, pending, invalid-signature, captured and duplicate webhook cases.
- [ ] Test checkout price tampering, stock races, coupon expiry/limits, invalid PIN code, guest/customer order history, cancellation/restock, refunds and unauthorized admin routes.
- [ ] Test responsive storefront and checkout on Android, iOS, tablet and desktop.
- [ ] Confirm backup restore, monitoring, support contacts, live-payment approval and HTTPS on the production domain.

Automated end-to-end payment and notification tests need a configured PostgreSQL instance, Razorpay sandbox credentials and provider test endpoints. No credentials are bundled, and no fake payment success path is provided.
