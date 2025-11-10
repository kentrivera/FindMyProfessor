# 🧪 Setup Verification Checklist

Use this checklist to verify your FindMyProfessor installation is working correctly.

---

## ✅ Pre-Installation Checks

- [ ] Node.js installed? Run: `node --version` (should be v16+)
- [ ] PHP installed? Run: `php --version` (should be v8.0+)
- [ ] Python installed? Run: `python --version` (should be v3.8+)
- [ ] MySQL running? Check XAMPP/WAMP control panel
- [ ] Project downloaded/cloned to: `C:\Users\PC\Desktop\find_my_prof`

---

## ✅ Database Setup Verification

### Step 1: Database Created
- [ ] Open phpMyAdmin: `http://localhost/phpmyadmin`
- [ ] Database `findmyprofessor` exists in left sidebar
- [ ] Click on database name

### Step 2: Tables Created
Check these 7 tables exist:
- [ ] `admins`
- [ ] `professors`
- [ ] `subjects`
- [ ] `schedules`
- [ ] `attachments`
- [ ] `activity_logs`

### Step 3: Sample Data Loaded
- [ ] Click `professors` table → Browse → Should see 5 professors
- [ ] Click `admins` table → Browse → Should see 1 admin (username: admin)
- [ ] Click `schedules` table → Browse → Should see 13 schedules

**If any table is empty:** Re-import `database/schema.sql`

---

## ✅ PHP Backend Verification

### Step 1: Server Running
```powershell
# Terminal in: backend/php
php -S localhost:8000
```

- [ ] No errors in terminal
- [ ] See: "Development Server (http://localhost:8000) started"

### Step 2: Test API Endpoint
Open browser and visit: `http://localhost:8000/api/professors`

**Expected Result:**
- [ ] JSON data appears (not an error)
- [ ] See professor data with names like "Dr. Maria Santos"

**If you see errors:**
- Check `config.php` database credentials
- Verify MySQL is running
- Check terminal for error messages

---

## ✅ Python Chatbot Verification

### Step 1: Virtual Environment
```powershell
# Terminal in: backend/python
python -m venv venv
venv\Scripts\activate
```

- [ ] Prompt shows `(venv)` prefix
- [ ] No error messages

### Step 2: Dependencies Installed
```powershell
pip install -r requirements.txt
```

- [ ] All packages installed successfully
- [ ] No version conflicts

### Step 3: Server Running
```powershell
python app.py
```

- [ ] See: "🤖 Starting FindMyProfessor AI Chatbot on port 5000..."
- [ ] See: "✅ Loaded X professors into chatbot memory"
- [ ] No error messages

### Step 4: Test Chatbot API
Open browser and visit: `http://localhost:5000/health`

**Expected Result:**
```json
{
  "status": "healthy",
  "professors_loaded": 5
}
```

- [ ] JSON response appears
- [ ] `professors_loaded` is 5 (or more if you added data)

**If errors:**
- Check `.env` file exists in `backend/python`
- Verify database credentials in `.env`
- Check if MySQL is running

---

## ✅ React Frontend Verification

### Step 1: Dependencies Installed
```powershell
# Terminal in: find_my_prof (root)
npm install
```

- [ ] All packages installed
- [ ] No errors or warnings (warnings are OK)

### Step 2: Environment File
- [ ] File `.env` exists in root directory
- [ ] Contains:
  ```
  VITE_API_URL=http://localhost:8000/api
  VITE_CHATBOT_API_URL=http://localhost:5000
  ```

### Step 3: Development Server
```powershell
npm run dev
```

- [ ] See: "Local: http://localhost:3000/"
- [ ] No compilation errors

### Step 4: Open Application
Visit: `http://localhost:3000/`

**Expected Result:**
- [ ] Page loads (no blank screen)
- [ ] See "FindMyProfessor" header
- [ ] See professor cards displayed
- [ ] Search bar is visible
- [ ] Department filter buttons appear
- [ ] Chat button (💬) appears in bottom-right corner

