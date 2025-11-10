# 🎉 FindMyProfessor - Quick Access Guide

## ✅ Database Setup Complete!

Your database has been successfully configured with sample data.

---

## 🔐 Login Credentials

### Admin Access
- **URL:** http://localhost:3000/admin/login
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Full admin panel with CRUD operations

### Student/User Access
- **URL:** http://localhost:3000/admin/login (switch to "Student" tab)
- **Username:** `user`
- **Password:** `user123`
- **Access:** Chat interface and professor search

**Additional Test Users:**
- Username: `student1` / Password: `user123`
- Username: `student2` / Password: `user123`

---

## 🌐 Application URLs

### Frontend
- **User View:** http://localhost:3000
- **AI Chat Interface:** http://localhost:3000/chat
- **Login Page:** http://localhost:3000/admin/login

### Backend APIs
- **PHP API:** http://localhost:8000/api
- **Python Chatbot:** http://localhost:5000 (if Python installed)

---

## 🎯 Features by Role

### 👤 **Student/User Features**
1. **Browse Professors** - View all professors with their details
2. **Search & Filter** - Search by name/department
3. **AI Chat Interface** - Full-screen ChatGPT-like chat
4. **Professor Info** - View contact, office location, subjects taught
5. **Schedules** - See class schedules and rooms

### 👨‍💼 **Admin Features**
1. **Dashboard** - Overview statistics
2. **Manage Professors** - Full CRUD operations
3. **Manage Subjects** - Add/Edit/Delete subjects
4. **Manage Schedules** - Create class schedules
5. **Attachments** - Upload and manage files
6. **Activity Logs** - Track all admin actions

---

## 📊 Sample Data Loaded

✅ **1 Admin User**
- System Administrator account

✅ **3 Student Users**
- Test accounts for student login

✅ **5 Professors**
- Dr. Maria Santos (Computer Science)
- Prof. Juan Dela Cruz (Mathematics)
- Dr. Anna Reyes (Computer Science)
- Prof. Pedro Garcia (Information Technology)
- Dr. Linda Tan (Computer Science)

✅ **9 Subjects**
- CS101: Introduction to Programming
- CS201: Data Structures and Algorithms
- MATH101: Calculus I
- CS301: Database Systems
- IT201: Network Security
- CS401: Machine Learning
- CS302: Web Development
- MATH201: Linear Algebra
- CS402: Data Mining

✅ **13 Class Schedules**
- Complete weekly schedules across multiple classrooms

---

## 🚀 How to Use

### For Students:
1. Go to http://localhost:3000
2. Click **"Chat with AI Assistant"** button (big button in hero section)
3. Or login via **Login → Switch to "Student" tab**
4. Use the chat interface to ask questions like:
   - "Find Dr. Maria Santos' schedule"
   - "What subjects does Prof. Juan teach?"
   - "Show me CS101 schedule"
   - "Where is Room 301?"

### For Admins:
1. Go to http://localhost:3000/admin/login
2. Select **"Admin"** tab
3. Enter: `admin` / `admin123`
4. Access the full admin panel
5. Manage professors, subjects, schedules, and more

---

## 🎨 UI Highlights

### Student Interface (ChatGPT-like)
- ✨ Modern gradient design
- 💬 Full-screen chat interface
- 🤖 Bot avatar with typing indicators
- 💡 Smart suggestion chips
- 📱 Fully responsive
- ⚡ Real-time message streaming

### Admin Panel
- 📊 Clean dashboard
- 📝 CRUD forms with validation
- 🎯 SweetAlert2 confirmations
- 📋 Sortable data tables
- 🔍 Search and filter
- 📎 File upload support

---

## ⚠️ Note About Chatbot

The AI chatbot requires **Python** to be installed. If Python is not available:
- The chat interface will still work
- It will show a connection error message
- All other features work perfectly

To enable chatbot:
1. Install Python from https://python.org
2. Run: `pip install flask flask-cors mysql-connector-python fuzzywuzzy python-Levenshtein`
3. Start chatbot: `python backend/python/app.py`

---

## 🔧 Quick Commands

```powershell
# Start all servers
.\START.bat

# Stop all servers
.\STOP.bat

# Reinstall database
php backend/php/setup_database.php

# Add users table
php backend/php/add_users_table.php
```

---

## 📞 Support

If you encounter any issues:
1. Check that MySQL/XAMPP is running
2. Verify both PHP and React servers are running
3. Check browser console for errors
4. Review backend/php/config.php for database credentials

---

## 🎉 You're All Set!

**Start exploring:** http://localhost:3000

Enjoy using FindMyProfessor! 🚀
