# Backend requests — 2026-09-01

Everything below was built **frontend-first** this session. Each feature works in
the app today (via live endpoints where they exist, or a browser-local fallback)
and switches to fully live automatically once the backend adds the fields /
endpoints described. Six items:

1. [Guardian assignment grades](#1-guardian-assignment-grades)
2. [Course-scoped announcements (tutor → their subject)](#2-course-scoped-announcements)
3. [Quiz audience by programme + department](#3-quiz-audience-by-programme--department)
4. [Community channels (General + per programme)](#4-community-channels)
5. [Admin student exam-track override](#5-admin-student-exam-track-override)
6. [Timetable by programme + department](#6-timetable-by-programme--department)

Items 5–6 predate today but are still open; they're folded in here so the
backend dev has a single checklist.

A shared idea runs through 3 & 4 (and existing timetables): **programme +
department keys**. The department-split programmes are JAMB, Post-UTME, WAEC and
After-School, each split into **Science / Art / Commercial**; Undergrad and
Preclinical are not split.

---

## 1. Guardian assignment grades

Guardians already have a **Quiz Results** tab; they now also have an **Assignment
Grades** tab. It needs one read-only endpoint, scoped/verified to the logged-in
parent's ward (same pattern as `quiz-results`).

**`GET /parents/me/wards/:id/assignment-grades`** → a list of the ward's
assignment grades. Use the ward's ObjectId (the `id` from
`GET /parents/me/wards`), not the studentId.

Each row (frontend reads these keys, with fallbacks):

```json
{
  "id": "…",
  "assignmentTitle": "Algebra Problem Set 1",
  "courseTitle": "Mathematics",
  "score": 17,
  "maxScore": 20,
  "status": "graded",          // 'graded' | 'submitted' | 'late'
  "feedback": "Good working.",
  "gradedAt": "2026-08-21T…",
  "submittedAt": "2026-08-19T…"
}
```

Ungraded submissions may be returned too (status `submitted`/`late`, no score) —
the UI shows them as "pending". Frontend: `dsaApi.guardian.assignmentGrades(id)`
in `src/lib/api.ts`; degrades gracefully (empty) until the endpoint is live.

---

## 2. Course-scoped announcements

Tutors can now target an announcement at **only the students taking one of their
subjects**, alongside the existing **all students** and **exam track** options.

`POST /announcements` gains a `scope: "course"` variant:

```json
{ "scope": "course", "courseId": "<id>", "courseTitle": "Use of English", "title": "…", "body": "…" }
```

Existing variants unchanged: `{ scope: "global" }` and
`{ scope: "track", track: "jamb"|"waec"|"postutme", examTrack: "…" }`.

**Backend action:**
1. Accept `scope: "course"` on `POST /announcements`, persist `courseId` (reject a
   tutor targeting a course they don't teach; admins may target any).
2. On `GET /announcements`, deliver a course-scoped announcement **only to
   students enrolled in that course**. A student's set = global + their track +
   every course they're enrolled in.
3. Return `courseId` and `courseTitle` on `GET` (a populated `{ _id, title }` is
   fine — the frontend handles both).

Frontend: `src/lib/announcementsStore.ts` filters course posts to the student's
enrolled course ids locally; live mode relies on the backend to enforce it.

---

## 3. Quiz audience by programme + department

Admins target a quiz at a **programme** (and department where it applies). A
student only sees quizzes for **their** programme (+ department), plus quizzes
targeted at **all students**.

`POST /quizzes` gains three fields:

```json
{
  "title": "JAMB Mock — Week 3",
  "type": "general",
  "track": "jamb",            // 'all' | jamb | postutme | waec | undergrad | preclinical | afterschool
  "department": "science",    // science | art | commercial — omitted for 'all' / non-split
  "audience": "JAMB · Science",  // display label, optional
  "subjects": [ … ]
}
```

`track: "all"` (or omitted) = everyone.

**Backend action:**
1. Persist `track` and `department` on the quiz.
2. Return them on `GET /quizzes` and `GET /quizzes/:id`.
3. Ideally filter `GET /quizzes` server-side for a student: return quizzes where
   `track` is `all`/empty, or `track` matches their programme **and**
   (`department` empty, or the programme isn't split, or `department` matches).

Frontend: `src/lib/quizAudience.ts` (`quizMatchesProfile`) filters client-side, so
targeting works as soon as `track`/`department` round-trip. If the backend drops
them, every quiz is treated as `all` (pre-existing behaviour — nothing breaks).

---

## 4. Community channels

The community went from one room to **General + one channel per programme**
(department-split where it applies). Students see General + their programme's
channel; tutors/admin see all. Admins **create/delete** channels; admins **and
tutors** **remove a member** from a channel.

Channel ids follow the programme(+dept) keys: `general`, `jamb-science`,
`jamb-art`, `jamb-commercial`, `postutme-*`, `waec-*`, `afterschool-*`,
`undergrad`, `preclinical`.

**Messages / settings** gained an optional `channelId` (omitted / `general` = the
main channel):

- `GET /community/messages?channelId=&limit=&before=`
- `POST /community/messages` body may include `channelId`
- `GET /community/settings?channelId=` → `{ locked }` (lock is **per channel**)
- `PATCH /community/settings` body `{ locked, channelId? }`

**New channel + membership endpoints:**

- `GET /community/channels` → channels the caller can see. Students get `general`
  + the channel(s) matching their programme (+ department); tutors/admin get all.
  Each: `{ id, name, track?, department?, kind }`.
- `POST /community/channels` (admin) → `{ name, track?, department? }`.
- `DELETE /community/channels/:id` (admin) → delete a channel **and its
  messages** (never allow deleting `general`).
- `GET /community/channels/:id/members` (tutor / admin) → `[{ id, fullname, role }]`.
- `DELETE /community/channels/:id/members/:userId` (tutor / admin) → remove
  someone from a channel.

**Access rules to enforce server-side:** a student may only read/post in
`general` and their own programme channel(s); `channelId` scopes messages; lock
is per channel; only admins create/delete channels; admins **and** tutors remove
members.

Frontend: `src/lib/communityChannels.ts` seeds the default channels in the
browser, so the switcher + admin create/delete + members panel work today.
Message scoping needs the backend to honour `channelId` (until then all channels
show the main channel's messages — no crash, just unscoped). The members panel
falls back to deriving participants from who has posted when `…/members` isn't
live.

---

## 5. Admin student exam-track override

*(Originally written 2026-08-27.)*

The admin can set a student's exam track from the Students roster (a "Set track"
dropdown per student) — to correct a student whose track is wrong, e.g. a **JAMB
candidate who also picked Post-UTME** showing Post-UTME. The frontend is built
(`src/app/admin/components/TrackOverride.tsx`) and the student portal already
prefers the backend's **`examTrack`** field over anything it derives. You already
store and return `examTrack` (e.g. `"jamb"`, `"waec"`) — **all that's missing is a
route to update it.**

**The one thing to add — `PATCH /admin/users/:id`** (admin), update editable user
fields:

```json
{ "examTrack": "jamb" }
```

(One of `jamb | waec | postutme | undergrad | preclinical | afterschool`.) Return
the updated user. Today only `PATCH /admin/users/:id/status` and
`DELETE /admin/users/:id` exist, so this general PATCH is the gap.

**Please also, for consistency:**

1. **Return `examTrack` on `GET /auth/me`** (it's already on the admin roster) so
   the student's own portal applies the admin's choice.
2. **Derive `examTrack` JAMB-first** at registration: when a student's programmes
   include both **JAMB and Post-UTME**, set `examTrack = "jamb"` (Post-UTME wins
   only when it's the *only* exam-prep programme). Ideally **re-derive existing
   students** once so JAMB+Post-UTME ones flip from `postutme` to `jamb`.

No new field needed — this reuses the existing `examTrack`, which the portal
treats as authoritative, so the PATCH takes effect on the student's next load.

---

## 6. Timetable by programme + department

*(Originally written 2026-08-26.)*

Timetables are keyed by **programme (+ department)**, the same keys as quizzes and
community channels: `waec-science|art|commercial`,
`afterschool-science|art|commercial`, `jamb-science|art|commercial`,
`postutme-science|art|commercial`, `undergrad`, `preclinical`.

**Backend action needed:** the API currently **whitelists** timetable keys and
**400s** the new `jamb-*` / `postutme-*` keys. Accept `jamb-science`, `jamb-art`,
`jamb-commercial`, `postutme-science`, `postutme-art`, `postutme-commercial` (and
keep the existing `waec-*` / `afterschool-*` / `undergrad` / `preclinical`) on:

- `GET /timetable/:key` → the grid for that key.
- `PUT /timetable/:key` (admin) → save the grid.

Store each period **cell as an array of up to three** subject strings (parallel
courses, e.g. JAMB `["Physics", "Biology", "Agric"]`) — the frontend already
sends arrays and reads a plain string as a one-item array for back-compat. The
frontend sends these keys today (`src/lib/timetable.ts`,
`src/components/dashboard/TimetableEditor.tsx`).