---

## ✅ Student View Testing

### Test 1: Professor Display
- [ ] Professors are shown (not "No professors found")
- [ ] Each professor card shows:
  - Name
  - Department
  - Office location
  - Email

### Test 2: Search Function
- [ ] Type "Santos" in search box
- [ ] Results filter to show only matching professors

### Test 3: Department Filter
- [ ] Click "Computer Science" button
- [ ] Only CS professors are shown

### Test 4: Chatbot Basic
- [ ] Click chat button (💬) in bottom-right
- [ ] Chat window opens
- [ ] See welcome message from bot
- [ ] Input box is ready

---

## ✅ Chatbot Testing

### Test 1: Simple Greeting
Type: `Hello`

**Expected Response:**
- [ ] Bot responds with greeting
- [ ] Suggestions appear below message
- [ ] No error messages

### Test 2: Professor Query
Type: `Who is Dr. Maria Santos?`

**Expected Response:**
- [ ] Bot shows professor information
- [ ] Department displayed
- [ ] Subjects listed
- [ ] Response is formatted nicely

### Test 3: Schedule Query
Type: `Show me Prof Santos schedule`

**Expected Response:**
- [ ] Bot displays schedule
- [ ] Days and times shown
- [ ] Classrooms listed
- [ ] Format: "📅 Monday, 08:00 - 10:00"

### Test 4: Subject Query
Type: `Who teaches Database Systems?`

**Expected Response:**
- [ ] Bot shows professor name
- [ ] Subject code (CS301) mentioned
- [ ] Department shown

### Test 5: Fuzzy Matching
Type: `Prof santus` (intentional misspelling)

**Expected Response:**
- [ ] Bot still finds "Dr. Maria Santos"
- [ ] No "not found" error
- [ ] Shows relevant information

---

## ✅ Admin Panel Testing

### Test 1: Admin Login
Visit: `http://localhost:3000/admin/login`

- [ ] Login page appears
- [ ] Username field visible
- [ ] Password field visible

Enter credentials:
- Username: `admin`
- Password: `admin123`

Click "Login"

**Expected Result:**
- [ ] Success message appears
- [ ] Redirected to dashboard
- [ ] See "Dashboard" title

### Test 2: Dashboard
- [ ] See 4 stat cards (Professors, Schedules, Subjects, Activities)
- [ ] Numbers are displayed (not 0 if you have sample data)
- [ ] Recent Activity section shows logs
- [ ] Navigation bar at top

### Test 3: Professors Page
Click "Professors" in navigation

- [ ] Professor table loads
- [ ] Shows 5 professors (sample data)
- [ ] Search box works
- [ ] "Add Professor" button visible

### Test 4: Create Professor
Click "Add Professor"

- [ ] Modal opens
- [ ] Form fields visible
- [ ] Fill in:
  - Name: "Test Professor"
  - Department: "Test Dept"
  - Email: "test@test.com"
- [ ] Click "Create"
- [ ] Success message appears
- [ ] New professor appears in table

### Test 5: Edit Professor
- [ ] Click edit (✏️) icon on any professor
- [ ] Modal opens with data pre-filled
- [ ] Change name
- [ ] Click "Update"
- [ ] Success message
- [ ] Changes reflected in table

### Test 6: Schedules Page
Click "Schedules" in navigation

- [ ] Schedule table loads
- [ ] Shows schedules with professor names, subjects, times
- [ ] Day filter dropdown works
- [ ] "Add Schedule" button visible

### Test 7: Attachments Page
Click "Attachments" in navigation

- [ ] Attachments grid loads
- [ ] "Upload File" button visible
- [ ] Click upload button
- [ ] Modal opens with schedule dropdown

### Test 8: Activity Logs
Click "Activity Logs" in navigation

