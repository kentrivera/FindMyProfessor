# 🎓 FindMyProfessor - AI-Powered Professor Search System

A complete full-stack web application that allows students to search for professors, view schedules, and interact with an intelligent AI chatbot. Admins can manage professors, schedules, subjects, and file attachments through a comprehensive dashboard.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### 👨‍🎓 Student Features
- **AI Chatbot Assistant** - Natural language queries about professors, schedules, and subjects
- **Professor Directory** - Browse and search all professors by name or department
- **Schedule Viewing** - View class schedules and classroom locations
- **File Downloads** - Access attachments like syllabi, exam files, and announcements
- **Responsive Design** - Mobile-friendly interface built with Tailwind CSS

### 👨‍💼 Admin Features
- **Secure Authentication** - Login system with session management
- **Professor Management** - Full CRUD operations for professor profiles
- **Subject Management** - Create and manage subjects linked to professors
- **Schedule Management** - Add, edit, and delete class schedules
- **File Attachments** - Upload PDFs, DOCs, and images to schedules
- **Activity Logs** - Track all admin actions and modifications
- **Dashboard Analytics** - View statistics and recent activities

### 🤖 AI Chatbot Capabilities
- **Intent Detection** - Understands various types of queries
- **Fuzzy Matching** - Handles misspellings and variations in professor names
- **Natural Responses** - Conversational tone with helpful suggestions
- **Context-Aware** - Provides relevant information based on query type
- **Real-time Data** - Fetches live data from the database

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern UI framework
- **Tailwind CSS 3** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **SweetAlert2** - Beautiful alerts and modals
- **Lucide React** - Icon library

### Backend - PHP API
- **PHP 8+** - RESTful API server
- **MySQL** - Relational database
- **PDO** - Database abstraction layer
- **JWT/Sessions** - Authentication

