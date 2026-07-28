# Backend requests — from the frontend team

Two API gaps are blocking student-facing features. The frontend has temporary
workarounds in place, but both need a real backend change to work correctly for
all users. Everything below was checked against the live API at
`https://api.distinguishedscholarsacademy.com` and the OpenAPI docs at
`/api-docs/`.

---

## 1. Persist and return the student's study mode (physical vs online) — HIGH

**What's missing:** `POST /api/auth/register` accepts
`{ name, email, password, phoneNumber, level, subjectsOfInterest, profilePic, role }`.
There is no field for whether the student is an **on-campus (physical)** or
**online** student. The signup form collects this ("Physical Student?") and
sends `isDsaStudent: true/false`, but the API ignores it, and `GET /api/auth/me`
never returns it.

**Why it matters:** the student dashboard is role-based. On-campus students get a
class timetable + attendance view; online students get live-class links. With no
stored value, **every student defaults to "online"** and on-campus students lose
their campus features.

**Requested change:**
1. Accept `isDsaStudent` (boolean) on `POST /api/auth/register` and store it on
   the user.
2. Return it on `GET /api/auth/me` (and in the `user` object from
   `/api/auth/login` and `/api/auth/verify-otp`).

A string `studyMode: "physical" | "online"` would be even better than a boolean,
but `isDsaStudent` matching the existing signup payload is fine.

**Current frontend workaround:** we remember the choice in the browser's local
storage at signup and use it only when the API says nothing. This breaks if the
student signs in on a **different device** — their on-campus status won't follow
them until the API stores it.

**Same gap applies to WAEC/NECO department.** WAEC and NECO students pick a
department (Science / Art / Commercial) at signup instead of individual subjects.
We send it as the single value in `subjectsOfInterest` (e.g.
`subjectsOfInterest: ["science"]`). Please **store and return `subjectsOfInterest`
on `GET /api/auth/me`** so the dashboard can show the department. Same
local-storage fallback and same cross-device limitation as study mode.

---

## 2. Implement "resend OTP" — MEDIUM

**What's missing:** the OTP verification screen has a "Resend code" button that
calls `POST /api/auth/send-otp`. That endpoint returns **404** and is not in the
API docs.

```
POST /api/auth/send-otp  →  404  "Cannot POST /api/auth/send-otp"
```

**Requested change:** add `POST /api/auth/send-otp` taking `{ email }` that
re-issues a fresh OTP to that email (same code path as the one register already
triggers). A `{ success, message }` response is fine.

**Current frontend workaround:** the button now shows "Resending codes is not
available yet — please use the code already sent to your email" instead of a raw
error. It will start working automatically once this endpoint exists — no
frontend change needed.

---

## 3. Tutor and Guardian portals — data endpoints — MEDIUM

The frontend now has three role-based dashboards: **student** (live), **tutor**
(`/tutor`), and **guardian/parent** (`/guardian`). Login already routes by the
`role` on the user (`student` | `tutor` | `parent` | `admin`), so **please make
sure `GET /api/auth/me` returns the correct `role`** for tutor and guardian
accounts — that is the only thing needed for routing to work.

The tutor and guardian dashboards currently render **mock data** because there
are no endpoints for their content yet. To make them real, we need:

**Tutor** (`role: "tutor"`):
- **Assigned students** — the roster of students this tutor teaches, each with
  name, exam track, average score, and progress.
- **Tutor's classes** — the sessions they teach (title, date/time, venue or live
  link, physical/online).
- **Tutor's quizzes + submissions** — quizzes they created and, per quiz,
  submission count and how many are graded (for the grading queue). The existing
  `POST /api/quizzes` already supports creation; we just need a "list quizzes for
  this tutor" + "submissions for a quiz" view.
- **Class analytics** — average score per topic/subject across their students.

**Guardian** (`role: "parent"`):
- **Ward link** — which student(s) this guardian is responsible for. Everything
  else hangs off this. A guardian → student relationship is the key missing
  piece.
- **Ward performance** — the ward's average score, accuracy, topics completed,
  and class rank.
- **Ward attendance** — attendance record (mainly for on-campus students).
- **Ward exam** — the ward's track; the countdown reuses `GET /api/programs`, so
  no new work there.
- **Fees** — the ward's fee items with amount, status (paid/due), and date.

None of these block the current build — the dashboards work with placeholder
data today — but they are all placeholders until these endpoints exist.

---

## For reference — already handled on the frontend, no backend action needed

These were frontend bugs against your (correct) API; fixed on our side:

- We were calling `GET /api/auth/profile` (404). Corrected to **`/api/auth/me`**.
- Quiz submission now sends the documented shape:
  `{ timeTaken, answers: [{ questionId, selectedOption }] }` (integer option
  index), per `POST /api/quizzes/{id}/submit`.
- Exam countdowns now read from `GET /api/programs`. **Request:** the only entry
  today is "JAMB Countdown" (and its `endDate` of 2026-04-20 has passed). To
  drive the WAEC and NECO dashboards, please add program entries via
  `POST /api/programs` whose `name` contains the word **"WAEC"** and **"NECO"**
  respectively (we match the track by name), each with a future `endDate`.
  Updating a countdown is then just another `POST /api/programs` — no deploy.

---

*Questions on any of this: reply to whoever sent you this note.*
