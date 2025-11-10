# 🚀 Quick Start Guide - FindMyProfessor

This guide will get you up and running in **15 minutes**!

## Prerequisites Checklist

- [ ] Node.js installed (v16+)
- [ ] PHP installed (v8.0+)
- [ ] Python installed (v3.8+)
- [ ] MySQL/XAMPP/WAMP running
- [ ] A code editor (VS Code recommended)

---

## Step-by-Step Setup

### ⚡ Step 1: Database (5 minutes)

1. **Start MySQL** (via XAMPP/WAMP or standalone)

2. **Create Database**:
   - Open phpMyAdmin → `http://localhost/phpmyadmin`
   - Click "New" → Name it `findmyprofessor`
   - Click "Import" tab
   - Choose `database/schema.sql` from project folder
   - Click "Go"

✅ Done! Database created with sample data.

---

### ⚡ Step 2: PHP Backend (2 minutes)

1. Open terminal in `backend/php` folder

2. Edit `config.php` if needed (default works for XAMPP):
   ```php
   DB_HOST = 'localhost'
   DB_USER = 'root'
   DB_PASS = ''  // Leave empty for XAMPP
   ```

3. Start PHP server:
   ```powershell
   php -S localhost:8000
   ```

✅ API running at `http://localhost:8000`

---

### ⚡ Step 3: Python Chatbot (3 minutes)

1. Open **new terminal** in `backend/python` folder

2. Create virtual environment:
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env` (no changes needed for default setup)

5. Start Flask server:
   ```powershell
   python app.py
   ```

✅ Chatbot running at `http://localhost:5000`

---

### ⚡ Step 4: React Frontend (5 minutes)

1. Open **new terminal** in project root folder

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Copy `.env.example` to `.env` (defaults are fine)

4. Start development server:
   ```powershell
   npm run dev
   ```

✅ App running at `http://localhost:3000`

---

## 🎉 You're Ready!

Open your browser and visit:

### Student View
**URL**: `http://localhost:3000/`

Try the chatbot:
- "Who teaches Database Systems?"
- "Show me Prof. Santos' schedule"

### Admin Panel
**URL**: `http://localhost:3000/admin/login`

**Credentials**:
- Username: `admin`
- Password: `admin123`

---

## 📝 Quick Test Checklist

- [ ] Student view loads professors
- [ ] Chatbot button appears (bottom-right)
- [ ] Chatbot responds to queries
- [ ] Admin login works
- [ ] Dashboard shows statistics
- [ ] Can create a new professor
- [ ] Can create a schedule
- [ ] Can upload a file

---

## ⚠️ Common Issues

**"Database connection failed"**
- Make sure MySQL is running
- Check username/password in `config.php`

**"Chatbot not responding"**
- Verify Python server is running (Step 3)
- Check console for errors

**"npm install fails"**
- Try: `npm install --legacy-peer-deps`

**Port already in use**
- Change ports in respective config files

---

## 🎯 What's Next?

1. **Explore the Admin Panel**
   - Add your own professors
   - Create real schedules
   - Upload attachments

2. **Test the Chatbot**
   - Try different queries
   - See fuzzy matching in action

3. **Customize**
   - Change colors in `tailwind.config.js`
   - Modify chatbot responses

4. **Deploy**
   - See `DEPLOYMENT.md` for production setup

---

## 💡 Pro Tips

- Keep all 3 terminals open while developing
- Use `Ctrl+C` to stop any server
- Refresh the database with `schema.sql` to reset data
- Check browser console (F12) for frontend errors
- Check terminal output for backend errors

---

## 🆘 Need Help?

1. Check `README.md` for detailed docs
2. Review `API_DOCUMENTATION.md`
3. Open an issue on GitHub

---

**Happy coding! 🚀**
