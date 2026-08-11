# Courses API Documentation

> **Status: LIVE on the backend.** Use these routes to replace local/mock stores.
> Interactive Swagger: [api-docs](https://api.distinguishedscholarsacademy.com/api-docs) · Local: `http://localhost:5001/api-docs`
> All protected calls need `Authorization: Bearer <JWT>`.


Base URL: `https://api.distinguishedscholarsacademy.com/api/courses`

Interactive docs: [https://api.distinguishedscholarsacademy.com/api-docs](https://api.distinguishedscholarsacademy.com/api-docs)

Local development base URL: `http://localhost:5001/api/courses`

All routes require a **Bearer Token** in the `Authorization` header.

## Overview
Courses are teachable units created by an **admin**, grouped into a **category**, and optionally assigned to a **tutor**.

| Category | Meaning |
|----------|---------|
| `waec-sss` | WAEC + SS1–SS3 |
| `jamb-putme` | JAMB **and** Post-UTME (same courses) |
| `higher` | 100 / 200 level |

A student’s category is derived from their `programmes` + `currentLevel` (programme/track wins over SS level). Students see courses for their category; tutors see students in categories of courses assigned to them.

Related materials live under `/api/courses/:id/materials` and `/api/materials/:id`. Enrollments: `/api/enrollments/me`.

---

## 1. Create Course
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/courses`
- **Access:** Admin
- **Body:**
  ```json
  {
    "title": "Mathematics",
    "subject": "Mathematics",
    "category": "jamb-putme",
    "tutorId": "65eTUTOR_ID",
    "description": "JAMB Maths covering algebra and geometry",
    "department": "science",
    "thumbnailUrl": "https://example.com/math.jpg",
    "isPublished": true
  }
  ```
- **Notes:** `tutorId` must be an active user with `role: tutor`. `department` is mainly for WAEC (`science` | `art` | `commercial`).
- **Success Response:** `201` with the created course (`id`, `title`, `tutorName`, etc.).

## 2. List Courses
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/courses`
- **Access:** Any authenticated user
- **Query:** `?category=jamb-putme` · `?tutorId=me` (tutor’s own courses) · `?tutorId=<id>`
- **Success Response:**
  ```json
  {
    "success": true,
    "count": 1,
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

## 3. My Courses (Student)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/courses/mine`
- **Access:** Student
- **Description:** Published courses for the student’s category, each with the assigned tutor and `progressPercent`.
- **Success Response:** `{ success, count, data: [{ ..., progressPercent, tutor }] }`

## 4. Get Course by ID
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/courses/:id`
- **Access:** Any authenticated user
- **Description:** Single course detail.

## 5. Update Course / Assign Tutor
- **Route:** `PUT https://api.distinguishedscholarsacademy.com/api/courses/:id`
- **Access:** Admin
- **Body (partial):**
  ```json
  {
    "tutorId": "65eNEW_TUTOR",
    "description": "Updated description",
    "isPublished": true
  }
  ```

## 6. Delete Course
- **Route:** `DELETE https://api.distinguishedscholarsacademy.com/api/courses/:id`
- **Access:** Admin

## 7. Enroll in a Course
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/courses/:id/enroll`
- **Access:** Student
- **Description:** Explicit enrollment. Returns `409` if already enrolled.
- **Success Response:** `201` with the enrollment document.

## 8. My Enrollments
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/enrollments/me`
- **Access:** Student
- **Description:** All enrollments with nested course + tutor and `progressPercent`.

---

## Course Materials

Materials are uploaded by the **owner tutor** (or admin). Store a hosted URL (see uploads stub in `lms.md` index / `POST /api/uploads/sign`).

### 9. List Materials
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/courses/:id/materials`
- **Access:** Student / owner tutor / admin

### 10. Add Material
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/courses/:id/materials`
- **Access:** Owner tutor / admin
- **Body:**
  ```json
  {
    "title": "Algebra Syllabus",
    "type": "syllabus",
    "url": "https://example.com/algebra.pdf",
    "description": "Week 1",
    "orderIndex": 0,
    "isDownloadable": true
  }
  ```
- **`type`:** `pdf` | `video` | `recording` | `syllabus` | `slide` | `link`

### 11. Update Material
- **Route:** `PUT https://api.distinguishedscholarsacademy.com/api/materials/:id`
- **Access:** Owner tutor / admin

### 12. Delete Material
- **Route:** `DELETE https://api.distinguishedscholarsacademy.com/api/materials/:id`
- **Access:** Owner tutor / admin

### 13. Mark Material Complete
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/materials/:id/complete`
- **Access:** Student
- **Description:** Marks the material done and recalculates enrollment `progressPercent`.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": { "progressPercent": 50, "completed": 1, "total": 2 }
  }
  ```

## Security
- Only admin creates/updates/deletes courses and assigns tutors.
- Tutors may only add/edit/delete materials on courses where they are `tutorId`.
- Students only complete materials for themselves; progress is computed server-side.
