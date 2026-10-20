# Persistent enrollment revocations

The 2026-10-20 fix builds on the integrated SWA Academy version (`f9ecdab`), preserving customer approval, the `/academy` base path and the public course catalog. Older local changes were reconciled, not substituted for the integrated version.

## Deployment order

1. Back up the target database and review the migration.
2. Apply committed migrations with `npm run db:deploy` using the target's verified database credentials.
3. Deploy the code and verify checkout, webhook delivery and access control in Stripe test mode before enabling real payments.

The new migration only adds `enrollment_revocations`; it does not delete or modify existing course data. Production migrations are not run by this change or by its tests. Code requiring the table must not be deployed before the migration.

`NEXT_PUBLIC_APP_URL` must be the HTTPS origin of the public SWA site, with no `/academy` suffix. The successful payment returns to `/academy/dashboard/corsi/...`; cancellation returns to the public `/corsi/...` page. No production localhost fallback is used.

Keep `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `charge.refunded` enabled on the webhook. Keep its signing secret outside Git.

## Access policy

- A revocation is persisted for the exact user, course and checkout session. Reopening a receipt or replaying completion cannot restore that purchase.
- Refunds never revoke a different session's valid enrollment. A refund arriving before completion is also remembered.
- Duplicate payments are logged for manual resolution; no automatic refund is issued. Their session cannot become a valid purchase later merely because the original is revoked.
- A new purchase with a new session can create access after a previous revocation.
- Manual actions carry the enrollment ID, preventing a stale admin view from revoking a newer purchase.
- Free enrollment revocations block automatic free re-enrollment. Restoration requires a deliberate administrative decision; no automatic restoration is implemented.
- Existing revoke-on-refund behavior, including partial refunds, is retained. Changing that business policy is a separate decision.
- Lesson progress is retained. Existing deleted enrollments cannot be retrospectively reconstructed from this migration; historical reconciliation is separate.

Operations on the same user/course are serialized with a transaction-scoped PostgreSQL advisory lock. A failed transaction rolls back the enrollment and revocation together. The current Stripe charge is checked before granting a paid checkout, not just the checkout's paid status.

## Verification

Run `npm test` for routing, payment validation and public URL checks.

For integration tests, provision a disposable local PostgreSQL database whose name ends in `_test`, set both `DATABASE_URL` and `DIRECT_URL` to it, apply migrations and run `npm run test:integration`. The tests refuse remote hosts and clean up only their synthetic fixtures. Stripe calls use in-process fixtures: no payment, refund or real credential is sent.

The integration suite exercises duplicate refunds, manual revocation, replay, out-of-order events, repurchase, concurrent requests, free courses, stale admin actions, signed webhooks, retryable errors and preserved progress.

Official references: [Stripe webhook ordering and duplicate delivery](https://docs.stripe.com/webhooks), [Charge refund fields](https://docs.stripe.com/api/charges/object).
