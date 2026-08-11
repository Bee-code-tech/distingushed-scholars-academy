# Backend requests — from the frontend team

> **Archive.** The endpoints below were the frontend wishlist. They are now
> implemented on the backend — use the LIVE docs in [README.md](./README.md)
> (`admin.md`, `attendance.md`, `courses.md`, etc.) and Swagger `/api-docs`
> for integration. Keep this file only for historical context.


The frontend is fully built and running on **browser-local / mock data**. These
endpoints are what's needed to make it real. Items are ordered by urgency.

> **Note:** the product **no longer has quizzes / CBT** — quiz features were
> removed from the app, so **no quiz endpoints are needed** (any `/api/quizzes*`
> work can be dropped from scope).

Base API: `https://api.distinguishedscholarsacademy.com/api`

---

# 🔴 URGENT — the sign-up, payment & login flow

This is the core path and touches money, so it's first.

## 1. Registration now collects much more — store & return it all

`POST /api/auth/register` currently accepts only
`{ name, email, password, phoneNumber, level, subjectsOfInterest, profilePic, role }`.
The multi-step signup now collects and sends **all** of the following — please
store them and return them on `GET /api/auth/me`:

| Field | Notes |
| --- | --- |
| `name`, `email`, `phoneNumber`, `password` | as today |
| `gender` | Male / Female |
| `dateOfBirth` | ISO date |
| `stateOfResidence` | Nigerian state |
| `school` | current school / institution |
| `classLevel` | SS1, SS2, SS3, 100 Level, 200 Level |
| `isDsaStudent` (boolean) | **physical (on-campus) vs online** — drives the whole dashboard |
| `subjectsOfInterest` (string[]) | JAMB/Post-UTME: subjects · WAEC: a single department (`["science"]`/`["art"]`/`["commercial"]`) |
| `programmes` (string[]) | e.g. WAEC Tutorials, JAMB Tutorials, Post-UTME Tutorials, After-School, etc. |
| `guardianName`, `guardianPhone`, `guardianEmail` | parent/guardian contact |
| `profilePic` | passport photo (currently sent as a base64 data URL) |
| `paymentReference` | Paystack reference — see §2 |
| `role` | always `student` from this form; **tutors and guardians/parents are created by an admin** (not self-service) — see §5 |

**Why it matters:** on-campus vs online, department, and programmes drive the
dashboard, timetable, attendance and live-class views. Today the frontend
remembers these in local storage as a fallback, so a student on a **different
device** loses them until the API stores and returns them.

## 2. Verify the Paystack payment (Portal Access Fee) — money

Every student pays a one-time **₦2,000 Portal Access Fee** via Paystack **before**
the account is activated.

**The frontend now uses the register-first flow that the API's Swagger already
implies:**

1. `POST /api/auth/register` (with `price` in **kobo** = `200000`) → server
   creates the PENDING student, **initializes** the Paystack transaction, and
   returns `data: { accessCode, authorizationUrl, reference, … }`.
2. The browser **resumes that same transaction** with `accessCode` (Paystack
   Popup v2 `resumeTransaction`) — so the reference the student pays under is the
   one the server created.
3. Paystack calls **`POST /api/auth/paystack/webhook`** (HMAC-SHA512) → the
   server marks the student paid. The client never decides "paid".
4. Then OTP → `verify-otp` issues the token.

**So the backend must actually return `data.accessCode` (and/or
`authorizationUrl`) from register, and the webhook must flip the paid flag.**
Verify server-side with the SECRET key (`GET
https://api.paystack.co/transaction/verify/:reference`) — never trust the
client; the secret key lives only in a backend env var. (If register does not
return an access code, the frontend falls back gracefully, but payment won't be
collected — so this response field is required for real payments.)

**Also plan for manual (offline) payments.** Some students pay by bank transfer
or cash. Authorized staff (see §9) must be able to mark such a student as paid —
e.g. `POST /api/payments/manual { studentId, amount, method, reference? }`
(staff-only) → sets `isPaid`. So paid-status should not depend solely on Paystack.

## 3. Return `role`, study mode, department & subjects on `GET /api/auth/me`

After login the frontend routes by `role`:
`student → /dashboard`, `tutor → /tutor`, `parent → /guardian`, `admin → /admin`.
`/auth/me` (and the `user` object from `/auth/login` and `/auth/verify-otp`) must
return the true **`role`**, plus **`isDsaStudent`** and **`subjectsOfInterest`**
so the dashboard shows the right mode and department.

## 4. OTP verification + resend

- Real OTP verification on `POST /api/auth/verify-otp`. (The frontend currently
  accepts a **demo code `1111`** as a stand-in — replace with real verification.)
- Add `POST /api/auth/send-otp` taking `{ email }` to re-issue a code — it
  currently **404s**. The "Resend code" button is wired and waiting for it.

---

# Needed — role features (built, running on mock data)

## 5. Tutor & Guardian data

**Tutor** (`role: "tutor"`):
- **Assigned students** — roster this tutor teaches (name, track, progress).
- **Tutor's classes** — sessions they teach (title, day/time, venue or live link).
- **Class analytics** — simple progress figures across their students.

