# Tutor, Attendance & Student-List APIs — with the UI they power

For the backend dev. **All three UIs are already built and running** — this doc
maps each screen to the exact endpoint + response fields it needs, so the API
can be structured to match. Base API: `/api`. All protected routes take
`Authorization: Bearer <JWT>` and must verify the caller's role server-side.

Envelope: `{ success: boolean, data: <payload>, message? }` (lists may return a
bare array; the frontend tolerates both).

---

## 1. Fetch students — for BOTH Admin and Tutor

There are **two different "students" views** with different scopes.

### 1a. Admin — every student  *(UI: Admin → Students; also Tutors, Guardians)*
The admin dashboard has live lists that call the server first and fall back to a
local list (a **Live / Local** badge shows which).

`GET /admin/users?role=student` *(also `tutor`, `parent`, `staff`)* — admin only.
Return `{ success, data: User[] }`. Fields the list renders:

| role | fields needed |
| --- | --- |
| `student` | `id`/`studentId`, `fullname`, `email`, `examTrack` (or `level`), `learningMode` (or `isDsaStudent`) |
| `tutor` | `id`, `fullname`, `email`, `subject` (or `subjects[]`) |
| `parent` | `id`, `fullname`, `email`, `wardName` (linked student's name) |

Supports `?search=` and `?page=&limit=`. **Blocked by:** there is no real admin
login yet (the panel uses a frontend bypass) — provide admin auth so the panel
sends a valid token.

### 1b. Tutor — only MY students  *(UI: Tutor → My Students; also Overview + Analytics)*
A tutor must see **only the students doing their courses** — i.e. students whose
category matches a course assigned to that tutor (categories: `waec-sss`,
`jamb-putme`, `higher`).

`GET /tutors/me/students` — tutor only, scoped to the tutor from the JWT.
Return each student with:

| field | used for |
| --- | --- |
| `id`, `fullname` | name column |
| `examTrack`/`level` | Track badge (JAMB / WAEC / Post-UTME) |
| `learningMode` | Mode (On-Campus / Online) |
| `averageScore` (0–100, optional) | "avg" column + "students needing attention" (<70) + class-average analytic |
| `progressPercent` (0–100, optional) | progress bar |

---

## 2. Tutor API  *(UI: the whole Tutor dashboard)*

The tutor is **admin-created** (role `tutor`) and logs in on the normal login
page; `/auth/me` must return `role: "tutor"`. Screens and what each calls:

| Tutor screen | Endpoint(s) | Notes |
| --- | --- | --- |
| **My Students** | `GET /tutors/me/students` | §1b |
| **My Courses** (assigned) | `GET /tutors/me/courses` or `GET /courses?tutorId=me` | course `title`, `subject`, `category` |
| **Course Materials** | `GET /courses/:id/materials` · `POST /courses/:id/materials` · `DELETE /materials/:id` | upload syllabus/PDF/video/recording (URL now; file upload later) |
| **Assignments** | `GET/POST /courses/:id/assignments` · `GET /assignments/:id/submissions` · `PUT /submissions/:id/grade` `{score,feedback}` | create → review submissions → grade |
| **Announcements** | `POST /announcements` `{scope:'track'|'global', track?, title, body}` | broadcast to students |
| **Live Classes** | `PUT /live-classes/:track/link` `{meetLink}` · `PATCH /live-classes/:track/status` `{status:'live'|'ended'}` | admin generates the Meet link; **tutor uploads it** & goes live |
| **Timetable** | `GET /timetable/:track` | **read-only** for tutors (admin schedules it) |
| **Analytics** | `GET /tutors/me/analytics` | class average, submissions/graded per course, at-risk students |
| **Overview tiles** | derived from the above | students count, courses count, assignments count, to-grade count |

Every tutor endpoint must scope to the tutor's **own** courses/students.

---

## 3. Attendance API  *(UI: Tutor/Admin "Take Attendance" + Student "Attendance")*

**Flow (self check-in):** a tutor/admin **activates** attendance for the day →
each student **marks themselves present** → the tutor/admin **monitor** who
checked in; the student sees **their own** record. The server sets the timestamp.

| Method | Path | Who | Purpose / response |
| --- | --- | --- | --- |
| POST | `/attendance/sessions` | tutor/admin | activate today → `{ active:true, date, activatedAt }` |
| DELETE | `/attendance/sessions/:date` | tutor/admin | close the window |
| GET | `/attendance/sessions/current` | any | is it open? → `{ active, date, activatedAt }` |
| POST | `/attendance/check-in` | student | mark self present — **studentId from JWT, not the body**; server stamps time → `{ status:'present', at }` · 403 if closed · 409 if already checked in |
| GET | `/attendance/check-ins?date=` | tutor/admin | who checked in → `[{ studentId, fullname, at }]` (drives the monitor list + expected/present count) |
| GET | `/attendance/me` | student | student's own record + rate → `{ present, total, rate }` |
| GET | `/attendance/report?courseId=&from=&to=` | tutor/admin | **downloadable CSV** of attendance |

**Security:** only tutor/admin activate/close & see the full list; a student may
only check *themselves* in and read *their own* record; check-in only while open,
idempotent, timestamp set **server-side**.

---

## What's already built on the frontend (so you can match shapes)
- **Admin**: Students / Tutors / Guardians lists (live-first `GET /admin/users?role=`, Live/Local badge).
- **Tutor**: Overview, My Students, Course Materials, Assignments (+grading), Announcements, Live Classes, read-only Timetable, Analytics.
- **Attendance**: tutor/admin activate + monitor; student self check-in + own record.

All run on browser-local stores today and switch to these endpoints as they ship
— no further frontend work needed once the shapes above are returned.

*(Screenshots of any of these screens can be provided on request.)*
