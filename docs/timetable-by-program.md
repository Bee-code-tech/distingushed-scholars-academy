# Timetable by programme — feature spec

*Written 2026-08-26 (Wednesday).*

The admin should build timetables **per programme**, and for secondary / O'level
programmes, **per department** (Science / Art / Commercial). A single period must
be able to hold **two courses** at once (e.g. JAMB students who take **Biology
instead of Physics** share the same slot).

---

## 1. What changes from today

Today (`src/lib/timetable.ts`) there is **one grid per exam track** (`jamb`,
`waec`, `postutme`), and `subjectsFor()` only splits WAEC by department. That
doesn't cover the new programme tracks (undergrad, preclinical, after-school), the
per-department split for secondary programmes, or two subjects in one period.

## 2. Target model

A timetable is identified by a **key** = programme (+ department where it applies):

| Programme | Department split? | Timetable keys |
|-----------|-------------------|----------------|
| WAEC / Secondary (SS) | **Yes** | `waec-science`, `waec-art`, `waec-commercial` |
| After-School / Summer (SS) | **Yes** | `afterschool-science`, `afterschool-art`, `afterschool-commercial` |
| **JAMB** | **Yes** | `jamb-science`, `jamb-art`, `jamb-commercial` |
| **Post-UTME** | **Yes** | `postutme-science`, `postutme-art`, `postutme-commercial` |
| 100-Level / Undergrad | No | `undergrad` |
| Preclinical | No | `preclinical` |

> **⚠️ Backend action needed:** the API currently **whitelists** timetable keys and
> **400s** the new `jamb-*` / `postutme-*` keys. Please accept `jamb-science`,
> `jamb-art`, `jamb-commercial`, `postutme-science`, `postutme-art`,
> `postutme-commercial` on `GET`/`PUT /api/timetable/:key`. The frontend already
> sends them.

- A **period cell** holds **up to three** course/subject entries (parallel
  courses), e.g. `["Physics", "Biology", "Agric"]` for JAMB. A student sees the
  one(s) matching their choice (or all, labelled).
- Grid stays 6 days (Mon–Sat) × 4 periods, as now.

### Cell shape
```ts
type Cell = string[]          // 0, 1, 2, or 3 subject names
type TimetableGrid = Cell[][] // [period][day]
```
(Today a cell is a single `string`; migrate to `string[]` — a plain string can be
read as `[string]` for backward compatibility.)

## 3. Admin editor changes (`TimetableEditor`)

1. **Programme picker** — choose the programme; if it's a department-split
   programme, also pick Science / Art / Commercial. The editor loads/saves that
   key's grid.
2. **Per-cell**: allow adding a **second** subject to a period (an "+ add
   alternative" affordance), and removing it. Cap at two.
3. Save per key (backend or local store keyed by the timetable key).

## 4. Student view

- Resolve the student's timetable key from their **programme + department**
  (extend `resolveStudentProfile` output — department already resolved for WAEC;
  add it for after-school/summer secondary students too).
- Render a period with two subjects as e.g. **"Physics / Biology"**, and if the
  student's own subject choice is known, highlight theirs.

## 5. Backend

- Extend the timetable endpoints to be keyed by **programme(+department)** rather
  than only `track`:
  - `GET /api/timetable/:key` → the grid for that key (`key` e.g. `waec-science`,
    `jamb`).
  - `PUT /api/timetable/:key` (admin) → save the grid.
- Store each cell as an **array of up to two** subject strings.
- Keep the existing `/api/timetable/:track` working (treat `track` as a key) so
  nothing breaks during migration.

## 6. Notes / open questions for the owner

- For JAMB dual-course periods: should the student see **both** subjects, or only
  the one matching their registered subjects? (Spec assumes: show both, highlight
  theirs — simplest and safe.)
- Confirm the department applies to **After-School/Summer** the same way it does to
  WAEC (assumed yes, since both are SS-level).
