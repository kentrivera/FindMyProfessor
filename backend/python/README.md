# FindMyProfessor AI Chatbot 🤖

Enhanced Python chatbot with AI intelligence, emotion detection, and database integration.

## Features ✨

- 🧠 **AI-Powered Responses** - Intelligent understanding of natural language
- 😊 **Emotion Detection** - Detects user emotions and adjusts responses accordingly
- 📸 **Image Support** - Can display professor images and attachments
- 📎 **File Attachments** - Shows course materials and resources
- 💬 **Short & Concise** - Quick, helpful responses
- 🎯 **Accurate Data** - Real-time database integration
- 🔍 **Fuzzy Search** - Finds professors even with typos

## Installation 📦

### Method 1: Using setup script (Recommended)
```batch
cd backend\python
setup.bat
```

### Method 2: Manual installation
```bash
cd backend/python
pip install -r requirements.txt
python -c "import nltk; nltk.download('punkt')"
```

## Configuration ⚙️

Create a `.env` file in the `backend/python` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=findmyprofessor
DB_USER=root
DB_PASSWORD=your_password

# Flask Configuration
FLASK_PORT=5000
FLASK_DEBUG=True

# OpenAI Configuration (Optional - for advanced AI)
OPENAI_API_KEY=your_openai_key_here
```

## Running the Server 🚀

```bash
cd backend/python
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints 📡

### POST /chat
Send a message to the chatbot

**Request:**
```json
{
  "message": "Who is Prof. Santos?",
  "session_id": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "response": "👨‍🏫 Prof. John Santos\n\n🏛️ Computer Science\n📚 Database Systems, Web Development\n📍 Room 301\n📧 jsantos@university.edu",
  "intent": "professor_info",
  "emotion": {
    "emotion": "neutral",
    "emoji": "😐",
    "polarity": 0.0
  },
  "data": {
    "id": 1,
    "name": "Prof. John Santos",
    ...
  },
  "attachments": [...],
  "image_url": "/uploads/professors/santos.jpg",
  "suggestions": [
    "Prof. Santos's schedule",
    "Contact Prof. Santos",
    "Find another prof"
  ]
}
```

### POST /reload-data
Reload chatbot data from database

### GET /health
Check chatbot health status

## Supported Queries 💬

- **Find Professor**: "Who is Prof. Santos?", "Find Professor Reyes"
- **Schedule**: "What's Prof. Santos' schedule?", "When does Dr. Cruz teach?"
- **Subject**: "Who teaches Database Systems?", "Find CS101 professor"
- **Contact**: "How to contact Prof. Santos?", "Prof. Reyes email"
- **Location**: "Where is Prof. Santos' office?", "Room for Prof. Cruz"
- **Attachments**: "Show Prof. Santos' materials", "Course files"

## Emotion Detection 😊

The chatbot detects emotions and adjusts responses:

- **Happy/Excited** 🤩 - Enthusiastic responses
- **Sad/Confused** 😕 - More supportive and helpful
- **Grateful** 🙏 - Acknowledges thanks warmly
- **Needy** 🆘 - Priority assistance
- **Neutral** 😐 - Standard helpful tone

## Database Schema 📊

The chatbot fetches data from:
- `professors` - Professor information
- `subjects` - Course/subject details
- `schedules` - Class schedules
- `attachments` - Course materials and images

## Technologies Used 🛠️

- **Flask** - Web framework
- **MySQL** - Database
- **TextBlob** - Sentiment analysis
- **FuzzyWuzzy** - Fuzzy string matching
- **NLTK** - Natural language processing
- **OpenAI** - Advanced AI (optional)

## Error Handling ⚠️

The chatbot handles:
- Database connection errors
- Invalid queries
- Missing data
- Typos in names
- Ambiguous requests

## Development 👨‍💻

### Adding New Intents

Edit `chatbot_engine_enhanced.py`:

```python
self.intents = {
    'your_intent': ['keyword1', 'keyword2'],
    ...
}
```

### Customizing Responses

Modify the `generate_short_response()` method in `chatbot_engine_enhanced.py`

### Adding Features

1. Update database queries in `database.py`
2. Add processing logic in `chatbot_engine_enhanced.py`
3. Update API response in `app.py`

## Troubleshooting 🔧

**Database Connection Error:**
- Check `.env` configuration
- Ensure MySQL is running
- Verify database credentials

**NLTK Data Not Found:**
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('brown')"
```

**Port Already in Use:**
Change `FLASK_PORT` in `.env` file

## License 📄

MIT License

## Support 💬

For issues or questions, please contact the development team.
