# Backend request — Community channel

The frontend now has a **Community** feature fully built and wired. It's one
shared channel that tutors and students post into, and that admins moderate.
Everything on the client is ready; it just needs these three endpoints to go
live. The client already talks to them (see `dsaApi.community` in
`src/lib/api.ts`) — the moment they exist, the feature works with no frontend
change.

## What it is

- **One global channel** (not per-course, not DMs). Every tutor and student
  sees the same feed.
- **Attachments are already hosted** — the browser uploads images / video /
  audio / pdf / doc straight to Cloudinary and sends you only the resulting
  URL. You never receive file bytes; just store the metadata.

## Roles

| Role | Can read | Can post | Allowed message types |
|------|----------|----------|-----------------------|
| Tutor | ✅ | ✅ | text, image, video, **audio**, file (pdf/doc) |
| Student | ✅ | ✅ | text, image, video, file (pdf/doc) — **no audio** |
| Admin | ✅ (all) | ✅ | everything a tutor can — text, image, video, **audio**, file — **and** delete any message |

- Guardians and other roles should get **403** on all community routes.
- Students posting `type: "audio"` should be rejected (**403 / 422**) — the UI
  hides the button, but please enforce it server-side too.
- **Admin can post like a tutor** (all types, including audio) **and** can
  delete any message. A tutor/student may delete only **their own**.

## Endpoints

### 1. `GET /api/community/messages`

Returns the channel, oldest → newest.

Query params (both optional):
- `limit` — max messages to return (default 100).
- `before` — a message id or ISO timestamp; return messages older than this
  (for loading history / infinite scroll).

Response — the usual `{ success, data }` envelope, `data` an array:

```json
{
  "success": true,
  "data": [
    {
      "id": "665f...",
      "sender": { "id": "661a...", "fullname": "Aisha Bello", "role": "tutor" },
      "type": "text",
      "text": "Welcome everyone 👋",
      "createdAt": "2026-08-24T09:12:00.000Z"
    },
    {
      "id": "665f...",
      "sender": { "id": "662b...", "fullname": "Tunde O.", "role": "student" },
      "type": "image",
      "fileUrl": "https://res.cloudinary.com/dxpbjxzfv/image/upload/v.../x.jpg",
      "fileName": "diagram.jpg",
      "fileType": "image/jpeg",
      "fileSize": 284122,
      "createdAt": "2026-08-24T09:20:00.000Z"
    }
  ]
}
```

The client is tolerant about field names (it reads `id|_id`,
`sender|user`, `fullname|fullName|name|username`, `createdAt|timestamp`), so
populate `sender` however is convenient — just include the sender's **id**,
**name** and **role** so bubbles show the author and “You” alignment works.

### 2. `POST /api/community/messages`

Body (the client sends exactly this shape):

```json
{
  "type": "text | image | video | audio | file",
  "text": "…",              // for type text
  "fileUrl": "https://…",    // for image/video/audio/file (already on Cloudinary)
  "fileName": "notes.pdf",
  "fileType": "application/pdf",
  "fileSize": 128374,
  "durationSec": 12          // audio only (voice-note length)
}
```

- **Stamp the sender from the JWT** — never trust a sender id from the body.
- Enforce the role rules above.
- Return the created message (same shape as the list rows) in `data`.

### 3. `DELETE /api/community/messages/:id`

- Admin → may delete any message.
- Member → may delete only a message they authored.
- Otherwise **403**.
- Return `{ success: true }`.

### 4. `PATCH /api/community/messages/:id`  *(new)*

Edit a message's text, or pin/unpin it. Body carries one or both:

```json
{ "text": "corrected text", "pinned": true }
```

- **`text`** — only the **author** may edit their own message's text (**403**
  otherwise). Optionally stamp `editedAt`.
- **`pinned`** — only **tutor / admin** may pin or unpin (**403** otherwise).
  Store a boolean `pinned` on the message.
- Return the updated message (same shape as a list row).

### 5. Community lock — `GET` / `PATCH /api/community/settings`  *(new)*

A single channel-wide setting so a tutor can run a lesson without students
posting over it.

- **`GET /api/community/settings`** → `{ "success": true, "data": { "locked": false } }`.
  Any member may read it.
- **`PATCH /api/community/settings`** with `{ "locked": true }` → only
  **tutor / admin** (**403** otherwise).
- **Enforcement:** while `locked` is true, reject `POST /community/messages`
  from **students** (**403**); tutors and admins can still post. The client also
  hides the composer for students, but please enforce server-side too.

#### Permissions summary

| Action | Who |
|--------|-----|
| Post | tutor, student, admin (student blocked while locked) |
| Edit text | the message's author only |
| Delete | author (own) + admin (any) |
| Pin / unpin | tutor, admin |
| Lock / unlock | tutor, admin |

## Notes

- No realtime needed for v1 — the client polls `GET` every 5 seconds and on tab
  focus. If you later add websockets we can switch, but polling is fine to ship.
- A simple `CommunityMessage` collection with
  `{ sender, type, text, fileUrl, fileName, fileType, fileSize, durationSec, createdAt }`
  and an index on `createdAt` covers it.
- Please cap `text` length (e.g. 4000 chars) and validate `type` server-side.
