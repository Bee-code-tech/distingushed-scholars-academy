# What the frontend needs from the backend

Hi — this is a consolidated list of the gaps we've hit while testing, with the
**exact requests the frontend already sends** so you have the contract in front
of you. We're not prescribing how to build it; wherever the shape is your call,
we'll adapt. For each item: what's blocked, what we send, and what we need back.

Base API: `https://api.distinguishedscholarsacademy.com/api`
All protected calls send `Authorization: Bearer <JWT>`.

---

## 1. Attendance, scoped per tutor  🔴

**Blocked:** attendance is currently **one shared daily session for the whole
school**. When one tutor opens it, every student can check in and every tutor
sees it. We need it scoped so a tutor runs attendance for **their own students**
only (students linked through the courses that tutor is assigned to).

**What we send today (already working, just not scoped):**

```
POST /attendance/sessions          # activate. body may carry a course:
    { "date": "2026-08-20", "courseId": "65e..." }   # date + courseId optional

POST /attendance/check-in          # student marks self; studentId from JWT
    { }

GET  /attendance/check-ins?date=2026-08-20   # monitor list

DELETE /attendance/sessions/2026-08-20        # close
```

**What we need:**
- A tutor opening a session affects only their own students.
- A student checks into **their** tutor's session (the tutor of the course
  they're enrolled in), and only while that tutor's session is open.
- `GET /attendance/check-ins` returns only the requesting tutor's students.
- Whatever you key it on (tutor, course, class) is fine — the enrollment/course
  link between student and tutor already exists to scope by. We'll send
  `courseId` on activate if that's the anchor you want.

*(Fuller write-up in `backend-request-attendance-per-tutor.md`.)*

---

## 2. Announcements — edit & delete  🔴

**Blocked:** `PUT /announcements/:id` and `DELETE /announcements/:id` both return
**404**, so a tutor/admin can't edit or remove an announcement after posting.

**Create already works** — for reference, this is what we send:

```
POST /announcements
    {
      "scope": "global",           # "global" | "track"
      "track": "waec",             # when scope = "track" (jamb | waec | postutme)
      "examTrack": "waec",          # sent alongside for compatibility
      "authorName": "Mr Bello",
      "title": "WAEC mock exam",
      "body": "WAEC mock holds Friday."
    }
```

**What we need (same auth as create — tutor/admin):**

```
PUT /announcements/:id
    { "title": "Updated title", "body": "Updated text" }
    # (scope/track edit optional)

DELETE /announcements/:id
    -> { "success": true }
```

---

## 3. Staff / Secretary login  🔴

**Blocked:** a secretary/staff member can't sign in — login returns "invalid
credentials", so the `/staff` dashboard is unreachable.

**What we send to create the staff account (admin):**

```
POST /admin/staff
    {
      "fullname": "Office Secretary",
      "email": "secretary@dsa.com",
      "password": "TempPass123",
      "role": "staff",
      "staffRole": "secretary",
      "permissions": ["payments.verify", "timetable.edit", "announcements.send"]
    }
```

**What we send to log them in:**

```
POST /auth/login
    { "email": "secretary@dsa.com", "password": "TempPass123" }
```

**What we need back** — the created staff account must be able to log in, and
both `/auth/login` and `GET /auth/me` must return:

```
{
  "role": "staff",
  "staffRole": "secretary",
  "permissions": ["payments.verify", "timetable.edit", "announcements.send"]
}
```

The `/staff` dashboard shows/hides tools based on `permissions`.

---

## 4. Resend OTP  🔴

**Blocked:** `POST /auth/send-otp` returns **404**. The "Resend code" button in
signup has nothing to call, so a student who misses the first code is stuck.

**What we send:**

```
POST /auth/send-otp
    { "email": "student@example.com" }
    -> { "success": true, "message": "OTP sent" }
```

Just re-issue (and re-send) a fresh OTP to that email.

---

## 5. Per-student material completion  🟡

**Blocked:** `GET /courses/:id/materials` doesn't tell us which materials the
logged-in **student** has completed, so the per-item "done" ticks are tracked in
the browser only (they don't follow the student to another device). The overall
`progressPercent` is authoritative; the per-item state isn't.

**What we send today:**

```
GET  /courses/:id/materials       # list
POST /materials/:id/complete      # mark one complete -> { progressPercent, completed, total }
```

**What we need:**
- Each material in `GET /courses/:id/materials` should include, for the
  requesting student, `completed: true|false`.
- Ideally a way to **un-mark** a material, e.g. `DELETE /materials/:id/complete`
  (or a toggle), so a student can correct a mistaken tick.

---

## 6. Guardian ward data  🟡

**Blocked:** a guardian can be created and can log in, but their dashboard has
**no live data** — we can't yet show a guardian their ward's information. This
is the one role still on demo data.

We create the guardian like this (works):

```
POST /admin/staff
    {
      "fullname": "Mrs Adeyemi", "email": "adeyemi@example.com",
      "password": "TempPass123", "role": "parent",
      "username": "adeyemi", "phoneNumber": "08098765432",
      "wardId": "DSA/2026-C4G5U2"      # a real student's studentId
    }
```

**What we need** — endpoints scoped to the **logged-in guardian** (verified
server-side against their ward link, so a guardian can only ever see their own
ward). Whatever grouping is easiest for you; for example:

```
GET /parents/me/wards
    -> [ { studentId, fullname, examTrack, level, isPaid } ]

GET /parents/me/wards/:studentId/performance
    -> { averageScore, progressPercent, attendanceRate, present, totalSessions,
         perSubject: [ { title, average } ] }

GET /parents/me/wards/:studentId/fees
    -> { amount, status: "paid" | "due", paidAt }
```

The key requirement is: **the ward relationship is verified on the server** — a
guardian must never see a child's data just by guessing an id.

---

## 7. Per-tutor live-class link  🟡  *(if we want it)*

**Current:** the Google Meet link is **one record per track**
(`PUT /live-classes/:track/link`), so every tutor teaching a track shares the
**same** link and the same live/ended status.

**What we send today:**

```
PUT   /live-classes/:track/link      { "meetLink": "https://meet.google.com/abc-defg-hij" }
PATCH /live-classes/:track/status    { "status": "live" }        # or { "status": "ended", "recordingUrl": "..." }
GET   /live-classes/next?track=waec  # student join state -> { status, meetLink, canJoin }
```

**What we need (if each tutor should have their own class link):**
- Live-class records keyed **per tutor/course**, not per track, so Tutor A's
  link and "live" state are independent of Tutor B's — and a student joins the
  session of **their** tutor.

If a shared per-track link is actually the intended design, we can leave this as
is — just flagging it in case it isn't.

---

## Already resolved on our side — no backend action

- **File uploads / object storage** — done client-side via **Cloudinary**
  (materials, avatars, signup photo, assignment files all upload in production).
  The `/uploads/sign` stub is no longer needed.
- **~100KB request-body limit** — no longer hit, since files go to Cloudinary
  rather than through JSON.

Everything else the app uses (auth, courses, materials, assignments, grades,
analytics, timetable, live-classes, announcements read, notifications, and the
current attendance endpoints) is live and working. Thanks!
