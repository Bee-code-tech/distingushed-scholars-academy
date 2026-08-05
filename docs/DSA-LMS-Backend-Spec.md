# DSA LMS — Backend Specification (Student & Tutor)

Everything the backend needs to make the Student and Tutor experiences real. This
is the authoritative spec: it lists **every database entity with its fields** and
**every endpoint** grouped by feature, marking what already exists vs. what is
new.

> Companion docs: `backend-requests.md` (original urgent auth/payment/attendance
> notes) and `DSA-Backend-Getting-Started.md` (Phase-1 auth kickoff). This file
> supersedes them for the full LMS scope.

Base API: `https://api.distinguishedscholarsacademy.com/api`
Auth: `Authorization: Bearer <JWT>` on every protected route.

---

## 0. Scope note — quizzes/CBT are VERSION TWO

CBT/Quizzes & Exams are **deferred to version two** — no quiz UI is built in v1.
The backend already implements quizzes (`/api/quizzes*`); those endpoints can
stay as-is, but **do not prioritize quiz work for v1**. The quiz sections below
(§2.7, §2.8, §7) are documented for completeness and v2 planning only.

---

## 0b. Version Two — deferred scope (NOT in v1)

These are intentionally **out of v1** and planned for **version two**. They stay
documented in this spec (entities + endpoints) for v2 planning, but the frontend
does **not** build them in v1. Do not prioritize them for the v1 backend.

1. **Quizzes / CBT & Exams** — *(entities §2.7–§2.8, endpoints §7)*. Students take
   timed CBTs/practice quizzes/exams; tutors author quizzes (nested subjects &
   questions), the system auto-grades and ranks (leaderboards), and results feed
   the gradebook. The backend **already implements** `/api/quizzes*` — leave
   those endpoints in place; there is simply no v1 frontend for them.
   *Why v2:* keep v1 focused on the core learning loop.

2. **Messaging — tutor ↔ student DMs** — *(entities §2.15, endpoints §11)*.
   Private one-to-one conversations between a tutor and their enrolled students
   (`Conversation` + `Message`, `read` receipts).
   *Why v2:* not launch-critical; one-way **announcements** cover comms in v1.

3. **Class chat / discussion forum** — *(entities §2.14, endpoints §11)*.
   Per-course/track discussion threads with replies, or a lightweight class chat
   room (`ForumThread`/`ForumPost` or `ChatMessage`).
   *Why v2:* a community layer that sits on top of the core once it exists.

4. **Realtime (WebSocket / Socket.IO)** — *(§15)*. Live delivery for chat, forum
   updates, and instant notifications (rooms per course/track/conversation).
   Until it lands, v1 uses plain **REST + polling** (`GET /notifications?unread=…`,
   chat `GET …/messages?after=<ts>`).
   *Why v2:* infrastructure that only pays off once messaging/chat exist.

**For contrast — what IS in v1 (built on the frontend):** auth + Paystack payment,
course materials, assignments & submissions, announcements & notifications, live
classes (admin schedules the timetable and generates the Meet link → the tutor
uploads it → the student joins), performance analytics, and profile & settings
(wired to `/auth/updatedetails` + `/auth/updatepassword`).

---

## 1. Conventions (apply to all endpoints)

- **Response envelope:** `{ success: boolean, message?: string, data: <payload>, count?: number }`.
  Lists return `data: [...]` with `count`. `/auth/me` and `/auth/login` may return
  the user under `data` or `user` — keep it consistent (`data`).
- **Auth & roles:** validate the JWT and the caller's role **server-side on every
  request**. Never trust a role/id from the client. Tutors see only their own
  courses/students; students see only their own records; guardians see only
  verified wards.
- **IDs:** string (Mongo ObjectId or UUID). All timestamps ISO-8601 UTC.
- **Pagination:** list endpoints accept `?page=1&limit=20`; return `count` (total).
- **Errors:** non-2xx returns `{ success:false, message }`. Use 400 (validation),
  401 (no/invalid token), 403 (wrong role), 404, 409 (conflict, e.g. already
  enrolled / already checked in), 422.
- **File uploads:** see §14. Materials, assignment attachments, submissions and
  recordings are stored in object storage; the API stores/returns **URLs**, not
  blobs.

---

## 2. Data model — every entity & field

