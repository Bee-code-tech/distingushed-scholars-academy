# Backend request — per-tutor / per-course attendance scoping

> **From:** frontend team · **Priority:** high
> **Status of frontend:** the tutor monitor already filters check-ins to the
> logged-in tutor's own students (`GET /tutors/me/students`). This is a
> stopgap — the underlying session is still shared, so we need the backend
> changes below for true isolation.

## The problem

Attendance today is **one global session per calendar day**:

- `POST /api/attendance/sessions` opens **the** session for that date (if one is
  already open it returns the existing one).
- `POST /api/attendance/check-in` marks the student present for **that** single
  daily session.
- `GET /api/attendance/check-ins?date=` returns **every** check-in for the date.

So when **any** tutor opens attendance:

1. Every student in the school can check in.
2. Every tutor's dashboard shows "attendance is open".
3. Check-ins are one shared pool.

**Desired:** attendance is scoped so that a tutor opens attendance for **their
own class/course**, only **their** students can check into it, and each tutor
only sees (and closes) **their own** session and check-ins.

## Recommended model — scope by **course**

A course already has an owner tutor (`tutorId`) and enrolled students, so
course is the natural scope (and a student enrolled in two tutors' courses can
be marked present in each independently).

Key change: an attendance **session** is keyed by **(courseId, date)** instead
of just **date**, and a **check-in** is keyed by **(sessionId/courseId,
studentId, date)**.

### 1. Open a session — `POST /api/attendance/sessions`
- **Body:** `{ "courseId": "65e...", "date": "2026-08-20" }` — `courseId` now
  **required**; `date` optional (defaults to today).
- **Auth:** only the course's **owner tutor** (or admin) may open it (`403`
  otherwise).
- **Behaviour:** upsert the session for that (courseId, date). Notify only
  students **enrolled in that course** (`attendance_open`).
- **Response:** `{ success, data: { id, courseId, date, active, activatedAt } }`

### 2. Close — `DELETE /api/attendance/sessions/:date?courseId=65e...`
(or `DELETE /api/attendance/sessions/:sessionId`) — owner tutor/admin only,
scoped to that course.

### 3. Current session(s) — `GET /api/attendance/sessions/current`
- **Student:** return the open sessions for the courses **they are enrolled
  in**: `{ success, data: [ { id, courseId, courseTitle, active, activatedAt } ] }`
  (array — a student may have more than one open class). `active:false`/empty
  when none.
- **Tutor:** return the open sessions for **their** courses.

### 4. Student check-in — `POST /api/attendance/check-in`
- **Body:** `{ "courseId": "65e..." }` — **required** now (which class they're
  marking present for). `studentId` still from the JWT.
- **Rules:** `403` if the student isn't enrolled in that course or the course's
  session isn't open; `409` if already checked in for that (course, date).
- **Response:** `{ success, data: { courseId, status: "present", at, date } }`

### 5. Monitor — `GET /api/attendance/check-ins?date=&courseId=65e...`
- **Auth:** owner tutor of `courseId` (or admin).
- Returns check-ins **for that course only**. If `courseId` is omitted for a
  tutor, return check-ins across **all their courses** (never the whole school).
- Row shape unchanged: `{ id, studentId, fullname, email, studentCode, status, at, date, courseId }`.

### 6. Student's own record — `GET /api/attendance/me`
- Keep returning the student's overall rate, but compute it across **their
  enrolled courses' sessions** (present ÷ total sessions held for their
  courses). Optionally add `perCourse: [{ courseId, title, present, total, rate }]`.

### 7. Report CSV — `GET /api/attendance/report`
- Honour the already-accepted `courseId` filter and scope a tutor's export to
  their own courses.

## Security
- A tutor may open/close/monitor attendance **only for courses where they are
  `tutorId`**; admin may do any.
- A student may check into **only courses they are enrolled in**, only while
  that course's session is open; timestamp server-side; idempotent per
  (course, date).

## Backward compatibility / migration
- Existing sessions/check-ins have no `courseId`. Either migrate them to a
  sentinel "general" course or drop them (test data).
- If a phased rollout is needed, keep the old global behaviour when `courseId`
  is absent, and treat `courseId`-scoped calls as the new path — but the
  frontend is ready to send `courseId` on all calls once this ships.

## What the frontend will do once this ships
- **Tutor** (`TakeAttendance`): pick one of their courses, open/close attendance
  for it, and monitor only that course's check-ins.
- **Student** (`StudentAttendance`): see each open class they're enrolled in and
  press "Mark me present" per class (`POST /check-in { courseId }`).
- We already read `/tutors/me/students`, `/courses/mine`, and
  `/enrollments/me`, so enrolment data is available client-side to drive the UI.

*Questions: reply to the frontend team. The relevant frontend files are
`src/components/dashboard/TakeAttendance.tsx` (tutor) and
`StudentAttendance.tsx` (student), plus `dsaApi.attendance` in `src/lib/api.ts`.*