**Guardian** (`role: "parent"`):
- **Admin-created, not self-service.** An admin creates the guardian account and
  sets the ward link at creation time (`POST /api/admin/staff`-style, with
  `role: "parent"` + `wardId`). There is no guardian self-registration.
- **Ward link** — which student(s) a guardian oversees. **This relationship is the
  key missing piece** — everything else hangs off it, and it must be verified
  server-side (a guardian must not see a child's data just by naming them).
- **Ward performance, attendance, and fees** (amount, status paid/due, date).

## 6. Attendance — activate & self-check-in

Attendance is **self-check-in**, not tutor-marked:

1. A **tutor/admin activates** attendance for the day.
2. Each **student marks *themselves* present** from their dashboard; **the server
   records the time**.
3. Tutor/admin **monitor** who checked in; students **view their own** record.

```
POST   /api/attendance/sessions          activate today (tutor/admin) → { active, date, activatedAt }
DELETE /api/attendance/sessions/:date     close the window (tutor/admin)
GET    /api/attendance/sessions/current   is it open now? (any user)
POST   /api/attendance/check-in           STUDENT marks self  (studentId from JWT, NOT body)
                                          → { status: "present", at: <server time> }
                                          · 403 if closed · 409 if already checked in
GET    /api/attendance/check-ins?date=…   who checked in (tutor/admin)
GET    /api/attendance/me                 student's own record + rate
```

**Security:** only tutor/admin activate/close & see the full list; a student may
only check *themselves* in and read *their own* record; check-in only while open,
idempotent, timestamp set **server-side**.

## 7. Timetable + online-class link

- **Weekly timetable per track** (JAMB / WAEC / Post-UTME) that **admin/tutor
  edit** and students view. A grid of `subject` per day × period.
  Suggested: `GET/PUT /api/timetable/:track` with a `{ grid: string[][] }` body.
- **Online class Google Meet link per track** — admin/tutor set it, the student's
  "Join Live Class" button opens it. Suggested: a field on the track/timetable,
  e.g. `meetLink`. (Later this could be an auto-generated Meet link via the
  Google Calendar/Meet API — needs Google Workspace + server-side OAuth.)

## 8. Program countdowns

Exam countdowns read from `GET /api/programs`. Only a (stale) "JAMB Countdown"
exists. Please add entries whose `name` contains **"WAEC"** and **"Post-UTME"**,
each with a future `endDate`, and refresh the JAMB one. Updating a countdown is
just another `POST /api/programs` — no deploy.

## 9. Staff roles & permissions (admin-managed)

Beyond the four core roles (`student` / `tutor` / `parent` / `admin`), the admin
must be able to create **additional staff accounts** — e.g. **secretary,
auditor** — each with its own permissions. **Please design the role model as
role → permissions, not a hardcoded enum**, so new roles can be added without a
code change.

Examples of duties:
- **Secretary** — verify **manual/offline payments** (§2), create/edit the
  **timetable** when the admin is unavailable, manage student records, send
  announcements — general administrative work.
- **Auditor** — read-only access to payments/finance and reports.

**Requested:**
- Admin endpoint to create a staff user: `POST /api/admin/staff { name, email,
  password, role }` and assign/adjust that role's permissions.
- A **permissions model** (role → list of permissions) that is **checked
  server-side on every protected action** (e.g. only a role with
  `payments.verify` can confirm a manual payment; only `timetable.edit` can
  change the timetable).
- Staff **log in on the normal login page** and must land on a staff dashboard
  (`/staff`) whose tools are shown/hidden by their permissions. `GET /api/auth/me`
  must therefore return `role: "staff"` plus the staff role and its permissions
  (e.g. `{ role: "staff", staffRole: "secretary", permissions: ["payments.verify", …] }`).

The frontend is **already built** for all of this (admin "Permissions" screen to
create staff + edit role permissions, staff login, and a permission-gated
`/staff` dashboard) — it currently runs on browser-local data. To make it real,
back these with `POST /api/admin/staff`, a login that returns `role: "staff"`,
and the permissions on `/api/auth/me`. Permission keys the UI uses:
`payments.verify`, `payments.view`, `timetable.edit`, `timetable.view`,
`attendance.manage`, `students.manage`, `students.view`, `announcements.send`,
`reports.view`, `staff.manage`.

**Security:** authorize each staff action against that role's permissions on the
server — never trust a role/permission sent from the client.

---

## Already handled on the frontend — no backend action

- Was calling `GET /api/auth/profile` (404); corrected to **`/api/auth/me`**.
- Countdowns now read from `GET /api/programs` (see §8 for the data still needed).

---

## Cross-cutting security

- Validate the JWT and role on **every** protected endpoint — never trust a role
  or id from the client.
- Tutor endpoints return only that tutor's data; guardian endpoints only that
  guardian's **verified** wards; students read only their own records.
- The admin panel currently uses a temporary frontend-only bypass — real admin
  auth must move to the backend before production.

*Questions on any of this: reply to whoever sent you this note.*
