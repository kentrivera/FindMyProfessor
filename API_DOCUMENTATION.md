# FindMyProfessor API Documentation

## Base URLs

- **PHP API**: `http://localhost:8000/api`
- **Python Chatbot API**: `http://localhost:5000`

---

## PHP REST API

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "token": "abc123...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@findmyprof.com",
    "full_name": "System Administrator"
  }
}
```

---

### Professors

#### Get All Professors
```http
GET /api/professors?search=santos&department=Computer Science
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Dr. Maria Santos",
    "department": "Computer Science",
    "contact": "09171234567",
    "email": "maria.santos@university.edu",
    "bio": "PhD in Computer Science...",
    "office_location": "Room 301, Science Building",
    "total_subjects": 3,
    "total_schedules": 6
  }
]
```

#### Create Professor
```http
POST /api/professors
Content-Type: application/json

{
  "name": "Dr. John Doe",
  "department": "Computer Science",
  "contact": "09171234567",
  "email": "john.doe@university.edu",
  "bio": "Expert in AI",
  "office_location": "Room 302"
}
```

---

### Schedules

#### Get All Schedules
```http
GET /api/schedules?professor_id=1&day=Monday
```

**Response**:
```json
[
  {
    "id": 1,
    "professor_id": 1,
    "subject_id": 1,
    "professor_name": "Dr. Maria Santos",
    "subject_code": "CS101",
    "subject_name": "Introduction to Programming",
    "classroom": "Room 101",
    "day": "Monday",
    "time_start": "08:00:00",
    "time_end": "10:00:00",
    "semester": "1st Semester",
    "academic_year": "2024-2025"
  }
]
```

---

## Python Chatbot API

### Send Chat Message
```http
POST /chat
Content-Type: application/json

{
  "message": "Who teaches Database Systems?",
  "session_id": "user123"
}
```

**Response**:
```json
{
  "success": true,
  "response": "📚 **Database Systems** (CS301)\n\nTaught by: **Dr. Anna Reyes**\nDepartment: Computer Science",
  "intent": "subject",
  "data": {...},
  "suggestions": [
    "Show Dr. Anna Reyes's schedule",
    "Find another subject"
  ]
}
```

### Chatbot Intent Types

- `greeting` - Hello, hi, hey
- `professor_info` - General professor information
- `schedule` - Class schedule queries
- `subject` - Subject/course queries
- `classroom` - Location queries
- `contact` - Contact information
- `help` - Help requests
- `unknown` - Unrecognized queries

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message here",
  "success": false
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## Query Parameters

### Pagination
```
?limit=50&offset=0
```

### Search
```
?search=santos
```

### Filters
```
?department=Computer Science
?day=Monday
?professor_id=1
```

---

For complete implementation details, see the source code in `backend/php/controllers/` and `backend/python/`.