### Backend - Python AI
- **Flask** - Lightweight Python web framework
- **FuzzyWuzzy** - Fuzzy string matching for names
- **MySQL Connector** - Database connectivity
- **Python-Levenshtein** - String similarity calculations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PHP** (v8.0 or higher) - [Download](https://www.php.net/downloads)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Composer** (PHP package manager) - [Download](https://getcomposer.org/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd find_my_prof
```

### 2. Database Setup

1. Start your MySQL server (XAMPP, WAMP, or standalone)

2. Create the database and import schema:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE findmyprofessor;
USE findmyprofessor;
SOURCE database/schema.sql;
```

Or use phpMyAdmin:
- Open phpMyAdmin
- Create database named `findmyprofessor`
- Import `database/schema.sql`

### 3. Backend Setup - PHP API

1. Navigate to the PHP backend directory:

```bash
cd backend/php
```

2. Configure database connection in `config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'findmyprofessor');
define('DB_USER', 'root');
define('DB_PASS', ''); // Your MySQL password
```

3. Start PHP development server:

```bash
# From backend/php directory
php -S localhost:8000
```

The API will be available at `http://localhost:8000`

### 4. Backend Setup - Python AI Chatbot

1. Navigate to the Python backend directory:

```bash
cd backend/python
```

2. Create a virtual environment:

```bash
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` file (copy from `.env.example`):

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
```

5. Configure `.env` file:

```env
DB_HOST=localhost
DB_NAME=findmyprofessor
DB_USER=root
DB_PASSWORD=

FLASK_PORT=5000
FLASK_DEBUG=True
```

6. Start the Flask server:

```bash
python app.py
```

The chatbot API will be available at `http://localhost:5000`

### 5. Frontend Setup - React

1. Navigate to the root directory:

```bash
cd find_my_prof
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
```

4. Configure `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
VITE_CHATBOT_API_URL=http://localhost:5000
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage Guide

### Default Admin Credentials

```
Username: admin
Password: admin123
```

⚠️ **Important:** Change these credentials in production!

### Accessing the Application

1. **Student View**: `http://localhost:3000/`
   - Browse professors
   - Use AI chatbot
   - View schedules

2. **Admin Login**: `http://localhost:3000/admin/login`
   - Use default credentials
   - Access admin dashboard

### Admin Workflow

1. **Add Professors**
   - Go to Professors page
   - Click "Add Professor"
   - Fill in details (name, department, contact, etc.)

2. **Add Subjects**
   - After creating professors
   - Use the Subjects section
   - Link subjects to professors

3. **Create Schedules**
   - Go to Schedules page
   - Select professor and subject
   - Set day, time, and classroom

4. **Upload Attachments**
   - Go to Attachments page
   - Select a schedule
   - Upload files (PDF, DOC, images)

5. **Monitor Activity**
   - View Logs page
   - Track all admin actions

### Using the AI Chatbot

Click the chat button (💬) in the bottom-right corner and try queries like:

```
"Who teaches Database Systems?"
"Show me Prof. Santos' schedule"
"Where is Dr. Reyes' office?"
"When does Prof. Dela Cruz teach?"
"Find professors in Computer Science"
```

## 📁 Project Structure

```
find_my_prof/
├── backend/
│   ├── php/
│   │   ├── controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ProfessorsController.php
│   │   │   ├── SubjectsController.php
│   │   │   ├── SchedulesController.php
│   │   │   ├── AttachmentsController.php
│   │   │   ├── LogsController.php
│   │   │   └── ChatbotDataController.php
│   │   ├── uploads/
│   │   ├── config.php
│   │   ├── database.php
│   │   └── index.php
│   └── python/
│       ├── app.py
│       ├── chatbot_engine.py
│       ├── database.py
│       └── requirements.txt
├── database/
│   └── schema.sql
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Chatbot.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── UserView.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Professors.jsx
│   │   ├── Schedules.jsx
│   │   ├── Attachments.jsx
│   │   └── Logs.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── chatbot.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔌 API Documentation

### PHP REST API Endpoints

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user

#### Professors
- `GET /api/professors` - Get all professors
- `GET /api/professors/:id` - Get single professor
- `POST /api/professors` - Create professor
- `PUT /api/professors/:id` - Update professor
- `DELETE /api/professors/:id` - Delete professor

#### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get single subject
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

#### Schedules
- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:id` - Get single schedule
- `POST /api/schedules` - Create schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

#### Attachments
- `GET /api/attachments` - Get all attachments
- `POST /api/attachments` - Upload file
- `DELETE /api/attachments/:id` - Delete attachment

#### Logs
- `GET /api/logs` - Get activity logs

### Python Chatbot API Endpoints

- `GET /` - API info
- `POST /chat` - Send message to chatbot
  ```json
  {
    "message": "Who teaches Database?",
    "session_id": "user123"
  }
  ```
- `POST /reload-data` - Reload chatbot data
- `GET /health` - Health check

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Change these values
        500: '#22c55e',
        600: '#16a34a',
        // ...
      },
    },
  },
}
```

### Modify Chatbot Responses

Edit `backend/python/chatbot_engine.py`:

```python
def process_message(self, message, session_id='default'):
    # Customize greeting messages
    if intent == 'greeting':
        return {
            'message': "Your custom greeting here!",
        }
```

## 🔒 Security Notes

For production deployment:

1. **Change default credentials** in the database
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** for all connections
4. **Implement JWT authentication** instead of simple tokens
5. **Add input validation** and sanitization
6. **Set up CORS** properly for your domain
7. **Use prepared statements** (already implemented)
8. **Hash passwords** with bcrypt (already implemented)

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify MySQL is running
- Check credentials in `config.php` and `.env`
- Ensure database exists

**Chatbot Not Responding**
- Check if Python server is running on port 5000
- Verify database connection in Python `.env`
- Check browser console for CORS errors

**File Upload Fails**
- Ensure `uploads/` directory exists
- Check file size limits in `config.php`
- Verify file type is allowed

**CORS Errors**
- Update `ALLOWED_ORIGINS` in PHP `config.php`
- Check Vite proxy settings in `vite.config.js`

## 📦 Building for Production

```bash
# Build frontend
npm run build

# The build files will be in dist/
# Deploy these to your web server
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created as a demonstration of full-stack development with AI integration.

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Flask team for the lightweight Python framework
- FuzzyWuzzy for fuzzy string matching

---

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the documentation
3. Check existing issues on GitHub
4. Create a new issue with detailed information

---

**Happy Coding! 🚀**
