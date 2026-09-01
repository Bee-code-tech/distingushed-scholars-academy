# Backend request — quiz audience by programme + department

*Written 2026-09-01.*

Admins now target a quiz at a **programme** (and, for department-split
programmes, a **department**), the same way timetables are keyed:

| Programme | Department split? |
|-----------|-------------------|
| JAMB | Science / Art / Commercial |
| Post-UTME | Science / Art / Commercial |
| WAEC | Science / Art / Commercial |
| After-School | Science / Art / Commercial |
| Undergrad (100-Level) | — |
| Preclinical | — |

A student should only see quizzes for **their** programme (+ department), plus
any quiz targeted at **all students**.

## What the frontend sends

`POST /quizzes` (admin) now includes three extra fields:

```json
{
  "title": "JAMB Mock — Week 3",
  "type": "general",
  "track": "jamb",            // 'all' | jamb | postutme | waec | undergrad | preclinical | afterschool
  "department": "science",    // science | art | commercial — omitted when track is 'all' or not dept-split
  "audience": "JAMB · Science",  // display label, optional
  "subjects": [ … ]
}
```

`track: "all"` (or omitted) means every student sees it.

## Backend action needed

1. **Persist** `track` and `department` on the quiz document.
2. **Return** them on `GET /quizzes` and `GET /quizzes/:id`.
3. Ideally **filter server-side** on `GET /quizzes` for a student: return quizzes
   where `track` is `all`/empty, or `track` matches the student's programme **and**
   (`department` is empty, or the programme isn't dept-split, or `department`
   matches the student's department).

## Frontend behaviour until then

`src/lib/quizAudience.ts` filters client-side in the student runner
(`quizMatchesProfile`), so targeting works **as soon as the backend stores and
returns `track`/`department`**. If the backend drops these fields, every quiz is
treated as `all` (visible to everyone) — the pre-existing behaviour, so nothing
breaks; targeting simply has no effect until the fields round-trip.