### 2.1 User  *(exists — extend)*
| Field | Type | Notes |
| --- | --- | --- |
| `id` | string (PK) | |
| `fullname` | string | |
| `email` | string (unique) | |
| `passwordHash` | string | never returned |
| `whatsappNumber` | string | |
| `role` | enum | `student` \| `tutor` \| `parent` \| `admin` \| `staff` |
| `gender` | enum | `Male` \| `Female` |
| `dateOfBirth` | date | |
| `stateOfResidence` | string | |
| `institution` | string | school/institution |
| `currentLevel` | string | SS1…, 100 Level… |
| `learningMode` | enum | `online` \| `physical` |
| `profilePic` | url | |
| `isPaid` | bool | portal access fee settled |
| `examTrack` | enum | `jamb` \| `waec` \| `postutme` (student) — may be derived from `programmes` |
| `department` | enum? | `science` \| `art` \| `commercial` (WAEC students only) |
| `programmes` | string[] | enrolled programme names |
| `subjects` | string[] | tutor: subjects taught |
| `bio` | text | tutor profile |
| `credentials` | string[] | tutor qualifications |
| `staffRoleId` | string? | staff → role in `StaffRole` |
| `guardianInfo` | object | `{ fullname, phoneNumber, email? }` (student) |
| `wardIds` | string[] | parent → linked students (server-verified) |
| `createdAt`/`updatedAt` | date | |

### 2.2 Course
A teachable unit (e.g. "JAMB Mathematics", "WAEC Physics").
| Field | Type | Notes |
| --- | --- | --- |
| `id` | string (PK) | |
| `title` | string | |
| `description` | text | |
| `examTrack` | enum | jamb \| waec \| postutme |
| `department` | enum? | WAEC only |
| `subject` | string | e.g. Mathematics |
| `tutorId` | FK→User | owning tutor |
| `thumbnailUrl` | url? | |
| `level` | string? | |
| `price` | int (kobo)? | 0/absent = free with portal access |
| `isPublished` | bool | |
| `syllabusMaterialId` | FK→CourseMaterial? | the syllabus doc |
| `createdAt`/`updatedAt` | date | |

### 2.3 Enrollment
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `studentId` | FK→User | |
| `courseId` | FK→Course | |
| `status` | enum | `active` \| `completed` \| `dropped` |
| `progressPercent` | int 0–100 | see §2.16 |
| `enrolledAt` | date | |
| `lastAccessedAt` | date | |
| unique | (studentId, courseId) | prevent double-enroll → 409 |

### 2.4 CourseMaterial  *(syllabus, PDFs, videos, recordings, slides, links)*
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `courseId` | FK→Course | |
| `tutorId` | FK→User | uploader |
| `title` | string | |
| `type` | enum | `pdf` \| `video` \| `recording` \| `syllabus` \| `slide` \| `link` |
| `url` | url | file URL or external/video URL |
| `fileSizeBytes` | int? | |
| `durationSeconds` | int? | video/recording |
| `description` | text? | |
| `orderIndex` | int | ordering within course |
| `isDownloadable` | bool | |
| `createdAt` | date | |

### 2.5 Assignment
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `courseId` | FK→Course | |
| `tutorId` | FK→User | |
| `title` | string | |
| `instructions` | text | |
| `attachmentUrl` | url? | brief/resources |
| `maxScore` | int | |
| `dueDate` | date | |
| `isPublished` | bool | |
| `allowLate` | bool | |
| `createdAt` | date | |

### 2.6 Submission
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `assignmentId` | FK→Assignment | |
| `studentId` | FK→User | |
| `fileUrl` | url? | uploaded work |
| `text` | text? | typed answer |
| `status` | enum | `submitted` \| `graded` \| `late` \| `returned` |
| `score` | int? | |
| `feedback` | text? | |
| `gradedBy` | FK→User? | tutor |
| `submittedAt`/`gradedAt` | date | |
| unique | (assignmentId, studentId) | |

### 2.7 Quiz / CBT  *(exists — extend with `courseId`)*
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `title`, `description` | string/text | |
| `type` | enum | `practice` \| `cbt` \| `exam` |
| `courseId` | FK→Course? | **add** — link quiz to a course |
| `isPaid` | bool | |
| `amount` | int (kobo) | |
| `accessCode` | string? | |
| `durationMinutes` | int | |
| `isActive` | bool | |
| `createdBy` | FK→User | tutor/admin |
| `subjects` | Subject[] | nested |
| `createdAt` | date | |

**Subject (nested):** `{ id, name, questions: Question[] }`
**Question (nested):** `{ id, text, options: string[], correctOptionIndex, explanation?, topic?, year?, difficulty? }`
> Correct answers/explanations are **stripped** from student-facing reads until
> after submission.