- [ ] Logs display in timeline format
- [ ] Shows CREATE, UPDATE, DELETE actions
- [ ] Shows admin username and timestamps
- [ ] Filter dropdowns work

### Test 9: Logout
- [ ] Click "Logout" button
- [ ] Redirected to login page
- [ ] Can't access dashboard without logging in again

---

## ✅ File Upload Testing

### Test 1: Upload File
1. Go to Attachments page
2. Click "Upload File"
3. Select a schedule from dropdown
4. Choose a PDF/image file
5. Add description (optional)
6. Click "Upload"

**Expected:**
- [ ] Success message appears
- [ ] File appears in grid
- [ ] File size shown
- [ ] Download button works

---

## ✅ Cross-Feature Integration

### Test 1: Create Professor → Schedule → Chatbot
1. Create a new professor
2. Create a schedule for that professor
3. Ask chatbot about the professor

**Expected:**
- [ ] Chatbot knows about the new professor
- [ ] Schedule information is current

### Test 2: Update Data → Chatbot Refresh
1. Change a professor's office location
2. Wait 5 seconds
3. Ask chatbot "Where is Prof X's office?"

**Expected:**
- [ ] Chatbot shows updated location

---

## ✅ Responsive Design Testing

### Desktop (1920x1080)
- [ ] All elements visible
- [ ] No horizontal scroll
- [ ] Table columns not cramped

### Tablet (768px width)
Press F12 → Toggle device toolbar → Select iPad

- [ ] Navigation collapses to hamburger menu
- [ ] Cards stack properly
- [ ] Table scrolls horizontally if needed

### Mobile (375px width)
Select iPhone SE

- [ ] Chatbot fits screen
- [ ] All buttons accessible
- [ ] Text readable without zoom

---

## ✅ Error Handling Testing

### Test 1: Invalid Login
- [ ] Enter wrong password
- [ ] See error message
- [ ] Not redirected

### Test 2: Empty Form Submission
- [ ] Try to create professor without name
- [ ] Form validation prevents submission
- [ ] Error message shown

### Test 3: Network Error Simulation
- [ ] Stop PHP server
- [ ] Try to load professors
- [ ] See friendly error message (not crash)

---

## ✅ Performance Checks

### Page Load Speed
- [ ] Homepage loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] Chatbot responds in < 1 second

### Chatbot Response Time
- [ ] Simple queries: < 500ms
- [ ] Complex queries: < 1 second

---

## 🎯 Final Verification

All green? You're ready to go! ✅

**Count your checkmarks:**
- ✅ All checked? **Perfect installation!**
- ⚠️ Some missing? Check troubleshooting in README.md
- ❌ Many failing? Review QUICKSTART.md step-by-step

---

## 🆘 Quick Troubleshooting

**Database connection failed:**
```powershell
# Check MySQL is running
# Verify credentials in config.php
```

**Chatbot not responding:**
```powershell
# Check Python server is running
# Visit http://localhost:5000/health
```

**Blank page:**
```powershell
# Check browser console (F12)
# Verify all servers are running
```

**Port already in use:**
```powershell
# Change ports in config files
# Or stop conflicting applications
```

---

## 📊 Expected Console Output

### PHP Server (Terminal 1)
```
PHP 8.x Development Server (http://localhost:8000) started
```

### Python Server (Terminal 2)
```
🤖 Starting FindMyProfessor AI Chatbot on port 5000...
✅ Loaded 5 professors into chatbot memory
* Running on http://0.0.0.0:5000
```

### React Dev Server (Terminal 3)
```
VITE v5.x.x ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

## ✨ Success Indicators

You'll know everything is working when:

1. ✅ Three terminal windows running without errors
2. ✅ Homepage shows professors
3. ✅ Chatbot responds intelligently
4. ✅ Admin can login and manage data
5. ✅ Files can be uploaded
6. ✅ Activity logs track changes

---

**Happy Testing! 🎉**

If all tests pass, you have a fully functional AI-powered professor search system!
