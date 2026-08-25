# DSA — Docs Archive

Older backend/API notes and requests, merged into one file to cut clutter. Each section keeps the original filename and the date & day it was written. Still-active specs kept as their own files: `Scholars-Drill-PRD.md`, `backend-request-community.md`, `backend-request-course-tutors.md`, `quiz-feature.md`.

## Contents

- [auth.md](#auth) — 2026-07-11 (Saturday)
- [program.md](#program) — 2026-07-11 (Saturday)
- [quiz.md](#quiz) — 2026-07-11 (Saturday)
- [backend-requests.md](#backend-requests) — 2026-07-28 (Tuesday)
- [DSA-LMS-Backend-Spec.md](#dsa-lms-backend-spec) — 2026-08-05 (Wednesday)
- [DSA-Portal-Client-Overview.md](#dsa-portal-client-overview) — 2026-08-05 (Wednesday)
- [DSA-Tutor-Attendance-Students-API.md](#dsa-tutor-attendance-students-api) — 2026-08-07 (Friday)
- [admin.md](#admin) — 2026-08-11 (Tuesday)
- [analytics.md](#analytics) — 2026-08-11 (Tuesday)
- [assignment.md](#assignment) — 2026-08-11 (Tuesday)
- [attendance.md](#attendance) — 2026-08-11 (Tuesday)
- [courses.md](#courses) — 2026-08-11 (Tuesday)
- [timetable.md](#timetable) — 2026-08-11 (Tuesday)
- [tutor.md](#tutor) — 2026-08-11 (Tuesday)
- [backend-request-attendance-per-tutor.md](#backend-request-attendance-per-tutor) — 2026-08-22 (Saturday)
- [backend-request-attendance-scoping.md](#backend-request-attendance-scoping) — 2026-08-22 (Saturday)
- [backend-needs.md](#backend-needs) — 2026-08-23 (Sunday)
- [backend-request-attendance-date-conflict.md](#backend-request-attendance-date-conflict) — 2026-08-23 (Sunday)


---

<a id="auth"></a>
## auth.md
*Written 2026-07-11 (Saturday).*

# Authentication API Routes

> **Status: LIVE on the backend.** Use these routes to replace local/mock stores.
> Interactive Swagger: [api-docs](https://api.distinguishedscholarsacademy.com/api-docs) · Local: `http://localhost:5001/api-docs`
> All protected calls need `Authorization: Bearer <JWT>`.


Base URL: `https://api.distinguishedscholarsacademy.com/api/auth`

Interactive docs: [https://api.distinguishedscholarsacademy.com/api-docs](https://api.distinguishedscholarsacademy.com/api-docs)

Local development base URL: `http://localhost:5001/api/auth`

## Registration Flow
There are two registration paths. Both create a real `User` record immediately and use `status` to track progress (`pending_payment`, `pending_otp`, `active`, `payment_failed`).

### Student registration
1. `POST /register` creates/updates a student user with `status: pending_payment`, generates a student ID like `DSA/2026-8903DS`, and initializes Paystack using the frontend `price`.
2. Paystack calls `POST /paystack/webhook` after payment. On success the user moves to `status: pending_otp` and a 4-digit OTP is emailed.
3. `POST /verify-otp` sets `status: active` and returns JWT + user.

### Guardian registration
1. `POST /register-guardian` creates/updates a guardian user with `status: pending_otp` linked to an existing active student. No payment.
2. OTP is emailed immediately.
3. `POST /verify-otp` sets `status: active` and returns JWT + user.

## Validation Rules
- **Email:** Must be unique.
- **Learning Mode:** Must be either `online` or `physical`.
- **Programmes:** Must be an array with at least one value.
- **Guardian Info:** `fullname` and `phoneNumber` are required. `email` is optional.
- **Price:** Required for student registration. Sent by the frontend in kobo (e.g. `500000` for NGN 5,000). The backend uses this exact value to initialize Paystack and later verify the webhook.
- **Password:** Minimum 6 characters.
- **Profile Picture:** If not supplied, a default Dicebear avatar is generated.
- **Student ID:** Generated automatically for students as `DSA/2026-` plus 6 random letters/digits (e.g. `DSA/2026-8903DS`).
- **Roles:** `student`, `guardian`, `admin`, `moderator`. Registration supports `student` and `guardian`.
- **Status:** `pending_payment` → `pending_otp` → `active` (or `payment_failed` for failed student payments).
## 1. Initialize Registration
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/auth/register`
- **Description:** Save a pending registration and initialize Paystack payment.
- **Body:**
  ```json
  {
    "fullname": "Ada Lovelace",
    "email": "ada@example.com",
    "whatsappNumber": "08012345678",
    "password": "password123",
    "profilePic": "https://example.com/avatar.jpg",
    "gender": "female",
    "dateOfBirth": "2005-07-01T00:00:00.000Z",
    "stateOfResidence": "Lagos",
    "institution": "University of Lagos",
    "currentLevel": "100L",
    "learningMode": "online",
    "programmes": ["JAMB", "WAEC"],
    "guardianInfo": {
      "fullname": "Grace Lovelace",
      "email": "grace@example.com",
      "phoneNumber": "08098765432"
    },
    "price": 500000
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Registration initialized successfully",
    "data": {
      "email": "ada@example.com",
      "studentId": "DSA/2026-8903DS",
      "reference": "dsa_reg_xxxxxxxxxxxxxxxx",
      "price": 500000,
      "currency": "NGN",
      "authorizationUrl": "https://checkout.paystack.com/...",
      "accessCode": "..."
    }
  }
  ```

## 2. Register Guardian
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/auth/register-guardian`
- **Description:** Start guardian registration (no payment). Sends OTP to email.
- **Body:**
  ```json
  {
    "fullname": "Grace Lovelace",
    "username": "grace_parent",
    "email": "grace@example.com",
    "phoneNumber": "08098765432",
    "password": "password123",
    "studentId": "DSA/2026-8903DS",
    "role": "guardian"
  }
  ```
- **Notes:**
  - `role` is optional. If omitted, it defaults to `guardian`.
  - `studentId` must belong to an existing verified student.
  - Complete signup with the same `POST /verify-otp` endpoint used by students.
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent to email. Please verify to complete guardian registration.",
    "data": {
      "email": "grace@example.com",
      "linkedStudentId": "DSA/2026-8903DS"
    }
  }
  ```

## 3. Paystack Webhook
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/auth/paystack/webhook`
- **Description:** Paystack notifies the backend after payment. On a valid successful charge, the backend sends a 4-digit OTP to the user's email.
- **Notes:**
  - This endpoint is called by Paystack, not by the frontend.
  - The backend verifies `x-paystack-signature` with HMAC-SHA512 and a timing-safe comparison.
  - On `charge.success`, the backend also calls Paystack `transaction/verify` and only trusts that verified response.
  - Paid amount is checked against the `price` stored on the pending registration (the price the frontend sent).
  - Currency and customer email are also checked.
  - Processing is idempotent: duplicate webhooks do not create another OTP once payment is marked paid and OTP has been sent.
  - If OTP email delivery fails after payment verification, a later webhook retry can resend the same OTP.
  - Failed charges mark the pending registration as failed without overwriting an already-paid registration.

## 4. Verify OTP
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/auth/verify-otp`
- **Description:** Verify the 4-digit OTP and complete student or guardian creation.
- **Body:**
  ```json
  {
    "email": "ada@example.com",
    "otp": "1234"
  }
  ```
- **Success Response:** Returns JWT + created user object (student or guardian).

## 5. Get Student By ID
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/auth/student?studentId=DSA/2026-8903DS`
- **Auth:** Bearer token required
- **Description:** Fetch a verified student's profile. Guardians can only view the student they are linked to. Admins can view any student.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "USER_ID",
      "studentId": "DSA/2026-8903DS",
      "fullname": "Ada Lovelace",
      "email": "ada@example.com",
      "role": "student",
      "isVerified": true
    }
  }
  ```

## 6. Login User
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/auth/login`
- **Description:** Log in an existing verified user.
- **Body:**
  ```json
  {
    "email": "ada@example.com",
    "password": "password123"
  }
  ```

## 7. Forgot Password
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/auth/forgot-password`
- **Description:** Send a password reset link to the user's email.
- **Body:**
  ```json
  {
    "email": "ada@example.com"
  }
  ```

## 8. Reset Password
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/auth/reset-password/:token`
- **Description:** Reset the user's password using the token sent to their email.

## User Profile Management
All routes in this section require a **Bearer Token** in the `Authorization` header.

## 9. Get Current User
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/auth/me`
- **Description:** Get the currently logged-in user's profile information.

## 10. Update User Details
- **Route:** `PUT https://api.distinguishedscholarsacademy.com/api/auth/updatedetails`
- **Description:** Update the current user's profile fields.

## 11. Update Password
- **Route:** `PUT https://api.distinguishedscholarsacademy.com/api/auth/updatepassword`
- **Description:** Update the current user's password.


---

<a id="program"></a>
## program.md
*Written 2026-07-11 (Saturday).*

# Program Countdown API Documentation

> **Status: LIVE on the backend.** Use these routes to replace local/mock stores.
> Interactive Swagger: [api-docs](https://api.distinguishedscholarsacademy.com/api-docs) · Local: `http://localhost:5001/api-docs`
> All protected calls need `Authorization: Bearer <JWT>`.


Base URL: `https://api.distinguishedscholarsacademy.com/api/programs`

Interactive docs: [https://api.distinguishedscholarsacademy.com/api-docs](https://api.distinguishedscholarsacademy.com/api-docs)

Local development base URL: `http://localhost:5001/api/programs`

Endpoints for managing program countdowns.

## 1. Upsert Program Countdown
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/programs`
- **Description:** Create a new program countdown or update an existing one by name.
- **Body:**
  ```json
  {
    "name": "JAMB Countdown",
    "endDate": "2026-04-20T00:00:00.000Z"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "65e...",
      "name": "JAMB Countdown",
      "endDate": "2026-04-20T00:00:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

## 2. Get All Programs
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/programs`
- **Description:** Retrieve all programs and their end dates.
- **Success Response:**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "65e...",
        "name": "JAMB Countdown",
        "endDate": "2026-04-20T00:00:00.000Z"
      }
    ]
  }
  ```


---

<a id="quiz"></a>
## quiz.md
*Written 2026-07-11 (Saturday).*

# Quiz API Documentation

> **Status: LIVE on the backend.** Use these routes to replace local/mock stores.
> Interactive Swagger: [api-docs](https://api.distinguishedscholarsacademy.com/api-docs) · Local: `http://localhost:5001/api-docs`
> All protected calls need `Authorization: Bearer <JWT>`.


Base URL: `https://api.distinguishedscholarsacademy.com/api/quizzes`

Interactive docs: [https://api.distinguishedscholarsacademy.com/api-docs](https://api.distinguishedscholarsacademy.com/api-docs)

Local development base URL: `http://localhost:5001/api/quizzes`

Endpoints for managing and accessing quizzes. All routes except where noted require a **Bearer Token** in the `Authorization` header.

## 1. Create Quiz (Admin Only)
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/quizzes`
- **Description:** Create a new quiz with nested subjects and questions.
- **Body:**
  ```json
  {
    "title": "JAMB Mock 2026",
    "description": "Comprehensive mock for JAMB candidates",
    "type": "general",
    "isPaid": true,
    "amount": 5000,
    "accessCode": "DSA-123456",
    "subjects": [
      {
        "name": "Mathematics",
        "timeLimit": 40,
        "questions": [
          {
            "questionText": "What is 2 + 2?",
            "options": ["3", "4", "5", "6"],
            "correctAnswer": 1,
            "explanation": "Basic addition",
            "marks": 2
          }
        ]
      }
    ]
  }
  ```
- **Success Response:** Returns the created quiz with automatically generated `accessLink` and `accessCode` (e.g., `DSA-123456`).

## 2. Get All Quizzes (Admin Only)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/quizzes`
- **Description:** Retrieve all quizzes in the system.

## 3. Get Quiz by Link (Student/Public)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/quizzes/link/:link`
- **Description:** Retrieve basic quiz information using the unique `accessLink`. This does *not* return the questions.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "title": "JAMB Mock 2026",
      "description": "...",
      "type": "general",
      "subjects": [
        { "name": "Mathematics", "timeLimit": 40, "questionCount": 1 }
      ],
      "totalMarks": 2,
      "isPaid": true,
      "amount": 5000
    }
  }
  ```

## 4. Verify Access Code (Student/Public)
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/quizzes/verify-code`
- **Description:** Verify the `accessCode` for a specific quiz link and retrieve the full quiz content (including questions).
- **Body:**
  ```json
  {
    "link": "abc123hexlink",
    "accessCode": "DSA-123456"
  }
  ```
- **Success Response:** Returns the `Quiz` object, but **excludes** `correctAnswer` and `explanation` from each question for security.

## 5. Update Quiz (Admin Only)
- **Route:** `PUT https://api.distinguishedscholarsacademy.com/api/quizzes/:id`
- **Description:** Update quiz details. Pre-save hooks will automatically recalculate `totalMarks` if subjects or questions are changed.

## 6. Delete Quiz (Admin Only)
- **Route:** `DELETE https://api.distinguishedscholarsacademy.com/api/quizzes/:id`

## 7. Toggle Quiz Status (Admin Only)
- **Route:** `PATCH https://api.distinguishedscholarsacademy.com/api/quizzes/:id/status`
- **Description:** Activate or deactivate a quiz. Inactive quizzes cannot be accessed via link or code.

---

## Important: Preserving IDs during Updates
When updating a quiz using `PUT /api/quizzes/:id`, Mongoose by default might regenerate subdocument IDs (for subjects and questions) if you replace the entire arrays.

To **preserve existing IDs** and avoid breaking student submissions that rely on them:
1. Perform a `GET` request to retrieve the current quiz structure.
2. In your `PUT` request body, **always include the `_id` field** for each subject and question that you are not changing or only editing.
3. Only omit the `_id` for entirely new subjects or questions.

**Example Update Body:**
```json
{
  "subjects": [
    {
      "_id": "65eba2c...",
      "name": "Updated Name",
      "questions": [
        {
          "_id": "65eba2d...",
          "questionText": "Edited Question",
          "options": ["A", "B"],
          "correctAnswer": 0
        }
      ]
    }
  ]
}
```

## 8. Submit Quiz (Student/Private)
- **Route:** `POST https://api.distinguishedscholarsacademy.com/api/quizzes/:id/submit`
- **Description:** Submit answers for grading. Returns the calculated score and saves the result.
- **Body:**
  ```json
  {
    "timeTaken": 120,
    "answers": [
      {
        "questionId": "65eba2c...",
        "selectedOption": 0
      }
    ]
  }
  ```

## 9. Get Leaderboard (Student/Private)
- **Route:** `GET https://api.distinguishedscholarsacademy.com/api/quizzes/:id/leaderboard`
- **Description:** Retrieve top 20 results for a specific quiz, sorted by score and time taken.
- **Success Response:**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "username": "John Doe",
        "profilePic": "https://api.dicebear.com/...",
        "score": 0.85,
        "timeTaken": 120
      }
    ]
  }
  ```


---

<a id="backend-requests"></a>
## backend-requests.md
*Written 2026-07-28 (Tuesday).*

# Backend requests — from the frontend team

> **Archive.** The endpoints below were the frontend wishlist. They are now
> implemented on the backend — use the LIVE docs in [README.md](./README.md)
> (`admin.md`, `attendance.md`, `courses.md`, etc.) and Swagger `/api-docs`
> for integration. Keep this file only for historical context.


The frontend is fully built and running on **browser-local / mock data**. These
endpoints are what's needed to make it real. Items are ordered by urgency.

> **Note:** the product **no longer has quizzes / CBT** — quiz features were
> removed from the app, so **no quiz endpoints are needed** (any `/api/quizzes*`
> work can be dropped from scope).

Base API: `https://api.distinguishedscholarsacademy.com/api`

---

# 🔴 URGENT — the sign-up, payment & login flow

This is the core path and touches money, so it's first.

## 1. Registration now collects much more — store & return it all

`POST /api/auth/register` currently accepts only
`{ name, email, password, phoneNumber, level, subjectsOfInterest, profilePic, role }`.
The multi-step signup now collects and sends **all** of the following — please
store them and return them on `GET /api/auth/me`:

| Field | Notes |
| --- | --- |
| `name`, `email`, `phoneNumber`, `password` | as today |
| `gender` | Male / Female |
| `dateOfBirth` | ISO date |
| `stateOfResidence` | Nigerian state |
| `school` | current school / institution |
| `classLevel` | SS1, SS2, SS3, 100 Level, 200 Level |
| `isDsaStudent` (boolean) | **physical (on-campus) vs online** — drives the whole dashboard |
| `subjectsOfInterest` (string[]) | JAMB/Post-UTME: subjects · WAEC: a single department (`["science"]`/`["art"]`/`["commercial"]`) |
| `programmes` (string[]) | e.g. WAEC Tutorials, JAMB Tutorials, Post-UTME Tutorials, After-School, etc. |
| `guardianName`, `guardianPhone`, `guardianEmail` | parent/guardian contact |
| `profilePic` | passport photo (currently sent as a base64 data URL) |
| `paymentReference` | Paystack reference — see §2 |
| `role` | always `student` from this form; **tutors and guardians/parents are created by an admin** (not self-service) — see §5 |

**Why it matters:** on-campus vs online, department, and programmes drive the
dashboard, timetable, attendance and live-class views. Today the frontend
remembers these in local storage as a fallback, so a student on a **different
device** loses them until the API stores and returns them.

## 2. Verify the Paystack payment (Portal Access Fee) — money

Every student pays a one-time **₦2,000 Portal Access Fee** via Paystack **before**
the account is activated.

**The frontend now uses the register-first flow that the API's Swagger already
implies:**

1. `POST /api/auth/register` (with `price` in **kobo** = `200000`) → server
   creates the PENDING student, **initializes** the Paystack transaction, and
   returns `data: { accessCode, authorizationUrl, reference, … }`.
2. The browser **resumes that same transaction** with `accessCode` (Paystack
   Popup v2 `resumeTransaction`) — so the reference the student pays under is the
   one the server created.
3. Paystack calls **`POST /api/auth/paystack/webhook`** (HMAC-SHA512) → the
   server marks the student paid. The client never decides "paid".
4. Then OTP → `verify-otp` issues the token.

**So the backend must actually return `data.accessCode` (and/or
`authorizationUrl`) from register, and the webhook must flip the paid flag.**
Verify server-side with the SECRET key (`GET
https://api.paystack.co/transaction/verify/:reference`) — never trust the
client; the secret key lives only in a backend env var. (If register does not
return an access code, the frontend falls back gracefully, but payment won't be
collected — so this response field is required for real payments.)

**Also plan for manual (offline) payments.** Some students pay by bank transfer
or cash. Authorized staff (see §9) must be able to mark such a student as paid —
e.g. `POST /api/payments/manual { studentId, amount, method, reference? }`
(staff-only) → sets `isPaid`. So paid-status should not depend solely on Paystack.

## 3. Return `role`, study mode, department & subjects on `GET /api/auth/me`

After login the frontend routes by `role`:
`student → /dashboard`, `tutor → /tutor`, `parent → /guardian`, `admin → /admin`.
`/auth/me` (and the `user` object from `/auth/login` and `/auth/verify-otp`) must
return the true **`role`**, plus **`isDsaStudent`** and **`subjectsOfInterest`**
so the dashboard shows the right mode and department.

## 4. OTP verification + resend

- Real OTP verification on `POST /api/auth/verify-otp`. (The frontend currently
  accepts a **demo code `1111`** as a stand-in — replace with real verification.)
- Add `POST /api/auth/send-otp` taking `{ email }` to re-issue a code — it
  currently **404s**. The "Resend code" button is wired and waiting for it.

---

# Needed — role features (built, running on mock data)

## 5. Tutor & Guardian data

**Tutor** (`role: "tutor"`):
- **Assigned students** — roster this tutor teaches (name, track, progress).
- **Tutor's classes** — sessions they teach (title, day/time, venue or live link).
- **Class analytics** — simple progress figures across their students.

**Guardian** (`role: "parent"`):
- **Admin-created, not self-service.** An admin creates the guardian account and
  sets the ward link at creation time (`POST /api/admin/staff`-style, with
  `role: "parent"` + `wardId`). There is no guardian self-registration.
- **Ward link** — which student(s) a guardian oversees. **This relationship is the
  key missing piece** — everything else hangs off it, and it must be verified
  server-side (a guardian must not see a child's data just by naming them).
- **Ward performance, attendance, and fees** (amount, status paid/due, date).

## 6. Attendance — activate & self-check-in

Attendance is **self-check-in**, not tutor-marked:

1. A **tutor/admin activates** attendance for the day.
2. Each **student marks *themselves* present** from their dashboard; **the server
   records the time**.
3. Tutor/admin **monitor** who checked in; students **view their own** record.

```
POST   /api/attendance/sessions          activate today (tutor/admin) → { active, date, activatedAt }
DELETE /api/attendance/sessions/:date     close the window (tutor/admin)
GET    /api/attendance/sessions/current   is it open now? (any user)
POST   /api/attendance/check-in           STUDENT marks self  (studentId from JWT, NOT body)
                                          → { status: "present", at: <server time> }
                                          · 403 if closed · 409 if already checked in
GET    /api/attendance/check-ins?date=…   who checked in (tutor/admin)
GET    /api/attendance/me                 student's own record + rate
```

**Security:** only tutor/admin activate/close & see the full list; a student may
only check *themselves* in and read *their own* record; check-in only while open,
idempotent, timestamp set **server-side**.

## 7. Timetable + online-class link

- **Weekly timetable per track** (JAMB / WAEC / Post-UTME) that **admin/tutor
  edit** and students view. A grid of `subject` per day × period.
  Suggested: `GET/PUT /api/timetable/:track` with a `{ grid: string[][] }` body.
- **Online class Google Meet link per track** — admin/tutor set it, the student's
  "Join Live Class" button opens it. Suggested: a field on the track/timetable,
  e.g. `meetLink`. (Later this could be an auto-generated Meet link via the
  Google Calendar/Meet API — needs Google Workspace + server-side OAuth.)

## 8. Program countdowns

Exam countdowns read from `GET /api/programs`. Only a (stale) "JAMB Countdown"
exists. Please add entries whose `name` contains **"WAEC"** and **"Post-UTME"**,
each with a future `endDate`, and refresh the JAMB one. Updating a countdown is
just another `POST /api/programs` — no deploy.

## 9. Staff roles & permissions (admin-managed)

Beyond the four core roles (`student` / `tutor` / `parent` / `admin`), the admin
must be able to create **additional staff accounts** — e.g. **secretary,
auditor** — each with its own permissions. **Please design the role model as
role → permissions, not a hardcoded enum**, so new roles can be added without a
code change.

Examples of duties:
- **Secretary** — verify **manual/offline payments** (§2), create/edit the
  **timetable** when the admin is unavailable, manage student records, send
  announcements — general administrative work.
- **Auditor** — read-only access to payments/finance and reports.

**Requested:**
- Admin endpoint to create a staff user: `POST /api/admin/staff { name, email,
  password, role }` and assign/adjust that role's permissions.
- A **permissions model** (role → list of permissions) that is **checked
  server-side on every protected action** (e.g. only a role with
  `payments.verify` can confirm a manual payment; only `timetable.edit` can
  change the timetable).
- Staff **log in on the normal login page** and must land on a staff dashboard
  (`/staff`) whose tools are shown/hidden by their permissions. `GET /api/auth/me`
  must therefore return `role: "staff"` plus the staff role and its permissions
  (e.g. `{ role: "staff", staffRole: "secretary", permissions: ["payments.verify", …] }`).

The frontend is **already built** for all of this (admin "Permissions" screen to
create staff + edit role permissions, staff login, and a permission-gated
`/staff` dashboard) — it currently runs on browser-local data. To make it real,
back these with `POST /api/admin/staff`, a login that returns `role: "staff"`,
and the permissions on `/api/auth/me`. Permission keys the UI uses:
`payments.verify`, `payments.view`, `timetable.edit`, `timetable.view`,
`attendance.manage`, `students.manage`, `students.view`, `announcements.send`,
`reports.view`, `staff.manage`.

**Security:** authorize each staff action against that role's permissions on the
server — never trust a role/permission sent from the client.

---

## Already handled on the frontend — no backend action

- Was calling `GET /api/auth/profile` (404); corrected to **`/api/auth/me`**.
- Countdowns now read from `GET /api/programs` (see §8 for the data still needed).

---

## Cross-cutting security

- Validate the JWT and role on **every** protected endpoint — never trust a role
  or id from the client.
- Tutor endpoints return only that tutor's data; guardian endpoints only that
  guardian's **verified** wards; students read only their own records.
- The admin panel currently uses a temporary frontend-only bypass — real admin
  auth must move to the backend before production.

*Questions on any of this: reply to whoever sent you this note.*


---

<a id="dsa-lms-backend-spec"></a>
## DSA-LMS-Backend-Spec.md
*Written 2026-08-05 (Wednesday).*

# DSA LMS — Backend Specification (Student & Tutor)

> **Mostly delivered (v1).** This was the authoritative wishlist while building.
> For day-to-day frontend integration, use the LIVE route docs in
> [README.md](./README.md). Quizzes / messaging / forum / websockets remain **v2**.


Everything the backend needs to make the Student and Tutor experiences real. This
is the authoritative spec: it lists **every database entity with its fields** and
**every endpoint** grouped by feature, marking what already exists vs. what is
new.

> Companion docs: `backend-requests.md` (original urgent auth/payment/attendance
> notes) and `DSA-Backend-Getting-Started.md` (Phase-1 auth kickoff). This file
> supersedes them for the full LMS scope.

Base API: `https://api.distinguishedscholarsacademy.com/api`
Auth: `Authorization: Bearer <JWT>` on every protected route.

---

## 0. Scope note — quizzes/CBT are VERSION TWO

CBT/Quizzes & Exams are **deferred to version two** — no quiz UI is built in v1.
The backend already implements quizzes (`/api/quizzes*`); those endpoints can
stay as-is, but **do not prioritize quiz work for v1**. The quiz sections below
(§2.7, §2.8, §7) are documented for completeness and v2 planning only.

---

## 0b. Version Two — deferred scope (NOT in v1)

These are intentionally **out of v1** and planned for **version two**. They stay
documented in this spec (entities + endpoints) for v2 planning, but the frontend
does **not** build them in v1. Do not prioritize them for the v1 backend.

1. **Quizzes / CBT & Exams** — *(entities §2.7–§2.8, endpoints §7)*. Students take
   timed CBTs/practice quizzes/exams; tutors author quizzes (nested subjects &
   questions), the system auto-grades and ranks (leaderboards), and results feed
   the gradebook. The backend **already implements** `/api/quizzes*` — leave
   those endpoints in place; there is simply no v1 frontend for them.
   *Why v2:* keep v1 focused on the core learning loop.

2. **Messaging — tutor ↔ student DMs** — *(entities §2.15, endpoints §11)*.
   Private one-to-one conversations between a tutor and their enrolled students
   (`Conversation` + `Message`, `read` receipts).
   *Why v2:* not launch-critical; one-way **announcements** cover comms in v1.

3. **Class chat / discussion forum** — *(entities §2.14, endpoints §11)*.
   Per-course/track discussion threads with replies, or a lightweight class chat
   room (`ForumThread`/`ForumPost` or `ChatMessage`).
   *Why v2:* a community layer that sits on top of the core once it exists.

4. **Realtime (WebSocket / Socket.IO)** — *(§15)*. Live delivery for chat, forum
   updates, and instant notifications (rooms per course/track/conversation).
   Until it lands, v1 uses plain **REST + polling** (`GET /notifications?unread=…`,
   chat `GET …/messages?after=<ts>`).
   *Why v2:* infrastructure that only pays off once messaging/chat exist.

**For contrast — what IS in v1 (built on the frontend):** auth + Paystack payment,
course materials, assignments & submissions, announcements & notifications, live
classes (admin schedules the timetable and generates the Meet link → the tutor
uploads it → the student joins), performance analytics, and profile & settings
(wired to `/auth/updatedetails` + `/auth/updatepassword`).

---

## 1. Conventions (apply to all endpoints)

- **Response envelope:** `{ success: boolean, message?: string, data: <payload>, count?: number }`.
  Lists return `data: [...]` with `count`. `/auth/me` and `/auth/login` may return
  the user under `data` or `user` — keep it consistent (`data`).
- **Auth & roles:** validate the JWT and the caller's role **server-side on every
  request**. Never trust a role/id from the client. Tutors see only their own
  courses/students; students see only their own records; guardians see only
  verified wards.
- **IDs:** string (Mongo ObjectId or UUID). All timestamps ISO-8601 UTC.
- **Pagination:** list endpoints accept `?page=1&limit=20`; return `count` (total).
- **Errors:** non-2xx returns `{ success:false, message }`. Use 400 (validation),
  401 (no/invalid token), 403 (wrong role), 404, 409 (conflict, e.g. already
  enrolled / already checked in), 422.
- **File uploads:** see §14. Materials, assignment attachments, submissions and
  recordings are stored in object storage; the API stores/returns **URLs**, not
  blobs.

---

## 2. Data model — every entity & field

### 2.1 User  *(exists — extend)*
| Field | Type | Notes |
| --- | --- | --- |
| `id` | string (PK) | |
| `fullname` | string | |
| `email` | string (unique) | |
| `passwordHash` | string | never returned |
| `whatsappNumber` | string | |
| `role` | enum | `student` \| `tutor` \| `parent` \| `admin` \| `staff` |
| `gender` | enum | `Male` \| `Female` |
| `dateOfBirth` | date | |
| `stateOfResidence` | string | |
| `institution` | string | school/institution |
| `currentLevel` | string | SS1…, 100 Level… |
| `learningMode` | enum | `online` \| `physical` |
| `profilePic` | url | |
| `isPaid` | bool | portal access fee settled |
| `examTrack` | enum | `jamb` \| `waec` \| `postutme` (student) — may be derived from `programmes` |
| `department` | enum? | `science` \| `art` \| `commercial` (WAEC students only) |
| `programmes` | string[] | enrolled programme names |
| `subjects` | string[] | tutor: subjects taught |
| `bio` | text | tutor profile |
| `credentials` | string[] | tutor qualifications |
| `staffRoleId` | string? | staff → role in `StaffRole` |
| `guardianInfo` | object | `{ fullname, phoneNumber, email? }` (student) |
| `wardIds` | string[] | parent → linked students (server-verified) |
| `createdAt`/`updatedAt` | date | |

### 2.2 Course
A teachable unit, grouped into a **category** shared across tracks/levels.
| Field | Type | Notes |
| --- | --- | --- |
| `id` | string (PK) | |
| `title` | string | e.g. "Mathematics" |
| `subject` | string | e.g. Mathematics |
| `category` | enum | **`waec-sss`** (WAEC + SS1–SS3) · **`jamb-putme`** (JAMB **and** Post-UTME — same courses) · **`higher`** (100/200 level). **This is the grouping the app uses**, not `examTrack`. |
| `tutorId` | FK→User? | **assigned tutor** (admin assigns). A student sees this tutor; the tutor sees students in the course's category |
| `description` | text? | |
| `department` | enum? | WAEC only |
| `thumbnailUrl` | url? | |
| `price` | int (kobo)? | 0/absent = free with portal access |
| `isPublished` | bool | |
| `createdAt`/`updatedAt` | date | |

> **Categories (as built).** Courses are added by the **admin** under one of the
> three categories above and **assigned to a tutor**. A student's category is
> derived from their track/level (WAEC & SS → `waec-sss`; JAMB & Post-UTME →
> `jamb-putme`; 100/200 → `higher`). **JAMB and Post-UTME see the same courses.**
> Students see the courses **and the assigned tutor** for their category; a tutor
> sees the **students doing their courses** (students whose category matches a
> category of a course assigned to that tutor).

### 2.3 Enrollment
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `studentId` | FK→User | |
| `courseId` | FK→Course | |
| `status` | enum | `active` \| `completed` \| `dropped` |
| `progressPercent` | int 0–100 | see §2.16 |
| `enrolledAt` | date | |
| `lastAccessedAt` | date | |
| unique | (studentId, courseId) | prevent double-enroll → 409 |

### 2.4 CourseMaterial  *(syllabus, PDFs, videos, recordings, slides, links)*
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `courseId` | FK→Course | |
| `tutorId` | FK→User | uploader |
| `title` | string | |
| `type` | enum | `pdf` \| `video` \| `recording` \| `syllabus` \| `slide` \| `link` |
| `url` | url | file URL or external/video URL |
| `fileSizeBytes` | int? | |
| `durationSeconds` | int? | video/recording |
| `description` | text? | |
| `orderIndex` | int | ordering within course |
| `isDownloadable` | bool | |
| `createdAt` | date | |

### 2.5 Assignment
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `courseId` | FK→Course | |
| `tutorId` | FK→User | |
| `title` | string | |
| `instructions` | text | |
| `attachmentUrl` | url? | brief/resources |
| `maxScore` | int | |
| `dueDate` | date | |
| `isPublished` | bool | |
| `allowLate` | bool | |
| `createdAt` | date | |

### 2.6 Submission
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `assignmentId` | FK→Assignment | |
| `studentId` | FK→User | |
| `fileUrl` | url? | uploaded work |
| `text` | text? | typed answer |
| `status` | enum | `submitted` \| `graded` \| `late` \| `returned` |
| `score` | int? | |
| `feedback` | text? | |
| `gradedBy` | FK→User? | tutor |
| `submittedAt`/`gradedAt` | date | |
| unique | (assignmentId, studentId) | |

### 2.7 Quiz / CBT  *(exists — extend with `courseId`)*
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `title`, `description` | string/text | |
| `type` | enum | `practice` \| `cbt` \| `exam` |
| `courseId` | FK→Course? | **add** — link quiz to a course |
| `isPaid` | bool | |
| `amount` | int (kobo) | |
| `accessCode` | string? | |
| `durationMinutes` | int | |
| `isActive` | bool | |
| `createdBy` | FK→User | tutor/admin |
| `subjects` | Subject[] | nested |
| `createdAt` | date | |

**Subject (nested):** `{ id, name, questions: Question[] }`
**Question (nested):** `{ id, text, options: string[], correctOptionIndex, explanation?, topic?, year?, difficulty? }`
> Correct answers/explanations are **stripped** from student-facing reads until
> after submission.

### 2.8 QuizAttempt (result)  *(exists as submit/leaderboard — persist per-student)*
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `quizId` | FK→Quiz | |
| `studentId` | FK→User | |
| `answers` | `{questionId, selectedOption:int}[]` | |
| `score`/`total` | int | |
| `timeTakenSeconds` | int | |
| `submittedAt` | date | |

### 2.9 Grade (gradebook entry)
Unifies assignment + quiz/exam scores for analytics & "upload grades".
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `studentId` | FK→User | |
| `courseId` | FK→Course | |
| `assessmentType` | enum | `assignment` \| `quiz` \| `exam` \| `manual` |
| `assessmentId` | string? | FK to the source |
| `title` | string | e.g. "Mock CBT 1" |
| `score`/`maxScore` | int | |
| `weightPercent` | int? | for weighted averages |
| `comment` | text? | |
| `recordedBy` | FK→User | tutor |
| `recordedAt` | date | |

### 2.10 AttendanceSession  *(spec'd in backend-requests §6)*
`{ id, courseId?|examTrack, date, activatedBy, activatedAt, closedAt?, isOpen }`

### 2.11 AttendanceRecord
`{ id, sessionId, studentId, status: present|late|absent, checkInAt }` — unique (sessionId, studentId).

### 2.12 Timetable / TimetableSlot
Per track (and WAEC department). **Admin-scheduled** (tutors/students read-only).
Either a grid blob or rows:
`TimetableSlot { id, examTrack, department?, day (Mon–Sat), period (1–4), startTime, endTime, subject, tutorId?, mode: online|physical, venue?, updatedBy (admin), updatedAt }`

### 2.13 LiveClass
| Field | Type | Notes |
| --- | --- | --- |
| `id` | PK | |
| `courseId`\|`examTrack` | FK/enum | |
| `tutorId` | FK→User | host |
| `title` | string | |
| `scheduledStart`/`scheduledEnd` | date | |
| `meetLink` | url | Google Meet — **admin-generated, tutor-uploaded** |
| `status` | enum | `scheduled` \| `live` \| `ended` — **set by the tutor** |
| `recordingUrl` | url? | becomes a `recording` CourseMaterial when ready |
| `createdAt` | date | |

### 2.14 Forum & Chat
**ForumThread** `{ id, scope: course|track, courseId?/examTrack, title, createdBy, isPinned, isLocked, createdAt, lastPostAt }`
**ForumPost** `{ id, threadId, authorId, body, parentPostId?, attachments[]?, createdAt, editedAt? }`
For a lighter **class chat**: `ChatMessage { id, roomId (courseId|track), senderId, body, sentAt }` (see §13 realtime).

### 2.15 Messaging (tutor ↔ student DM)
**Conversation** `{ id, participantIds: string[], lastMessageAt }`
**Message** `{ id, conversationId, senderId, recipientId, body, attachments[]?, sentAt, readAt? }`

### 2.16 Progress tracking
**MaterialProgress** `{ id, studentId, materialId, courseId, completed, completedAt?, lastPositionSeconds? }`.
`Enrollment.progressPercent` = completed materials ÷ total course materials (or a
weighted formula incl. assignments/quizzes). Recompute on material completion.

### 2.17 Announcement
`{ id, scope: global|track|course, examTrack?/courseId?, authorId, title, body, createdAt }` — broadcast; fan out into Notifications.

### 2.18 Notification
`{ id, userId, type: class_reminder|deadline|grade_posted|announcement|message|attendance_open|enrollment, title, body, link?, isRead, createdAt }`

### 2.19 Payment  *(exists — extend)*
`{ id, studentId, reference, amount(kobo), currency, status: pending|success|failed, method: paystack|manual, purpose: portal_access|course_fee, courseId?, verifiedBy?, paidAt, createdAt }`

### 2.20 StaffRole  *(from backend-requests §9)*
`{ id, name, permissions: string[] }` + staff users reference it via `staffRoleId`.

---

## 3. Auth & profile  *(mostly exists)*
| Method | Path | Who | Notes |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | exists — register-first + Paystack init (returns `accessCode`) |
| POST | `/auth/paystack/webhook` | Paystack | exists — marks paid |
| POST | `/auth/verify-otp` | public | exists |
| POST | `/auth/send-otp` | public | **missing — add** (resend) |
| POST | `/auth/login` | public | exists |
| GET | `/auth/me` | any | exists — **must return** role, examTrack, department, learningMode, isPaid, subjects |
| PUT | `/auth/updatedetails` | any | exists — profile & settings |
| PUT | `/auth/updatepassword` | any | exists |
| POST | `/auth/forgot-password` · `/auth/reset-password/:token` | public | exists |
| POST | `/admin/staff` | admin | **new** — create tutor/guardian/staff (role + wardId/permissions) |
| GET | `/admin/users?role=…` | admin | **new** — list users by role (`student`/`tutor`/`parent`/`staff`) for the admin's **Students / Tutors / Guardians / Staff** management views. Supports `?search=`&pagination |

> **Admin management views (as built).** The admin dashboard has **live-first**
> lists for **Students, Tutors, Guardians** (and Staff under Permissions): each
> screen calls `GET /admin/users?role=…` first and falls back to a browser-local
> list until the endpoint exists (a "Live"/"Local" badge shows which). No
> demo/seed people remain — every list is driven by real accounts.

### 3a. REQUIRED to make the admin panel show real users

Two backend pieces are **blocking** the admin panel from displaying registered
users (today `GET /admin/users` returns **404** and admin has no server token):

**1. Real admin authentication.** The admin login is currently a **frontend-only
bypass** — there is no server admin session/JWT. Provide a real admin login so
the panel sends a valid `Authorization: Bearer` token; protected admin endpoints
must verify the `admin`/`super_admin` role server-side.

**2. `GET /admin/users?role=student|tutor|parent|staff`** (admin-only). Return
the envelope `{ success, data: User[] }` (or a bare array). The frontend reads
these fields per role (send these names, or the frontend already tolerates the
alternates in parentheses):

| Role (`?role=`) | Fields the admin list needs |
| --- | --- |
| `student` | `id`/`studentId`, `fullname` (or `fullName`), `email`, `examTrack` (or `level`), `learningMode` (or `isDsaStudent`) |
| `tutor` | `id`, `fullname`, `email`, `subject` (or `subjects[]`) |
| `parent` (guardian) | `id`, `fullname`, `email`, `wardName` (the linked student's name) |
| `staff` | `id`, `fullname`, `email`, `role`/`staffRole` + `permissions[]` |

Support `?search=` and pagination (`?page=&limit=`). Once both ship, the admin's
Students/Tutors/Guardians lists populate from the database automatically — no
frontend change needed.

Related: tutors & guardians are still **created** via `/auth/register` (role
`tutor` / `parent`); a dedicated `POST /admin/staff`-style admin-create endpoint
is requested above.

---

## 4. Courses & enrollment  *(new)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/courses?category=` | any | list courses (filter by `category` / `tutorId`) |
| GET | `/courses/mine` | student | courses **for the student's category** + each course's assigned **tutor** (drives "My Courses / Your Tutors") |
| GET | `/courses/:id` | any | course detail (+materials/assignments counts) |
| POST | `/courses` | **admin** | create — `{ title, subject, category, tutorId? }` |
| PUT | `/courses/:id` | admin | update / **assign or change the tutor** (`tutorId`) |
| DELETE | `/courses/:id` | admin | |
| GET | `/tutors/me/students` | tutor | students **doing this tutor's courses** — i.e. students whose category matches a category of a course assigned to the tutor |
| POST | `/courses/:id/enroll` | student | (optional) explicit enroll — otherwise category drives membership |
| GET | `/enrollments/me` | student | my courses + progressPercent |

> Course management (add course + category + tutor assignment) is done by the
> **admin** (see §2.2). Student↔tutor visibility is **category-derived**: a
> student sees the tutors of the courses in their category, and a tutor sees the
> students whose category matches their assigned courses.

## 5. Course materials  *(new)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/courses/:id/materials` | enrolled student / owner tutor | list |
| POST | `/courses/:id/materials` | owner tutor | add (after file upload, §14) |
| PUT | `/materials/:id` | owner tutor | edit/reorder |
| DELETE | `/materials/:id` | owner tutor | |
| GET | `/materials/:id/download` | enrolled student | signed URL (respect `isDownloadable`) |
| POST | `/materials/:id/complete` | student | mark done → updates progress |

## 6. Assignments & submissions  *(new)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/courses/:id/assignments` | enrolled/owner | list |
| POST | `/courses/:id/assignments` | owner tutor | create |
| PUT/DELETE | `/assignments/:id` | owner tutor | edit/remove |
| POST | `/assignments/:id/submit` | student | submit (file/text) → `submitted`/`late` |
| GET | `/assignments/:id/submissions` | owner tutor | all submissions |
| GET | `/submissions/me?assignmentId=` | student | my submission + score/feedback |
| PUT | `/submissions/:id/grade` | owner tutor | `{ score, feedback }` → also writes a Grade |

## 7. Quizzes / CBT & exams  *(exists — extend)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/quizzes` | admin/tutor | list (own for tutor) |
| POST | `/quizzes` | tutor/admin | create (nested subjects/questions) |
| PUT/DELETE/PATCH `:id/status` | `/quizzes/:id` | owner | edit/remove/toggle |
| GET | `/quizzes/link/:link` | student | metadata (no answers) |
| POST | `/quizzes/verify-code` | student | unlock questions |
| POST | `/quizzes/:id/submit` | student | grade → persist QuizAttempt + Grade |
| GET | `/quizzes/:id/leaderboard` | any | top results |
| GET | `/quizzes/attempts/me` | student | **add** — my attempts/history |

## 8. Grades & gradebook  *(new)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/grades/me` | student | my grades across courses |
| GET | `/courses/:id/grades` | owner tutor | course gradebook |
| POST | `/courses/:id/grades` | owner tutor | upload/record grade(s) |
| PUT | `/grades/:id` | owner tutor | correct |

## 9. Attendance  *(spec'd — build)*
`POST /attendance/sessions` (tutor activate) · `DELETE /attendance/sessions/:id` (close) ·
`GET /attendance/sessions/current` · `POST /attendance/check-in` (student, server timestamps) ·
`GET /attendance/check-ins?date=` (tutor) · `GET /attendance/me` (student) ·
`GET /attendance/report?courseId=&from=&to=` (tutor → **downloadable CSV**). Full rules in backend-requests §6.

## 10. Timetable & live classes  *(spec'd — build)*

> **Ownership (as built):** the **ADMIN** schedules the timetable and **generates
> the Google Meet link** (externally, in Google Meet), then passes it to the
> **TUTOR**, who **uploads** it and flips the class **live/ended**. Students and
> tutors view the timetable **read-only**; students join when the tutor is live.

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/timetable/:track` | any | grid — students & tutors view (read-only) |
| PUT | `/timetable/:track` | **admin only** | schedule/edit the grid |
| GET | `/live-classes?track=` | enrolled/tutor | upcoming/live for the track |
| PUT | `/live-classes/:track/link` | tutor | **upload the admin-generated Meet link** |
| PATCH | `/live-classes/:track/status` | tutor | set `live` / `ended` (+`recordingUrl`) |
| GET | `/live-classes/next?track=` | student | next class + join state (drives "Join Live Class") |

## 11. Announcements, messaging & forum

> **Scope:** Announcements are **v1** (built). **Messaging (DMs) & forum/class
> chat are VERSION TWO** — the `/conversations*` and `/threads*` rows below are
> documented for v2 planning only; do not prioritize them for v1.
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/announcements?scope=` | any (scoped) | list |
| POST | `/announcements` | tutor/admin/staff | broadcast → fan out to Notifications |
| GET | `/conversations` · `/conversations/:id/messages` | participant | DM threads |
| POST | `/conversations/:id/messages` | participant | send DM |
| POST | `/conversations` | tutor/student | start convo (tutor↔enrolled student only) |
| GET | `/courses/:id/threads` · POST `/threads` · GET `/threads/:id` · POST `/threads/:id/posts` | enrolled/owner | forum |

## 12. Notifications  *(new)*
`GET /notifications` (mine, `?unread=true`) · `PATCH /notifications/:id/read` ·
`PATCH /notifications/read-all` · (server creates them on deadlines, grades,
announcements, attendance-open, new message; class reminders via a scheduler).

## 13. Analytics & progress  *(new — mostly computed)*
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/analytics/me` | student | avg score, attendance rate, progress %, per-subject breakdown |
| GET | `/courses/:id/analytics` | owner tutor | class averages, submission/attendance rates, at-risk students |
| GET | `/tutors/me/students` | tutor | all my students + summary metrics |

---

## 14. File storage & uploads  *(critical new infra)*
PDFs, videos, recordings, assignment briefs & submissions need object storage
(S3 / Cloudinary / GCS) — do **not** put binaries in the main DB.
- `POST /uploads/sign` → returns a **presigned upload URL** + final `fileUrl`.
  Client uploads directly to storage, then sends `fileUrl` to the material/
  submission endpoint. Enforce type/size limits (e.g. PDF ≤ 25MB, video via
  provider). Access to private files via short-lived signed URLs.
- Video: prefer a provider (Cloudinary/Mux/YouTube-unlisted) for transcoding &
  streaming; store the playback URL + `durationSeconds`.

## 15. Realtime (chat & notifications)  *(new)*
Chat, forum live updates, and instant notifications want **WebSocket/Socket.IO**
(rooms per course/track/conversation). If out of scope initially, the REST
endpoints above work with **polling** (`GET /notifications?unread=true`, chat
`GET …/messages?after=<ts>`); the frontend will poll until sockets exist.

## 16. Roles & permissions matrix (server-enforced)
| Capability | student | tutor | admin | staff (by perm) |
| --- | --- | --- | --- | --- |
| Enroll, view materials, submit, take quizzes, check-in | ✅ own | — | — | — |
| Create course/material/assignment/quiz, grade, host class, take attendance, announce | — | ✅ own courses | ✅ | per-permission |
| Manage users/roles, verify manual payments, global settings | — | — | ✅ | per-permission |

**Timetable & live classes:** the **admin** schedules the timetable and generates
the Meet link; the **tutor** only uploads that link and sets the class live/ended
(tutors do NOT edit the timetable). Enforce this split server-side.

Tutor endpoints must scope to the tutor's **own** courses/students; student
endpoints to the student's **own** enrollments/records; enforce on the server.

---

## 17. Suggested build order (so the frontend can integrate incrementally)
1. **Finish auth** — `/auth/me` returns full profile; add `/auth/send-otp`,
   `/admin/staff`. (Unblocks live login already wired on the frontend.)
2. **Courses + enrollment + materials + file uploads** (§4, §5, §14) — the LMS core.
3. **Assignments + submissions + grading** (§6, §8).
4. **Quizzes/CBT** — **VERSION TWO** (skip for v1; endpoints already exist).
5. **Attendance + timetable + live classes** (§9, §10).
6. **Notifications + announcements** (§12, §17), then **analytics** (§13).
7. **VERSION TWO:** quizzes/CBT (§7), **messaging + forum/class chat** (§11), and **realtime** sockets (§15).

Until each ships, the frontend runs that feature on a browser-local store
(clearly marked) and swaps to the endpoint above when ready — per the
"everything is live" rule (real API primary, local fallback only where no
endpoint exists yet).


---

<a id="dsa-portal-client-overview"></a>
## DSA-Portal-Client-Overview.md
*Written 2026-08-05 (Wednesday).*

# Distinguished Scholars Academy — Online Learning Portal

## What it does & how it works — a plain-language overview

This document explains, in simple terms, what the DSA online portal offers, who
uses it, and how each part works. It also explains what is ready now (Version 1)
and what is planned for later (Version 2).

---

## 1. What the portal is

A single online home for the academy where **students learn**, **tutors teach**,
**parents keep an eye on their children**, and the **admin runs everything** — for
JAMB, WAEC and Post-UTME, both on-campus and online.

Everyone signs in and sees a dashboard made for their role.

---

## 2. Who uses it

| Role | Who they are | What they do |
| --- | --- | --- |
| **Student** | Signs up and pays to join | Learns: materials, live classes, assignments, attendance, progress |
| **Tutor** | Created by the admin | Teaches: uploads materials, sets assignments, grades, takes attendance, hosts live classes |
| **Guardian / Parent** | Created by the admin, linked to their child | Follows their child's progress, attendance and fees |
| **Admin** | Runs the academy | Creates staff, schedules the timetable, sets up live-class links, manages payments and permissions |
| **Staff (e.g. Secretary, Auditor)** | Created by the admin with specific permissions | Handle the tasks the admin allows — e.g. a secretary confirms offline payments; an auditor views finance reports |

---

## 3. The student journey (step by step)

1. **Sign up** — the student fills a short multi-step form (their details, class
   level, the programme they want).
2. **Pay the Portal Access Fee (₦2,000)** — a one-time payment through Paystack.
   The account is only activated after payment is confirmed.
3. **Verify** — the student enters a code sent to them to confirm their account.
4. **Dashboard** — once in, the student can:
   - See their **weekly timetable**
   - **Join the live class** when the tutor starts it
   - Open **course materials** — syllabus, notes (PDFs), videos and class recordings — and download what's allowed
   - **Submit assignments** and later see their **score and the tutor's feedback**
   - **Mark themselves present** when attendance is opened
   - Track **how far they've gone** in each course (a progress bar)
   - See their **performance** — average score, attendance, progress
   - Read **announcements** and see **new-item notifications**
   - Update their **profile and password**

---

## 4. The tutor journey

Tutors don't sign themselves up — the **admin creates the tutor account** and
gives them their login. Once signed in, a tutor can:

- Upload **course materials**: syllabus, PDFs, videos and recordings
- Create **assignments**, then **grade** submissions and leave **feedback**
- **Take attendance** (open it for the day; students check themselves in)
- **Host the live class** — paste the class link the admin provides and mark the
  class "live" so students can join
- Send **announcements** to their students
- View **class analytics** — how students are performing, who needs attention
- View the **timetable** (read-only — the admin sets it)

---

## 5. Admin, staff & guardians

**Admin** is in control of the academy and can:
- Create **tutors**, **guardians**, and **other staff**
- **Schedule the weekly timetable** for each exam track
- **Generate the live-class (Google Meet) link** and pass it to the tutor
- Manage **roles and permissions**, oversee **payments** and everything else

**Staff** are extra helpers the admin creates and gives **only the permissions
they need**. Examples:
- **Secretary** — confirms payments made offline (bank transfer/cash), helps
  manage records and can stand in for routine admin tasks
- **Auditor** — can view finance and reports, but not change things

**Guardians / Parents** are created by the admin and **linked to their child**,
so they only ever see **their own child's** progress, attendance and fees.

---

## 6. How the main processes work (the flows)

**Registration & payment**
> Sign up → pay the ₦2,000 fee (Paystack) → payment confirmed → verify with the
> code → account active → dashboard.
> *Some students pay offline (transfer/cash); a staff member confirms those
> manually so their account is activated.*

**Live class**
> Admin creates the Google Meet link → hands it to the tutor → tutor uploads it
> and marks the class "live" → students see the **Join Live Class** button light
> up → they tap it and join. When the class ends, the tutor marks it ended.

**Attendance**
> Tutor (or admin) opens attendance for the day → each student marks **themselves**
> present → the time is recorded → tutor sees who attended, student sees their own
> record.

**Assignments**
> Tutor creates an assignment with a due date → student submits (typed answer or a
> file link) → tutor grades and adds feedback → student sees their score and
> comments.

**Timetable**
> Admin schedules the weekly classes for each track → students and tutors see it
> (read-only). "Next class" on the dashboard comes straight from this timetable.

**Materials & progress**
> Tutor uploads materials to a course → students open/download them and mark items
> complete → the student's progress bar fills up as they go.

**Announcements & notifications**
> Tutor or admin posts an announcement (to everyone or one track) → students see
> it with a "new" badge until they read it.

---

## 7. What's ready now — Version 1

Everything below is built and working in the portal:

- Student sign-up, **payment**, and secure login
- **Course materials** (syllabus, PDFs, videos, recordings) + progress tracking
- **Assignments & submissions** with grading and feedback
- **Announcements & notifications**
- **Live classes** (admin schedules & provides the link; tutor hosts; student joins)
- **Attendance** (self check-in) and the **weekly timetable**
- **Performance analytics** for students and tutors
- **Profile & settings**
- **Admin, tutor, guardian and staff** accounts with the right permissions

---

## 8. What's coming later — Version 2 (and why)

To launch sooner with a solid, focused product, a few advanced features are
planned for a **second phase**. They are intentionally left out of Version 1 —
the portal is fully usable without them.

| Feature | What it is | Why it's Version 2 |
| --- | --- | --- |
| **Quizzes / CBT & Exams** | Timed online tests and mock exams students take on the portal, auto-scored, with leaderboards | It's a large feature on its own; Version 1 focuses on the core teaching-and-learning flow first. Assignments already cover assessment for now |
| **Messaging (tutor ↔ student)** | Private one-to-one chat between a tutor and a student | Not essential for launch — **announcements** already let tutors reach students one-way |
| **Class chat / discussion forum** | A group space for a class to ask questions and discuss | A community add-on that works best layered on top once the core is live |
| **Instant/real-time updates** | Chats and notifications appearing the very second they happen | Only becomes useful once messaging and chat exist; until then, the portal refreshes to show new items |

**In short:** Version 1 delivers the complete learning experience — enrolling,
paying, attending live and on-campus classes, getting materials, doing
assignments, tracking performance. Version 2 adds **online testing** and
**communication/community** features on top.

---

## 9. A note on going fully live

The portal is fully built and is being connected to its secure server and
database. While that connection is finalised, some sample information may appear
as placeholders; it is replaced by real data automatically as each part is
connected. The parts that handle **accounts and payments are already live**.

---

*Prepared for Distinguished Scholars Academy. For anything technical, a detailed
developer specification is available separately.*


---

<a id="dsa-tutor-attendance-students-api"></a>
## DSA-Tutor-Attendance-Students-API.md
*Written 2026-08-07 (Friday).*

# Tutor, Attendance & Student-List APIs — with the UI they power

> **Superseded.** Prefer the LIVE docs:
> [admin.md](./admin.md) · [tutor.md](./tutor.md) · [attendance.md](./attendance.md).
> See [README.md](./README.md) for the full integration map.


For the backend dev. **All three UIs are already built and running** — this doc
maps each screen to the exact endpoint + response fields it needs, so the API
can be structured to match. Base API: `/api`. All protected routes take
`Authorization: Bearer <JWT>` and must verify the caller's role server-side.

Envelope: `{ success: boolean, data: <payload>, message? }` (lists may return a
bare array; the frontend tolerates both).

---

## 1. Fetch students — for BOTH Admin and Tutor

There are **two different "students" views** with different scopes.

### 1a. Admin — every student  *(UI: Admin → Students; also Tutors, Guardians)*
The admin dashboard has live lists that call the server first and fall back to a
local list (a **Live / Local** badge shows which).

`GET /admin/users?role=student` *(also `tutor`, `parent`, `staff`)* — admin only.
Return `{ success, data: User[] }`. Fields the list renders:

| role | fields needed |
| --- | --- |
| `student` | `id`/`studentId`, `fullname`, `email`, `examTrack` (or `level`), `learningMode` (or `isDsaStudent`) |
| `tutor` | `id`, `fullname`, `email`, `subject` (or `subjects[]`) |
| `parent` | `id`, `fullname`, `email`, `wardName` (linked student's name) |

Supports `?search=` and `?page=&limit=`. **Blocked by:** there is no real admin
login yet (the panel uses a frontend bypass) — provide admin auth so the panel
sends a valid token.

### 1b. Tutor — only MY students  *(UI: Tutor → My Students; also Overview + Analytics)*
A tutor must see **only the students doing their courses** — i.e. students whose
category matches a course assigned to that tutor (categories: `waec-sss`,
`jamb-putme`, `higher`).

`GET /tutors/me/students` — tutor only, scoped to the tutor from the JWT.
Return each student with:

| field | used for |
| --- | --- |
| `id`, `fullname` | name column |
| `examTrack`/`level` | Track badge (JAMB / WAEC / Post-UTME) |
| `learningMode` | Mode (On-Campus / Online) |
| `averageScore` (0–100, optional) | "avg" column + "students needing attention" (<70) + class-average analytic |
| `progressPercent` (0–100, optional) | progress bar |

---

## 2. Tutor API  *(UI: the whole Tutor dashboard)*

The tutor is **admin-created** (role `tutor`) and logs in on the normal login
page; `/auth/me` must return `role: "tutor"`. Screens and what each calls:

| Tutor screen | Endpoint(s) | Notes |
| --- | --- | --- |
| **My Students** | `GET /tutors/me/students` | §1b |
| **My Courses** (assigned) | `GET /tutors/me/courses` or `GET /courses?tutorId=me` | course `title`, `subject`, `category` |
| **Course Materials** | `GET /courses/:id/materials` · `POST /courses/:id/materials` · `DELETE /materials/:id` | upload syllabus/PDF/video/recording (URL now; file upload later) |
| **Assignments** | `GET/POST /courses/:id/assignments` · `GET /assignments/:id/submissions` · `PUT /submissions/:id/grade` `{score,feedback}` | create → review submissions → grade |
| **Announcements** | `POST /announcements` `{scope:'track'|'global', track?, title, body}` | broadcast to students |
| **Live Classes** | `PUT /live-classes/:track/link` `{meetLink}` · `PATCH /live-classes/:track/status` `{status:'live'|'ended'}` | admin generates the Meet link; **tutor uploads it** & goes live |
| **Timetable** | `GET /timetable/:track` | **read-only** for tutors (admin schedules it) |
| **Analytics** | `GET /tutors/me/analytics` | class average, submissions/graded per course, at-risk students |
| **Overview tiles** | derived from the above | students count, courses count, assignments count, to-grade count |

Every tutor endpoint must scope to the tutor's **own** courses/students.

---

## 3. Attendance API  *(UI: Tutor/Admin "Take Attendance" + Student "Attendance")*

**Flow (self check-in):** a tutor/admin **activates** attendance for the day →
each student **marks themselves present** → the tutor/admin **monitor** who
checked in; the student sees **their own** record. The server sets the timestamp.

| Method | Path | Who | Purpose / response |
| --- | --- | --- | --- |
| POST | `/attendance/sessions` | tutor/admin | activate today → `{ active:true, date, activatedAt }` |
| DELETE | `/attendance/sessions/:date` | tutor/admin | close the window |
| GET | `/attendance/sessions/current` | any | is it open? → `{ active, date, activatedAt }` |
| POST | `/attendance/check-in` | student | mark self present — **studentId from JWT, not the body**; server stamps time → `{ status:'present', at }` · 403 if closed · 409 if already checked in |
| GET | `/attendance/check-ins?date=` | tutor/admin | who checked in → `[{ studentId, fullname, at }]` (drives the monitor list + expected/present count) |
| GET | `/attendance/me` | student | student's own record + rate → `{ present, total, rate }` |
| GET | `/attendance/report?courseId=&from=&to=` | tutor/admin | **downloadable CSV** of attendance |

**Security:** only tutor/admin activate/close & see the full list; a student may
only check *themselves* in and read *their own* record; check-in only while open,
idempotent, timestamp set **server-side**.

---

## What's already built on the frontend (so you can match shapes)
- **Admin**: Students / Tutors / Guardians lists (live-first `GET /admin/users?role=`, Live/Local badge).
- **Tutor**: Overview, My Students, Course Materials, Assignments (+grading), Announcements, Live Classes, read-only Timetable, Analytics.
- **Attendance**: tutor/admin activate + monitor; student self check-in + own record.

All run on browser-local stores today and switch to these endpoints as they ship
— no further frontend work needed once the shapes above are returned.

*(Screenshots of any of these screens can be provided on request.)*


---

<a id="admin"></a>
## admin.md
*Written 2026-08-11 (Tuesday).*

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


---

<a id="analytics"></a>
## analytics.md
*Written 2026-08-11 (Tuesday).*

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


---

<a id="assignment"></a>
## assignment.md
*Written 2026-08-11 (Tuesday).*

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


---

<a id="attendance"></a>
## attendance.md
*Written 2026-08-11 (Tuesday).*

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


---

<a id="courses"></a>
## courses.md
*Written 2026-08-11 (Tuesday).*

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


---

<a id="timetable"></a>
## timetable.md
*Written 2026-08-11 (Tuesday).*

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


---

<a id="tutor"></a>
## tutor.md
*Written 2026-08-11 (Tuesday).*

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


---

<a id="backend-request-attendance-per-tutor"></a>
## backend-request-attendance-per-tutor.md
*Written 2026-08-22 (Saturday).*

# What we need: attendance scoped per tutor

Hi — sharing a gap we ran into while testing attendance, and what the product
needs it to do. Not prescribing an implementation; you'll know the cleanest way
to do it on your side. This is just the behaviour we're after and the context.

## Context

Attendance is self-check-in: a tutor opens attendance for the day, and each of
their students marks themselves present from their dashboard. In real use there
are **many tutors**, each running their **own class with their own students**
(students see a tutor through the course they're enrolled in).

## What's happening now

Right now attendance behaves as **one shared session for the whole school per
day**. In practice that means:

- When **one** tutor opens attendance, it counts as open for **everyone** —
  every student can check in, and every other tutor's screen shows "attendance
  is open", even tutors who never opened it.
- A student's check-in isn't tied to a particular tutor; it lands in the single
  global session.
- Tutors can't tell their own class's attendance apart from another class's.

So a tutor can't actually run attendance for just their class.

## What we need it to do

We need attendance to be **scoped to the individual tutor and their students**:

1. When a tutor opens attendance, it should apply **only to their own
   students** — not to students who belong to other tutors.
2. A student should mark present against **their own tutor's** session (the
   tutor of the course they're enrolled in), and only when that tutor has
   actually opened attendance.
3. Each tutor should see and monitor **only their own students'** check-ins,
   counts and attendance rate.
4. If Tutor A has attendance open but Tutor B hasn't, **Tutor B's students
   should not see "attendance is open."**

In short: one tutor's attendance shouldn't leak into another tutor's class.

## A couple of things that might help (your call)

- The link between a student and their tutor already exists through
  **enrollments / courses** (a course has a tutor, a student is enrolled in a
  course), so there's an existing relationship to scope by.
- The "activate session" call already accepts an optional `courseId`, which
  might be a natural anchor for scoping — but however you model it (per tutor,
  per course, per class) is fine with us.

## On our side

The frontend is already wired to the current attendance endpoints (activate,
current session, check-in, check-ins, my record) and works. We're happy to
adapt to whatever shape you land on — we just need the **scoping** so each
tutor's attendance is isolated to their own students. Whatever's easiest for you
to support, tell us the shape and we'll consume it.

Thanks!


---

<a id="backend-request-attendance-scoping"></a>
## backend-request-attendance-scoping.md
*Written 2026-08-22 (Saturday).*

# Backend request — per-tutor / per-course attendance scoping

> **From:** frontend team · **Priority:** high
> **Status of frontend:** the tutor monitor already filters check-ins to the
> logged-in tutor's own students (`GET /tutors/me/students`). This is a
> stopgap — the underlying session is still shared, so we need the backend
> changes below for true isolation.

## The problem

Attendance today is **one global session per calendar day**:

- `POST /api/attendance/sessions` opens **the** session for that date (if one is
  already open it returns the existing one).
- `POST /api/attendance/check-in` marks the student present for **that** single
  daily session.
- `GET /api/attendance/check-ins?date=` returns **every** check-in for the date.

So when **any** tutor opens attendance:

1. Every student in the school can check in.
2. Every tutor's dashboard shows "attendance is open".
3. Check-ins are one shared pool.

**Desired:** attendance is scoped so that a tutor opens attendance for **their
own class/course**, only **their** students can check into it, and each tutor
only sees (and closes) **their own** session and check-ins.

## Recommended model — scope by **course**

A course already has an owner tutor (`tutorId`) and enrolled students, so
course is the natural scope (and a student enrolled in two tutors' courses can
be marked present in each independently).

Key change: an attendance **session** is keyed by **(courseId, date)** instead
of just **date**, and a **check-in** is keyed by **(sessionId/courseId,
studentId, date)**.

### 1. Open a session — `POST /api/attendance/sessions`
- **Body:** `{ "courseId": "65e...", "date": "2026-08-20" }` — `courseId` now
  **required**; `date` optional (defaults to today).
- **Auth:** only the course's **owner tutor** (or admin) may open it (`403`
  otherwise).
- **Behaviour:** upsert the session for that (courseId, date). Notify only
  students **enrolled in that course** (`attendance_open`).
- **Response:** `{ success, data: { id, courseId, date, active, activatedAt } }`

### 2. Close — `DELETE /api/attendance/sessions/:date?courseId=65e...`
(or `DELETE /api/attendance/sessions/:sessionId`) — owner tutor/admin only,
scoped to that course.

### 3. Current session(s) — `GET /api/attendance/sessions/current`
- **Student:** return the open sessions for the courses **they are enrolled
  in**: `{ success, data: [ { id, courseId, courseTitle, active, activatedAt } ] }`
  (array — a student may have more than one open class). `active:false`/empty
  when none.
- **Tutor:** return the open sessions for **their** courses.

### 4. Student check-in — `POST /api/attendance/check-in`
- **Body:** `{ "courseId": "65e..." }` — **required** now (which class they're
  marking present for). `studentId` still from the JWT.
- **Rules:** `403` if the student isn't enrolled in that course or the course's
  session isn't open; `409` if already checked in for that (course, date).
- **Response:** `{ success, data: { courseId, status: "present", at, date } }`

### 5. Monitor — `GET /api/attendance/check-ins?date=&courseId=65e...`
- **Auth:** owner tutor of `courseId` (or admin).
- Returns check-ins **for that course only**. If `courseId` is omitted for a
  tutor, return check-ins across **all their courses** (never the whole school).
- Row shape unchanged: `{ id, studentId, fullname, email, studentCode, status, at, date, courseId }`.

### 6. Student's own record — `GET /api/attendance/me`
- Keep returning the student's overall rate, but compute it across **their
  enrolled courses' sessions** (present ÷ total sessions held for their
  courses). Optionally add `perCourse: [{ courseId, title, present, total, rate }]`.

### 7. Report CSV — `GET /api/attendance/report`
- Honour the already-accepted `courseId` filter and scope a tutor's export to
  their own courses.

## Security
- A tutor may open/close/monitor attendance **only for courses where they are
  `tutorId`**; admin may do any.
- A student may check into **only courses they are enrolled in**, only while
  that course's session is open; timestamp server-side; idempotent per
  (course, date).

## Backward compatibility / migration
- Existing sessions/check-ins have no `courseId`. Either migrate them to a
  sentinel "general" course or drop them (test data).
- If a phased rollout is needed, keep the old global behaviour when `courseId`
  is absent, and treat `courseId`-scoped calls as the new path — but the
  frontend is ready to send `courseId` on all calls once this ships.

## What the frontend will do once this ships
- **Tutor** (`TakeAttendance`): pick one of their courses, open/close attendance
  for it, and monitor only that course's check-ins.
- **Student** (`StudentAttendance`): see each open class they're enrolled in and
  press "Mark me present" per class (`POST /check-in { courseId }`).
- We already read `/tutors/me/students`, `/courses/mine`, and
  `/enrollments/me`, so enrolment data is available client-side to drive the UI.

*Questions: reply to the frontend team. The relevant frontend files are
`src/components/dashboard/TakeAttendance.tsx` (tutor) and
`StudentAttendance.tsx` (student), plus `dsaApi.attendance` in `src/lib/api.ts`.*


---

<a id="backend-needs"></a>
## backend-needs.md
*Written 2026-08-23 (Sunday).*

# What the frontend needs from the backend

Hi — this is a consolidated list of the gaps we've hit while testing, with the
**exact requests the frontend already sends** so you have the contract in front
of you. We're not prescribing how to build it; wherever the shape is your call,
we'll adapt. For each item: what's blocked, what we send, and what we need back.

Base API: `https://api.distinguishedscholarsacademy.com/api`
All protected calls send `Authorization: Bearer <JWT>`.

---

## 1. Attendance, scoped per tutor  🔴

**Blocked:** attendance is currently **one shared daily session for the whole
school**. When one tutor opens it, every student can check in and every tutor
sees it. We need it scoped so a tutor runs attendance for **their own students**
only (students linked through the courses that tutor is assigned to).

**What we send today (already working, just not scoped):**

```
POST /attendance/sessions          # activate. body may carry a course:
    { "date": "2026-08-20", "courseId": "65e..." }   # date + courseId optional

POST /attendance/check-in          # student marks self; studentId from JWT
    { }

GET  /attendance/check-ins?date=2026-08-20   # monitor list

DELETE /attendance/sessions/2026-08-20        # close
```

**What we need:**
- A tutor opening a session affects only their own students.
- A student checks into **their** tutor's session (the tutor of the course
  they're enrolled in), and only while that tutor's session is open.
- `GET /attendance/check-ins` returns only the requesting tutor's students.
- Whatever you key it on (tutor, course, class) is fine — the enrollment/course
  link between student and tutor already exists to scope by. We'll send
  `courseId` on activate if that's the anchor you want.

*(Fuller write-up in `backend-request-attendance-per-tutor.md`.)*

---

## 2. Announcements — edit & delete  🔴

**Blocked:** `PUT /announcements/:id` and `DELETE /announcements/:id` both return
**404**, so a tutor/admin can't edit or remove an announcement after posting.

**Create already works** — for reference, this is what we send:

```
POST /announcements
    {
      "scope": "global",           # "global" | "track"
      "track": "waec",             # when scope = "track" (jamb | waec | postutme)
      "examTrack": "waec",          # sent alongside for compatibility
      "authorName": "Mr Bello",
      "title": "WAEC mock exam",
      "body": "WAEC mock holds Friday."
    }
```

**What we need (same auth as create — tutor/admin):**

```
PUT /announcements/:id
    { "title": "Updated title", "body": "Updated text" }
    # (scope/track edit optional)

DELETE /announcements/:id
    -> { "success": true }
```

---

## 3. Staff / Secretary login  🔴

**Blocked:** a secretary/staff member can't sign in — login returns "invalid
credentials", so the `/staff` dashboard is unreachable.

**What we send to create the staff account (admin):**

```
POST /admin/staff
    {
      "fullname": "Office Secretary",
      "email": "secretary@dsa.com",
      "password": "TempPass123",
      "role": "staff",
      "staffRole": "secretary",
      "permissions": ["payments.verify", "timetable.edit", "announcements.send"]
    }
```

**What we send to log them in:**

```
POST /auth/login
    { "email": "secretary@dsa.com", "password": "TempPass123" }
```

**What we need back** — the created staff account must be able to log in, and
both `/auth/login` and `GET /auth/me` must return:

```
{
  "role": "staff",
  "staffRole": "secretary",
  "permissions": ["payments.verify", "timetable.edit", "announcements.send"]
}
```

The `/staff` dashboard shows/hides tools based on `permissions`.

---

## 4. Resend OTP  🔴

**Blocked:** `POST /auth/send-otp` returns **404**. The "Resend code" button in
signup has nothing to call, so a student who misses the first code is stuck.

**What we send:**

```
POST /auth/send-otp
    { "email": "student@example.com" }
    -> { "success": true, "message": "OTP sent" }
```

Just re-issue (and re-send) a fresh OTP to that email.

---

## 5. Per-student material completion  🟡

**Blocked:** `GET /courses/:id/materials` doesn't tell us which materials the
logged-in **student** has completed, so the per-item "done" ticks are tracked in
the browser only (they don't follow the student to another device). The overall
`progressPercent` is authoritative; the per-item state isn't.

**What we send today:**

```
GET  /courses/:id/materials       # list
POST /materials/:id/complete      # mark one complete -> { progressPercent, completed, total }
```

**What we need:**
- Each material in `GET /courses/:id/materials` should include, for the
  requesting student, `completed: true|false`.
- Ideally a way to **un-mark** a material, e.g. `DELETE /materials/:id/complete`
  (or a toggle), so a student can correct a mistaken tick.

---

## 6. Guardian ward data  🟡

**Blocked:** a guardian can be created and can log in, but their dashboard has
**no live data** — we can't yet show a guardian their ward's information. This
is the one role still on demo data.

We create the guardian like this (works):

```
POST /admin/staff
    {
      "fullname": "Mrs Adeyemi", "email": "adeyemi@example.com",
      "password": "TempPass123", "role": "parent",
      "username": "adeyemi", "phoneNumber": "08098765432",
      "wardId": "DSA/2026-C4G5U2"      # a real student's studentId
    }
```

**What we need** — endpoints scoped to the **logged-in guardian** (verified
server-side against their ward link, so a guardian can only ever see their own
ward). Whatever grouping is easiest for you; for example:

```
GET /parents/me/wards
    -> [ { studentId, fullname, examTrack, level, isPaid } ]

GET /parents/me/wards/:studentId/performance
    -> { averageScore, progressPercent, attendanceRate, present, totalSessions,
         perSubject: [ { title, average } ] }

GET /parents/me/wards/:studentId/fees
    -> { amount, status: "paid" | "due", paidAt }
```

The key requirement is: **the ward relationship is verified on the server** — a
guardian must never see a child's data just by guessing an id.

---

## 7. Per-tutor live-class link  🟡  *(if we want it)*

**Current:** the Google Meet link is **one record per track**
(`PUT /live-classes/:track/link`), so every tutor teaching a track shares the
**same** link and the same live/ended status.

**What we send today:**

```
PUT   /live-classes/:track/link      { "meetLink": "https://meet.google.com/abc-defg-hij" }
PATCH /live-classes/:track/status    { "status": "live" }        # or { "status": "ended", "recordingUrl": "..." }
GET   /live-classes/next?track=waec  # student join state -> { status, meetLink, canJoin }
```

**What we need (if each tutor should have their own class link):**
- Live-class records keyed **per tutor/course**, not per track, so Tutor A's
  link and "live" state are independent of Tutor B's — and a student joins the
  session of **their** tutor.

If a shared per-track link is actually the intended design, we can leave this as
is — just flagging it in case it isn't.

---

## Already resolved on our side — no backend action

- **File uploads / object storage** — done client-side via **Cloudinary**
  (materials, avatars, signup photo, assignment files all upload in production).
  The `/uploads/sign` stub is no longer needed.
- **~100KB request-body limit** — no longer hit, since files go to Cloudinary
  rather than through JSON.

Everything else the app uses (auth, courses, materials, assignments, grades,
analytics, timetable, live-classes, announcements read, notifications, and the
current attendance endpoints) is live and working. Thanks!


---

<a id="backend-request-attendance-date-conflict"></a>
## backend-request-attendance-date-conflict.md
*Written 2026-08-23 (Sunday).*

# Attendance: only one class can open per day (409 "date already in use")

Thanks for the per-course attendance work — we've wired the frontend to it
(activate/close/check-in/monitor all send `courseId` now). While testing we hit
one issue that blocks it, and wanted to show you exactly what we're seeing so
it's quick to place.

## What we're seeing

Opening attendance works for the **first** class of the day, but opening
attendance for a **second** class on the **same date** fails — even when it's a
different course with a different tutor:

```
POST /api/attendance/sessions   { "courseId": "<first course>" }   -> 201  ✅
POST /api/attendance/sessions   { "courseId": "<second course>" }  -> 409
    { "success": false, "message": "That date is already in use" }
```

The second course is brand new (no prior session) and belongs to a different
tutor, so it shouldn't clash with the first one.

## Why it matters

The whole point of the per-course change is that **each tutor runs attendance
for their own class**. On any given school day, several classes happen — so
several courses need attendance open on the **same date** at the same time. With
the current behaviour, once one class opens attendance, **no other class can**
for the rest of that day.

## What we think is happening (your call)

It looks like a session is unique on **date alone**, so the second insert for the
same day collides. We'd expect a session to be unique per **course per day** —
i.e. the key that makes a session unique should include the course (and possibly
the tutor), not just the date. Something like unique on `(courseId, date)` rather
than `(date)`. However you model it is fine — we just need **different courses to
be able to have attendance open on the same date**.

## To reproduce

1. `POST /attendance/sessions { courseId: A }` → 201
2. `POST /attendance/sessions { courseId: B }` (B ≠ A, same day) → 409
   "That date is already in use"

## On our side

The frontend is already sending `courseId` on every attendance call and shows a
course picker (tutor) / per-course cards (student). Nothing to change on our end
— once two courses can open attendance on the same date, the full flow
(activate → student marks present → tutor monitors → close) works per class.

Thanks!

