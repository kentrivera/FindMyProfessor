# 🎓 FindMyProfessor - Project Index

**Welcome to FindMyProfessor!** This is your complete guide to navigating the project.

---

## 🚀 Quick Start (Choose Your Path)

### For Developers (First Time Setup)
1. **Read:** [`QUICKSTART.md`](QUICKSTART.md) - 15-minute guided setup
2. **Run:** Double-click `START.bat` (Windows) to launch all servers
3. **Verify:** Follow [`TESTING_CHECKLIST.md`](TESTING_CHECKLIST.md)
4. **Browse:** Open `http://localhost:3000`

### For Users (Already Set Up)
1. **Run:** `START.bat` 
2. **Browse:** `http://localhost:3000`
3. **Login as Admin:** `http://localhost:3000/admin/login` (admin/admin123)

### For Understanding the Project
1. **Start:** [`README.md`](README.md) - Comprehensive documentation
2. **Overview:** [`PROJECT_SUMMARY.md`](PROJECT_SUMMARY.md) - Project statistics
3. **Structure:** [`FOLDER_STRUCTURE.md`](FOLDER_STRUCTURE.md) - File organization

---

## 📚 Documentation Map

| Document | Purpose | Read This If... |
|----------|---------|-----------------|
| **[README.md](README.md)** | Complete guide | You want full documentation |
| **[QUICKSTART.md](QUICKSTART.md)** | Fast setup | You want to run it NOW |
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | API reference | You're building API integrations |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Project overview | You want to understand what was built |
| **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** | Directory guide | You need to find specific files |
| **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** | Verification steps | You want to test everything works |
| **[INDEX.md](INDEX.md)** | This file | You're lost and need directions 😄 |

---

## 🗂️ Project Structure at a Glance

```
find_my_prof/
│
├── 📱 Frontend (React)        → src/
├── 🔧 Backend PHP API         → backend/php/
├── 🤖 Backend Python AI       → backend/python/
├── 🗄️ Database Schema         → database/
├── 📚 Documentation           → *.md files
└── ⚙️ Scripts                 → START.bat, STOP.bat
```

---

## 🎯 Common Tasks

### Starting the Application
```powershell
# Method 1: Automatic (Windows)
START.bat

# Method 2: Manual (3 terminals)
# Terminal 1: cd backend/php && php -S localhost:8000
# Terminal 2: cd backend/python && python app.py
# Terminal 3: npm run dev
```

### Stopping the Application
```powershell
# Method 1: Automatic (Windows)
STOP.bat

# Method 2: Manual
# Close all terminal windows
```

### Resetting the Database
```sql
-- In phpMyAdmin or MySQL CLI
DROP DATABASE findmyprofessor;
CREATE DATABASE findmyprofessor;
USE findmyprofessor;
SOURCE database/schema.sql;
```

### Adding a New Professor (Admin)
1. Login to admin panel
2. Navigate to Professors
3. Click "Add Professor"
4. Fill in details
5. Save

### Testing the Chatbot
1. Open student view
2. Click chat button (bottom-right)
3. Try: "Who teaches Database Systems?"

---

## 🔍 Finding Specific Code

### "Where is the code for...?"

| Feature | Location |
|---------|----------|
| **Login page** | `src/pages/Login.jsx` |
| **Chatbot widget** | `src/components/Chatbot.jsx` |
| **Chatbot AI logic** | `backend/python/chatbot_engine.py` |
| **Professor API** | `backend/php/controllers/ProfessorsController.php` |
| **Database schema** | `database/schema.sql` |
| **API client** | `src/services/api.js` |
| **Admin dashboard** | `src/pages/AdminDashboard.jsx` |
| **Tailwind config** | `tailwind.config.js` |

---

## 🎨 Customization Guide

### Change Colors
**File:** `tailwind.config.js`
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#22c55e',  // Change this
        600: '#16a34a',  // And this
      },
    },
  },
}
```

### Modify Chatbot Greeting
**File:** `backend/python/chatbot_engine.py`
```python
# Line ~120
if intent == 'greeting':
    return {
        'message': "Your custom greeting here!",
    }
```

### Change API URLs
**File:** `.env` (root directory)
```env
VITE_API_URL=http://localhost:8000/api
VITE_CHATBOT_API_URL=http://localhost:5000
```

### Add New Database Table
1. Edit `database/schema.sql`
2. Add CREATE TABLE statement
3. Re-import in phpMyAdmin

---

## 🐛 Troubleshooting Quick Reference

### Issue: Database connection failed
**Solution:**
1. Check MySQL is running
2. Verify credentials in `backend/php/config.php`
3. Ensure database exists

### Issue: Chatbot not responding
**Solution:**
1. Check `http://localhost:5000/health`
2. Verify Python server is running
3. Check browser console for errors

### Issue: Blank page
**Solution:**
1. Open browser console (F12)
2. Check all 3 servers are running
3. Verify .env file exists

### Issue: Port already in use
**Solution:**
1. Run `STOP.bat`
2. Or change ports in config files

