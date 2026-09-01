# Backend request — admin student exam-track override

*Written 2026-08-27.*

The admin can now set a student's exam track from the Students roster (a "Set
track" dropdown per student). This corrects a student whose programmes resolve to
the wrong track — e.g. a **JAMB candidate who also picked Post-UTME** and shows
Post-UTME. The frontend is built (`src/app/admin/components/TrackOverride.tsx`)
and calls the endpoint below; it degrades to an inline error until it exists.

## Field

Add **`examTrackOverride`** (string, one of `jamb | waec | postutme | undergrad |
preclinical | afterschool`, or empty) to the **user** model.

- The student portal **prefers `examTrackOverride`** over the programme-derived
  track (`resolveStudentProfile` already checks it first). Empty → normal
  behaviour (derive from programmes).

## Endpoints

1. **`PATCH /api/admin/users/:id`** (admin) — update editable user fields. For
   this feature the body is:
   ```json
   { "examTrackOverride": "jamb" }
   ```
   (An empty string clears the override.) Return the updated user. This is a
   general user-update route — today only `PATCH /admin/users/:id/status` and
   `DELETE /admin/users/:id` exist, so this new PATCH is what's missing.

2. **Return `examTrackOverride`** on:
   - `GET /api/auth/me` (so the student's own portal applies it), and
   - `GET /api/admin/users?role=student` (so the roster shows the current value).

## Notes

- No enforcement/derivation logic on the backend is required — the frontend
  resolves the track. You only need to **store and return** the field.
- Keep it distinct from any auto-derived `examTrack`/`examType`, so a normal
  student (no override) still resolves from their programmes.
