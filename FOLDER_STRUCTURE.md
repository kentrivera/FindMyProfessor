# 📁 FindMyProfessor - Complete Folder Structure

```
find_my_prof/
│
├── 📱 FRONTEND (React + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                 # Admin navigation bar
│   │   │   └── Chatbot.jsx                # AI chatbot widget
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx                  # Admin login page
│   │   │   ├── UserView.jsx               # Student interface
│   │   │   ├── AdminDashboard.jsx         # Dashboard with analytics
│   │   │   ├── Professors.jsx             # Professor CRUD management
│   │   │   ├── Schedules.jsx              # Schedule management
│   │   │   ├── Attachments.jsx            # File upload/management
│   │   │   └── Logs.jsx                   # Activity logs viewer
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                     # PHP API client (Axios)
│   │   │   └── chatbot.js                 # Python chatbot API client
│   │   │
│   │   ├── App.jsx                        # Main app component with routing
│   │   ├── main.jsx                       # React entry point
│   │   └── index.css                      # Tailwind + custom styles
│   │
│   ├── public/                            # Static assets
│   ├── index.html                         # HTML template
│   ├── package.json                       # NPM dependencies
│   ├── vite.config.js                     # Vite build config
│   ├── tailwind.config.js                 # Tailwind theme config
│   ├── postcss.config.js                  # PostCSS config
│   ├── .env                               # Environment variables
│   └── .env.example                       # Environment template
│
├── 🔧 BACKEND - PHP REST API
│   └── backend/php/
│       ├── controllers/
│       │   ├── AuthController.php         # Login/logout/session
│       │   ├── ProfessorsController.php   # Professor CRUD
│       │   ├── SubjectsController.php     # Subject CRUD
│       │   ├── SchedulesController.php    # Schedule CRUD
│       │   ├── AttachmentsController.php  # File upload/delete
│       │   ├── LogsController.php         # Activity logs retrieval
│       │   └── ChatbotDataController.php  # Data feed for AI
│       │
│       ├── uploads/                       # File storage directory
│       │   └── .gitkeep
│       │
│       ├── config.php                     # Database & app configuration
│       ├── database.php                   # PDO database connection
│       └── index.php                      # API router & entry point
│
├── 🤖 BACKEND - Python AI Chatbot
│   └── backend/python/
│       ├── app.py                         # Flask application
│       ├── chatbot_engine.py              # NLP & intent detection
│       ├── database.py                    # MySQL connector
│       ├── requirements.txt               # Python dependencies
│       ├── .env                           # Environment variables
│       └── .env.example                   # Environment template
│
├── 🗄️ DATABASE
│   └── database/
│       └── schema.sql                     # Complete MySQL schema + sample data
│
├── 📚 DOCUMENTATION
│   ├── README.md                          # Main documentation (comprehensive)
│   ├── QUICKSTART.md                      # 15-minute setup guide
│   ├── API_DOCUMENTATION.md               # API endpoint reference
│   ├── PROJECT_SUMMARY.md                 # Project overview & stats
│   └── FOLDER_STRUCTURE.md                # This file
│
└── ⚙️ CONFIGURATION
    ├── .gitignore                         # Git exclusions
    ├── .env.example                       # Frontend env template
    └── package.json                       # Project metadata

```

---

## 📊 File Count Summary

| Category                  | Files | Purpose                           |
|---------------------------|-------|-----------------------------------|
| React Components          | 9     | UI components and pages           |
| PHP Controllers           | 7     | Backend API logic                 |
| Python Chatbot            | 3     | AI chatbot engine                 |
| Service/API Clients       | 2     | Frontend API communication        |
| Configuration Files       | 7     | Build, theme, environment setup   |
| Documentation             | 5     | Guides and references             |
| Database Schema           | 1     | MySQL structure and sample data   |
| **TOTAL**                 | **34+** | Complete web application        |

---

## 🎯 Key Directories Explained

### `/src` - React Frontend
All client-side code including components, pages, and services.

**Why this structure?**
- Separates concerns (components, pages, services)
- Easy to navigate and maintain
- Scalable for future features

### `/backend/php` - REST API
PHP backend following MVC-inspired architecture with controllers.

**Why this structure?**
- Controller-based routing
- Separation of concerns
- Easy to add new endpoints

