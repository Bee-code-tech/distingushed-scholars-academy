# Quiz / CBT — feature spec

*Written 2026-08-26 (Wednesday).*

How quizzes should work end-to-end for DSA, and what already exists vs what still
needs building. The flow the academy wants:

> **Tutors** supply the questions (bulk Excel **or** one-by-one with images) →
> **Admin** assembles and publishes the quiz → **Students** take it against a
> timer → **Results** are visible to everyone involved, **including the guardian**.
> Performance analytics to follow (owner will define the metrics).

---

## 1. Roles & flow

| Step | Who | What |
|------|-----|------|
| 1. Contribute questions | **Tutor** | Upload questions for their subject — a filled **Excel** sheet, or add them **one by one** (with an optional image per question). Questions land in a per-subject **question bank**. |
| 2. Build & publish quiz | **Admin** | Pick questions (or a whole bank), set title, subject/category, **time limit**, shuffle, access code, leaderboard on/off, then publish. |
| 3. Take quiz | **Student** | Open the quiz (by link or access code), answer against a **countdown timer**; auto-submits when time runs out. |
| 4. See results | **Student, Tutor, Admin, Guardian** | Score + breakdown after submit. The **guardian** sees their ward's quiz results alongside the rest of the ward's performance. |
| 5. Analytics | — | *Deferred — owner will specify the metrics.* |

---

## 2. What already exists (do not rebuild)

- **Admin exam builder** — `src/app/admin/hooks/useExamBuilder.ts` + `constants/quiz.ts`:
  a 3-step builder with **bulk Excel import** and **per-question image upload**
  (currently base64), quiz config (title, description, `timeLimit`, shuffle,
  `showLeaderboard`, `accessCode`, category).
- **Excel parser** — `src/app/admin/utils/excelParser.ts` reads these columns:
  `Subject, Topic, Question` (or `Body`), `A, B, C, D, E, Answer, Explanation, Mark`.
- **Admin quiz management** — `QuizzeManagement.tsx`, `useQuizManagement.ts`,
  `QuizModal.tsx` (create/update/delete/toggle status).
- **Backend quiz endpoints** (live in Swagger):
  - `GET/POST /api/quizzes`
  - `GET/PUT/DELETE /api/quizzes/{id}`
  - `PATCH /api/quizzes/{id}/status` (publish / unpublish)
  - `POST /api/quizzes/{id}/submit` (student submission → score)
  - `GET /api/quizzes/{id}/leaderboard`
  - `POST /api/quizzes/verify-code`, `GET /api/quizzes/link/{link}` (student access)

So the **admin build + student submit + leaderboard** spine exists. The gaps are
the **tutor question flow**, **image hosting**, and the **guardian results view**.

---

## 3. Data model

```ts
// Question (constants/quiz.ts)
{
  id, subject, topic,
  body,                       // the question text
  options: { A, B, C, D, E }, // E optional
  correctOption,              // 'A'..'E'
  explanation,
  image: string | null,       // -> move to a Cloudinary URL (see §5)
  mark: number
}

// QuizConfig
{ title, description, timeLimit /* minutes */, shuffleQuestions,
  showLeaderboard, accessCode, category }
```

### Excel template (tutor upload)
One row per question, header row exactly:

| Subject | Topic | Question | A | B | C | D | E | Answer | Explanation | Mark |
|---------|-------|----------|---|---|---|---|---|--------|-------------|------|

- `Answer` is a letter A–E. `E` and `Explanation` optional. `Mark` defaults to 1.
- Images can't ride in Excel — a tutor adds images on the one-by-one screen after
  import, or leaves them out.

---

## 4. To build — frontend

1. **Tutor question upload** (new, in the tutor portal):
   - "Questions" tab: pick subject → **Import Excel** (reuse `parseExcelQuestions`)
     **or** **Add one by one** (reuse the builder's per-question form + image).
   - Saves to the tutor's **question bank** for that subject (see §6 backend).
   - Reuse the existing `useExamBuilder` pieces so the parsing/image logic isn't
     duplicated.
2. **Admin quiz assembly** (extend existing builder):
   - Add a "Pull from question bank" source — filter by subject/tutor, select
     questions, then set `QuizConfig` and publish.
3. **Student quiz runner** (verify/complete):
   - Countdown from `timeLimit`; **auto-submit at zero**; disable back-nav during
     the attempt; `POST /quizzes/:id/submit`; show score + per-question review.
4. **Guardian results view** (new tab in the guardian portal):
   - List the ward's quiz results (title, score, date) + drill-in — using the
     ward-scoped results endpoint (§6).

---

## 5. Images — host on Cloudinary (not base64)

The builder currently stores images as base64 data URLs, which bloats the quiz
payload (and the backend body limit is ~100 KB). Switch per-question images to
**Cloudinary** using the existing `uploadToCloudinary(file, 'dsa/quiz')`
(`src/lib/cloudinary.ts`) and store only the returned `imageUrl` on the question.

---

## 6. To build — backend

1. **Question bank** (tutor-contributed, admin-consumed):
   - `POST /api/questions` (tutor) — create one/many questions for a subject.
   - `GET /api/questions?subject=&tutorId=` (tutor own / admin all) — list bank.
   - `DELETE /api/questions/:id`.
   - Or, if simpler, model questions as embedded in draft quizzes and add a
     `source: 'bank'` filter — but a standalone bank keeps tutor contributions
     reusable across quizzes.
2. **Results visibility**:
   - `GET /api/quizzes/:id/results` — all submissions for a quiz (admin/tutor).
   - **Guardian**: extend the parents API so a guardian can read their ward's quiz
     results, e.g. `GET /api/parents/me/wards/:studentId/quiz-results`, mirroring
     the existing `/performance` and `/fees` ward endpoints (server enforces the
     ward link, as those already do).
3. Confirm `POST /quizzes/:id/submit` returns the **per-question correctness** (not
   just a total) so the student review screen and results can show breakdowns.

---

## 7. Deferred

- **Performance analytics** — the owner will define the metrics (per-subject
  averages, trend over time, cohort comparisons, etc.). Leave a placeholder in the
  student "My Performance" and guardian "Performance" tabs to slot these in.

---

## Permissions summary

| Action | Who |
|--------|-----|
| Contribute questions (Excel / one-by-one + images) | Tutor (own subjects), Admin |
| Build & publish a quiz | Admin |
| Take a quiz | Student |
| See a student's result | that Student, their Tutor, Admin, their Guardian |
