# DSA — Payments & Access Plan

*Drafted 2026-08-26 (Wednesday). Plan only — no code yet.*

Two things to add: (1) an **offline-payment** option beside the online gateway,
and (2) a dashboard **"Unlock more features"** entry for **tiered plans**. Plus the
**access model** that decides what a paid vs unpaid student can reach.

---

## 0. Guiding principle — beta stays open

Right now everyone can see and do everything, and we want to keep it that way
while people test. So:

- Build all the payment **plumbing** (buttons, proof upload, plans screen, data
  fields, admin review) **now**, but keep a master switch — **`PAYWALL_ENABLED`**
  — **OFF**. With it off, nothing is locked; students test the whole portal.
- At launch, flip it **ON** and the gates below start applying.
- The "free class for unpaid students" idea (Dr. Philip's) is **v2**, after this
  is hosted — not part of this plan.

---

## 1. What already exists (reuse, don't rebuild)

- **Online payment**: register-first Paystack. `POST /auth/register` creates a
  pending student, initializes the transaction, returns an `accessCode`; the
  browser resumes it (`src/lib/paystack.ts`). The **backend** decides "paid" via
  the Paystack webhook — the frontend never does.
- **Offline marking (admin)**: `POST /api/admin/payments/manual` already exists —
  "Mark student paid (offline / cash / bank transfer)", body
  `{ studentId, amount (kobo), method, reference }`.
- **Fees status**: `GET /parents/me/wards/:studentId/fees`.
- The registration fee today is the fixed **₦2,000 portal-access fee**
  (`PORTAL_ACCESS_FEE`).

So the online rail and an admin "mark paid" already work. The gaps are: a
**student-facing offline-proof upload**, a **tiered-plans** purchase, and the
**access/entitlement** layer.

---

## 2. Deliverable A — Offline payment ("I've paid offline")

Applies first to the existing **₦2,000 registration fee**, and later to tier
purchases (same component).

**At the payment step, replace the single "Make Payment" button with two:**
1. **Pay Online** → the existing Paystack flow.
2. **I've Paid Offline** → opens a small form:
   - proof upload (receipt / teller / screenshot — image or PDF → Cloudinary),
   - optional: amount, bank/reference number, date paid.

**On submit:** the student is granted **provisional access** immediately
(payment status = `pending-offline`) and lands in the portal — matching "once
they've made the proof of payment, they will be able to access the portal."

**Admin review** (new *Payments* area): a queue of offline submissions showing
the proof image + details, with **Approve** (→ `active`, reuse the manual-payment
record) or **Disable/Reject** (→ revoke access). Admin can also disable an
already-active student at any time ("the admin will be able to disable it back").

**Backend needed** (spec):
- `POST /api/payments/offline` (student) — `{ planId?, months?, amount?, method,
  reference?, proofUrl }` → creates a `pending-offline` payment and sets the
  student's access to provisional.
- `GET /api/admin/payments/offline` (admin) — the review queue.
- `PATCH /api/admin/payments/offline/:id` (admin) — `{ decision: 'approve' |
  'reject' }`; approve reuses the manual-payment path.
- `PATCH /api/admin/users/:id/access` (admin) — `{ enabled: boolean }` to
  disable/enable a student's access regardless of payment (the master override).

---

## 3. Deliverable B — "Unlock more features" + tiered plans

A card/button on the student dashboard → a **Plans** screen (the three tiers).
Pick a tier + duration → pay **Online** or **Offline** (Deliverable A) → the
student's `plan` + `planExpiry` are set. *(The purchase wiring can come after the
offline flow; the screen + entry point can ship first.)*

### Plans & pricing

| Plan | Monthly | 2 months | 3 months |
|------|---------|----------|----------|
| **Silver** — Essential Prep | ₦8,000 | ₦15,000 *(save ₦1,000)* | ₦20,000 *(save ₦4,000)* |
| **Gold** — Complete Prep + Accountability | ₦12,000 | ₦22,000 *(save ₦2,000)* | ₦30,000 *(save ₦6,000)* |
| **Elite** — Premium Prep + Personal Support | ₦17,000 | ₦32,000 *(save ₦2,000)* | ₦45,000 *(save ₦6,000)* |

### What each tier includes (from the pricing sheet)

