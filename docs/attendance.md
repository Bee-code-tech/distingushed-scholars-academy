# Attendance API Documentation

> **Status: LIVE on the backend.** Use these routes to replace local/mock stores.
> Interactive Swagger: [api-docs](https://api.distinguishedscholarsacademy.com/api-docs) · Local: `http://localhost:5001/api-docs`
> All protected calls need `Authorization: Bearer <JWT>`.


Base URL: `https://api.distinguishedscholarsacademy.com/api/attendance`

Interactive docs: [https://api.distinguishedscholarsacademy.com/api-docs](https://api.distinguishedscholarsacademy.com/api-docs)

Local development base URL: `http://localhost:5001/api/attendance`

All routes require a **Bearer Token** in the `Authorization` header.

## Flow (self check-in)
Attendance is **not** marked by the tutor for each student. Instead:

1. A **tutor or admin activates** attendance for the day.
2. Each **student marks themselves present** from their dashboard.
3. The **server records the timestamp** (never trust a client-sent time).
4. Tutor/admin **monitor** who checked in; students view **their own** record.

Dates use `YYYY-MM-DD` (UTC date key from the server).

---

## 1. Activate Attendance Session
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/attendance/sessions`
- **Access:** Tutor or admin
- **Description:** Open today’s attendance window. If already open, returns the existing session. Notifies active students (`attendance_open`).
- **Body (optional):**
  ```json
  {
    "date": "2026-08-11",
    "courseId": "65e..."
  }
  ```
  If `date` is omitted, today is used.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "active": true,
      "date": "2026-08-11",
      "activatedAt": "2026-08-11T08:00:00.000Z",
      "id": "65e..."
    }
  }
  ```

## 2. Close Attendance Session
- **Route:** `DELETE https://api.distinguishedscholarsacademy.com/api/attendance/sessions/:date`
- **Access:** Tutor or admin
- **Description:** Close the attendance window for that date so further check-ins are rejected.
- **Example:** `DELETE /api/attendance/sessions/2026-08-11`
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "active": false,
      "date": "2026-08-11",
      "closedAt": "2026-08-11T16:00:00.000Z"
    }
  }
  ```

## 3. Get Current Session
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/attendance/sessions/current`
- **Access:** Any authenticated user
- **Description:** Check whether attendance is open right now (drives the student “Mark present” button).
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "active": true,
      "date": "2026-08-11",
      "activatedAt": "2026-08-11T08:00:00.000Z"
    }
  }
  ```
  If no session exists for today: `{ "active": false, "date": "2026-08-11" }`.

## 4. Student Check-In
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/attendance/check-in`
- **Access:** Student only
- **Description:** Mark the logged-in student present. `studentId` is taken from the JWT — **do not send it in the body**.
- **Body:** `{}` (empty)
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "status": "present",
      "at": "2026-08-11T08:05:12.000Z",
      "date": "2026-08-11"
    }
  }
  ```
- **Errors:**
  - `403` — attendance is not open
  - `409` — already checked in today

## 5. List Check-Ins (Monitor)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/attendance/check-ins?date=2026-08-11`
- **Access:** Tutor or admin
- **Description:** Who checked in for a given date (defaults to today). Powers the monitor list and present/expected counts.
- **Success Response:**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "65e...",
        "studentId": "65e...",
        "fullname": "Ada Lovelace",
        "email": "ada@example.com",
        "studentCode": "DSA/2026-8903DS",
        "status": "present",
        "at": "2026-08-11T08:05:12.000Z",
        "date": "2026-08-11"
      }
    ]
  }
  ```

## 6. My Attendance (Student)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/attendance/me`
- **Access:** Student only
- **Description:** The student’s own attendance history and rate.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "present": 8,
      "total": 10,
      "rate": 80,
      "records": [
        { "date": "2026-08-11", "status": "present", "at": "2026-08-11T08:05:12.000Z" }
      ]
    }
  }
  ```

## 7. Attendance Report (CSV)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/attendance/report?from=2026-08-01&to=2026-08-31`
- **Access:** Tutor or admin
- **Description:** Downloadable CSV of check-ins. Optional `from` / `to` date filters. Optional `courseId` is accepted for future scoping.
- **Response:** `Content-Type: text/csv` with columns `date,studentId,fullname,email,status,at`.

## Security
- Only tutor/admin can activate, close, list check-ins, or download reports.
- A student may only check **themselves** in and read **their own** record.
- Check-in is only allowed while the session is active; timestamps are set server-side; duplicate check-ins return 409.
