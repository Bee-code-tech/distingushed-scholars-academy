# Backend requests — from the frontend team

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
| `role` | always `student` from this form; **tutors are created by an admin**; guardians self-register with `role: parent` |

**Why it matters:** on-campus vs online, department, and programmes drive the
dashboard, timetable, attendance and live-class views. Today the frontend
remembers these in local storage as a fallback, so a student on a **different
device** loses them until the API stores and returns them.

## 2. Verify the Paystack payment (Portal Access Fee) — money

Every student pays a one-time **₦2,000 Portal Access Fee** via Paystack **before**
the account is activated. The frontend opens the Paystack popup with the
**public** key and sends the resulting `paymentReference`.

**The backend must verify that reference with the Paystack SECRET key**
(server-side, `GET https://api.paystack.co/transaction/verify/:reference`) and
only then mark the account paid/active. **Do not trust the client** — a success
callback can be faked. The secret key must live only in a backend env var.

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
- **Ward link** — which student(s) a guardian oversees. **This relationship is the
  key missing piece** — everything else hangs off it, and it must be verified
  server-side (a guardian must not see a child's data just by typing a username).
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