### 2.8 QuizAttempt (result)  *(exists as submit/leaderboard — persist per-student)*
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `quizId` | FK→Quiz | |
| `studentId` | FK→User | |
| `answers` | `{questionId, selectedOption:int}[]` | |
| `score`/`total` | int | |
| `timeTakenSeconds` | int | |
| `submittedAt` | date | |

### 2.9 Grade (gradebook entry)
Unifies assignment + quiz/exam scores for analytics & "upload grades".
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `studentId` | FK→User | |
| `courseId` | FK→Course | |
| `assessmentType` | enum | `assignment` \| `quiz` \| `exam` \| `manual` |
| `assessmentId` | string? | FK to the source |
| `title` | string | e.g. "Mock CBT 1" |
| `score`/`maxScore` | int | |
| `weightPercent` | int? | for weighted averages |
| `comment` | text? | |
| `recordedBy` | FK→User | tutor |
| `recordedAt` | date | |

### 2.10 AttendanceSession  *(spec'd in backend-requests §6)*
`{ id, courseId?|examTrack, date, activatedBy, activatedAt, closedAt?, isOpen }`

### 2.11 AttendanceRecord
`{ id, sessionId, studentId, status: present|late|absent, checkInAt }` — unique (sessionId, studentId).

### 2.12 Timetable / TimetableSlot
Per track (and WAEC department). **Admin-scheduled** (tutors/students read-only).
Either a grid blob or rows:
`TimetableSlot { id, examTrack, department?, day (Mon–Sat), period (1–4), startTime, endTime, subject, tutorId?, mode: online|physical, venue?, updatedBy (admin), updatedAt }`

### 2.13 LiveClass
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `courseId`\|`examTrack` | FK/enum | |
| `tutorId` | FK→User | host |
| `title` | string | |
| `scheduledStart`/`scheduledEnd` | date | |
| `meetLink` | url | Google Meet — **admin-generated, tutor-uploaded** |
| `status` | enum | `scheduled` \| `live` \| `ended` — **set by the tutor** |
| `recordingUrl` | url? | becomes a `recording` CourseMaterial when ready |
| `createdAt` | date | |

### 2.14 Forum & Chat
**ForumThread** `{ id, scope: course|track, courseId?/examTrack, title, createdBy, isPinned, isLocked, createdAt, lastPostAt }`
**ForumPost** `{ id, threadId, authorId, body, parentPostId?, attachments[]?, createdAt, editedAt? }`
For a lighter **class chat**: `ChatMessage { id, roomId (courseId|track), senderId, body, sentAt }` (see §13 realtime).

### 2.15 Messaging (tutor ↔ student DM)
**Conversation** `{ id, participantIds: string[], lastMessageAt }`
**Message** `{ id, conversationId, senderId, recipientId, body, attachments[]?, sentAt, readAt? }`

### 2.16 Progress tracking
**MaterialProgress** `{ id, studentId, materialId, courseId, completed, completedAt?, lastPositionSeconds? }`.
`Enrollment.progressPercent` = completed materials ÷ total course materials (or a
weighted formula incl. assignments/quizzes). Recompute on material completion.

### 2.17 Announcement
`{ id, scope: global|track|course, examTrack?/courseId?, authorId, title, body, createdAt }` — broadcast; fan out into Notifications.

### 2.18 Notification
`{ id, userId, type: class_reminder|deadline|grade_posted|announcement|message|attendance_open|enrollment, title, body, link?, isRead, createdAt }`

### 2.19 Payment  *(exists — extend)*
`{ id, studentId, reference, amount(kobo), currency, status: pending|success|failed, method: paystack|manual, purpose: portal_access|course_fee, courseId?, verifiedBy?, paidAt, createdAt }`

### 2.20 StaffRole  *(from backend-requests §9)*
`{ id, name, permissions: string[] }` + staff users reference it via `staffRoleId`.

---

## 3. Auth & profile  *(mostly exists)*
| Method | Path | Who | Notes |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | exists — register-first + Paystack init (returns `accessCode`) |
| POST | `/auth/paystack/webhook` | Paystack | exists — marks paid |
| POST | `/auth/verify-otp` | public | exists |
| POST | `/auth/send-otp` | public | **missing — add** (resend) |
| POST | `/auth/login` | public | exists |
| GET | `/auth/me` | any | exists — **must return** role, examTrack, department, learningMode, isPaid, subjects |
| PUT | `/auth/updatedetails` | any | exists — profile & settings |
| PUT | `/auth/updatepassword` | any | exists |
| POST | `/auth/forgot-password` · `/auth/reset-password/:token` | public | exists |
| POST | `/admin/staff` | admin | **new** — create tutor/guardian/staff (role + wardId/permissions) |
| GET | `/admin/users?role=…` | admin | **new** — list users by role (`student`/`tutor`/`parent`/`staff`) for the admin's **Students / Tutors / Guardians / Staff** management views. Supports `?search=`&pagination |

