# Scholars Drill — Product Requirements Document

**Product:** Scholars Drill (working name in the technical spec: *Quiz360Pro*)
**Parent:** Distinguished Scholars Academy (DSA) — DowPhil Group
**Version:** 1.1 — revised against the live DSA codebase and backend API docs
**Date:** 25 August 2026
**Owner:** Product

---

## 0. Basis of this document

### 0.1 Confirmed product decisions

| # | Decision |
|---|---|
| D1 | Scholars Drill is a **separate application** with its own codebase, sharing the **same MongoDB Atlas database** as DSA |
| D2 | Scholars Drill runs on its **own domain** |
| D3 | A DSA student who opens Scholars Drill is **silently auto-provisioned on the Free tier** — no second signup |
| D4 | The DSA admin dashboard **sees all accounts**, not only DSA-enrolled students |
| D5 | A person is identified across products by **email + Student ID + Program** |
| D6 | DSA is **live with real registered students** — shared login must work with existing credentials, no forced password reset |
| D7 | Stack: MongoDB Atlas, REST API documented in Swagger UI |
| D8 | v1 launch scope: shared login + **CBT engine + question bank + AI explanation engine** |

### 0.2 What was verified in the codebase

Version 1.0 of this PRD was written blind and carried several wrong assumptions. This version is checked against the DSA repository and its `docs/` API contracts. Verified facts:

