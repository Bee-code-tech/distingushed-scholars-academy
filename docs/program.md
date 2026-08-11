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
