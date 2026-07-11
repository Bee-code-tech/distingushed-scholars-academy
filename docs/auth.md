# Authentication API Routes

Base URL: `/api/auth` (on port 5001)

## Validation Rules
- **Level:** Must be one of: `jamb`, `waec`, `post utme`
- **Role:** Default is `student`. Other options: `admin`, `moderator`.
- **Profile Picture:** Automatically generated if not provided.
- **Subjects of Interest:** At least 4 subjects must be selected.
- **Password:** Minimum 6 characters.

## 1. Register User
- **Route:** `POST http://localhost:5001/api/auth/register`
- **Description:** Register a new user. Sends an OTP to the user's email for verification.
- **Body:**
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "phoneNumber": "1234567890",
    "level": "jamb",
    "subjectsOfInterest": ["Mathematics", "English", "Physics", "Chemistry"],
    "profilePic": "http://image-url.com" (optional),
    "role": "student" (optional)
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent to email. Please verify to complete registration."
  }
  ```

## 2. Verify OTP
- **Route:** `POST http://localhost:5001/api/auth/verify-otp`
- **Description:** Verify the OTP sent to the user's email to complete registration. Returns a JWT token and user details.
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "token": "JWT_TOKEN",
    "user": {
      "id": "USER_ID",
      "name": "User Name",
      "email": "user@example.com",
      "phoneNumber": "1234567890",
      "level": "jamb",
      "subjectsOfInterest": ["Mathematics", "English", "Physics", "Chemistry"],
      "role": "student",
      "profilePic": "https://api.dicebear.com/7.x/adventurer/svg?seed=User%20Name"
    }
  }
  ```

## 3. Login User
- **Route:** `POST http://localhost:5001/api/auth/login`
- **Description:** Log in an existing, verified user. Returns a JWT token and basic user details.
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "token": "JWT_TOKEN",
    "user": {
      "id": "USER_ID",
      "name": "User Name",
      "email": "user@example.com",
      "level": "jamb",
      "role": "student",
      "profilePic": "https://api.dicebear.com/7.x/adventurer/svg?seed=User%20Name"
    }
  }
  ```

## 4. Forgot Password
- **Route:** `POST http://localhost:5001/api/auth/forgot-password`
- **Description:** Send a password reset link to the user's email.
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Reset link sent to email"
  }
  ```

## 5. Reset Password
- **Route:** `POST http://localhost:5001/api/auth/reset-password/:token`
- **Description:** Reset the user's password using the token sent to their email.
- **URL Params:**
  - `token`: The reset token from the email link.
- **Body:**
  ```json
  {
    "newPassword": "newPassword123"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Password reset successful"
  }
  ```

## User Profile Management
All routes in this section require a **Bearer Token** in the `Authorization` header.

## 6. Get Current User
- **Route:** `GET http://localhost:5001/api/auth/me`
- **Description:** Get the currently logged-in user's profile information.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "USER_ID",
      "name": "User Name",
      "email": "user@example.com",
      "role": "student",
      "profilePic": "..."
    }
  }
  ```

## 7. Update User Details
- **Route:** `PUT http://localhost:5001/api/auth/updatedetails`
- **Description:** Update public profile information.
- **Body:**
  ```json
  {
    "name": "New Name",
    "email": "newemail@example.com",
    "phoneNumber": "0987654321",
    "level": "waec",
    "subjectsOfInterest": ["Math", "English", "Logic", "Art"]
  }
  ```
- **Success Response:** Returns the updated `User` object.

## 8. Update Password
- **Route:** `PUT http://localhost:5001/api/auth/updatepassword`
- **Description:** Update the user's password.
- **Body:**
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }
  ```
- **Success Response:** Returns a new JWT token.