> **Admin management views (as built).** The admin dashboard has live lists for
> **Students, Tutors, Guardians** (and Staff under Permissions). Right now the
> frontend records admin-created **tutors/guardians locally** (and lists locally
> registered students) because there is no list endpoint yet — it swaps to
> `GET /admin/users?role=…` the moment it exists. No demo/seed people remain in
> the UI: every list is driven by real registrations / admin-created accounts.
> Note tutors & guardians are still created via `/auth/register` (role `tutor` /
> `parent`); a dedicated admin-create endpoint is requested above.

---

## 4. Courses & enrollment  *(new)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/courses` | any | list/browse (filter `?track=&department=&tutorId=`) |
| GET | `/courses/:id` | any | course detail (+materials/assignments counts) |
| POST | `/courses` | tutor/admin | create |
| PUT | `/courses/:id` | owner tutor/admin | update |
| DELETE | `/courses/:id` | owner tutor/admin | |
| POST | `/courses/:id/enroll` | student | enroll (→409 if already) |
| GET | `/enrollments/me` | student | my courses + progressPercent |
| GET | `/courses/:id/students` | owner tutor | roster |

## 5. Course materials  *(new)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/courses/:id/materials` | enrolled student / owner tutor | list |
| POST | `/courses/:id/materials` | owner tutor | add (after file upload, §14) |
| PUT | `/materials/:id` | owner tutor | edit/reorder |
| DELETE | `/materials/:id` | owner tutor | |
| GET | `/materials/:id/download` | enrolled student | signed URL (respect `isDownloadable`) |
| POST | `/materials/:id/complete` | student | mark done → updates progress |

## 6. Assignments & submissions  *(new)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/courses/:id/assignments` | enrolled/owner | list |
| POST | `/courses/:id/assignments` | owner tutor | create |
| PUT/DELETE | `/assignments/:id` | owner tutor | edit/remove |
| POST | `/assignments/:id/submit` | student | submit (file/text) → `submitted`/`late` |
| GET | `/assignments/:id/submissions` | owner tutor | all submissions |
| GET | `/submissions/me?assignmentId=` | student | my submission + score/feedback |
| PUT | `/submissions/:id/grade` | owner tutor | `{ score, feedback }` → also writes a Grade |

## 7. Quizzes / CBT & exams  *(exists — extend)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/quizzes` | admin/tutor | list (own for tutor) |
| POST | `/quizzes` | tutor/admin | create (nested subjects/questions) |
| PUT/DELETE/PATCH `:id/status` | `/quizzes/:id` | owner | edit/remove/toggle |
| GET | `/quizzes/link/:link` | student | metadata (no answers) |
| POST | `/quizzes/verify-code` | student | unlock questions |
| POST | `/quizzes/:id/submit` | student | grade → persist QuizAttempt + Grade |
| GET | `/quizzes/:id/leaderboard` | any | top results |
| GET | `/quizzes/attempts/me` | student | **add** — my attempts/history |

## 8. Grades & gradebook  *(new)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/grades/me` | student | my grades across courses |
| GET | `/courses/:id/grades` | owner tutor | course gradebook |
| POST | `/courses/:id/grades` | owner tutor | upload/record grade(s) |
| PUT | `/grades/:id` | owner tutor | correct |

## 9. Attendance  *(spec'd — build)*
`POST /attendance/sessions` (tutor activate) · `DELETE /attendance/sessions/:id` (close) ·
`GET /attendance/sessions/current` · `POST /attendance/check-in` (student, server timestamps) ·
`GET /attendance/check-ins?date=` (tutor) · `GET /attendance/me` (student) ·
`GET /attendance/report?courseId=&from=&to=` (tutor → **downloadable CSV**). Full rules in backend-requests §6.

## 10. Timetable & live classes  *(spec'd — build)*