**Full troubleshooting:** See [README.md - Troubleshooting Section](README.md#🐛-troubleshooting)

---

## 📊 Project Statistics

- **Total Files:** 40+
- **Lines of Code:** 4,500+
- **API Endpoints:** 32
- **Database Tables:** 7
- **React Components:** 9
- **Technologies:** 8 (React, PHP, Python, MySQL, etc.)

**Details:** See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 🎓 Learning Resources

### Understanding the Stack

**React:**
- Components in `src/components/` and `src/pages/`
- Learn: [React Docs](https://react.dev)

**PHP:**
- Controllers in `backend/php/controllers/`
- Learn: [PHP Tutorial](https://www.php.net/manual/en/tutorial.php)

**Python/Flask:**
- Main code in `backend/python/`
- Learn: [Flask Quickstart](https://flask.palletsprojects.com/)

**MySQL:**
- Schema in `database/schema.sql`
- Learn: [MySQL Tutorial](https://dev.mysql.com/doc/)

**Tailwind CSS:**
- Config in `tailwind.config.js`
- Learn: [Tailwind Docs](https://tailwindcss.com/docs)

---

## 🚀 Next Steps After Setup

### For Learning
1. ✅ Follow QUICKSTART.md
2. ✅ Complete TESTING_CHECKLIST.md
3. ✅ Read through code files
4. ✅ Try modifying UI components
5. ✅ Experiment with chatbot responses

### For Development
1. ✅ Set up version control (git)
2. ✅ Create a development branch
3. ✅ Add your own features
4. ✅ Test thoroughly
5. ✅ Deploy to production

### For Production Deployment
1. ✅ Change default passwords
2. ✅ Use environment variables
3. ✅ Enable HTTPS
4. ✅ Set up proper CORS
5. ✅ Configure for your hosting

---

## 📞 Getting Help

### Documentation
1. Check this INDEX.md (you're here!)
2. Read the specific guide you need
3. Follow step-by-step instructions

### Common Questions
- **"How do I start?"** → QUICKSTART.md
- **"What does this do?"** → PROJECT_SUMMARY.md
- **"Where is X file?"** → FOLDER_STRUCTURE.md
- **"How do I test?"** → TESTING_CHECKLIST.md
- **"What are the APIs?"** → API_DOCUMENTATION.md

### Still Stuck?
1. Check TESTING_CHECKLIST.md for verification
2. Review README.md troubleshooting section
3. Check server terminal outputs for errors
4. Verify all prerequisites are installed

---

## ✨ Feature Highlights

### For Students
- 🔍 **Search** professors by name/department
- 💬 **AI Chatbot** for natural language queries
- 📅 **View Schedules** with classroom info
- 📄 **Download Files** (syllabi, materials)

### For Admins
- 👥 **Manage Professors** - Full CRUD
- 📚 **Manage Subjects** - Link to professors
- 📅 **Manage Schedules** - Create timetables
- 📎 **Upload Files** - Attach documents
- 📊 **View Analytics** - Dashboard stats
- 📝 **Activity Logs** - Audit trail

### For Developers
- ✅ **RESTful API** - Well-structured endpoints
- ✅ **Component-Based UI** - Reusable React components
- ✅ **AI Integration** - Python chatbot with NLP
- ✅ **Database-Driven** - MySQL with proper relations
- ✅ **Documented Code** - Comments and guides

---

## 🎯 Project Goals Achieved

✅ **Full-Stack Application** - Frontend, Backend, Database
✅ **AI Integration** - Intelligent chatbot with fuzzy matching
✅ **Admin Panel** - Complete management system
✅ **User Interface** - Clean, responsive design
✅ **Documentation** - Comprehensive guides
✅ **Production-Ready** - Follows best practices

---

## 📝 Quick Command Reference

```powershell
# Start everything
START.bat

# Stop everything
STOP.bat

# Install frontend dependencies
npm install

# Install Python dependencies
cd backend/python
pip install -r requirements.txt

# Build for production
npm run build

# Run database script
mysql -u root -p < database/schema.sql
```

---

## 🎨 Project Highlights

### What Makes This Special?

1. **Complete Solution** - Not just one part, the whole system
2. **AI-Powered** - Real NLP, not just keyword matching
3. **Professional UI** - Modern design with Tailwind CSS
4. **Well-Documented** - 6 comprehensive guides
5. **Easy Setup** - One-click startup script
6. **Production-Ready** - Security and best practices
7. **Beginner-Friendly** - Clear docs and examples

---

## 🏆 Success Checklist

- [ ] All servers start without errors
- [ ] Student view displays professors
- [ ] Chatbot responds intelligently
- [ ] Admin can login
- [ ] CRUD operations work
- [ ] Files can be uploaded
- [ ] Activity logs track changes

**All checked?** Congratulations! You have a fully working application! 🎉

---

## 📖 Documentation Quick Links

- **[📘 Complete Guide](README.md)** - Everything you need to know
- **[⚡ Quick Start](QUICKSTART.md)** - Get running in 15 minutes
- **[🔌 API Docs](API_DOCUMENTATION.md)** - Endpoint reference
- **[📊 Project Summary](PROJECT_SUMMARY.md)** - Overview & stats
- **[📁 Folder Guide](FOLDER_STRUCTURE.md)** - File organization
- **[✅ Testing Guide](TESTING_CHECKLIST.md)** - Verification steps

---

## 🎉 You're All Set!

This project is ready to:
- ✅ Run locally for development
- ✅ Be customized for your needs
- ✅ Be deployed to production
- ✅ Serve as a learning resource
- ✅ Be extended with new features

**Ready to start?** Run `START.bat` and visit `http://localhost:3000`

**Need help?** Choose the right documentation above.

**Want to learn?** Read through the code files in order.

---

**Happy Coding! 🚀**

*Last Updated: October 29, 2025*
