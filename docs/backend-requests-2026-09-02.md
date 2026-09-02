# Backend requests — 2026-09-02

Two new features plus one carry-over. As with the 2026-09-01 batch, the frontend
is built (or will be built) **live-first** so each switches on automatically once
the backend ships its side.

1. [Notify programme students when a quiz is created](#1-quiz-created-notifications)
2. [Free / public quizzes (no-login link, name + age)](#2-free--public-quizzes)
3. [Carry-over: course-announcement delivery filtering](#3-carry-over)

The **programme + department** key model from 2026-09-01 applies again: the
dept-split programmes are JAMB, Post-UTME, WAEC, After-School (each Science / Art /
Commercial); Undergrad and Preclinical are not split.

---

## 1. Quiz-created notifications

**Goal:** when an admin publishes a quiz, every student **doing that programme**
gets a notification about it (so they know a new quiz is available).

The notification inbox is already live and **backend-driven** — the frontend only
reads it (`GET /notifications`, `PATCH /notifications/:id/read`,
`PATCH /notifications/read-all`) and shows an unread badge on the bell. So this is
a **backend fan-out on quiz create**; no new frontend inbox work is required.

### What to build (backend)

On `POST /quizzes` (publish), after saving, create one notification per matching
student, using the quiz's `track` / `department` audience (see
`docs/backend-requests-2026-09-01.md` §3):

| Quiz `track` | Recipients |
|---|---|
| `all` (or empty) | every active student |
| a dept-split track **with** `department` | students whose `examTrack` = track **and** `department` = department |
| a dept-split track **without** `department` | students whose `examTrack` = track (any department) |
| a non-split track (undergrad / preclinical) | students whose `examTrack` = track |

Match on the same `examTrack` field the portal already treats as authoritative.
**Don't** notify the quiz's creator.

### Notification payload (match the existing shape exactly)

The inbox returns `{ id, type, title, body, link, isRead, createdAt }`. Emit:

```json
{
  "type": "quiz",
  "title": "New quiz: <quiz title>",
  "body": "<audience label> · <N> questions",
  "link": "/dashboard?tab=quizzes"
}
```

- `audience label` = the quiz's `audience` (e.g. `"JAMB · Science"` or
  `"All students"`).
- `link` deep-links the student to their Quizzes tab. (Frontend: the dashboard
  already restores the active tab from `?tab=`; I'll make a `type:"quiz"`
  notification open the Quizzes view when tapped.)

### Notes

- Fan-out should be efficient (one bulk insert), not one request per student.
- If a quiz is later edited (not re-published), do **not** re-notify.
- Optional: also emit for the tutor(s) assigned to the matching courses.

---

## 2. Free / public quizzes

**Goal:** an admin can mark a quiz as **Free** — for random, non-affiliated people
who have no account. They get a **shareable link**; on it they only enter their
**name and age** (no email, no password), take the quiz, see their **results**,
then get a message that to access more features they should join DSA, and are
sent to the **DSA homepage** (`/`).

There's already link infrastructure to build on: `GET /quizzes/link/:link` and
`POST /quizzes/verify-code`. Free quizzes need a **no-auth, no-access-code** path.

### Quiz model additions

On the quiz:

```json
{ "accessMode": "portal" | "free", "link": "<slug>" }
```

- `accessMode: "portal"` (default) = today's behaviour (enrolled/logged-in
  students, audience-filtered by track/department).
- `accessMode: "free"` = public. Generate a unique `link` slug on create and
  return it so the admin can copy/share it. A free quiz is typically open to
  everyone (`track: "all"`), but the field may still be set.

### Public endpoints (NO auth)

1. **`GET /public/quizzes/:link`** — fetch a free quiz by its slug for taking.
   - Returns the quiz with `subjects[].questions[]` **without** the correct
     answers (`Answer` omitted) so it can't be scraped.
   - 404 if the slug doesn't exist or the quiz isn't `accessMode: "free"`.
   - Must **not** require a token or access code.

2. **`POST /public/quizzes/:link/submit`** — submit a public attempt.
   - Body: `{ "name": "...", "age": 17, "answers": [ { "questionId": "...", "selectedOption": 0 } ], "timeTaken": 123 }`
   - Returns the same result shape as the authed submit:
     `{ totalScore, totalMarks, percentage, breakdown[] }`.
   - Stores a **public attempt** record `{ quizId, name, age, score, totalMarks, percentage, submittedAt }` (no account, no PII beyond name + age).
   - Rate-limit this (it's unauthenticated) to prevent abuse.

3. *(optional, admin)* **`GET /quizzes/:id/public-results`** — list public attempts
   `{ name, age, score, percentage, submittedAt }` so the admin can see who took a
   free quiz.

### Frontend (I will build these, live-first)

- **Admin QuizBuilder:** an **access-mode** control — *Portal (enrolled students)*
  vs *Free (public link)*. On Free, after publishing, show the shareable link with
  a copy button.
- **Public taker page** — a new no-auth route (e.g. `/q/[link]`), mirroring the
  `/rapid-quiz` pattern:
  1. **Details step:** name + age only.
  2. **Quiz step:** the questions with the per-subject timer (anti-cheat relaxed
     for public takers).
  3. **Results step:** score / percentage / breakdown.
  4. **CTA:** "To unlock full features — courses, tutors, tracked progress — join
     Distinguished Scholars Academy," with a button that navigates to the
     **homepage** (`/`).

Until the public endpoints exist, the admin toggle + link are inert (the page
shows a "coming soon" state); once `GET /public/quizzes/:link` and
`POST /public/quizzes/:link/submit` are live, the flow works end-to-end with no
further frontend change.

---

## 3. Carry-over

Still open from 2026-09-01 (found during endpoint verification):

- **Course-scoped announcement delivery** — `POST /announcements`
  `{ scope: "course", courseId }` stores correctly, but `GET /announcements`
  currently returns course posts to **everyone** (a non-enrolled guardian saw a
  Biology-scoped announcement). The server should deliver a `scope: "course"`
  announcement **only to students enrolled in that course**. The frontend already
  filters client-side as a safety net, so this isn't user-visible breakage — but
  it should be enforced server-side. See
  `docs/backend-requests-2026-09-01.md` §2.
