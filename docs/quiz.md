# Quiz API Documentation

Endpoints for managing and accessing quizzes. All routes except where noted require a **Bearer Token** in the `Authorization` header.

## 1. Create Quiz (Admin Only)
- **Route:** `POST /api/quizzes`
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
- **Route:** `GET /api/quizzes`
- **Description:** Retrieve all quizzes in the system.

## 3. Get Quiz by Link (Student/Public)
- **Route:** `GET /api/quizzes/link/:link`
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
- **Route:** `POST /api/quizzes/verify-code`
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
- **Route:** `PUT /api/quizzes/:id`
- **Description:** Update quiz details. Pre-save hooks will automatically recalculate `totalMarks` if subjects or questions are changed.

## 6. Delete Quiz (Admin Only)
- **Route:** `DELETE /api/quizzes/:id`

## 7. Toggle Quiz Status (Admin Only)
- **Route:** `PATCH /api/quizzes/:id/status`
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
- **Route:** `POST /api/quizzes/:id/submit`
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
- **Route:** `GET /api/quizzes/:id/leaderboard`
- **Description:** Retrieve top 20 results for a specific quiz, sorted by score and time taken.
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
