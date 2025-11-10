# 🎓 FindMyProfessor - AI-Powered Professor Finder

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![PHP](https://img.shields.io/badge/PHP-8.0+-purple.svg)](https://php.net/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)

A comprehensive web application for students to find professors, view schedules, and interact with an AI chatbot. Features include real-time search, schedule management, file attachments, activity logging, and a responsive design with beautiful blue-violet-pink gradient theme.

![FindMyProfessor](https://img.shields.io/badge/Status-Production%20Ready-success)

## ✨ Features

### 🎯 **Core Features**
- **AI Chatbot** - Intelligent assistant with emotion detection and contextual responses
- **Professor Directory** - Search and browse professor profiles with profile images
- **Schedule Management** - View class schedules by day, subject, or professor
- **Subject Library** - Browse available courses with descriptions and prerequisites
- **File Attachments** - Upload and access course materials (PDFs, images, documents)
- **Activity Logs** - Track all system activities with user attribution

### 👥 **User Roles**
- **Students** - Search professors, view schedules, use AI chatbot
- **Admins** - Full CRUD operations on professors, subjects, schedules, attachments

### 🎨 **Design & UX**
- **Responsive Design** - Mobile-first approach, works on devices as small as 300px
- **Modern UI** - Beautiful gradient theme (blue → violet → pink)
- **Smooth Animations** - Typing effects, fade-ins, hover states
- **Dark/Light Elements** - High contrast cards with glassmorphism effects

### 🤖 **AI Capabilities**
- Natural language understanding for queries
- Professor and schedule recommendations
- Emotion detection in user messages
- Dynamic suggestions based on context
- File attachment integration in responses

## 📸 Screenshots

### Landing Page
Beautiful introduction with features showcase and call-to-action.

### Student Dashboard
Browse professors with profile images, departments, and contact information.

### AI Chat Interface
Full-page chat experience with typing animations, professor cards, and schedule tables.

### Admin Dashboard
Statistics, top professors, and recent activity with enhanced gradient design.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **PHP** (v8.0 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kentrivera/FindMyProfessor.git
cd FindMyProfessor
```

2. **Install dependencies**
```bash
npm install
cd backend/node
npm install
cd ../..
```

3. **Setup Database**
```bash
# Import the database schema
mysql -u root -p < database/schema.sql

# Or use the PHP setup script
php backend/php/setup_database.php
```

4. **Configure Environment**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_NAME=findmyprofessor
# DB_USER=root
# DB_PASSWORD=your_password
```

5. **Start the application**
```bash
# Windows
START.bat

# Manual start (3 terminals)
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: PHP API Server
cd backend/php
php -S 0.0.0.0:8000

# Terminal 3: Node.js Chatbot Server
cd backend/node
node chatbot-server.js
```

6. **Access the application**
- Frontend: http://localhost:5173
- Admin Panel: http://localhost:5173/admin/login

### Default Credentials
- **Admin**: `admin` / `admin123`
- **Student**: `user` / `user123`

## 🌐 Network Access

Access from other devices on the same WiFi network:

1. Find your IP address:
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

2. Access from other devices:
```
http://YOUR_IP_ADDRESS:5173
Example: http://192.168.254.103:5173
```

**Firewall Setup (Windows)**
```powershell
New-NetFirewallRule -DisplayName "FindMyProfessor - Vite" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "FindMyProfessor - PHP" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "FindMyProfessor - Node" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

## 📁 Project Structure

```
FindMyProfessor/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── AdminLayout.jsx  # Admin dashboard layout
│   │   ├── Chatbot.jsx      # Floating chatbot widget
│   │   ├── Sidebar.jsx      # Admin navigation sidebar
│   │   └── Navbar.jsx       # Admin navigation bar
│   ├── pages/              # Page components
│   │   ├── Landing.jsx     # Public landing page
│   │   ├── Login.jsx       # Authentication page
│   │   ├── Register.jsx    # User registration
│   │   ├── UserView.jsx    # Student professor browser
│   │   ├── ChatInterface.jsx # Full-page AI chat
│   │   ├── AdminDashboard.jsx # Admin statistics
│   │   └── [Professors|Subjects|Schedules|Attachments|Logs].jsx
│   ├── services/           # API service layer
│   │   ├── api.js         # Backend API calls
│   │   └── chatbot.js     # Chatbot API integration
│   └── contexts/          # React contexts
│       └── SidebarContext.jsx
├── backend/
│   ├── php/               # PHP backend
│   │   ├── controllers/   # Business logic
│   │   │   ├── AuthController.php
│   │   │   ├── ProfessorsController.php
│   │   │   ├── SchedulesController.php
│   │   │   ├── SubjectsController.php
│   │   │   ├── AttachmentsController.php
│   │   │   └── LogsController.php
│   │   ├── database.php   # Database connection
│   │   ├── config.php     # Configuration
│   │   └── uploads/       # File storage
│   ├── node/             # Node.js chatbot server
│   │   ├── chatbot-server.js  # Main server
│   │   └── emotional-intents.js # Intent recognition
│   └── python/           # Python AI (optional)
│       ├── app.py
│       └── chatbot_engine_enhanced.py
├── database/
│   └── schema.sql        # Database structure
├── START.bat             # Windows quick start
└── package.json          # Node.js dependencies
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **SweetAlert2** - Beautiful alerts
- **Lucide React** - Icon library

### Backend
- **PHP 8+** - RESTful API server
- **Node.js** - Chatbot server & static files
- **Express** - Web framework
- **MySQL** - Database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### AI Features
- Intent recognition
- Entity extraction
- Emotion detection
- Natural language processing
- Context awareness

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/login       # User login
POST /api/auth/register    # Student registration
```

### Professors
```
GET    /api/professors               # List all professors
GET    /api/professors/:id           # Get single professor
POST   /api/professors               # Create professor (admin)
PUT    /api/professors/:id           # Update professor (admin)
DELETE /api/professors/:id           # Delete professor (admin)
```

### Schedules
```
GET    /api/schedules               # List all schedules
GET    /api/schedules/:id           # Get single schedule
POST   /api/schedules               # Create schedule (admin)
PUT    /api/schedules/:id           # Update schedule (admin)
DELETE /api/schedules/:id           # Delete schedule (admin)
```

### Subjects
```
GET    /api/subjects               # List all subjects
GET    /api/subjects/:id           # Get single subject
POST   /api/subjects               # Create subject (admin)
PUT    /api/subjects/:id           # Update subject (admin)
DELETE /api/subjects/:id           # Delete subject (admin)
```

### Chatbot
```
POST /chat                         # Send message to AI
GET  /api/chatbot/data            # Get training data
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#2563eb` (blue-600)
- **Primary Violet**: `#7c3aed` (violet-600)
- **Primary Pink**: `#db2777` (pink-600)
- **Background**: Gradient from blue-50 → violet-50 → pink-50
- **Text**: slate-600, slate-700, slate-800, slate-900

### Gradients
```css
/* Main gradient */
bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600

/* Light backgrounds */
bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50

/* Cards & components */
bg-gradient-to-r from-blue-50/50 via-violet-50/50 to-pink-50/50
```

### Responsive Breakpoints
- **xs**: 320px (custom - ultra-small phones)
- **sm**: 640px (mobile)
- **md**: 768px (tablets)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)

## 📱 Mobile Support

The app is fully responsive down to 300px width:
- Adaptive font sizes: `text-[9px]` → `xs:text-[10px]` → `sm:text-sm`
- Flexible layouts: Stack on mobile, grid on desktop
- Touch-friendly buttons: Minimum 44x44px tap targets
- Optimized images: Responsive with proper aspect ratios

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth (24-hour expiry)
- **Password Hashing** - bcrypt with salt rounds
- **Role-Based Access** - Admin/Student permission separation
- **SQL Injection Prevention** - Prepared statements
- **XSS Protection** - Input sanitization
- **CORS Configuration** - Controlled API access
- **Activity Logging** - All actions tracked with user attribution

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Kent Rivera**
- GitHub: [@kentrivera](https://github.com/kentrivera)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- Lucide for the beautiful icons
- SweetAlert2 for elegant alerts
- All contributors and users of this project

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the documentation files in the repository
- Review the QUICKSTART.md for common setup problems

## 🚀 Future Enhancements

- [ ] Email notifications
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] Rating system for professors
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Export schedules to PDF
- [ ] Integration with university systems

---

⭐ If you find this project helpful, please give it a star on GitHub!

🔗 **Repository**: https://github.com/kentrivera/FindMyProfessor.git

Made with ❤️ by Kent Rivera
