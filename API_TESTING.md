# VAC API Testing

Start the server before testing:

```bash
npm start
```

Base URL: `http://localhost:5000`

In Postman, use **Import > Raw text** and paste each cURL command separately.

## Integration Basics

All request and response bodies are JSON. Send this header for requests with a body:

```http
Content-Type: application/json
```

Protected endpoints require the token returned by login:

```http
Authorization: Bearer <token>
```

The API identifies the user from the token. Frontend code must not send a user ID to select the current student or admin.

### Roles

| Role | Access |
| --- | --- |
| `student` | `/api/students/*` and `/api/auth/me` |
| `admin` | `/api/admin/*` and `/api/auth/me` |
| `faculty` | Authentication only; no student or admin route access |

### Common HTTP Errors

| Status | Meaning |
| --- | --- |
| `400` | Invalid or missing request field, ID, or enum value |
| `401` | Missing, malformed, expired, or invalid bearer token |
| `403` | Token is valid but its role cannot access the endpoint |
| `404` | Resource or active registration was not found |
| `409` | Course has no seats, or a conflicting course operation occurred |
| `500` | Server or database failure |

Error responses use this shape:

```json
{
  "message": "Human-readable error description"
}
```

## Authentication Contract

### Register Request

`POST /api/auth/register`

Required fields: `fullName`, `email`, `password`, and `role`.

Allowed `role` values: `student`, `faculty`, `admin`.

For faculty accounts, `facultyType` is required and must be `internal` or `external`.

Successful response:

```json
{
  "message": "Account created successfully",
  "user": {
    "id": "1",
    "fullName": "Test Student",
    "email": "student@example.com",
    "role": "student",
    "facultyType": null,
    "createdAt": "2026-09-26T10:00:00.000Z"
  },
  "token": "JWT_TOKEN"
}
```

### Login Response

`POST /api/auth/login` returns the same `user` and `token` fields plus `message: "Login successful"`. Store the token securely and send it as a bearer token for subsequent requests.

### Current User Response

`GET /api/auth/me` returns:

```json
{
  "user": {
    "id": "1",
    "fullName": "Test Student",
    "email": "student@example.com",
    "role": "student",
    "facultyType": null,
    "createdAt": "2026-09-26T10:00:00.000Z"
  }
}
```

## Health

```bash
curl --location 'http://localhost:5000/health'
```

## Register Student

```bash
curl --location 'http://localhost:5000/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
  "fullName": "Test Student",
  "email": "student@example.com",
  "password": "Password123!",
  "role": "student"
}'
```

## Login

```bash
curl --location 'http://localhost:5000/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "student@example.com",
  "password": "Password123!"
}'
```

Copy the `token` from the login response and replace `YOUR_TOKEN` below. Copy a course `id` from the available courses response and replace `COURSE_ID`.

## Current User

```bash
curl --location 'http://localhost:5000/api/auth/me' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

## Available Courses

```bash
curl --location 'http://localhost:5000/api/students/courses' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

## Register for a Course

```bash
curl --location --request POST 'http://localhost:5000/api/students/courses/COURSE_ID/register' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

## My Courses

```bash
curl --location 'http://localhost:5000/api/students/my-courses' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

## Student Dashboard

```bash
curl --location 'http://localhost:5000/api/students/dashboard' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

## Completed Courses

```bash
curl --location 'http://localhost:5000/api/students/completed-courses' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

## Cancel Course Registration

