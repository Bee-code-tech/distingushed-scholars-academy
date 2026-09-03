# Backend requests — 2026-09-03 (P0–P2 from post-presentation backlog)

The three P0 items from `docs/post-presentation-backlog-2026-09-03.md`. Item 2
(tutor profile) was a pure frontend gap and is **fixed**; items 1 and 3 need the
backend.

---

## 1. Custom roles / permissions — create-role API 🔴

**Symptom:** "not allowed to create a new role."

**Current state (frontend):** the admin *Permissions* screen
(`src/app/admin/components/RolesPermissions.tsx`) reads roles from
`GET /api/admin/roles`, but **creating / editing a role saves to a browser-local
store** (`staffStore.saveRole`) — it never persists server-side. So a created
role disappears on another device and can't be assigned for real.

**Backend needed:**
- **`POST /api/admin/roles`** (admin) — create a custom role
  `{ name, permissions: string[] }` → returns the saved role `{ id, name, permissions }`.
- **`PUT /api/admin/roles/:id`** (admin) — update a role's name / permissions.
- **`DELETE /api/admin/roles/:id`** (admin) — remove a role.
- Make sure the acting admin is **permitted** to manage roles (the current error
  reads like an authorization rejection, not a missing route).
- Related, still pending: **staff-account creation** (`POST /api/admin/staff`)
  so a person can actually be given one of these roles and sign in.

**Frontend follow-up (admin dev):** once the endpoints persist + allow creation,
switch `RolesPermissions.tsx` from `staffStore.saveRole` to
`dsaApi.admin.createRole` / update / delete (an `createRole` stub already exists
in `src/lib/admin-api.ts`). Left to the admin frontend owner — noted in
`docs/note-for-admin-frontend-dev.md`.

---

## 2. Tutor profile — ✅ fixed frontend-side (no backend change)

"Tutor unable to update his profile" was simply that the **tutor dashboard had no
Settings screen** — the endpoints already exist (`PUT /auth/updatedetails`,
`PUT /auth/updatepassword`). Added a **Profile & Settings** tab to the tutor
dashboard reusing the shared `SettingsView`. Works against the existing
endpoints; no backend work required. (If `PUT /auth/updatedetails` rejects a
tutor role, that would be the only backend follow-up — please confirm it accepts
tutors.)

---

## 3. No cross-tutor "spill-over" — scope tutor endpoints 🔴

**Requirement:** a tutor must only ever see **their own students'** data in
Gradebook, Assignments, Analytics (and the roster). Today a tutor can see beyond
their assigned students.

**The frontend already asks for scoped data** — it does not request all students:
- Gradebook: `GET /courses?tutorId=me` + `GET` tutor students (`analytics.tutorStudents`).
- Analytics (tutor): `analytics.tutorOverview()` + `analytics.tutorStudents()`.
- Assignments (tutor): `GET /courses?tutorId=me`, then submissions per course.

So the spill-over is **server-side**: these endpoints must filter to the
**authenticated tutor's** courses/students, not return the whole set. Please
verify and enforce scoping on:

- **`GET /courses?tutorId=me`** → only courses that tutor is assigned to.
- **the tutor students endpoint** (roster / `analytics.tutorStudents`) → only
  students enrolled in that tutor's courses.
- **`analytics.tutorOverview`** and any per-course grade/assignment/analytics
  reads → aggregate only over that tutor's students.
- **assignment submissions** and **manual grades** reads → a tutor may only read
  submissions/grades for **their own** assignments/courses.

A tutor should never be able to fetch another tutor's roster, submissions, grades
or analytics — enforce by the token's tutor id, not a client-supplied filter.

---

## 4. Payments — paid vs free access + 1/2/3-month plans 🟡 (P2)

The 3-level access model (`free` / `portal` / `tutorial`) and the plans UI are
built (`src/lib/access.ts`, `UnlockPlans.tsx`); the frontend now lets a student
buy a **tutorial plan for 1, 2 or 3 months** (price = monthly × months). Backend
needed to make it real:

- **`GET /plans`** — the admin-managed plan list `{ id, name, kind, amount,
  durationMonths, grantsLevel, note }`. (Frontend shows sensible defaults until
  this is live.) `amount` is the **per-month** price for tutorial plans.
- **`POST /payments/online`** and **`POST /payments/offline`** now receive
  `{ planId, months, amount }` — `months` ∈ {1,2,3} and `amount` = monthly ×
  months. Verify/record the payment, then **grant access**: set the user's
  `accessLevel` (`portal` or the plan's `grantsLevel`) and, for tutorial plans,
  **`tutorialExpiry = now + months`**. The portal already reads `accessLevel` +
  `tutorialExpiry` and expires access past the date.
- Return `accessLevel` / `tutorialExpiry` on `GET /auth/me` so the portal
  reflects paid vs free correctly.
- The paywall itself is gated by `NEXT_PUBLIC_PAYWALL_ENABLED` (off in beta);
  flip it on once payments + access-grant are verified.

Admin side (offline approvals) already exists; it just needs the grant-on-approve
to set `accessLevel` + `tutorialExpiry`.

---

## 5. Classes & tracks (P3)

Registration **already** captures a **class** (SS1 / SS2 / SS3) separate from the
programme (`classLevel`, sent as `currentLevel`; the backend stores & returns it —
confirmed `currentLevel: "SS3"`). The student **home now shows the class beside
the track** (frontend done). Remaining work is backend + the admin roster:

- **Courses keyed off class** — a course should target a **class** (SS1/SS2/SS3),
  so a tutor's course and a student's class line up. Add a `class` (or reuse
  `currentLevel`) dimension to the course model / enrolment.
- **WAEC as a course** under the SS classes (rather than a standalone programme),
  per the new structure.
- **Tutor sees his class's students** — the tutor roster/analytics should include
  the students in the classes/courses he teaches (this is the same scoping fix as
  §3 — enforce by the tutor's assignments).
- **Get students by programme / class** — an admin endpoint (or query params on
  the roster list, e.g. `GET /admin/users?role=student&programme=&class=`) so the
  admin roster can **search + filter** by programme/class.

**Admin frontend (admin dev):** wire a search box + programme/class filter dropdown
into `StudentRoster.tsx` against that endpoint. Left to the admin owner (didn't
touch the component).
