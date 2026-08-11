# Tutor API Documentation

> **Status: LIVE on the backend.** Use these routes to replace local/mock stores.
> Interactive Swagger: [api-docs](https://api.distinguishedscholarsacademy.com/api-docs) · Local: `http://localhost:5001/api-docs`
> All protected calls need `Authorization: Bearer <JWT>`.


Base URL: `https://api.distinguishedscholarsacademy.com/api/tutors`

Interactive docs: [https://api.distinguishedscholarsacademy.com/api-docs](https://api.distinguishedscholarsacademy.com/api-docs)

Local development base URL: `http://localhost:5001/api/tutors`

All routes require a **Bearer Token** for a `tutor` (admin may also call these).

## Overview
Tutors are **admin-created** (`POST /api/admin/staff` with `role: "tutor"`). They sign in on the normal login page; `/auth/me` returns `role: "tutor"`.

Tutor-scoped list endpoints live here. Day-to-day teaching actions use other docs:
- Materials & courses → `courses.md`
- Assignments & grading → `assignment.md`
- Attendance → `attendance.md`
- Live class link/status → `timetable.md`
- Announcements → see Announcements section below / `lms.md` index

---

## 1. My Courses
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/tutors/me/courses`
- **Description:** Courses where this tutor is `tutorId`.
- **Success Response:**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "65e...",
        "title": "Mathematics",
        "subject": "Mathematics",
        "category": "jamb-putme",
        "tutorId": "65e...",
        "tutorName": "Mr Hakeem Bello",
        "isPublished": true
      }
    ]
  }
  ```
- **Alias:** `GET /api/courses?tutorId=me` returns the same set.

## 2. My Students
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/tutors/me/students`
- **Description:** Active students whose category matches at least one of this tutor’s courses (`waec-sss` | `jamb-putme` | `higher`). Includes average score and progress for the roster UI.
- **Success Response:**
  ```json
  {
    "success": true,
    "count": 24,
    "data": [
      {
        "id": "65e...",
        "fullname": "Ada Lovelace",
        "email": "ada@example.com",
        "examTrack": "jamb",
        "level": "SS3",
        "learningMode": "online",
        "averageScore": 82,
        "progressPercent": 45
      }
    ]
  }
  ```

## 3. My Analytics
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/tutors/me/analytics`
- **Description:** Overview tiles — student/course/assignment counts, to-grade backlog, class average, at-risk students, per-course stats.
- **See:** `analytics.md` for the full response shape.

---

## Announcements (tutor may post)

- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/announcements`
- **Access:** Tutor / admin / staff
- **Body:**
  ```json
  {
    "scope": "track",
    "track": "jamb",
    "title": "Mock exam Friday",
    "body": "Bring your calculator."
  }
  ```
- **`scope`:** `global` | `track` | `course`
- Fans out notifications to matching students. List with `GET /api/announcements`.

## Security
- Every tutor endpoint scopes data to the JWT user (unless caller is admin).
- Tutors cannot edit the timetable grid (admin only) — they only upload Meet links and set live/ended.
