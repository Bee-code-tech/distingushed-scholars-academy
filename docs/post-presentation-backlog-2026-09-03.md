# Post-presentation backlog — prioritised

*Compiled 2026-09-03 from the "DSA Issues after presentation" list + follow-up notes.*
*Tags: **[F]** frontend · **[B]** backend · **[F+B]** both. Status: 🔴 not started ·
🟡 partly built · 🟢 built (frontend), backend pending · ✅ done.*

> **Progress (updated 2026-09-04):** P0, P1, P3, P4 and the open P5 items are
> **done**. The only remaining major block is **P2 — Access & payments**
> (items 9–10), which needs product direction (plan definitions, pricing,
> Paystack flow). Item 18 (course UX) is partly addressed (courses now carry a
> class). See per-item ✅ marks below.

The two source lists overlapped a lot — this merges them into one de-duplicated,
priority-ordered plan. Priorities are a **recommendation**; adjust as you see fit.

---

## P0 — Broken / data-integrity (fix first)

These are either broken or leak data across users.

1. **Custom roles/permissions API** ✅ **[B]** — roles CRUD is live; the roles
   screen persists to `GET/POST/DELETE /admin/roles` (no longer localStorage).
2. **Tutor can't update profile** ✅ **[F+B]** — the Profile & Settings form saves
   via `PUT /auth/updatedetails` (+ `updatepassword`); tutor fields supported.
3. **No cross-tutor "spill-over"** ✅ **[F+B]** — analytics/grade/assignment
   controllers scope to the tutor's assigned courses/students
   (`coursesForTutorFilter` / `isCourseTutor`).

---

## P1 — Finish the quiz (backend for what's already built + demoed)

The quiz feature is built and demoed; these unblock it end-to-end. Details already
specced in `docs/backend-requests-2026-09-02.md` §5–6.

4. **Quiz questions — backend** ✅ **[B]** — bank questions persist/serve (legacy +
   v2), with `batchName`, edit and delete.
5. **Quiz attempts** ✅ **[B]** — `maxAttempts` enforced, `attemptsUsed` exposed,
   attempts list + delete/withdraw live; admin panel wired.
6. **Quiz leaderboard** ✅ **[B]** — endpoint returns ranked scores; admin panel reads it.
7. **Editing a quiz** ✅ **[F+B]** — `PUT /quizzes/:id` + edit UI (list-first builder).
8. **Free/public quiz — revised** ✅ **[F+B]** — taker form is email + name + phone;
   one-attempt-per-device lock; public endpoints live; redesigned results.

---

## P2 — Access & payments (paid vs free)

9. **Paid vs free — UI + API** 🔴 **[F+B]** — the 3-level access model
   (`docs/payment-plan.md`) needs its live UI + backend so paid and free students
   get the right access. *Screenshot #2.*
10. **Payment durations** 🔴 **[F+B]** — offer **1 / 2 / 3-month** plans (price +
    expiry per duration).

---

## P3 — Classes & tracks (data-model change)

Bigger structural change — do together.

11. **SS1 / SS2 / SS3 as classes** ✅ **[F+B]** — registration already captures a
    **class** (`currentLevel`) *and* track/programmes. Backend: `Course.classLevel`
    added; `/courses/mine` matches the student's class (`change-2026-09-04-course-classlevel.md`).
12. **WAEC under course + class on views** ✅ **[F+B]** — courses carry a class
    (admin CourseManager class selector); student home shows **class + track**; the
    tutor roster shows each student's **class**; tutor students derive from his courses.
13. **Filter/search students by programme/class** ✅ **[F+B]** — admin roster has a
    **search box + programme/class filter dropdowns** (backend `listUsers` already
    supported the filters).

---

## P4 — Academics & community

14. **Tutors create quizzes** ✅ **[F+B]** — tutors have **Create Quiz** in their
    Academics nav (`<QuizBuilder />`), gated by the quizzes.create permission.
15. **Community per programme + tutor track-scope** ✅ **[F+B]** — a tutor now only
    sees the community channels of the **track(s) they teach** (derived from their
    assigned courses); admins still see/moderate all.
16. **Excel upload — named batches + tutor review/edit** ✅ **[F+B]** — named
    batches (`batchName`) flow through import; tutors can review, bulk-upload, and
    **edit** bank questions (`PUT /questions/:id`, `change-2026-09-03-question-edit.md`).

---

## P5 — Admin/UX polish & smaller items

17. **Merge People screens** ✅ **[F]** — Tutors and Guardians are now list-first
    with an inline **Create Tutor/Guardian** button; the separate create nav items
    are gone.
18. **Course UX improvement (admin)** 🟡 **[F]** — courses now carry a class + inline
    edit; further tidy-up optional.
19. **Announcement badge** ✅ **[F]** — unread count shows on the announcements nav
    for student + tutor (`useAnnouncementsUnread`).
20. **Support / customer care** ✅ **[F+B]** — Support contact form (POST /support)
    on student, tutor **and guardian** dashboards.
21. ~~**Timetable "cleared"**~~ ✅ — resolved / already done (confirmed 2026-09-03).

---

## Already done this session (for reference — don't re-scope)
- Anti-cheat (5 warnings + modal), calculator, submit-confirm, per-subject
  results + download + retake, question pagination, rich-text/math questions,
  list-first admin quiz builder, admin attempts panel, 30-min idle logout.
- Backend asks for the above live in `docs/backend-requests-2026-09-01.md` and
  `docs/backend-requests-2026-09-02.md`.