### `/backend/python` - AI Chatbot
Flask-based AI chatbot with NLP capabilities.

**Why this structure?**
- Microservice architecture
- Independent deployment
- Focused responsibility (AI only)

### `/database` - Schema & Data
MySQL database structure and sample data.

**Why separate?**
- Version control for schema
- Easy database setup
- Portable sample data

---

## 🔄 Data Flow

```
┌─────────────┐
│   Student   │
│  (Browser)  │
└──────┬──────┘
       │
       ├─────────────► React Frontend (Port 3000)
       │                     │
       │                     ├──► PHP API (Port 8000)
       │                     │         │
       │                     │         └──► MySQL Database
       │                     │
       │                     └──► Python Chatbot (Port 5000)
       │                                   │
       │                                   └──► MySQL Database
       │
┌──────▼──────┐
│   Admin     │
│ (Dashboard) │
└─────────────┘
```

---

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────┐
│     PRESENTATION LAYER              │
│  (React + Tailwind Components)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     APPLICATION LAYER               │
│  (API Services + State Management)  │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼─────┐   ┌──────▼──────┐
│  PHP API   │   │  Python AI  │
│ (Business  │   │  (Chatbot   │
│   Logic)   │   │   Engine)   │
└──────┬─────┘   └──────┬──────┘
       │                │
       └────────┬────────┘
                │
┌───────────────▼──────────────┐
│      DATA LAYER              │
│   (MySQL Database)           │
└──────────────────────────────┘
```

---

## 📦 Module Dependencies

### Frontend Dependencies
```
React Application
├── react-router-dom (routing)
├── axios (HTTP client)
├── sweetalert2 (alerts)
└── lucide-react (icons)
```

### Backend Dependencies
```
PHP API
└── PDO (MySQL)

Python Chatbot
├── Flask (web framework)
├── Flask-CORS (cross-origin)
├── FuzzyWuzzy (fuzzy matching)
└── MySQL Connector (database)
```

---

## 🚀 Startup Order

For development, start in this order:

1. **MySQL Server** (XAMPP/standalone)
2. **PHP API** (`backend/php`)
   ```bash
   php -S localhost:8000
   ```
3. **Python Chatbot** (`backend/python`)
   ```bash
   python app.py
   ```
4. **React Frontend** (root directory)
   ```bash
   npm run dev
   ```

---

## 📝 Configuration Files Map

| File                    | Purpose                              | Location      |
|-------------------------|--------------------------------------|---------------|
| `package.json`          | NPM dependencies & scripts           | Root          |
| `vite.config.js`        | Build tool configuration             | Root          |
| `tailwind.config.js`    | Design system theme                  | Root          |
| `.env`                  | Frontend environment vars            | Root          |
| `config.php`            | PHP database & app config            | backend/php   |
| `.env`                  | Python chatbot config                | backend/python|
| `requirements.txt`      | Python dependencies                  | backend/python|

---

## 🎨 Asset Organization

```
Frontend Assets:
├── Icons: lucide-react (component library)
├── Styles: Tailwind CSS (utility classes)
└── Uploads: backend/php/uploads/

Backend Storage:
└── File Uploads: backend/php/uploads/
    ├── PDFs
    ├── Documents
    └── Images
```

---

## 🔐 Security Files

- **`.gitignore`** - Excludes sensitive files from Git
- **`.env`** - Contains environment secrets (not in Git)
- **`config.php`** - Database credentials (update for production)

---

## 📖 Documentation Map

1. **README.md** - Start here! Complete guide
2. **QUICKSTART.md** - Fast 15-minute setup
3. **API_DOCUMENTATION.md** - API reference
4. **PROJECT_SUMMARY.md** - Project overview
5. **FOLDER_STRUCTURE.md** - This file

---

## 🎯 Quick Navigation Tips

**Need to modify...**

- **UI/Design?** → `src/components/` or `src/pages/`
- **API Logic?** → `backend/php/controllers/`
- **Chatbot?** → `backend/python/chatbot_engine.py`
- **Database?** → `database/schema.sql`
- **Colors?** → `tailwind.config.js`
- **API URLs?** → `.env` files

---

**This structure is designed for:**
✅ Easy navigation
✅ Clear separation of concerns
✅ Scalability
✅ Maintainability
✅ Team collaboration

---

*Generated: October 29, 2025*