> **Ownership (as built):** the **ADMIN** schedules the timetable and **generates
> the Google Meet link** (externally, in Google Meet), then passes it to the
> **TUTOR**, who **uploads** it and flips the class **live/ended**. Students and
> tutors view the timetable **read-only**; students join when the tutor is live.

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/timetable/:track` | any | grid — students & tutors view (read-only) |
| PUT | `/timetable/:track` | **admin only** | schedule/edit the grid |
| GET | `/live-classes?track=` | enrolled/tutor | upcoming/live for the track |
| PUT | `/live-classes/:track/link` | tutor | **upload the admin-generated Meet link** |
| PATCH | `/live-classes/:track/status` | tutor | set `live` / `ended` (+`recordingUrl`) |
| GET | `/live-classes/next?track=` | student | next class + join state (drives "Join Live Class") |

## 11. Announcements, messaging & forum

> **Scope:** Announcements are **v1** (built). **Messaging (DMs) & forum/class
> chat are VERSION TWO** — the `/conversations*` and `/threads*` rows below are
> documented for v2 planning only; do not prioritize them for v1.
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/announcements?scope=` | any (scoped) | list |
| POST | `/announcements` | tutor/admin/staff | broadcast → fan out to Notifications |
| GET | `/conversations` · `/conversations/:id/messages` | participant | DM threads |
| POST | `/conversations/:id/messages` | participant | send DM |
| POST | `/conversations` | tutor/student | start convo (tutor↔enrolled student only) |
| GET | `/courses/:id/threads` · POST `/threads` · GET `/threads/:id` · POST `/threads/:id/posts` | enrolled/owner | forum |

## 12. Notifications  *(new)*
`GET /notifications` (mine, `?unread=true`) · `PATCH /notifications/:id/read` ·
`PATCH /notifications/read-all` · (server creates them on deadlines, grades,
announcements, attendance-open, new message; class reminders via a scheduler).

## 13. Analytics & progress  *(new — mostly computed)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/analytics/me` | student | avg score, attendance rate, progress %, per-subject breakdown |
| GET | `/courses/:id/analytics` | owner tutor | class averages, submission/attendance rates, at-risk students |
| GET | `/tutors/me/students` | tutor | all my students + summary metrics |

---

## 14. File storage & uploads  *(critical new infra)*
PDFs, videos, recordings, assignment briefs & submissions need object storage
(S3 / Cloudinary / GCS) — do **not** put binaries in the main DB.
- `POST /uploads/sign` → returns a **presigned upload URL** + final `fileUrl`.
  Client uploads directly to storage, then sends `fileUrl` to the material/
  submission endpoint. Enforce type/size limits (e.g. PDF ≤ 25MB, video via
  provider). Access to private files via short-lived signed URLs.
- Video: prefer a provider (Cloudinary/Mux/YouTube-unlisted) for transcoding &
  streaming; store the playback URL + `durationSeconds`.

## 15. Realtime (chat & notifications)  *(new)*
Chat, forum live updates, and instant notifications want **WebSocket/Socket.IO**
(rooms per course/track/conversation). If out of scope initially, the REST
endpoints above work with **polling** (`GET /notifications?unread=true`, chat
`GET …/messages?after=<ts>`); the frontend will poll until sockets exist.

## 16. Roles & permissions matrix (server-enforced)
| Capability | student | tutor | admin | staff (by perm) |
| --- | --- | --- | --- | --- |
| Enroll, view materials, submit, take quizzes, check-in | ✅ own | — | — | — |
| Create course/material/assignment/quiz, grade, host class, take attendance, announce | — | ✅ own courses | ✅ | per-permission |
| Manage users/roles, verify manual payments, global settings | — | — | ✅ | per-permission |

**Timetable & live classes:** the **admin** schedules the timetable and generates
the Meet link; the **tutor** only uploads that link and sets the class live/ended
(tutors do NOT edit the timetable). Enforce this split server-side.

Tutor endpoints must scope to the tutor's **own** courses/students; student
endpoints to the student's **own** enrollments/records; enforce on the server.

---

## 17. Suggested build order (so the frontend can integrate incrementally)
1. **Finish auth** — `/auth/me` returns full profile; add `/auth/send-otp`,
   `/admin/staff`. (Unblocks live login already wired on the frontend.)
2. **Courses + enrollment + materials + file uploads** (§4, §5, §14) — the LMS core.
3. **Assignments + submissions + grading** (§6, §8).
4. **Quizzes/CBT** — **VERSION TWO** (skip for v1; endpoints already exist).
5. **Attendance + timetable + live classes** (§9, §10).
6. **Notifications + announcements** (§12, §17), then **analytics** (§13).
7. **VERSION TWO:** quizzes/CBT (§7), **messaging + forum/class chat** (§11), and **realtime** sockets (§15).

Until each ships, the frontend runs that feature on a browser-local store
(clearly marked) and swaps to the endpoint above when ready — per the
"everything is live" rule (real API primary, local fallback only where no
endpoint exists yet).
