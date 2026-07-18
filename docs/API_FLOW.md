# BitLinks 🔗 REST API Reference & Request Lifecycle Flow

This document outlines the formal REST API contract for the **BitLinks** URL shortener platform. It details all endpoints, authentication parameters, request schemas, status code scenarios, and JSON transaction payloads.

---

## 🔒 Authentication Protocol

Core user history API endpoints require a signed JSON Web Token (JWT) transmitted via an HTTP-only cookie named `token`. The token is set upon successful authentication and verified on the server-side.

```http
Cookie: token=<JWT_TOKEN_HERE>
```

Failure to transmit the token, or presenting an invalid/expired token, yields:
- **HTTP Status Code:** `401 Unauthorized`
- **JSON Payload:** `{"success": false, "error": true, "message": "Unauthorized"}` or `{"success": false, "error": true, "message": "Invalid token"}`

---

## 🔑 1. Authentication Endpoints

### A. Register New Account
Creates a new creator/user profile.

- **Route:** `POST /api/auth/signup`
- **Authentication Required:** None
- **Content-Type:** `application/json`

* **Rate Limit**: 3 signup attempts per minute per IP address.

#### Request Body
```json
{
  "name": "Anurag Singh",
  "email": "anurag@example.com",
  "password": "SecurePassword123"
}
```

#### Response (HTTP 201 Created)
```json
{
  "success": true,
  "error": false,
  "message": "User registered successfully"
}
```

#### Common Error Responses
* **HTTP 400 Bad Request (Missing/Empty Fields or Invalid Email)**
  ```json
  {
    "success": false,
    "error": true,
    "message": "Name, email, and password are required and must be strings"
  }
  ```
* **HTTP 409 Conflict (Duplicate User Email)**
  ```json
  {
    "success": false,
    "error": true,
    "message": "User with this email already exists"
  }
  ```
* **HTTP 503 Service Unavailable (DB Connection Fail)**
  ```json
  {
    "success": false,
    "error": true,
    "message": "Database server connection issue. Please try again later."
  }
  ```

---

### B. User Login / Session Creation
Authenticates the user, signs a JWT session token, and returns it in a secure cookie.

- **Route:** `POST /api/auth/login`
- **Authentication Required:** None
- **Content-Type:** `application/json`
- **Rate Limit**: 5 login attempts per minute per IP address.

#### Request Body
```json
{
  "email": "anurag@example.com",
  "password": "SecurePassword123"
}
```

#### Response (HTTP 200 OK)
*Sets HTTP-only Cookie:* `token=<jwt_token>; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
```json
{
  "success": true,
  "error": false,
  "message": "Login successful",
  "user": {
    "name": "Anurag Singh",
    "email": "anurag@example.com"
  }
}
```

#### Common Error Responses
* **HTTP 401 Unauthorized (Invalid Credentials)**
  ```json
  {
    "success": false,
    "error": true,
    "message": "Invalid credentials"
  }
  ```
* **HTTP 500 Internal Server Error**
  ```json
  {
    "success": false,
    "error": true,
    "message": "Internal server error"
  }
  ```

---

## 🔗 2. URL Management Endpoints

### A. Shorten URL Alias
Creates a new short URL map redirecting to a long destination URL. If the client has a valid session token, the link is permanently bound to the user's account for analytics. Otherwise, it is created anonymously.

- **Route:** `POST /api/generate`
- **Authentication Required:** Optional (Reads cookie `token` if present)
- **Content-Type:** `application/json`
- **Rate Limit**: 30 URL generation requests per minute per IP address.

#### Request Body
```json
{
  "url": "https://react.dev/reference/react/hooks",
  "shorturl": "react-hooks"
}
```
*Note: If `shorturl` (custom alias) is provided, it must be between 1 and 30 characters in length and only contain alphanumeric characters, hyphens, or underscores.*

#### Response (HTTP 201 Created)
```json
{
  "success": true,
  "error": false,
  "message": "URL generated successfully!",
  "shortUrl": "https://bitlinks.io/react-hooks"
}
```

#### Common Error Responses
* **HTTP 400 Bad Request (Invalid URL formats, Alias length > 30, Empty properties, Unsupported protocol schemes)**
  ```json
  {
    "success": false,
    "error": true,
    "message": "Custom alias can only contain letters, numbers, hyphens, and underscores."
  }
  ```
* **HTTP 409 Conflict (Alias Already Taken)**
  ```json
  {
    "success": false,
    "error": true,
    "message": "Short URL already exists!"
  }
  ```

---

### B. Retrieve User URLs
Retrieves the history of shortened links created by the currently authenticated user.

- **Route:** `GET /api/user/urls`
- **Authentication Required:** Yes (Valid JWT in `token` cookie)
- **Rate Limit**: 60 requests per minute per IP address.

#### Response (HTTP 200 OK)
```json
{
  "success": true,
  "error": false,
  "urls": [
    {
      "_id": "64b0f92b7c4d5d6789a1b2c3",
      "url": "https://react.dev/reference/react/hooks",
      "shorturl": "react-hooks",
      "userId": "64b0f92b7c4d5d6789a1b2a1",
      "clicks": 14,
      "createdAt": "2026-07-18T16:15:00.000Z",
      "fullShortUrl": "https://bitlinks.io/react-hooks"
    }
  ]
}
```

#### Common Error Responses
* **HTTP 401 Unauthorized (Missing or Invalid token)**
  ```json
  {
    "success": false,
    "error": true,
    "message": "Unauthorized"
  }
  ```
* **HTTP 503 Service Unavailable (DB Connection Fail)**
  ```json
  {
    "success": false,
    "error": true,
    "message": "Failed to connect to the database"
  }
  ```

---

## ⚡ 3. Redirection Engine (System Entry Point)

Handles redirection from shortened URLs to their original destination.

- **Route:** `GET /[shorturl]`
- **Authentication Required:** None

#### Process Flow
1. Receives shorturl alias parameter.
2. Gracefully filters out default crawler paths (`favicon.ico`, `robots.txt`, `sitemap.xml`) and runs early parameter format verification (matches `/^[a-zA-Z0-9_-]+$/`).
3. Queries MongoDB to find matching document.
4. If found:
   - Increments the `clicks` counter in MongoDB using `$inc` asynchronously via Next.js `after`.
   - Returns a **302 Found** redirect response to the target `url`.
5. If not found:
   - Responds with `404 Not Found` presenting a custom glassmorphism web layout.

#### Common Response Formats
* **HTTP 302 Found (Redirection)**
  - `Location: https://react.dev/reference/react/hooks`
* **HTTP 404 Not Found (Beautiful Fallback Webpage)**
  - Content-Type: `text/html`
  - HTML structure with error details.

