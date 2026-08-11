# Assignments & Grades API Documentation

> **Status: LIVE on the backend.** Use these routes to replace local/mock stores.
> Interactive Swagger: [api-docs](https://api.distinguishedscholarsacademy.com/api-docs) · Local: `http://localhost:5001/api-docs`
> All protected calls need `Authorization: Bearer <JWT>`.


Base URL: `https://api.distinguishedscholarsacademy.com/api`

Interactive docs: [https://api.distinguishedscholarsacademy.com/api-docs](https://api.distinguishedscholarsacademy.com/api-docs)

Local development base URL: `http://localhost:5001/api`

All routes require a **Bearer Token** in the `Authorization` header.

## Overview
Tutors create assignments on **their** courses. Students submit file/text answers. Tutors grade submissions, which also writes a gradebook entry used by analytics.

Nested under courses:
- `/api/courses/:id/assignments`
- `/api/courses/:id/grades`

Standalone:
- `/api/assignments/:id`
- `/api/submissions/:id/grade`
- `/api/submissions/me`
- `/api/grades/me`
- `/api/grades/:id`

---

## Assignments

### 1. Create Assignment
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/courses/:id/assignments`
- **Access:** Owner tutor / admin
- **Body:**
  ```json
  {
    "title": "Homework 1",
    "instructions": "Solve questions 1-10 in the workbook",
    "attachmentUrl": "https://example.com/brief.pdf",
    "maxScore": 20,
    "dueDate": "2026-12-31T23:59:59.000Z",
    "isPublished": true,
    "allowLate": true
  }
  ```
- **Success Response:** `201` with the created assignment (`id`, `courseId`, `tutorId`, `dueDate`, …).

### 2. List Assignments for a Course
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/courses/:id/assignments`
- **Access:** Enrolled student / owner tutor / admin
- **Notes:** Students only see `isPublished: true` assignments.

### 3. Update Assignment
- **Route:** `PUT https://api.distinguishedscholarsacademy.com/api/assignments/:id`
- **Access:** Owner tutor / admin
- **Body:** Any subset of create fields.

### 4. Delete Assignment
- **Route:** `DELETE https://api.distinguishedscholarsacademy.com/api/assignments/:id`
- **Access:** Owner tutor / admin
- **Notes:** Also deletes that assignment’s submissions.

---

## Submissions

### 5. Submit Assignment
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/assignments/:id/submit`
- **Access:** Student
- **Body:**
  ```json
  {
    "text": "My written answers…",
    "fileUrl": "https://example.com/hw1.pdf"
  }
  ```
- **Notes:**
  - At least one of `text` or `fileUrl` is required.
  - After the due date: status becomes `late` if `allowLate` is true; otherwise `400`.
  - One submission per student per assignment (`409` on duplicate).
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "65e...",
      "assignmentId": "65e...",
      "studentId": "65e...",
      "status": "submitted",
      "submittedAt": "2026-08-11T10:00:00.000Z"
    }
  }
  ```

### 6. List Submissions (Tutor)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/assignments/:id/submissions`
- **Access:** Owner tutor / admin
- **Description:** All submissions for grading, with student name/email populated.

### 7. My Submissions (Student)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/submissions/me?assignmentId=65e...`
- **Access:** Student
- **Description:** The student’s submissions (optionally filtered by assignment). Includes score/feedback once graded.

### 8. Grade a Submission
- **Route:** `PUT https://api.distinguishedscholarsacademy.com/api/submissions/:id/grade`
- **Access:** Owner tutor / admin
- **Body:**
  ```json
  {
    "score": 18,
    "feedback": "Great work — review Q7"
  }
  ```
- **Notes:**
  - `score` must be between `0` and the assignment’s `maxScore`.
  - Sets submission `status: "graded"` and upserts a `Grade` row (`sourceType: "assignment"`).
- **Success Response:** Graded submission with `score`, `feedback`, `gradedAt`.

---

## Grades / Gradebook

### 9. Course Gradebook
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/courses/:id/grades`
- **Access:** Owner tutor / admin
- **Description:** All grade entries for the course (assignments + manual), with student info.

### 10. Record Manual Grades
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/courses/:id/grades`
- **Access:** Owner tutor / admin
- **Body (single or array):**
  ```json
  {
    "studentId": "65eSTUDENT",
    "title": "Class participation",
    "score": 5,
    "maxScore": 5,
    "feedback": "Excellent"
  }
  ```
  Or `{ "grades": [ { ... }, { ... } ] }`.

### 11. My Grades (Student)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/grades/me`
- **Access:** Student
- **Description:** All of the student’s grades across courses, each with `percent`.

### 12. Update a Grade
- **Route:** `PUT https://api.distinguishedscholarsacademy.com/api/grades/:id`
- **Access:** Owner tutor / admin
- **Body:** `{ "score": 4, "feedback": "Adjusted", "title": "…" }`

## Security
- Tutors may only manage assignments/grades on courses where they are the assigned `tutorId`.
- Students may only submit and read their own submissions/grades.
- Score bounds and late rules are enforced server-side.
