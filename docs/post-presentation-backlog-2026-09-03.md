# Post-presentation backlog — prioritised

*Compiled 2026-09-03 from the "DSA Issues after presentation" list + follow-up notes.*
*Tags: **[F]** frontend · **[B]** backend · **[F+B]** both. Status: 🔴 not started ·
🟡 partly built · 🟢 built (frontend), backend pending.*

The two source lists overlapped a lot — this merges them into one de-duplicated,
priority-ordered plan. Priorities are a **recommendation**; adjust as you see fit.

---

## P0 — Broken / data-integrity (fix first)

These are either broken or leak data across users.

1. **Custom roles/permissions API** 🔴 **[B]** — creating a custom role fails
   ("not allowed to create new role"). The permissions catalogue + assignment UI
   exist on the frontend (`staffStore.ts`); the backend needs a **create-role**
   endpoint (and staff-account creation, still disabled). *Screenshot #6 = note "Create roles".*
2. **Tutor can't update profile** 🔴 **[F+B]** — editing/saving a tutor's own
   profile fails. Confirm the endpoint + wire the form.
3. **No cross-tutor "spill-over"** 🔴 **[F+B]** — a tutor must only see **their own
   students'** data in **Gradebook, Assignments, and Analytics**. Today these can
   show data beyond the tutor's roster. Scope every query/view to the tutor's
   assigned courses/students (privacy + correctness).

---

## P1 — Finish the quiz (backend for what's already built + demoed)

The quiz feature is built and demoed; these unblock it end-to-end. Details already
specced in `docs/backend-requests-2026-09-02.md` §5–6.

4. **Quiz questions — backend** 🔴 **[B]** — persist/serve the question bank
   properly (the store the tutor bank + quizzes read/write). *Screenshot #5.*
5. **Quiz attempts** 🟢 **[B]** — enforce `maxAttempts` on submit, expose
   `attemptsUsed`, and the attempts list (`GET /quizzes/:id/attempts`,
   delete/withdraw). Frontend + admin panel already built. *(09-02 §5–6)*
6. **Quiz leaderboard** 🟡 **[B]** — endpoint exists and the admin panel reads it;
   confirm it returns ranked scores per quiz.
7. **Editing a quiz** 🔴 **[F+B]** — admins/tutors can currently only delete +
   re-create. Add **edit** (title, audience, attempts, subjects/questions) →
   `PUT /quizzes/:id`, plus the edit UI.
8. **Free/public quiz — revised** 🟢→🔴 **[F+B]** — change the taker form from
   name+age to **email + name + phone**; **one attempt per device** (store a flag
   locally so they can't retake); **email the score** to the address given. Still
   needs the public endpoints (`docs/backend-requests-2026-09-02.md` §2), now plus
   an email-send + duplicate-guard. *Screenshot #10 / note "collect email…".*

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

11. **SS1 / SS2 / SS3 as classes** 🔴 **[F+B]** — registration should capture a
    **class** (SS1–SS3) *in addition to* the track/programme, not just a programme.
    Backend: courses key off class. *Note "SS1, SS2, SS3…".*
12. **WAEC under course + class on views** 🔴 **[F+B]** — WAEC becomes a course;
    SS1–SS3 are classes. Student home shows **class alongside track**; a tutor sees
    the **students in his class**.
13. **Filter/search students by programme/class** 🔴 **[F+B]** — admin roster gets
    a **search box + filter dropdown** by programme/class; backend "get students by
    category/class". *Screenshot #1 & #4 = notes "Student table filter" / "sorting".*

---

## P4 — Academics & community

14. **Tutors create quizzes** 🔴 **[F+B]** — an "Academic module" so **tutors** (not
    only admins) can build/publish quizzes from their bank. *Screenshot #7.*
15. **Community per programme + tutor track-scope** 🟡 **[F+B]** — per-programme
    channels exist (`docs/backend-requests-2026-09-01.md` §4); enforce that a
    **tutor only accesses their own track's** community, and add track-based
    messaging for tutors. *Screenshot #8 & #9.*
16. **Excel upload — named batches + tutor review/edit** 🔴 **[F+B]** — every Excel
    upload carries a **name** shown on admin & tutor ends; a tutor can **review**
    questions from the bank, **bulk-upload**, and **edit** them.

---

## P5 — Admin/UX polish & smaller items

17. **Merge People screens** 🔴 **[F]** — combine **Tutors + Create Tutor** into one
    screen, and **Guardians + Create Guardian** into one (like the list-first quiz
    view).
18. **Course UX improvement (admin)** 🔴 **[F]** — tidy the admin course flow.
19. **Announcement badge** 🔴 **[F]** — show a **count of new** announcements/
    notifications on the bell/announcements.
20. **Support / customer care** 🔴 **[F+B]** — a support/contact channel on the site.
21. **Timetable "cleared"** ⚪ **[?]** — *needs clarification*: is the timetable
    showing empty (a bug), or is this item done? Confirm intent.

---

## Already done this session (for reference — don't re-scope)
- Anti-cheat (5 warnings + modal), calculator, submit-confirm, per-subject
  results + download + retake, question pagination, rich-text/math questions,
  list-first admin quiz builder, admin attempts panel, 30-min idle logout.
- Backend asks for the above live in `docs/backend-requests-2026-09-01.md` and
  `docs/backend-requests-2026-09-02.md`.
