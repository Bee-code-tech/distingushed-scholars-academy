# Backend request — admin student exam-track override (Option A: reuse `examTrack`)

*Written 2026-08-27, updated to Option A.*

The admin can set a student's exam track from the Students roster (a "Set track"
dropdown per student). This corrects a student whose track is wrong — e.g. a
**JAMB candidate who also picked Post-UTME** showing Post-UTME. The frontend is
built (`src/app/admin/components/TrackOverride.tsx`) and the student portal now
prefers the backend's **`examTrack`** field over anything it derives.

You already store and return `examTrack` on the user (e.g. `"jamb"`, `"waec"`).
**All that's missing is a route to update it.**

## The one thing to add

**`PATCH /api/admin/users/:id`** (admin) — update editable user fields. Body:

```json
{ "examTrack": "jamb" }
```

(One of `jamb | waec | postutme | undergrad | preclinical | afterschool`.) Return
the updated user. Today only `PATCH /admin/users/:id/status` and
`DELETE /admin/users/:id` exist, so this general PATCH is the gap.

## Please also (so it's consistent)

1. **Return `examTrack` on `GET /api/auth/me`** (it's already on the admin roster)
   so the student's own portal applies the admin's choice.
2. **Derive `examTrack` JAMB-first** at registration: when a student's programmes
   include both **JAMB and Post-UTME**, set `examTrack = "jamb"` (Post-UTME wins
   only when it's the *only* exam-prep programme). This matches the portal and
   means most students are correct without any admin action; the admin override
   is just for exceptions. Ideally **re-derive existing students** once so the
   JAMB+Post-UTME ones flip from `postutme` to `jamb`.

## Notes

- No new field needed — this reuses the existing `examTrack`.
- The portal treats `examTrack` as authoritative, so the admin PATCH takes effect
  on the student's next load.
