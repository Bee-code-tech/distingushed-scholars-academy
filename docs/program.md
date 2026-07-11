# Program Countdown API Documentation

Endpoints for managing program countdowns.

## 1. Upsert Program Countdown
- **Route:** `POST http://localhost:5001/api/programs`
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
- **Route:** `GET http://localhost:5001/api/programs`
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
