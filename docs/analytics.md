# Analytics API Documentation

> **Status: LIVE on the backend.** Use these routes to replace local/mock stores.
> Interactive Swagger: [api-docs](https://api.distinguishedscholarsacademy.com/api-docs) · Local: `http://localhost:5001/api-docs`
> All protected calls need `Authorization: Bearer <JWT>`.


Base URL: `https://api.distinguishedscholarsacademy.com/api`

Interactive docs: [https://api.distinguishedscholarsacademy.com/api-docs](https://api.distinguishedscholarsacademy.com/api-docs)

Local development base URL: `http://localhost:5001/api`

All routes require a **Bearer Token** in the `Authorization` header.

## Overview
Analytics endpoints are **computed** from grades, enrollments, submissions, and attendance. They power the student performance view and the tutor overview / “students needing attention” tiles.

| Audience | Route |
|----------|-------|
| Student | `GET /analytics/me` |
| Tutor (all my courses) | `GET /tutors/me/analytics` |
| Tutor (one course) | `GET /courses/:id/analytics` |
| Tutor (roster + scores) | `GET /tutors/me/students` |

At-risk students are those with an average score **below 70**.

---

## 1. Student Analytics (Me)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/analytics/me`
- **Access:** Student
- **Description:** Personal averages across grades, course progress, and attendance rate.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "averageScore": 82,
      "progressPercent": 45,
      "attendanceRate": 80,
      "present": 8,
      "totalSessions": 10,
      "perSubject": [
        {
          "courseId": "65e...",
          "title": "Mathematics",
          "subject": "Mathematics",
          "average": 85
        }
      ]
    }
  }
  ```
- **Notes:** `averageScore` / subject averages may be `null` when the student has no grades yet.

## 2. Tutor Analytics (Overview)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/tutors/me/analytics`
- **Access:** Tutor (or admin)
- **Description:** Dashboard overview for the logged-in tutor — student/course counts, grading backlog, class average, at-risk list, and per-course breakdown.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "studentsCount": 24,
      "coursesCount": 3,
      "assignmentsCount": 10,
      "submissionsCount": 40,
      "gradedCount": 32,
      "toGradeCount": 8,
      "classAverage": 74,
      "atRiskStudents": [
        { "id": "65e...", "fullname": "Ada Lovelace", "averageScore": 62 }
      ],
      "perCourse": [
        {
          "courseId": "65e...",
          "title": "Mathematics",
          "assignments": 4,
          "submissions": 18,
          "graded": 15,
          "average": 76
        }
      ]
    }
  }
  ```

## 3. Course Analytics
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/courses/:id/analytics`
- **Access:** Owner tutor / admin
- **Description:** Analytics scoped to one course (class average, submission rate, at-risk students in that course’s category).
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "courseId": "65e...",
      "title": "Mathematics",
      "studentsCount": 24,
      "assignmentsCount": 4,
      "submissionsCount": 18,
      "gradedCount": 15,
      "submissionRate": 75,
      "classAverage": 76,
      "atRiskStudents": [
        { "id": "65e...", "fullname": "Ada Lovelace", "averageScore": 62 }
      ]
    }
  }
  ```

## 4. Tutor Students Roster (with metrics)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/tutors/me/students`
- **Access:** Tutor (or admin)
- **Description:** Students whose category matches a course assigned to this tutor. Includes optional performance fields used by the “My Students” table and “needing attention” list.
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
        "avg": 82,
        "progressPercent": 45,
        "progress": 45
      }
    ]
  }
  ```
- **Notes:** If the tutor has no courses assigned yet, the API returns all active students (same behaviour the frontend used on local data).

## How scores are calculated
- Grade percent = `(score / maxScore) * 100`.
- Class / student averages are the mean of those percents.
- Progress comes from enrollment `progressPercent` (updated when students complete materials).
- Attendance rate = present check-ins ÷ total attendance sessions.

## Security
- Students only see `/analytics/me`.
- Tutors only receive analytics for their own courses (admin may access tutor routes).
- Course analytics returns `403` if the tutor does not own the course.
