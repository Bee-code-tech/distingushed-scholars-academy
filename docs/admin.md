# Admin API Documentation

> **Status: LIVE on the backend.** Use these routes to replace local/mock stores.
> Interactive Swagger: [api-docs](https://api.distinguishedscholarsacademy.com/api-docs) · Local: `http://localhost:5001/api-docs`
> All protected calls need `Authorization: Bearer <JWT>`.


Base URL: `https://api.distinguishedscholarsacademy.com/api/admin`

Interactive docs: [https://api.distinguishedscholarsacademy.com/api-docs](https://api.distinguishedscholarsacademy.com/api-docs)

Local development base URL: `http://localhost:5001/api/admin`

All routes require a **Bearer Token** for an `admin` user.

## Overview
Admin endpoints power the admin dashboard: listing people by role, creating tutors/parents/staff, managing staff permissions, and confirming offline payments.

Related: program countdown upsert is admin-only on `POST /api/programs` (see `program.md`).

## Seed an admin
```bash
npm run seed:admin
```
Default credentials (override with env `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`):
- email: `admin@dsa.com`
- password: `Admin123!`

Also seeds staff roles `secretary` and `auditor`.

## Roles the admin manages
| Role query | Who |
|------------|-----|
| `student` | Registered students |
| `tutor` | Tutors created by admin |
| `parent` | Parents + legacy `guardian` accounts |
| `staff` | Staff + legacy `moderator` accounts |
| `admin` | Admin users |

---

## 1. List Users by Role
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/admin/users?role=student`
- **Description:** List active users filtered by role for the Students / Tutors / Guardians / Staff screens.
- **Query params:**
  - `role` (required) — `student` | `tutor` | `parent` | `staff` | `admin`
  - `search` — matches fullname, email, username, studentId
  - `page` — default `1`
  - `limit` — default `20` (max 100)
- **Success Response:**
  ```json
  {
    "success": true,
    "count": 12,
    "page": 1,
    "limit": 20,
    "data": [
      {
        "id": "65e...",
        "studentId": "DSA/2026-8903DS",
        "fullname": "Ada Lovelace",
        "fullName": "Ada Lovelace",
        "email": "ada@example.com",
        "examTrack": "jamb",
        "level": "SS3",
        "learningMode": "online",
        "role": "student"
      }
    ]
  }
  ```
- **Fields by role:**
  - **student** — `examTrack` / `level`, `learningMode` / `isDsaStudent`
  - **tutor** — `subject` / `subjects`
  - **parent** — `wardName`, `wardId` / `linkedStudentId`
  - **staff** — `staffRole`, `permissions`

## 2. Create Tutor / Parent / Staff / Admin
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/admin/staff`
- **Description:** Create an active account without the student payment/OTP flow. Share the email + temporary password with the person so they can sign in.
- **Body (tutor):**
  ```json
  {
    "fullname": "Mr Hakeem Bello",
    "email": "hakeem@dsa.com",
    "password": "TempPass123",
    "role": "tutor",
    "username": "hakeem",
    "phoneNumber": "08012345678",
    "subjects": ["Mathematics"],
    "bio": "10 years teaching Maths",
    "credentials": ["B.Sc Mathematics"]
  }
  ```
- **Body (parent):**
  ```json
  {
    "fullname": "Mrs Adeyemi",
    "email": "adeyemi@example.com",
    "password": "TempPass123",
    "role": "parent",
    "username": "adeyemi",
    "phoneNumber": "08098765432",
    "wardId": "DSA/2026-8903DS"
  }
  ```
- **Body (staff):**
  ```json
  {
    "fullname": "Office Secretary",
    "email": "secretary@dsa.com",
    "password": "TempPass123",
    "role": "staff",
    "staffRole": "secretary",
    "permissions": ["payments.verify", "timetable.edit", "announcements.send"]
  }
  ```
- **Notes:**
  - `wardId` must belong to an **active** student (`studentId` or Mongo ObjectId).
  - Parent accounts require `username` and `phoneNumber`.
  - Prefer this endpoint over posting `role: tutor|parent` to `/auth/register` (that path still works if the request carries an admin Bearer token).
- **Success Response:** `201` with `{ success, message, data: <sanitized user> }`.

## 3. List Staff Roles
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/admin/roles`
- **Description:** List role → permissions definitions used by the Permissions screen.
- **Success Response:**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "65e...",
        "name": "secretary",
        "permissions": ["payments.verify", "timetable.edit", "announcements.send"]
      }
    ]
  }
  ```

## 4. Create / Update Staff Role
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/admin/roles`
- **Description:** Upsert a staff role and its permissions. Pass `id` to update an existing role.
- **Body:**
  ```json
  {
    "name": "auditor",
    "permissions": ["payments.view", "reports.view", "students.view", "timetable.view"]
  }
  ```
- **Permission keys used by the frontend:**
  `payments.verify`, `payments.view`, `timetable.edit`, `timetable.view`, `attendance.manage`, `students.manage`, `students.view`, `announcements.send`, `reports.view`, `staff.manage`

## 5. Manual / Offline Payment
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/admin/payments/manual`
- **Description:** Mark a student as paid when they paid by cash or bank transfer instead of Paystack.
- **Body:**
  ```json
  {
    "studentId": "DSA/2026-8903DS",
    "amount": 200000,
    "method": "cash",
    "reference": "BANK-TRANSFER-001"
  }
  ```
- **Success Response:** Student profile with `status: "active"` and `isPaid: true`.

## Security
- Only `role: admin` may call these routes (403 otherwise).
- Ward links for parents are verified server-side — a parent cannot attach an arbitrary student just by naming them.
