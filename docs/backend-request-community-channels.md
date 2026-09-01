# Backend request — community channels (General + per programme)

*Written 2026-09-01.*

The community is no longer a single room. There is now a **General** channel
plus one channel **per programme**, and department-split programmes get one per
department — the same keys as timetables/quizzes:

| Programme | Channels |
|-----------|----------|
| JAMB | `jamb-science`, `jamb-art`, `jamb-commercial` |
| Post-UTME | `postutme-science`, `postutme-art`, `postutme-commercial` |
| WAEC | `waec-science`, `waec-art`, `waec-commercial` |
| After-School | `afterschool-science`, `afterschool-art`, `afterschool-commercial` |
| Undergrad | `undergrad` |
| Preclinical | `preclinical` |
| (General) | `general` — everyone |

Admins can **create** and **delete** channels; admins/tutors can **remove a
member** from a channel.

## Endpoints the frontend now calls

Messages/settings gained an optional `channelId` (omitted / `general` = the main
channel):

- `GET /community/messages?channelId=&limit=&before=`
- `POST /community/messages` body may include `channelId`
- `GET /community/settings?channelId=` → `{ locked }`
- `PATCH /community/settings` body `{ locked, channelId? }`

New channel + membership endpoints:

- `GET /community/channels` → channels the caller can see. **Students** should
  get `general` + the channel(s) matching their programme (+ department);
  **tutors/admin** get all. Each channel: `{ id, name, track?, department?, kind }`.
- `POST /community/channels` (admin) → `{ name, track?, department? }`.
- `DELETE /community/channels/:id` (admin) → delete a channel **and its messages**
  (never allow deleting `general`).
- `GET /community/channels/:id/members` (tutor / admin) → `[{ id, fullname, role }]`.
- `DELETE /community/channels/:id/members/:userId` (tutor / admin) → remove
  someone from a channel (they stop seeing / posting to it).

## Access rules to enforce server-side

- A student may only read/post in `general` and their own programme channel(s).
- `channelId` on `GET`/`POST /community/messages` scopes messages to that channel.
- Lock state is **per channel**.
- Only admins create/delete channels; admins **and** tutors remove members.

## Frontend behaviour until this ships

`src/lib/communityChannels.ts` seeds the default channel list in the browser, so
the switcher, admin create/delete, and the members panel all work locally today.
When `GET /community/channels` returns rows, that becomes the source of truth.
Message scoping needs the backend to honour `channelId`; until then every channel
shows the main channel's messages (no crash — just unscoped). The members panel
falls back to deriving participants from who has posted when
`GET …/members` isn't live, and removing a member needs the DELETE endpoint.
