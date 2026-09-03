# Note for the admin frontend dev

*From the student/portal side — 2026-08-26 (Wednesday). Two things for your area.*

## 1. Missing: create Secretary / Staff accounts

The admin panel can currently create **Tutors** (`Create Tutor`) and **Guardians**
(`Create Guardian`) only. There is **no screen to create a Secretary or other
staff**, even though the backend fully supports it:

- `POST /api/admin/staff` — *"Create tutor, parent, staff, or admin"* — accepts
  `role` plus `staffRoleId` / `staffRole` / `permissions` (and the usual
  `fullname, email, password, username, phone`).
- `GET`/`POST /api/admin/roles` — the staff-role catalogue (`StaffRoleItem`).
- `adminApi.createStaff(...)` already exists in `src/lib/admin-api.ts` (it's what
  `Create Tutor` calls with `role: 'tutor'`).

**Suggested build:** a **"Create Staff"** screen under the *People* group, mirroring
`CreateTutor.tsx`, but with a **role / staff-role picker** (Secretary, etc.,
loaded from `GET /admin/roles`) and optional permissions. It's essentially
`CreateTutor` with `role: 'staff'` + a `staffRoleId` select instead of the
hard-coded `role: 'tutor'`. Staff then sign in and land on `/staff`
(`dashboardPathForRole` already routes `role: 'staff'` there).

## 2. Heads-up: two small fixes I had to make in admin files to unblock the build

`main` was failing `tsc` after the last admin push. I made the **minimal** fixes
below so the app builds — please review / take ownership:

- **`src/lib/admin-api.ts`** — re-added `tutorIds?: string[]` to
  `CreateCoursePayload`. The two-tutors-per-course feature (CourseManager sends
  `tutorIds`; backend now returns a `tutors[]` array — see
  `docs/backend-request-course-tutors.md`) broke when the rework dropped that
  field.
- **`src/app/admin/components/Library.tsx`** — `LibraryCourseWrapper` passes
  `<Library courseId={...}>`, but the export was renamed to `LibraryPage()` with
  **no props**, so it didn't compile. I added an **optional, unused**
  `{ courseId?: string }` param to `LibraryPage` to unbreak the build — the
  **course-scoped library still needs wiring** (LibraryPage ignores `courseId`
  for now). Please finish that when you can.

Nothing else in the admin panel was touched.

## 3. Backend checklist — features built frontend-first (2026-09-01)

Six features shipped on the portal side that need backend support to go fully
live. Each is **already built and safe** (live where the endpoint exists, else a
browser-local fallback) — the backend work just switches them on. Full request
details, payloads and access rules are in
**`docs/backend-requests-2026-09-01.md`**. Summary checklist:

- [ ] **Guardian assignment grades** — `GET /parents/me/wards/:id/assignment-grades`
  (read-only, parent-scoped, like `quiz-results`). *(§1)*
- [ ] **Course-scoped announcements** — accept `scope: "course"` (+ `courseId`) on
  `POST /announcements`; deliver only to students enrolled in that course. *(§2)*
- [ ] **Quiz audience** — persist + return `track` / `department` on quizzes;
  filter `GET /quizzes` to the student's programme. *(§3)*
- [ ] **Community channels** — `GET/POST/DELETE /community/channels`,
  `GET/DELETE /community/channels/:id/members/:userId`, and honour `channelId` on
  messages/settings (lock is per channel). *(§4)*
- [ ] **Admin exam-track override** — `PATCH /admin/users/:id` accepting
  `examTrack`; return `examTrack` on `GET /auth/me`; derive JAMB-first. *(§5)*
- [ ] **Timetable by programme** — accept the `jamb-*` / `postutme-*` (+ existing
  dept-split) keys on `GET`/`PUT /timetable/:key`; store cells as arrays of up to
  three subjects. *(§6)*

## 4. Permissions screen creates roles LOCALLY only (2026-09-03)

`RolesPermissions.tsx` creates/edits roles via `staffStore.saveRole` (browser
localStorage), so roles never reach the backend — this is behind the
"can't create a new role" report. Once the backend ships
`POST/PUT/DELETE /api/admin/roles` (see `docs/backend-requests-2026-09-03.md` §1),
switch the create/edit/delete handlers to `dsaApi.admin.createRole` (a stub
already exists in `admin-api.ts`) instead of `saveRole`. Left to you as the admin
frontend owner — I didn't modify your component.