- **Silver**: intensive UTME tutorial classes · weekly assessment tests ·
  standard UTME CBT mock · Student Portal & LMS · attendance & basic performance.
- **Gold**: everything in Silver + Parent Portal · DSA CBT Practice Platform ·
  supplementary video lessons · detailed performance analytics · Accountability
  Hub & exam-readiness monitoring.
- **Elite**: everything in Gold + CBT Practice Premium Pro & DSA study materials ·
  exclusive past-questions video walkthroughs · individual performance reviews &
  personalized feedback · exclusive revision sessions & priority support.

---

## 4. Access model — what's gated vs always-free

Mapping the tier sheet onto the actual portal features (**proposal — please
confirm**). Everything is free while `PAYWALL_ENABLED` is off.

| Feature in the app | Free (unpaid) | Silver | Gold | Elite |
|--------------------|:---:|:---:|:---:|:---:|
| Dashboard, Announcements, **Community** (view + message) | ✅ | ✅ | ✅ | ✅ |
| Profile, Settings, browse timetable | ✅ | ✅ | ✅ | ✅ |
| **Live / tutorial Classes** | Free classes only *(v2)* | ✅ | ✅ | ✅ |
| Weekly assessments · standard **CBT mock** (Quizzes) | — | ✅ | ✅ | ✅ |
| Course Materials / E-Learning (LMS) | — | ✅ | ✅ | ✅ |
| Attendance & basic performance | — | ✅ | ✅ | ✅ |
| **Parent/Guardian Portal** | — | — | ✅ | ✅ |
| CBT Practice Platform · supplementary videos · detailed analytics | — | — | ✅ | ✅ |
| CBT **Premium Pro** · study materials · past-Q walkthroughs · 1-on-1 reviews | — | — | — | ✅ |

The headline gate the owner named: **unpaid students can't join classes** (only
free classes, which are v2). Community, announcements and browsing stay open to
everyone.

---

## 5. Data model (fields to add)

**On the student/user:**
- `plan`: `none | silver | gold | elite`
- `planExpiry`: date (drives "active vs expired")
- `paymentStatus`: `none | pending-offline | active | expired | disabled`
- `accessEnabled`: boolean — admin master override (disable back)

**Offline payment record:** `{ studentId, planId, months, amount, method,
reference, proofUrl, status: pending|approved|rejected, reviewedBy, createdAt }`.

`GET /auth/me` should return `plan`, `planExpiry`, `paymentStatus`,
`accessEnabled` so the frontend can compute entitlements.

---

## 6. Gating mechanism (frontend)

- One helper — `canAccess(feature)` — reads `PAYWALL_ENABLED` + the user's
  `plan`/`paymentStatus`/`accessEnabled` against the table in §4.
- While `PAYWALL_ENABLED` is off, `canAccess` always returns true (beta).
- When on: a gated nav item shows a small **lock**; opening it shows an "Unlock
  with a plan" screen (Deliverable B) instead of the feature.
- Entitlements are **also enforced server-side** on the gated endpoints (classes,
  premium CBT, guardian) — the frontend lock is UX only.

---

## 7. Phasing

- **Phase 1 (now, beta):** offline-proof upload + two-button payment step + admin
  Payments review + "Unlock" entry + Plans screen (display) + data fields.
  `PAYWALL_ENABLED = off` — nothing blocked.
- **Phase 2 (launch):** tier purchase via Paystack (amounts per §3), turn
  `PAYWALL_ENABLED` on, enforce §4 (frontend + backend).
- **Phase 3 (v2):** free classes for unpaid students.

---

## 8. Open questions for the owner

1. **₦2,000 vs the tiers** — is the ₦2,000 a one-time registration/access fee that
   stays *in addition to* the monthly tier subscription, or does a tier
   subscription replace it? (This changes what the payment step charges.)
2. **Confirm the §4 mapping** — especially which features are Silver vs Gold vs
   Elite, and that Community/announcements are always free.
3. **Offline access timing** — grant provisional access the moment proof is
   uploaded (assumed), or only after an admin approves it?
4. **"Classes" gate** — does this mean live classes only, or also recorded
   materials? (Assumed: live classes are the gate; materials follow the tier.)
5. **Plan duration model** — monthly subscription with expiry (assumed), and what
   happens at expiry (revert to free vs disabled)?
