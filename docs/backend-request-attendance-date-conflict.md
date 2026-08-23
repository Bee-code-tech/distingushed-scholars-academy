# Attendance: only one class can open per day (409 "date already in use")

Thanks for the per-course attendance work — we've wired the frontend to it
(activate/close/check-in/monitor all send `courseId` now). While testing we hit
one issue that blocks it, and wanted to show you exactly what we're seeing so
it's quick to place.

## What we're seeing

Opening attendance works for the **first** class of the day, but opening
attendance for a **second** class on the **same date** fails — even when it's a
different course with a different tutor:

```
POST /api/attendance/sessions   { "courseId": "<first course>" }   -> 201  ✅
POST /api/attendance/sessions   { "courseId": "<second course>" }  -> 409
    { "success": false, "message": "That date is already in use" }
```

The second course is brand new (no prior session) and belongs to a different
tutor, so it shouldn't clash with the first one.

## Why it matters

The whole point of the per-course change is that **each tutor runs attendance
for their own class**. On any given school day, several classes happen — so
several courses need attendance open on the **same date** at the same time. With
the current behaviour, once one class opens attendance, **no other class can**
for the rest of that day.

## What we think is happening (your call)

It looks like a session is unique on **date alone**, so the second insert for the
same day collides. We'd expect a session to be unique per **course per day** —
i.e. the key that makes a session unique should include the course (and possibly
the tutor), not just the date. Something like unique on `(courseId, date)` rather
than `(date)`. However you model it is fine — we just need **different courses to
be able to have attendance open on the same date**.

## To reproduce

1. `POST /attendance/sessions { courseId: A }` → 201
2. `POST /attendance/sessions { courseId: B }` (B ≠ A, same day) → 409
   "That date is already in use"

## On our side

The frontend is already sending `courseId` on every attendance call and shows a
course picker (tutor) / per-course cards (student). Nothing to change on our end
— once two courses can open attendance on the same date, the full flow
(activate → student marks present → tutor monitors → close) works per class.

Thanks!
