# Timetable & Live Classes API Documentation

> **Status: LIVE on the backend.** Use these routes to replace local/mock stores.
> Interactive Swagger: [api-docs](https://api.distinguishedscholarsacademy.com/api-docs) · Local: `http://localhost:5001/api-docs`
> All protected calls need `Authorization: Bearer <JWT>`.


Base URL: `https://api.distinguishedscholarsacademy.com/api`

Interactive docs: [https://api.distinguishedscholarsacademy.com/api-docs](https://api.distinguishedscholarsacademy.com/api-docs)

Local development base URL: `http://localhost:5001/api`

All routes require a **Bearer Token** in the `Authorization` header.

## Ownership (as built)
1. **Admin** schedules the weekly timetable per track and generates the Google Meet link externally.
2. **Tutor** uploads that Meet link and flips the class to `live` / `ended`.
3. **Students** (and tutors) view the timetable **read-only** and join when status is `live`.

Tracks: `jamb` | `waec` | `postutme`

---

## Timetable

Grid shape: `string[][]` — 6 days (Mon–Sat) × 4 periods. Each cell is a subject name (or empty string).

### 1. Get Timetable
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/timetable/:track`
- **Access:** Any authenticated user
- **Example:** `GET /api/timetable/jamb`
- **Description:** Returns the grid for that track. Creates an empty grid if none exists yet.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "65e...",
      "track": "jamb",
      "grid": [
        ["Mathematics", "English", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""]
      ],
      "updatedAt": "2026-08-11T09:00:00.000Z"
    }
  }
  ```

### 2. Update Timetable
- **Route:** `PUT https://api.distinguishedscholarsacademy.com/api/timetable/:track`
- **Access:** Admin or staff only (**not** tutors)
- **Body:**
  ```json
  {
    "grid": [
      ["Mathematics", "English", "Physics", "Chemistry"],
      ["English", "Mathematics", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""]
    ]
  }
  ```
- **Errors:**
  - `400` — invalid track or missing `grid`
  - `403` — caller is not admin/staff (tutors cannot edit)

---

## Live Classes

One live-class record is kept per track. Status: `scheduled` | `live` | `ended`.

### 3. List Live Classes
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/live-classes?track=jamb`
- **Access:** Any authenticated user
- **Description:** List live-class records. Optional `track` filter.

### 4. Upload Meet Link (Tutor)
- **Route:** `PUT https://api.distinguishedscholarsacademy.com/api/live-classes/:track/link`
- **Access:** Tutor or admin
- **Description:** Tutor pastes the admin-generated Google Meet URL.
- **Body:**
  ```json
  {
    "meetLink": "https://meet.google.com/abc-defg-hij"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "65e...",
      "track": "jamb",
      "meetLink": "https://meet.google.com/abc-defg-hij",
      "status": "scheduled"
    }
  }
  ```

### 5. Update Live Status
- **Route:** `PATCH https://api.distinguishedscholarsacademy.com/api/live-classes/:track/status`
- **Access:** Tutor or admin
- **Body:**
  ```json
  {
    "status": "live"
  }
  ```
  Or when ending:
  ```json
  {
    "status": "ended",
    "recordingUrl": "https://example.com/recording.mp4"
  }
  ```
- **Notes:** Going `live` requires a `meetLink` already uploaded (`400` otherwise). Sets `startedAt` / `endedAt` accordingly.

### 6. Next Class / Join State (Student)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/live-classes/next?track=jamb`
- **Access:** Any authenticated user (used by students)
- **Description:** Drives the “Join Live Class” button.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "track": "jamb",
      "meetLink": "https://meet.google.com/abc-defg-hij",
      "status": "live",
      "canJoin": true
    }
  }
  ```
  `canJoin` is `true` only when `status === "live"` and a Meet link exists.

## Security
- Timetable **edit** is admin/staff only — tutors get `403` on `PUT /timetable/:track`.
- Tutors may upload links and change live status; they do not schedule the weekly grid.
- Invalid tracks return `400`.
