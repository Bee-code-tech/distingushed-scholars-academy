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
