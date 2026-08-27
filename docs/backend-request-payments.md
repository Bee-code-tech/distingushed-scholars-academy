# Backend request — Payments & Access (Phase 1)

*Written 2026-08-26 (Wednesday).*

The frontend for Phase 1 of the payments plan ([payment-plan.md](payment-plan.md))
is built and calls the endpoints below (`dsaApi.plans` / `dsaApi.payments` in
`src/lib/api.ts`). They degrade gracefully until these ship — the student Unlock
screen shows default plans and the offline form errors on submit; the admin
Payments screen shows "not live yet" notices. Everything lights up once these
exist. The **access levels are not enforced yet** (beta: `PAYWALL_ENABLED` off);
this request is only the data + endpoints.

## Concepts

- **Access level** on a student: `free` → `portal` (paid ₦2,000) → `tutorial`
  (paid tutorial fee, time-bound). At tutorial expiry, revert to `free`.
- **Plans** are admin-managed (amounts not hard-coded). A `portal` plan grants
  `portal`; a `tutorial` plan grants `tutorial` for `durationMonths`.
- **Caps** (admin-editable) limit how many tests / materials / live classes L1 and
  L2 can access; L3 is unlimited.
- A live class can be flagged **`isFree`** → joinable by everyone, ignores caps.

## 1. Student fields (return on `GET /auth/me`)

```json
{
  "accessLevel": "free | portal | tutorial",
  "tutorialExpiry": "2026-12-01T00:00:00.000Z",
  "paymentStatus": "none | pending-offline | active | expired | disabled",
  "accessEnabled": true
}
```

## 2. Plans

- `GET /api/plans` — active plans (any authed user). Each:
  `{ id, name, kind: 'portal'|'tutorial', amount, durationMonths, grantsLevel, active }`.
  `amount` in **naira** (the client shows it as-is; if you prefer kobo, say so and
  I'll divide).
- `GET /api/admin/plans` — all plans (admin).
- `POST /api/admin/plans` — body `{ name, kind, amount, durationMonths,
  grantsLevel, active }`.
- `PATCH /api/admin/plans/:id` — partial update (e.g. `{ amount }`, `{ active }`).
- `DELETE /api/admin/plans/:id`.

## 3. Payments

- `POST /api/payments/online` (student) — `{ planId, months? }` → initialize a
  Paystack transaction for that plan's amount and **return `{ accessCode }`** (the
  browser resumes it, exactly like registration). The webhook then sets the
  student's `accessLevel` + `tutorialExpiry`.
- `POST /api/payments/offline` (student) — `{ planId, months?, amount, method,
  reference?, proofUrl }`. Store the proof; set the student to **provisional
  access** (`paymentStatus: 'pending-offline'`, and grant the plan's level so they
  can use the portal immediately). Return the created record.
- `GET /api/admin/payments/offline` (admin) — the pending queue. Each row:
  `{ id, student{ id, fullname }, planId, amount, method, reference, proofUrl,
  status, createdAt }`.
- `PATCH /api/admin/payments/offline/:id` (admin) — `{ decision: 'approve' |
  'reject' }`. **Approve** → confirm the level (reuse the manual-payment path,
  `POST /admin/payments/manual` logic). **Reject** → revoke access
  (`paymentStatus: 'disabled'`, level back to `free`).
- `PATCH /api/admin/users/:id/access` (admin) — `{ enabled: boolean }`. Master
  switch to disable/re-enable a student's access regardless of payment.

## 4. Access caps (admin settings)

- `GET /api/admin/settings/access` → `{ freeTests, freeMaterials, freeLiveClasses,
  portalTests, portalMaterials, portalLiveClasses }` (integers). Defaults:
  3 / 5 / 5 and 10 / 20 / 10.
- `PATCH /api/admin/settings/access` — partial update of the same object.

## 5. Live classes

- Add **`isFree: boolean`** to the live-class model, settable by the admin. A free
  class is joinable by everyone and does not count toward the caps in §4.

## Notes

- No enforcement needed yet — the frontend keeps the paywall off during beta.
  When we launch, the level + caps get enforced on the gated endpoints (live
  classes, community, assignments, tests, materials) server-side too.
- Currency: the client sends/reads `amount` in **naira**. Confirm if the model
  stores kobo.