| Area | Reality |
|---|---|
| **Backend** | A **separate service** at `api.distinguishedscholarsacademy.com`, Swagger at `/api-docs`. The repo in `wamp64/www` is the Next.js frontend only. |
| **Auth** | Email + password, JWT Bearer token. `POST /api/auth/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password/:token`, `/me`, `/updatepassword`. |
| **Email verification** | Yes — 4-digit OTP emailed, `POST /verify-otp` sets `status: active`. |
| **Google OAuth** | **Not implemented.** Password only. |
| **Email uniqueness** | Enforced by backend validation ("Email: Must be unique"). |
| **Student ID format** | `DSA/2026-8903DS` — `DSA/YYYY-` plus 6 random alphanumerics. *(The technical spec's `DSA20260421` is wrong.)* |
| **Registration flow** | `POST /register` → `status: pending_payment` → Paystack → webhook → `pending_otp` → OTP → `active`. **Payment is mandatory to create a student account.** |
| **Roles** | A **single `role` string** on the user: `student` \| `tutor` \| `parent` \| `staff` \| `admin` \| `super_admin` (legacy `guardian`, `moderator`). |
| **Programmes** | `programmes: ["JAMB","WAEC"]` array on the user, plus `examTrack`/`level`, `subjectsOfInterest[]`, `learningMode: online\|physical`, `isDsaStudent`. |
| **Guardians** | Parent accounts already exist, linked to a student by `studentId`. |
| **Quiz/CBT today** | `POST /api/quizzes` creates an admin-authored quiz with nested subjects and questions, reached by `accessLink` + `accessCode`. Submit and leaderboard endpoints exist. |
| **Existing Quiz360Pro UI** | Routes already live **inside the DSA frontend**: `/quiz360pro`, `/rapid-quiz`, `/dashboard/quiz360`, `/dashboard/simulator`, `/dashboard/community`, `/dashboard/rankings`. |
| **Admin auth** | Not backend-enforced. `NEXT_PUBLIC_ENABLE_ADMIN_BYPASS` defaults to **true, including on the live site**; the `admin_token` cookie is the literal string `true`, not a JWT. |

### 0.3 The three findings that change the plan

**F1 — There is no way to create a free DSA account.** Registration runs through Paystack before the account is ever activated. Scholars Drill's entire growth model is free national signups (P2), so it cannot reuse `POST /api/auth/register`. A free, product-aware registration path is now a **v1 backend blocker**, not a detail.

**F2 — One `role` field means cross-product admin escalation is live-by-default.** Every account carries a single `role`. If Scholars Drill checks `role === 'admin'`, every DSA admin, and anyone who reaches the still-enabled admin bypass, becomes a national platform administrator on day one. Roles must be namespaced per product before Scholars Drill ships.

**F3 — Quiz360Pro is already partly built inside the DSA frontend.** D1 says separate app; six route groups say otherwise. This has to be resolved deliberately (O15) — extract them into the new app, or accept the monolith and revise D1. Leaving both is the one outcome that guarantees two divergent CBT implementations.

### 0.4 Still unverified

The backend repository itself was not available — only the frontend and its API documentation. So the actual Mongoose schemas, index definitions, and whether email uniqueness is case-normalised are inferred from documentation, not read. O1 and O16 cover this.

---

## 1. Problem

### 1.1 The user's problem

A JAMB or WAEC candidate in Nigeria needs two different things and today has to go to two different places for them.

They need **teaching** — a tutor explaining trigonometry, a structured syllabus, a class schedule, someone accountable for their progress. DSA provides this.

They need **repetition under exam conditions** — thousands of past questions, a countdown timer, instant scoring, and an answer to "why was I wrong?" at 11pm when no tutor is awake. DSA does not provide this at scale, and the existing CBT apps that do (Testlander, Gradelly and similar) are widely distrusted on answer accuracy, which is the one thing a practice app cannot get wrong.

The result is a split: DSA's paying students drill on a free third-party app of unknown accuracy, and the millions of candidates using those apps have no path to real teaching.

### 1.2 The business problem

DSA's revenue is capped by classroom and tutor capacity — it is a tutorial centre in Ibadan, sold per student per term. It cannot grow past the number of students its tutors can teach.

A CBT product has no such ceiling, but a CBT product launched as an unknown brand starts at zero trust and zero traffic. DSA has admission stories, real students, and a name parents already check.

Scholars Drill exists to convert DSA's credibility into a national product, and the national product's traffic back into DSA tutorial enrolments.

### 1.3 The problem this PRD solves

The two products only compound each other if they feel like one organisation to the student. If a DSA student has to create a second account, remember a second password, and re-enter their name, school and exam type, the link breaks at the first step — and the tutorial student, the most valuable user in the system, meets the new product as a stranger's app.

**One account, two products.** An account created on DSA signs in to Scholars Drill. An account created on Scholars Drill signs in to DSA. Neither requires a second registration, and neither product's admin loses the ability to run its own operation.

### 1.4 Why this is harder than it looks

1. **DSA is live.** Real accounts, real password hashes, real payment records. The design must accept what is already in the database.
2. **Separate domains cannot share cookies.** "Same login" has to be built deliberately; it does not fall out of sharing a database.
3. **The current account model assumes every user paid.** F1. The system has no concept of a free user, and Scholars Drill is mostly free users.
4. **The current role model assumes one product.** F2. A single `role` string cannot express "DSA admin, Scholars Drill student".
5. **Two apps writing one collection** can silently clobber each other's fields unless ownership is assigned per field.

---

## 2. Target Users

### 2.1 Primary — students

**P1. The DSA tutorial student (existing).** Enrolled and paying, has an account with a `DSA/2026-…` Student ID, `programmes`, `learningMode`. Attends class, then wants to practise. The most valuable user and the one who must experience zero friction — should never see a signup form on Scholars Drill.

**P2. The independent candidate (new, national, the growth market).** A JAMB/WAEC/NECO/Post-UTME candidate anywhere in Nigeria with no relationship to DSA. Found Scholars Drill through search, referral, or social. **Signs up free** — which the current backend cannot do (F1). May never enrol in DSA, and the product must be worth paying for on its own.

**P3. The converting candidate.** Started as P2, now wants a tutor or saw DSA's admission results, and enrols. Must keep the same account, practice history and progress. Enrolment adds to the account; it does not replace it.

### 2.2 Secondary

**P4. Parent / guardian.** Already modelled in the system as `role: parent`, linked by `studentId`. Pays the fees, wants proof of value.

**P5. DSA tutor.** `role: tutor`. Uploads notes and recordings, marks assignments, runs attendance for their own students.

**P6. DSA admin / staff.** `role: admin` \| `super_admin` \| `staff`. Runs the tutorial business. Per D4, also sees the full account list.

**P7. Scholars Drill content admin.** Uploads and verifies questions, manages the report queue. **A new role that does not exist today** and must not be expressed by reusing `role: admin` (F2).

### 2.3 Not for v1

Schools buying seats in bulk; students outside Nigeria; exams beyond JAMB/WAEC/NECO/Post-UTME.

---

## 3. Core Features

### 3.1 Shared identity

**One account record per person, in the shared `users` collection, owned by one service.**

The good news from 0.2: the architecture this needs **already exists**. The DSA backend is a separate service with documented auth endpoints. Scholars Drill should consume those endpoints and never implement its own hashing, token signing, or session invalidation. This satisfies D1 — two applications, one database — without two competing auth implementations.

**What Scholars Drill owns:** its own collections (question bank, attempts, subscriptions, reports), keyed by the shared user id. It never writes credentials or DSA enrolment fields directly.

**What "same credentials" means in v1.** The same email and password sign a student in on either site. It does **not** mean being signed in on one site silently signs you in on the other — that is cross-domain SSO, which across separate domains (D2) needs a token-handoff flow. v1 ships shared credentials; silent SSO is a Phase 2 decision (O4).

### 3.2 A free registration path (new, and a v1 blocker)

Today `POST /api/auth/register` initialises Paystack and parks the user at `pending_payment`. No payment, no account. Scholars Drill needs the opposite default.

Required: a registration path that creates an `active` account **without payment**, going straight to OTP verification:

`register (free) → pending_otp → verify-otp → active`

Whether that is a new endpoint, a `product` parameter on the existing one, or a `price: 0` branch is the backend team's call — but it must exist, and the resulting account must be a first-class user, not a lesser one. It also must not let anyone bypass DSA's paid enrolment: **free registration creates a Scholars Drill account with no DSA enrolment and no Student ID.** (R-21, O13)

### 3.3 Product-namespaced roles (new, and a v1 blocker)

The single `role` string must be joined by per-product roles, e.g.:

```
roles: {
  dsa:           'student' | 'tutor' | 'parent' | 'staff' | 'admin' | 'super_admin' | null,
  scholarsdrill: 'student' | 'content_admin' | 'admin' | null
}
```

Rules:
- Scholars Drill authorises **only** on `roles.scholarsdrill`. It must never read the legacy top-level `role`.
- The legacy `role` field stays populated for the existing DSA frontend until it is migrated — a compatibility field, not a source of truth for the new product.
- Cross-product rights are assigned explicitly, never inherited.
- **The admin bypass (`NEXT_PUBLIC_ENABLE_ADMIN_BYPASS`) must be off and removed before Scholars Drill launches.** It is currently on by default on the live site, and once the two products share a user collection it is not just a DSA problem.

### 3.4 Account model

Three concepts that must not be collapsed:

| Concept | Where | Who has it |
|---|---|---|
| **Account identity** | `users` doc: id, fullname, email, password hash, status, verification | Everyone |
| **DSA enrolment** | Student ID, `programmes`, `learningMode`, class, attendance, fees | Only DSA-enrolled students |
| **Scholars Drill profile** | Tier, exam target, subjects, attempts, bookmarks | Everyone who has opened Scholars Drill |

**A Scholars Drill-only user gets no DSA Student ID.** `DSA/2026-…` means "enrolled DSA student" and must keep meaning that, or DSA's rosters and guardian linking (which keys on `studentId`) break. This is why identity is *email + Student ID + Program* (D5) — Student ID is an enrolment attribute, not a universal identifier.

**Naming hazard:** the existing field `isDsaStudent` means *physical vs online* study mode, **not** "is this person a DSA student rather than a Scholars Drill user". Do not reuse it for product origin. Use a separate `products[]` array (R-18). Getting this wrong will look like it works and be wrong in production.

### 3.5 Two admin dashboards, one database

**DSA Admin** — existing responsibilities unchanged, plus per D4:
- Default tab **DSA Students** — accounts with an active DSA enrolment. Class management, attendance, payments, announcements all operate on this set. This is what `GET /api/admin/users?role=student` returns today.
- Second tab **All Accounts** — every account, with an origin filter (DSA / Scholars Drill / Both), searchable by name, email, Student ID.
- Bulk actions live only in the first tab and are hard-scoped to it. D4 grants visibility of everyone; it must not grant a class announcement the reach of the whole country.

**Scholars Drill Admin** — separate dashboard, separate role (3.3):
- Question bank management: upload, edit, tag by exam/year/subject/topic/difficulty, plus the verification workflow (3.6).
- User management: tier, suspension, usage.
- Reported-question review queue.

### 3.6 Question bank and answer verification

The existing quiz API is an **admin-authored quiz** model: a quiz is a titled container of subjects and questions, reached by `accessLink` + `accessCode`. That fits DSA's mock exams. It does **not** give Scholars Drill what it needs — a national pool of individually addressable questions, filterable by year, topic and difficulty, from which sessions are assembled on demand. Today's create-quiz payload carries no `year`, `topic`, or `difficulty` at all (the frontend `Question` type has them; the API contract does not).

So v1 needs a **question bank as a first-class collection**, not a quiz list:

- Each question: text, options, correct answer, worked solution, exam type, year, subject, topic, difficulty, institution (Post-UTME), status.
- Status: `draft` → `verified` → `disputed`. **Only `verified` is servable in CBT Mode.**
- Every question in the student UI has a **report control**. N reports moves it to `disputed`, out of the servable pool and into the review queue.
- Verification records verifier identity and timestamp.

Without this, "verified answers" is a marketing claim the product cannot back, and the AI will confidently explain a wrong answer — worse than no explanation.

### 3.7 CBT and Practice modes

**CBT Mode** — countdown timer with auto-submit, on-screen calculator, flag-and-review, question grid, instant score, worked solutions after submit. Sessions are assembled from the bank by filter, not pre-authored.

**Practice Mode** — untimed, per-question feedback, worked solution and AI explanation on demand, bookmarking.

Some of this exists in `/dashboard/simulator` and `/rapid-quiz` and may be reusable — subject to O15.

### 3.8 AI explanation engine

On demand, per question, after the student has answered: why the correct answer is correct, and why the chosen one is wrong.

- Student-triggered only, never pre-generated across the bank (cost).
- **Cached per (question id, chosen option)** — the same wrong answer is explained thousands of times and should cost once.
- Grounded in the stored question, options, verified answer and worked solution. The model is never the source of the correct answer.
- Carries its own "This doesn't look right" control, feeding the same queue as 3.6.
- Rate-limited on the Free tier (O7).
- On failure, degrades to the stored worked solution — never a blank state.

### 3.9 Explicitly out of v1

AI weakness detector, AI study planner, AI tutor chat, AI question/flashcard generator, voice tutor, streaks/XP/badges/leaderboards, weekly national challenges, Intelligence Community peer Q&A, offline mode, national mock scheduling, Scholars Drill parent and tutor dashboards, institutional accounts.

*(Note: `/dashboard/community` and `/dashboard/rankings` already exist in the DSA frontend. Out of scope here means out of scope **for Scholars Drill v1** — it does not mean removing them from DSA.)*

---

## 4. User Stories

### Shared identity

**US-1** — As a DSA tutorial student, I want to open Scholars Drill and sign in with the details I already use for DSA, so that I can start practising without creating another account.
*Accepts when:* DSA email + password signs me in on Scholars Drill; no registration form; name and exam track pre-filled from my existing profile; dashboard in one step.

**US-2** — As a new candidate with no DSA connection, I want to sign up on Scholars Drill for free, so that I can use the platform without paying a tutorial centre in Ibadan.
*Accepts when:* signup completes with **no payment step**; I verify by OTP and reach the dashboard; I am never asked for a Student ID or Program; I get full Free-tier access.

**US-3** — As a student who signed up on Scholars Drill and later enrolled at DSA, I want my existing account to become my DSA account, so that I keep my practice history and progress.
*Accepts when:* enrolment attaches a `DSA/YYYY-…` Student ID and `programmes` to my existing account; no second registration; Scholars Drill data intact; DSA dashboard appears.

**US-4** — As a student, I want to change my password once and have it work on both sites.
*Accepts when:* a change on either product applies to both; sessions on both invalidate; the UI says plainly that it covers both.

**US-5** — As a student who forgot my password, I want to reset from whichever site I am on.
*Accepts when:* reset works from either product; the email is branded to the product I started from; the new password works on both.

**US-6** — As a student, I want to verify my account by OTP once, not once per product.
*Accepts when:* an account already `active` on DSA is not asked to re-verify on Scholars Drill; a Scholars Drill account verified by OTP is `active` for DSA login too.

### Practice and learning

**US-7** — As a candidate two weeks from JAMB, I want a timed mock under real exam conditions, so that I know whether I can finish in time.
*Accepts when:* timer counts down and auto-submits; calculator available; questions flaggable and revisitable; score immediate on submit.

**US-8** — As a student who got a question wrong, I want to know *why*, so that I do not repeat the mistake.
*Accepts when:* explanation available on demand after answering; addresses both the correct option and mine; appears within an acceptable wait (O8).

**US-9** — As a student, I want to filter by subject, year and topic, so that I can drill my weak topic rather than a random mix.
*Accepts when:* filters combine; results are verified questions only; an empty result says so.

**US-10** — As a student who spots a wrong answer, I want to report it, so that the platform I am trusting stays trustworthy.
*Accepts when:* one-tap report on every question and explanation; confirmation shown; question leaves the servable pool pending review.

### Admin

**US-11** — As a DSA admin, I want my student list to show only enrolled tutorial students by default, so that class management is not buried under national signups.
*Accepts when:* default view is DSA-enrolled only; all-accounts is a deliberate second step; bulk messaging cannot reach past the enrolled set.

**US-12** — As a DSA admin, I want to search all accounts across both products, so that I can answer a parent's question regardless of where the account was created.
*Accepts when:* search covers name, email, Student ID; each result shows origin and enrolment status.

**US-13** — As a Scholars Drill content admin, I want to upload questions and mark them verified, so that only checked questions reach students.
*Accepts when:* bulk upload supported; questions tagged by exam/year/subject/topic/difficulty; unverified never served in CBT; verifier and timestamp recorded.

**US-14** — As a Scholars Drill admin, I want a queue of reported questions, so that disputes are resolved rather than accumulating.
*Accepts when:* reports listed with count and student comment; I can correct, re-verify or retire; resolution restores or removes the question.

**US-15** — As the platform owner, I want product admin roles separated, so that a DSA staff account cannot administer the national platform.
*Accepts when:* a `role: admin` DSA account has **no** Scholars Drill admin access; Scholars Drill authorises only on `roles.scholarsdrill`; the admin bypass is removed; role changes are logged.

---

## 5. Requirements

### 5.1 Identity and authentication

| ID | Requirement | Priority |
|---|---|---|
| R-1 | One `users` collection holds exactly one record per person, used by both products | Must |
| R-2 | The existing DSA backend service owns all auth endpoints. Scholars Drill consumes them and never writes credentials or hashes | Must |
| R-3 | Existing DSA credentials authenticate as-is. No migration forcing existing students to reset passwords (D6) | Must |
| R-4 | **A free registration path that creates an `active` account with no payment**, via OTP only (F1, 3.2) | Must — blocker |
| R-5 | Free registration creates no DSA enrolment and no Student ID | Must |
| R-6 | Email stored normalised (trimmed, lower-cased) and matched case-insensitively | Must |
| R-7 | A unique index on normalised email exists at the database level, not only in application validation (O1, O16) | Must |
| R-8 | **Product-namespaced roles (`roles.dsa`, `roles.scholarsdrill`). Scholars Drill authorises only on its own namespace and never reads the legacy `role`** (F2, 3.3) | Must — blocker |
| R-9 | `NEXT_PUBLIC_ENABLE_ADMIN_BYPASS` is disabled and the bypass code removed before Scholars Drill launch | Must — blocker |
| R-10 | Admin route protection is enforced by the backend on every request, not by a client-set `admin_token=true` cookie | Must |
| R-11 | A password change or reset invalidates active sessions on **both** products | Must |
| R-12 | Account status (`active` / `suspended` / `deleted`) is account-level and blocks both products. A **product-level** ban blocks only that product and is stored separately | Must |
| R-13 | An account already `active` is not asked to re-verify by OTP on the other product (US-6) | Must |
| R-14 | Auth events (login, failure, password change, role change, cross-product provisioning) are audit-logged with product, IP, timestamp | Must |
| R-15 | Rate limiting on login, registration and password reset, per IP and per account | Must |
| R-16 | Cross-domain silent SSO is **not** in v1 — shared credentials only (O4) | v1 constraint |

### 5.2 Data model

| ID | Requirement | Priority |
|---|---|---|
| R-17 | Account record holds only shared identity: id, fullname, normalised email, phone, password hash, status, verification, timestamps | Must |
| R-18 | A `products[]` array records which products the person has entered, with first-seen timestamps. **It is a new field — `isDsaStudent` is study mode and must not be reused** (3.4) | Must |
| R-19 | DSA enrolment data (Student ID, `programmes`, `learningMode`, class, attendance, fees) is clearly separated from account identity | Must |
| R-20 | Scholars Drill data (tier, exam target, subjects, attempts, bookmarks) lives in Scholars Drill collections keyed by account id | Must |
| R-21 | Each field has exactly one owning service. Scholars Drill never writes DSA enrolment fields; DSA never writes Scholars Drill profile fields | Must |
| R-22 | Student ID is issued on DSA enrolment only, is unique, and keeps the `DSA/YYYY-XXXXXX` format (guardian linking depends on it) | Must |
| R-23 | Writes to the shared account record use atomic field-level updates, never whole-document replacement (E12) | Must |

### 5.3 Cross-product flows

| ID | Requirement | Priority |
|---|---|---|
| R-24 | First Scholars Drill sign-in by an existing account auto-creates a Free-tier profile with no user-facing step (D3) | Must |
| R-25 | Auto-provisioning pre-fills from existing profile data (`examTrack`/`level`, `subjectsOfInterest`, `programmes`); anything missing is collected in-app, not as a blocking form | Must |
| R-26 | A signup attempt with an existing email is handled as a sign-in prompt, never a duplicate account or a bare "email taken" error (E1) | Must |
| R-27 | DSA enrolment of an existing account attaches enrolment data to it; no new account is created for an existing email (US-3) | Must |

### 5.4 DSA admin

| ID | Requirement | Priority |
|---|---|---|
| R-28 | Default DSA admin student view is filtered to accounts with an active DSA enrolment | Must |
| R-29 | An "All Accounts" view lists every account with an origin filter and search by name, email, Student ID (D4) | Must |
| R-30 | Bulk actions (messaging, export, class assignment) exist only in the enrolled-students view and are hard-scoped to it | Must |
| R-31 | The all-accounts view is read-and-search only in v1 | Should |

### 5.5 Question bank, CBT, AI

| ID | Requirement | Priority |
|---|---|---|
| R-32 | A question bank collection with per-question exam type, year, subject, topic, difficulty, institution — addressable and filterable independently of any quiz (3.6) | Must |
| R-33 | Question status `draft` / `verified` / `disputed`; only `verified` servable in CBT Mode | Must |
| R-34 | Verification records verifier identity and timestamp | Must |
| R-35 | Report control on every question and every AI explanation; N reports (configurable, O6) moves a question to `disputed` | Must |
| R-36 | CBT Mode: countdown with auto-submit, calculator, flag/review, question grid, instant scoring, worked solutions post-submit | Must |
| R-37 | Practice Mode: untimed, per-question feedback, explanation on demand, bookmarking | Must |
| R-38 | In-progress CBT attempts persist server-side and survive disconnection, refresh and device change (E9) | Must |
| R-39 | AI explanations generated on demand only, cached by (question id, chosen option) | Must |
| R-40 | AI explanations grounded in the stored question, options, verified answer and worked solution; the model is not the source of the correct answer | Must |
| R-41 | Free-tier daily limits enforced **server-side**, reset at midnight Africa/Lagos (E10) | Must |
| R-42 | AI failure degrades to the stored worked solution — never a blank state or error page | Must |

### 5.6 Non-functional

| ID | Requirement | Priority |
|---|---|---|
| R-43 | Mobile-first. Primary device is a mid-range Android phone on 3G/4G | Must |
| R-44 | Lightweight question payloads; images compressed and lazy-loaded; CBT usable on an intermittent connection | Must |
| R-45 | Answers submit optimistically and queue for retry — a dropped connection mid-exam must not lose answered questions | Must |
| R-46 | NDPR compliance: explicit consent at registration, minors' data handled with care, no third-party sale | Must |
| R-47 | The shared auth service is the highest-criticality dependency. A Scholars Drill deploy must not be able to take it down (E13) | Must |
| R-48 | Shared design system across both products so a student recognises one organisation | Should |

---

## 6. Edge Cases

**E1 — Signup on Scholars Drill with an email that already exists on DSA.**
Do not create a duplicate; do not show a bare "email already taken" — the student may not know they have a DSA account. Show: *"You already have an account with Distinguished Scholars Academy. Sign in with the same details."* plus a reset link. Same in reverse.

**E2 — Same person, two different emails.**
Registered at DSA with a parent's email, signed up at Scholars Drill with their own. Two accounts, one human. Not reliably detectable. v1: an **admin-initiated account merge** in the DSA dashboard (search by name/phone, confirm, merge), logged, behind a confirmation step. Automatic merging on phone match is **not** in v1 (E4).

**E3 — Case-variant or whitespace-variant duplicate emails already in the database.**
Backend validation enforces uniqueness, but if it compares raw strings then `Ada@x.com` and `ada@x.com` are two accounts today. Audit before build (O1); normalise and add the database-level unique index (R-6, R-7).

**E4 — Recycled phone number.**
Nigerian numbers get reassigned. Phone alone must never authenticate into an existing account; it may verify alongside a password.

**E5 — Registration abandoned at `pending_payment`.**
A real risk in the current flow: `POST /register` creates a User record and reserves a Student ID before payment. Those records sit at `pending_payment` forever, holding an email address. If such a person later signs up on Scholars Drill, the email collides with a half-created DSA account that has never been paid for or verified. Decision needed: does the free Scholars Drill path **claim and activate** that record, or is it blocked? Recommended: claim it — activate as a Scholars Drill account, leave the DSA enrolment unpaid and inactive, do not honour the reserved Student ID until payment. (O13)

**E6 — Unverified account claimed on the other product.**
Accounts at `pending_otp` exist under an email nobody has proven they control. A first cross-product sign-in on a non-`active` account must complete OTP verification before access is granted, or shared login becomes an account-takeover path.

**E7 — Password reset started on the wrong-feeling brand.**
A student who only knows Scholars Drill receives a DSA-branded reset email. Confusing at best, phishing-shaped at worst. Brand the email to the product the reset started from while resetting the one shared credential.

**E8 — DSA enrolment ends.**
Term finishes or the student drops out. **Account and Scholars Drill access persist**; only the enrolment closes. They leave the DSA enrolled-students view, stay in all-accounts, keep all practice history. Losing a CBT account because a tutorial term ended would be a serious product failure.

**E9 — Cross-product privilege escalation.** *(Confirmed live risk — F2.)*
Every account carries a single `role`. If Scholars Drill reads it, every DSA admin, tutor and staff member becomes a Scholars Drill admin, and the still-enabled admin bypass extends to the national platform. Namespaced roles (R-8) plus bypass removal (R-9), with an explicit regression test: *a `role: admin` DSA account receives 403 from every Scholars Drill admin endpoint.*

**E10 — Password change mid-exam.**
R-11 invalidates sessions on both products, killing an in-progress CBT attempt on another device. Rule: **submitted answers are never lost.** The attempt persists server-side (R-38); on re-authentication the student resumes at the question they reached with timer state preserved.

**E11 — Free-tier daily limit and timezone.**
"100 questions/day" resets at midnight **Africa/Lagos**, not UTC — a UTC reset lands at 1am local and reads as broken. Server-side enforcement; a client counter is trivially bypassed.

**E12 — A verified answer turns out to be wrong.**
The AI will have confidently justified it to every student who asked. When a question moves to `disputed`, invalidate its cached explanations and pull it from the pool. v1: log affected past attempts. Notifying affected students is Phase 2.

**E13 — Concurrent writes from both apps to one account record.**
Whole-document writes will silently clobber. Atomic field-level updates only (R-23), plus the single-owner rule (R-21).

**E14 — Auth service down.**
Under R-2 both products share one auth dependency. Accept it, monitor it as the highest-criticality service, and make sure a Scholars Drill deploy cannot take it offline.

**E15 — Student ID as a login identifier.**
DSA students may expect to log in with `DSA/2026-…`. Scholars Drill users have none. If the login field accepts either, the Scholars Drill form must not imply a Student ID is required (O5).

**E16 — Guardian accounts and the shared login.**
`role: parent` accounts link to a student by `studentId` and exist to view a child. What does a guardian see if they sign in to Scholars Drill? v1 recommendation: **guardians have no Scholars Drill access** — signing in returns a clear message rather than an empty student dashboard. (O14)

**E17 — Deleting an account with an active enrolment or paid subscription.**
Block deletion where money or an active enrolment is attached, with an explanation and a route to support.

**E18 — Two accounts later enrolled under one Student ID.**
An operational error, but the unique constraint (R-22) must reject it rather than silently accept a second holder — guardian linking keys on `studentId`.

---

## 7. MVP Scope

**Goal of v1:** a DSA student and a stranger from Kano can each use Scholars Drill's CBT engine, with one account model behind both, and neither is asked to register twice.

### Backend blockers — these come first

1. **Free registration path** (R-4, R-5) — no free signup exists today.
2. **Product-namespaced roles** (R-8) — cross-product admin escalation is live-by-default.
3. **Remove the admin bypass and enforce admin auth server-side** (R-9, R-10).
4. **Email normalisation audit + database-level unique index** (R-6, R-7, E3).
5. **Question bank as a first-class collection** (R-32) — the current quiz API cannot serve filterable national practice.

Nothing student-facing is worth building before 1–4 land.

### In scope

**Shared identity** — one account, one auth service; existing DSA credentials unchanged; silent Free-tier auto-provisioning on first Scholars Drill sign-in; free direct signup; existing-email signup handled as sign-in; password change/reset spanning both products; namespaced roles; audit logging.

**Scholars Drill student experience** — CBT Mode; Practice Mode; question bank with exam/year/subject/topic/difficulty filters; AI explanation engine (on demand, cached, grounded, degrading); report control; server-side Free-tier limits.

**Scholars Drill admin** — question upload and tagging; verification workflow; reported-question queue; basic user list with tier and suspension.

**DSA admin** — existing dashboard unchanged, plus the all-accounts view with origin filter and search (D4); default view scoped to enrolled students; bulk actions hard-scoped; admin-initiated account merge (E2).

### Out of scope for v1

Paid tiers and payments on Scholars Drill; all other AI features; gamification; peer Q&A; offline mode; national mock scheduling and rankings; Scholars Drill parent and tutor access; institutional accounts; silent cross-domain SSO; automatic account merging; editing Scholars Drill users from the DSA dashboard.

### On launching without payments

D8 puts payments outside v1, so Scholars Drill launches free. Defensible — it maximises signups and stress-tests the question bank before money is involved — but **v1 generates no direct revenue**, and tier-gating (R-41) must be built assuming paid tiers arrive next, so Phase 2 is a switch-on rather than a rebuild. Worth noting that Paystack integration already exists in the DSA backend, so Phase 2 is integration work rather than greenfield. Confirm this sequencing is intentional (O9).

### v1 is done when

1. A DSA student signs in to Scholars Drill with existing credentials and reaches the dashboard with no registration form.
2. A new user completes free signup with **no payment step** and is never asked for a Student ID or Program.
3. That user, on enrolling at DSA, keeps the same account and all practice history.
4. A password changed on either product works on the other and invalidates both sessions.
5. **A `role: admin` DSA account receives 403 from every Scholars Drill admin endpoint** (regression test).
6. The admin bypass is gone and admin routes are enforced server-side.
7. Only verified questions are served in CBT Mode; a reported question leaves the pool.
8. A dropped connection mid-CBT loses no submitted answers.

---

## 8. Success Metrics

**Does the shared account work?**
- % of DSA-enrolled students signed in to Scholars Drill within 30 days of launch
- Duplicate-account rate (merged / total) — should be near zero
- Signup abandonment among users who already had a DSA account — should be near zero after E1 handling

**Is the product used?**
- Weekly active students; questions attempted per active student per week
- CBT attempts completed vs abandoned
- AI explanation requests per attempt

**Trust — the differentiator**
- Reports per 1,000 questions served; median report-to-resolution time; % of bank in `disputed`

**Business**
- Scholars Drill users who enrol in DSA — the flywheel the whole structure exists for

---

## 9. Open Questions

### Closed by the codebase review

| # | Question | Answer |
|---|---|---|
| ~~O2~~ | DSA auth methods | Email + password with JWT. **No Google OAuth** — US-6 rescoped to OTP parity |
| ~~O3~~ | Does DSA verify email? | Yes — 4-digit OTP, `status: active` on verify |
| ~~O11~~ | Student ID format | `DSA/YYYY-` + 6 random alphanumerics (e.g. `DSA/2026-8903DS`) |
| ~~O12~~ | Programme list | `programmes[]` on the user; JAMB, WAEC, Post-UTME; course categories `waec-sss`, `jamb-putme`, `higher` |

### Open

| # | Question | Blocks | Owner |
|---|---|---|---|
| **O1** | Does the live `users` collection contain **case-variant or whitespace-variant duplicate emails**? Backend validates uniqueness, but the comparison may be raw-string. One aggregation on lowercased email settles it (E3) | R-6, R-7 | Eng |
| **O4** | Shared credentials only in v1, or silent cross-domain SSO? Separate domains (D2) make SSO a real token-handoff build | R-16 | Product + Eng |
| **O5** | Should the login field accept Student ID as well as email? (E15) | Login UI | Product |
| **O6** | How many reports move a question to `disputed`? | R-35 | Product |
| **O7** | Free-tier limits: questions/day and AI explanations/day. Spec says 100 questions/day; the AI limit is unstated | R-41 | Product |
| **O8** | Acceptable wait for an AI explanation, and which LLM provider (an open decision in the technical spec too) | R-39, cost | Eng + Product |
| **O9** | Confirm v1 launches with no payments on Scholars Drill — a revenue decision, not only a scope one | MVP scope | Business |
| **O10** | Confirmed Scholars Drill domain name | Infra, branding | Business |
| **O13** | **What happens to abandoned `pending_payment` DSA registrations when that email signs up free on Scholars Drill?** Recommended: claim and activate as a Scholars Drill account, do not honour the reserved Student ID until payment (E5) | R-4 | Product + Eng |
| **O14** | Do `role: parent` guardians get any Scholars Drill access? Recommended: no in v1 (E16) | R-8 | Product |
| **O15** | **`/quiz360pro`, `/rapid-quiz`, `/dashboard/quiz360`, `/dashboard/simulator` already exist inside the DSA frontend. Extract them into the new app, or revise D1?** Leaving both guarantees two divergent CBT implementations (F3) | Architecture | Eng + Product |
| **O16** | Backend repo access for schema review — the actual Mongoose models, indexes and hashing config were not readable, only the API docs | R-3, R-7 | Eng |
| **O17** | Where do the launch questions come from — existing DSA material, licensed bank, or manual entry? A CBT product with an empty bank does not launch | v1 content | Business |
| **O18** | Who staffs verification and the report queue, at what daily volume? The differentiator is an ongoing operational commitment, not a feature | R-33, R-35 | DSA ops |

---

## Appendix A — Assumptions

1. Both products deploy independently against the same MongoDB Atlas cluster and the same backend auth service (D1, D7).
2. The backend at `api.distinguishedscholarsacademy.com` is stable enough to own shared auth. Its documented endpoints are treated as accurate; the schemas behind them were not read (O16).
3. `programmes` / `examTrack` are DSA-registration attributes. A Scholars Drill-only user has neither until they enrol.
4. Nigerian students only in v1; all times, currency and exam types local.
5. The technical spec's Phase 1–4 sequencing holds; this PRD scopes v1 tighter than the spec's Phase 1 because D8 narrowed it.

## Appendix B — Existing API surface referenced

| Purpose | Endpoint |
|---|---|
| Login | `POST /api/auth/login` |
| Register (student, payment-gated) | `POST /api/auth/register` |
| Register guardian | `POST /api/auth/register-guardian` |
| Verify OTP | `POST /api/auth/verify-otp` |
| Current user | `GET /api/auth/me` |
| Forgot / reset password | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password/:token` |
| Update password | `PUT /api/auth/updatepassword` |
| Student lookup | `GET /api/auth/student?studentId=…` |
| List users by role | `GET /api/admin/users?role=…` |
| Create staff/tutor/parent/admin | `POST /api/admin/staff` |
| Quizzes | `POST /api/quizzes`, `GET /api/quizzes/link/:link`, `POST /api/quizzes/verify-code`, `POST /api/quizzes/:id/submit`, `GET /api/quizzes/:id/leaderboard` |
| Programmes countdown | `GET`/`POST /api/programs` |

Swagger: `https://api.distinguishedscholarsacademy.com/api-docs`

---

*Sources: DSA & Quiz360Pro Technical Specification v1.0; the DSA frontend repository (`src/lib/auth.ts`, `src/lib/types.ts`, `middleware.ts`, `.env.example`) and its `docs/` API contracts (`auth.md`, `admin.md`, `quiz.md`, `program.md`, `backend-needs.md`); confirmed product decisions D1–D8.*
