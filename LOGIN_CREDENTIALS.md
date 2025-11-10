# FindMyProfessor - Login Credentials

## 🔐 Security Enhancements Implemented

### ✅ What's New:
- **JWT Token Authentication** - Secure token-based authentication with 24-hour expiry
- **Session Management** - Secure PHP sessions with httponly cookies
- **Session Fixation Prevention** - Regenerates session ID on login
- **IP Address Validation** - Detects session hijacking attempts
- **Password Hashing** - BCrypt password hashing (industry standard)
- **Activity Logging** - Tracks all admin actions
- **Role-Based Access Control** - Separate admin and user permissions

---

## 👤 Admin Accounts

### Admin Login
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** admin@findmyprof.com
- **Full Name:** System Administrator
- **Access:** Full admin dashboard, manage professors, subjects, schedules

---

## 🎓 Student/User Accounts

### Student 1
- **Username:** `user`
- **Password:** `user123`
- **Email:** user@student.edu
- **Full Name:** John Student
- **Student ID:** 2024-001
- **Access:** View professors, schedules, chat interface

### Student 2
- **Username:** `student1`
- **Password:** `user123`
- **Email:** student1@student.edu
- **Full Name:** Alice Johnson
- **Student ID:** 2024-002
- **Access:** View professors, schedules, chat interface

### Student 3
- **Username:** `student2`
- **Password:** `user123`
- **Email:** student2@student.edu
- **Full Name:** Bob Martinez
- **Student ID:** 2024-003
- **Access:** View professors, schedules, chat interface

---

## 🌐 Application URLs

- **Frontend (React):** http://localhost:3000
- **Backend API (PHP):** http://localhost:8000
- **Admin Dashboard:** http://localhost:3000/admin/dashboard
- **Chat Interface:** http://localhost:3000/chat

---

## 🚀 How to Login

### As Admin:
1. Go to http://localhost:3000/admin/login
2. Toggle to "Admin" mode
3. Enter username: `admin`
4. Enter password: `admin123`
5. Click Login

### As Student:
1. Go to http://localhost:3000
2. Click on login or navigate to login page
3. Toggle to "Student" mode
4. Enter username: `user` (or student1, student2)
5. Enter password: `user123`
6. Click Login

---

## 🔒 Security Features

### Token Expiry
- JWT tokens expire after **24 hours**
- Users will need to login again after expiry

### Session Security
- HttpOnly cookies prevent XSS attacks
- Secure session handling
- IP address validation
- Session regeneration on login

### Password Security
- All passwords are hashed using BCrypt
- Cost factor: 10 (2^10 iterations)
- Never stored in plain text

### Activity Logging (Admin Only)
- All admin actions are logged
- Tracks: Login, CRUD operations
- Stores: IP address, timestamp, details

---

## 🛠️ For Developers

### To Add New Admin:
```php
$password_hash = password_hash('your_password', PASSWORD_BCRYPT);
INSERT INTO admins (username, password_hash, email, full_name) 
VALUES ('newadmin', '$password_hash', 'email@example.com', 'Full Name');
```

### To Add New User:
```php
$password_hash = password_hash('your_password', PASSWORD_BCRYPT);
INSERT INTO users (username, password_hash, email, full_name, student_id) 
VALUES ('newuser', '$password_hash', 'email@example.com', 'Full Name', '2024-004');
```

### To Change Password:
```php
$new_password_hash = password_hash('new_password', PASSWORD_BCRYPT);
UPDATE admins SET password_hash = '$new_password_hash' WHERE username = 'admin';
```

---

## 📊 Database Tables

### admins
- id, username, password_hash, email, full_name
- created_at, last_login

### users
- id, username, password_hash, email, full_name, student_id
- created_at, last_login

### activity_logs
- id, admin_id, action, entity_type, entity_id
- details, ip_address, created_at

---

## ⚠️ Important Notes

1. **Change Default Passwords** - For production, change all default passwords
2. **Update JWT Secret** - Change the JWT secret in `AuthController.php`
3. **Enable HTTPS** - Set `session.cookie_secure = 1` when using HTTPS
4. **Database Backup** - Regularly backup your database
5. **Environment Variables** - Store sensitive data in .env files

---

## 🐛 Troubleshooting

### Can't Login as Admin?
- Check if XAMPP/MySQL is running
- Verify database connection in `config.php`
- Run `php backend/php/check_accounts.php` to verify accounts exist

### Token Expired Error?
- Login again to get a new token
- Check if system time is correct

### Session Hijacking Detected?
- This happens if your IP address changes
- Clear browser cookies and login again
- Or disable IP validation for development

---

**Last Updated:** October 29, 2025
**Version:** 2.0 (Enhanced Security)
