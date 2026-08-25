# Backend request — multiple tutors per course

Right now a course stores a single `tutorId`. The academy needs to assign **more
than one tutor to the same course** (e.g. two tutors co-teaching Chemistry). The
admin panel already has the UI for this — it sends a `tutorIds` array — it just
needs the backend to store and return it.

## What the frontend now sends

**`POST /api/courses`** and **`PUT /api/courses/:id`** now include a `tutorIds`
array alongside the existing `tutorId`:

```json
{
  "title": "Chemistry",
  "subject": "Chemistry",
  "category": "jamb-putme",
  "tutorId": "661a...",             // first tutor (kept for backward compat)
  "tutorIds": ["661a...", "662b..."], // ALL assigned tutors — please store this
  "isPublished": true
}
```

Adding a second tutor to an existing course is done with `PUT /api/courses/:id`
carrying the full `tutorIds` set (this is the fix for "it says create the course
again" — the admin no longer recreates the course).

## What we need

1. **Store an array.** Add `tutors: [ObjectId ref User]` (or `tutorIds`) to the
   Course model. Keep `tutorId` working as an alias for `tutors[0]` so nothing
   else breaks.
2. **Accept `tutorIds`** on `POST /courses` and `PUT /courses/:id`. When present,
   set the course's tutors to exactly that set. If only `tutorId` is sent, treat
   it as a single-element set.
3. **Return the assigned tutors** on `GET /courses` and `GET /courses/:id` — ideally
   populated so the UI can show names:
   ```json
   {
     "id": "...",
     "title": "Chemistry",
     "tutors": [
       { "id": "661a...", "fullname": "Aisha Bello" },
       { "id": "662b...", "fullname": "Tunde Okoro" }
     ]
   }
   ```
   The client already reads any of `tutors[]`, `tutorIds[]`, populated `tutor`, or
   single `tutorId`, so any of these shapes works — an array is what unlocks two.
4. **Tutor scoping.** A tutor should see a course in **“My Courses”** if they are in
   the course's tutor set (not only if they are `tutorId`). Please update the
   `GET /tutors/me/courses` (and the tutor students/analytics scoping) to match on
   membership in `tutors`, so a co-tutor sees the course and its students too.

## Notes

- No new endpoints needed — just the model field + accepting/returning the array
  on the existing course routes.
- Deleting/looking up a course is unchanged.
