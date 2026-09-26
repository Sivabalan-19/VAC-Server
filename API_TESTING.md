# VAC API Testing

Start the server before testing:

```bash
npm start
```

Base URL: `http://localhost:5000`

In Postman, use **Import > Raw text** and paste each cURL command separately.

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
