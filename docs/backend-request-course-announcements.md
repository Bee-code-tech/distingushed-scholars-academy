# Backend request — course-scoped announcements (tutor → their subject)

*Written 2026-09-01.*

Tutors can now target an announcement at **only the students taking one of their
subjects** (courses), in addition to the existing **all students** and **exam
track** options. The frontend already sends this; the backend needs to accept
and enforce it.

## What the frontend sends

`POST /announcements` body, new `scope: "course"` variant:

```json
{
  "scope": "course",
  "courseId": "<course ObjectId>",
  "courseTitle": "Use of English",   // for display; optional
  "authorName": "Mr. Bello",
  "title": "…",
  "body": "…"
}
```

Existing variants are unchanged:
- `{ "scope": "global", … }`
- `{ "scope": "track", "track": "jamb" | "waec" | "postutme", "examTrack": "…", … }`

## Backend action needed

1. **Accept `scope: "course"`** on `POST /announcements` and persist `courseId`
   (and `courseTitle` if you keep it). Reject if the author is a tutor who does
   **not** own/teach that course (admins may target any course).
2. **Delivery / filtering** on `GET /announcements`: a student should receive a
   `course`-scoped announcement **only if they are enrolled in that course**.
   So the student's set = `global` + their `track` + every `course` they're
   enrolled in. (Tutors/admin listing their own sent announcements should see
   all of theirs.)
3. On `GET`, return `courseId` and `courseTitle` (populating the course title is
   ideal so the badge reads the subject name). The frontend also handles
   `courseId` arriving as a populated object `{ _id, title }`.

## Frontend fallback (until this ships)

`src/lib/announcementsStore.ts` supports the `course` scope locally
(`getForStudent(track, courseIds)` filters course announcements to the student's
enrolled course ids). Live mode relies on the backend to filter, so until the
endpoint enforces enrolment, a course-scoped announcement created live may be
delivered by the existing (track/global) logic only — it won't break, but it
won't reach exactly the enrolled set until the backend implements the filter.
