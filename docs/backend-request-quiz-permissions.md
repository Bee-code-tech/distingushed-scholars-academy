# Backend request — Create-quiz / Delete-quiz permissions

*Written 2026-09-03.*

Two assignable permissions were added to the admin **Permissions** settings so a
staff role can be granted quiz rights independently:

| Permission key    | Label           | Module    |
|-------------------|-----------------|-----------|
| `quizzes.create`  | Create quizzes  | Academics |
| `quizzes.delete`  | Delete quizzes  | Academics |

(There's also the existing broader `quizzes.manage` = "Build / manage quizzes".)

They show up in the settings and can be ticked for any role today, but nothing
**enforces** them yet — that needs the backend.

## What the backend must do

**1. Persist roles + their permissions** (prerequisite — see
`docs/backend-requests-2026-09-03.md` §1). Roles currently save to browser
localStorage only, so a granted permission never reaches the server. The role
API (`POST/PUT/DELETE /api/admin/roles`) must store the `permissions[]` array
(including `quizzes.create` / `quizzes.delete`) and return it, and a staff user's
effective permissions must be resolvable from their assigned role.

**2. Enforce the permissions on the quiz routes:**

- **`POST /quizzes`** (create) — allow only when the caller is an admin **or** a
  staff/tutor whose role includes **`quizzes.create`** (or `quizzes.manage`).
  Reject others with **403**.
- **`DELETE /quizzes/:id`** (delete) — allow only for an admin **or** a holder of
  **`quizzes.delete`** (or `quizzes.manage`). Reject others with **403**.
- Editing (`PUT /quizzes/:id`) and status changes (`PATCH /quizzes/:id/status`)
  should fall under `quizzes.manage` (or `quizzes.create`) — your call, but be
  consistent.

**3. Surface the caller's permissions** (e.g. on `GET /auth/me`, a
`permissions: string[]`) so the frontend can hide the **Create Quiz** action and
the per-quiz **Delete** button from staff who lack the right (the API 403 is the
real guard; this is just UX).

## Frontend status

- The two permissions are in the catalogue (`src/lib/staffStore.ts`) and render
  in the Permissions screen.
- The quiz builder posts `POST /quizzes` and deletes via `DELETE /quizzes/:id`
  already (admin + tutor "Create Quiz"). Once the backend enforces + exposes the
  permissions, the frontend can gate the buttons on them.