```bash
curl --location --request DELETE 'http://localhost:5000/api/students/my-courses/COURSE_ID' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

## Testing Order

1. Register Student
2. Login
3. Current User
4. Available Courses
5. Register for a Course
6. My Courses
7. Student Dashboard
8. Completed Courses
9. Cancel Course Registration

## Student Response Contracts

### Course Object

Course listing responses use these fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | number | Course identifier used in URL paths |
| `date` | string | Course date formatted as `DD/MM/YYYY` |
| `name` | string | Course title |
| `type` | string | Course type or skill type |
| `mode` | string | `Online` or `Offline` for student courses |
| `credit` | number | Credits awarded |
| `organizer` | string | Course organizer |
| `available` | number | Remaining seats |
| `details` | string | Course description |

`GET /api/students/courses` returns `{ "courses": [...] }`. It excludes courses in which the current student already has an active registration.

`GET /api/students/my-courses` returns `{ "courses": [...] }` with the same fields plus `status`. Active registrations normally have `status: "Registered"`.

`GET /api/students/completed-courses` returns `{ "courses": [...] }` with `completedOn` instead of `date` and `available`.

### Registration Responses

Successful registration returns:

```json
{
  "message": "Course registered successfully",
  "enrollment": {
    "id": "1",
    "status": "Registered"
  }
}
```

Cancellation returns:

```json
{
  "message": "Course registration cancelled"
}
```

### Student Dashboard Response

`GET /api/students/dashboard` returns:

```json
{
  "dashboard": {
    "completedCourses": 4,
    "totalCredits": 16,
    "enrolledCourses": 5,
    "onlineCourses": 2,
    "offlineCourses": 2,
    "latestCompletedOn": "2026-09-15",
    "completionRate": 80
  }
}
```

`completionRate` is a number from `0` to `100`. An account with no registrations receives `0`.

## Admin API

Register or log in with an account whose role is `admin`, then copy its token and replace `ADMIN_TOKEN` below.

### Admin Dashboard

```bash
curl --location 'http://localhost:5000/api/admin/dashboard' \
--header 'Authorization: Bearer ADMIN_TOKEN'
```

### List Courses

```bash
curl --location 'http://localhost:5000/api/admin/courses' \
--header 'Authorization: Bearer ADMIN_TOKEN'
```

Optional filters use query parameters: `status`, `search`, `mode`, and `category`.

```bash
curl --location 'http://localhost:5000/api/admin/courses?status=Pending&mode=Online' \
--header 'Authorization: Bearer ADMIN_TOKEN'
```

### Create Course

```bash
curl --location 'http://localhost:5000/api/admin/courses' \
--header 'Authorization: Bearer ADMIN_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "AI Technology and Industrial Revolution",
  "code": "VAC-AI-101",
  "type": "Webinar",
  "category": "Artificial Intelligence",
  "mode": "Online",
  "instructor": "Dr. Sarah Connor",
  "department": "Computer Science & Engineering",
  "maxIntake": 60,
  "credits": 2,
  "details": "Webinar explaining industrial integrations with generative AI models.",
  "imageUrl": "https://example.com/course-image.jpg",
  "regStartDate": "2026-08-15",
  "regEndDate": "2026-08-25",
  "startDate": "2026-08-28T10:00:00Z",
  "endDate": "2026-08-29T17:00:00Z",
  "location": "Google Meet / Lab 304"
}'
```

Replace `COURSE_ID` with a course ID from the list response.

### Course Details

```bash
curl --location 'http://localhost:5000/api/admin/courses/COURSE_ID' \
--header 'Authorization: Bearer ADMIN_TOKEN'
```

### Update Course Status

```bash
curl --location --request PATCH 'http://localhost:5000/api/admin/courses/COURSE_ID/status' \
--header 'Authorization: Bearer ADMIN_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "statusText": "Attendance Opened"
}'
```

For rejection feedback:

```bash
curl --location --request PATCH 'http://localhost:5000/api/admin/courses/COURSE_ID/status' \
--header 'Authorization: Bearer ADMIN_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "statusText": "Rejected",
  "rejectionReason": "The syllabus needs additional practical hours."
}'
```

### Registered Student Roster

```bash
curl --location 'http://localhost:5000/api/admin/courses/COURSE_ID/students' \
--header 'Authorization: Bearer ADMIN_TOKEN'
```

Replace `STUDENT_ID` with a student ID from the roster response.

### Update Student Attendance

```bash
curl --location --request PATCH 'http://localhost:5000/api/admin/courses/COURSE_ID/students/STUDENT_ID/attendance' \
--header 'Authorization: Bearer ADMIN_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "status": "Present"
}'
```

The status can be `Present` or `Absent`.

### Mark All Students Present

```bash
curl --location --request POST 'http://localhost:5000/api/admin/courses/COURSE_ID/attendance/mark-all-present' \
--header 'Authorization: Bearer ADMIN_TOKEN'
```

## Admin Integration Reference

### Admin Dashboard Response

`GET /api/admin/dashboard` returns:

```json
{
  "dashboard": {
    "totalCourses": 5,
    "pendingCourses": 2,
    "activeCourses": 2,
    "totalStudents": 224,
    "uniqueInstructors": 5
  }
}
```

### Course List Options

`GET /api/admin/courses` accepts these optional query parameters. Omitted parameters return all courses.

| Parameter | Example | Behavior |
| --- | --- | --- |
| `status` | `Pending` | Case-insensitive match against `statusText` |
| `search` | `AI` | Searches name, code, instructor, department, and category |
| `mode` | `Online` | Exact match: `Online`, `Offline`, or `Hybrid` |
| `category` | `Artificial Intelligence` | Exact category match |

### Admin Course Object

Course detail and list responses use these fields:

| Field | Type | Required when creating | Notes |
| --- | --- | --- | --- |
| `id` | number | No | Generated by the server |
| `name` | string | Yes | Course title |
| `code` | string | Yes | Course code such as `VAC-AI-101` |
| `type` | string | No | Defaults to `Webinar` |
| `category` | string | No | Defaults to `Artificial Intelligence` |
| `mode` | string | No | `Online`, `Offline`, or `Hybrid`; defaults to `Online` |
| `statusText` | string | No | Defaults to `Approval Pending...` |
| `currentStep` | number | No | Lifecycle step, calculated by status updates |
| `imageUrl` | string or null | No | Image URL for the course hero |
| `details` | string | No | Course description; defaults to an empty string |
| `instructor` | string | Yes | Faculty or guest instructor |
| `organizer` | string | No | Uses `instructor` automatically when omitted |
| `department` | string | Yes | Owning department |
| `maxIntake` | number | No | Positive integer; defaults to `60` |
| `registeredCount` | number | No | Calculated from active enrollments |
| `attendedCount` | number | No | Attendance summary value |
| `regStartDate` | string or null | No | ISO date: `YYYY-MM-DD` |
| `regEndDate` | string or null | No | ISO date: `YYYY-MM-DD` |
| `startDate` | string or null | No | ISO timestamp, for example `2026-08-28T10:00:00Z` |
| `endDate` | string or null | No | ISO timestamp |
| `location` | string or null | No | Venue or online platform |
| `credits` | number | No | Positive integer; defaults to `1` |
| `rejectionReason` | string or null | No | Set when a proposal is rejected |

### Status Values

The UI can use these status values with `PATCH /api/admin/courses/:courseId/status`:

| Value | Intended use | Resulting step |
| --- | --- | --- |
| `Approval Pending...` | Waiting for admin review | `1` |
| `Attendance Opened` | Approved and open/active | `3` |
| `Approved` | Approved course | `3` |
| `Rejected` | Proposal rejected | `1` |
| `Course Completed` | Course lifecycle completed | `4` |

The service accepts other text values, but these values keep frontend filters and lifecycle labels consistent. Send `rejectionReason` when using `Rejected`; otherwise it is cleared when omitted.

### Admin Course Detail Response

`GET /api/admin/courses/:courseId` returns `{ "course": { ... } }` using the Admin Course Object fields above.

### Roster Response

`GET /api/admin/courses/:courseId/students` returns `{ "students": [...] }`:

```json
{
  "students": [
    {
      "id": "21",
      "studentName": "Aarav Sharma",
      "rollNo": "21CSE01",
      "department": "Computer Science & Engineering",
      "year": "3rd Year",
      "email": "aarav.s@example.com",
      "registeredDate": "2026-08-20",
      "attendanceStatus": "Present",
      "markedTime": "2026-08-28T10:05:00.000Z"
    }
  ]
}
```

`attendanceStatus` is `Present` or `Absent`. If no attendance record exists, the API returns `Absent`.

### Attendance Options

`PATCH /api/admin/courses/:courseId/students/:studentId/attendance` accepts exactly one body field:

```json
{
  "status": "Present"
}
```

Allowed values are `Present` and `Absent`. The operation is an upsert, so it can be called for both first-time and existing attendance records.

`POST /api/admin/courses/:courseId/attendance/mark-all-present` marks every active enrollment in that course as `Present` and returns:

```json
{
  "message": "All enrolled students marked present",
  "updated": 8
}
```

## Recommended Frontend Integration Flow

1. Register or log in and store the returned JWT.
2. Send the JWT in the `Authorization` header for every protected request.
3. For the admin dashboard, call `/api/admin/dashboard` and `/api/admin/courses` in parallel.
4. Use the returned course `id` when navigating to a course detail page.
5. Load course details and roster with `/api/admin/courses/:courseId` and `/students`.
6. After a status or attendance mutation, refetch the affected detail or roster endpoint so the UI reflects server state.
7. On `401`, clear the session and redirect to login. On `403`, show an access-denied state. On `409`, show the server message without retrying automatically.

## Endpoint Summary

| Method | Endpoint | Role |
| --- | --- | --- |
| `GET` | `/health` | Public |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Any authenticated user |
| `GET` | `/api/students/courses` | Student |
| `POST` | `/api/students/courses/:courseId/register` | Student |
| `GET` | `/api/students/my-courses` | Student |
| `DELETE` | `/api/students/my-courses/:courseId` | Student |
| `GET` | `/api/students/completed-courses` | Student |
| `GET` | `/api/students/dashboard` | Student |
| `GET` | `/api/admin/dashboard` | Admin |
| `GET` | `/api/admin/courses` | Admin |
| `POST` | `/api/admin/courses` | Admin |
| `GET` | `/api/admin/courses/:courseId` | Admin |
| `PATCH` | `/api/admin/courses/:courseId/status` | Admin |
| `GET` | `/api/admin/courses/:courseId/students` | Admin |
| `PATCH` | `/api/admin/courses/:courseId/students/:studentId/attendance` | Admin |
| `POST` | `/api/admin/courses/:courseId/attendance/mark-all-present` | Admin |
