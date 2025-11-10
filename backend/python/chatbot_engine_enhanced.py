from fuzzywuzzy import fuzz, process
import re
from datetime import datetime
from database import DatabaseConnection
from textblob import TextBlob
import os
from typing import Dict, List, Optional
import openai

class EmotionDetector:
    """Detect emotions and sentiment from user messages"""
    
    @staticmethod
    def analyze_sentiment(text: str) -> Dict:
        """Analyze sentiment and emotion of text"""
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity  # -1 to 1
        subjectivity = blob.sentiment.subjectivity  # 0 to 1
        
        # Determine emotion
        if polarity > 0.5:
            emotion = "very_happy"
            emoji = "😊"
        elif polarity > 0.1:
            emotion = "happy"
            emoji = "🙂"
        elif polarity < -0.5:
            emotion = "very_sad"
            emoji = "😢"
        elif polarity < -0.1:
            emotion = "sad"
            emoji = "😕"
        else:
            emotion = "neutral"
            emoji = "😐"
        
        # Check for specific emotions
        text_lower = text.lower()
        if any(word in text_lower for word in ['love', 'loving', 'adore', 'i love you']):
            emotion = "loving"
            emoji = "💕"
        elif any(word in text_lower for word in ['thanks', 'thank you', 'appreciate', 'grateful', 'tysm', 'thx']):
            emotion = "grateful"
            emoji = "🙏"
        elif any(word in text_lower for word in ['sad', 'depressed', 'upset', 'crying', 'unhappy', 'miserable']):
            emotion = "sad"
            emoji = "😢"
        elif any(word in text_lower for word in ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'pissed']):
            emotion = "angry"
            emoji = "😠"
        elif any(word in text_lower for word in ['tired', 'exhausted', 'sleepy', 'fatigue', 'burned out', 'drained']):
            emotion = "tired"
            emoji = "😴"
        elif any(word in text_lower for word in ['stressed', 'stressed out', 'anxious', 'worried', 'nervous', 'overwhelmed']):
            emotion = "stressed"
            emoji = "😰"
        elif any(word in text_lower for word in ['bored', 'boring', 'dull', 'meh']):
            emotion = "bored"
            emoji = "😑"
        elif any(word in text_lower for word in ['excited', 'awesome', 'amazing', 'fantastic', 'wonderful', 'yay', 'woohoo']):
            emotion = "excited"
            emoji = "🤩"
        elif any(word in text_lower for word in ['happy', 'glad', 'joyful', 'cheerful', 'delighted', 'pleased']):
            emotion = "happy"
            emoji = "😊"
        elif any(word in text_lower for word in ['confused', 'lost', "don't understand", 'unclear', 'puzzled']):
            emotion = "confused"
            emoji = "😕"
        elif any(word in text_lower for word in ['help', 'please', 'need', 'urgent', 'asap']):
            emotion = "needy"
            emoji = "🆘"
        elif any(word in text_lower for word in ['great', 'good', 'fine', 'okay', 'alright']):
            emotion = "content"
            emoji = "🙂"
        
        return {
            'polarity': polarity,
            'subjectivity': subjectivity,
            'emotion': emotion,
            'emoji': emoji
        }

class ChatbotEngineEnhanced:
    def __init__(self):
        self.professors_data = []
        self.db = DatabaseConnection()
        self.emotion_detector = EmotionDetector()
        
        # OpenAI API key (optional - for more advanced responses)
        self.use_openai = False
        if os.getenv('OPENAI_API_KEY'):
            openai.api_key = os.getenv('OPENAI_API_KEY')
            self.use_openai = True
        
        self.intents = {
            'greeting': ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo', 'hola', 'greetings'],
            'farewell': ['bye', 'goodbye', 'see you', 'later', 'see ya', 'cya', 'gotta go', 'take care'],
            'thanks': ['thanks', 'thank you', 'appreciate', 'grateful', 'thx', 'ty', 'tysm'],
            'how_are_you': ['how are you', 'how r u', 'how are u', 'whats up', "what's up", 'hows it going', 'how do you do'],
            'feeling_good': ['happy', 'excited', 'great', 'wonderful', 'fantastic', 'amazing', 'awesome', 'love', 'loving'],
            'feeling_bad': ['sad', 'depressed', 'stressed', 'worried', 'anxious', 'frustrated', 'upset', 'angry', 'mad'],
            'feeling_tired': ['tired', 'exhausted', 'sleepy', 'burned out', 'fatigue', 'drained'],
            'feeling_confused': ['confused', 'lost', 'stuck', "don't understand", 'unclear', 'puzzled', 'overwhelmed'],
            'feeling_bored': ['bored', 'boring', 'nothing to do', 'dull'],
            'compliment_bot': ['you are amazing', 'you are awesome', 'you are great', 'good job', 'well done', 'nice', 'smart', 'helpful'],
            'love_declaration': ['i love you', 'love you', 'i like you', 'you are the best'],
            'joke': ['tell me a joke', 'joke', 'make me laugh', 'funny', 'humor'],
            'age': ['how old are you', 'your age', 'when were you born'],
            'name': ['what is your name', 'your name', 'who are you', 'what are you'],
            'capability': ['what can you do', 'your abilities', 'your features'],
            'motivation': ['motivate me', 'inspire me', 'encourage', 'motivation', 'inspiration'],
            'study_tips': ['study tips', 'how to study', 'study advice', 'exam tips', 'study help'],
            'professor_info': ['who is', 'tell me about', 'info about', 'information', 'about'],
            'professor_search': ['find', 'search', 'look for', 'looking for', 'show me'],
            'schedule': ['schedule', 'class', 'when', 'time', 'what time', 'timetable'],
            'subject': ['subject', 'teach', 'teaches', 'teaching', 'course', 'what does'],
            'classroom': ['where', 'room', 'classroom', 'location', 'find'],
            'contact': ['contact', 'email', 'phone', 'reach', 'how to contact'],
            'attachment': ['file', 'attachment', 'document', 'material', 'resource', 'image', 'photo'],
            'help': ['help', 'how', 'what can you do', 'commands', 'assist']
        }
        
        self.load_data()
    
    def load_data(self):
        """Load data from database"""
        results = self.db.fetch_all_data()
        
        # Transform data
        professors_dict = {}
        
        for row in results:
            prof_id = row['professor_id']
            
            if prof_id not in professors_dict:
                professors_dict[prof_id] = {
                    'id': row['professor_id'],
                    'name': row['professor_name'],
                    'department': row['department'],
                    'contact': row['contact'],
                    'email': row['email'],
                    'office_location': row['office_location'],
                    'bio': row['bio'],
                    'image_url': row['image_url'],
                    'subjects': [],
                    'schedules': []
                }
            
            # Add subject
            if row['subject_id']:
                subject_exists = any(s['id'] == row['subject_id'] for s in professors_dict[prof_id]['subjects'])
                if not subject_exists:
                    professors_dict[prof_id]['subjects'].append({
                        'id': row['subject_id'],
                        'code': row['subject_code'],
                        'name': row['subject_name'],
                        'description': row['subject_description'],
                        'units': row['units']
                    })
            
            # Add schedule
            if row['schedule_id']:
                professors_dict[prof_id]['schedules'].append({
                    'id': row['schedule_id'],
                    'subject_code': row['subject_code'],
                    'subject_name': row['subject_name'],
                    'classroom': row['classroom'],
                    'day': row['day'],
                    'time_start': str(row['time_start']) if row['time_start'] else None,
                    'time_end': str(row['time_end']) if row['time_end'] else None,
                    'semester': row['semester'],
                    'academic_year': row['academic_year'],
                    'section': row['section'],
                    'description': row['schedule_description']
                })
        
        self.professors_data = list(professors_dict.values())
        print(f"✅ Loaded {len(self.professors_data)} professors")
    
    def detect_intent(self, message: str) -> str:
        """Detect user intent from message"""
        message_lower = message.lower()
        
        # Check each intent
        intent_scores = {}
        for intent, keywords in self.intents.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            if score > 0:
                intent_scores[intent] = score
        
        if intent_scores:
            # Return intent with highest score
            return max(intent_scores, key=intent_scores.get)
        
        return 'unknown'
    
    def find_professor(self, query: str) -> Optional[Dict]:
        """Find professor using fuzzy matching"""
        if not self.professors_data:
            return None
        
        # Clean query
        query_clean = re.sub(r'\b(prof|professor|dr|doctor|ms|mr|mrs)\b\.?\s*', '', query, flags=re.IGNORECASE).strip()
        
        # Try fuzzy matching on professor names
        professor_names = [p['name'] for p in self.professors_data]
        match = process.extractOne(query_clean, professor_names, scorer=fuzz.token_sort_ratio)
        
        if match and match[1] >= 60:  # 60% similarity threshold
            matched_name = match[0]
            for prof in self.professors_data:
                if prof['name'] == matched_name:
                    return prof
        
        return None
    
    def find_by_subject(self, query: str) -> List[Dict]:
        """Find professor by subject"""
        results = []
        query_lower = query.lower()
        
        for prof in self.professors_data:
            for subject in prof['subjects']:
                if (query_lower in subject['code'].lower() or 
                    query_lower in subject['name'].lower()):
                    results.append({
                        'professor': prof,
                        'subject': subject
                    })
        
        return results
    
    def get_attachments(self, professor_id: int) -> List[Dict]:
        """Get attachments for a professor"""
        return self.db.fetch_attachments(professor_id=professor_id)
    
    def format_schedule_short(self, schedules: List[Dict]) -> str:
        """Format schedule in a short, concise way"""
        if not schedules:
            return "No schedule available."
        
        lines = []
        for sched in schedules[:3]:  # Show only first 3
            time = f"{sched['time_start']}-{sched['time_end']}" if sched['time_start'] else "TBA"
            lines.append(f"📅 {sched['day']} {time} - {sched['subject_code']} @ {sched['classroom']}")
        
        if len(schedules) > 3:
            lines.append(f"...and {len(schedules) - 3} more")
        
        return "\n".join(lines)
    
    def format_response_with_emotion(self, base_message: str, user_emotion: Dict) -> str:
        """Adjust response based on user emotion"""
        emotion = user_emotion['emotion']
        emoji = user_emotion['emoji']
        
        # Add appropriate opening based on emotion
        if emotion in ['very_sad', 'sad']:
            opening = f"I can sense you're feeling down {emoji}. I'm here to help make things easier!\n\n"
        elif emotion == 'angry':
            opening = f"I understand you're frustrated {emoji}. Let's work through this together!\n\n"
        elif emotion == 'tired':
            opening = f"You sound exhausted {emoji}. Let me help you quickly so you can rest!\n\n"
        elif emotion == 'stressed':
            opening = f"Take a deep breath {emoji}. I'll help you sort this out!\n\n"
        elif emotion == 'confused':
            opening = f"No worries, let me clarify things for you {emoji}!\n\n"
        elif emotion == 'bored':
            opening = f"Let's make this interesting {emoji}!\n\n"
        elif emotion in ['grateful', 'thanks']:
            opening = f"You're very welcome! {emoji} Glad I could help!\n\n"
        elif emotion == 'needy':
            opening = f"Don't worry, I'm here to help! {emoji}\n\n"
        elif emotion in ['excited', 'very_happy', 'happy', 'loving']:
            opening = f"Love your energy! {emoji}\n\n"
        elif emotion == 'content':
            opening = f"Great! {emoji}\n\n"
        else:
            opening = ""
        
        return opening + base_message
    
    def generate_short_response(self, intent: str, data: Optional[Dict], user_emotion: Dict) -> Dict:
        """Generate short, concise responses"""
        import random
        
        # Greeting
        if intent == 'greeting':
            greetings = [
                f"Hi there! {user_emotion['emoji']} How can I help you today?",
                f"Hello! {user_emotion['emoji']} What would you like to know?",
                f"Hey! {user_emotion['emoji']} Need info about professors?",
                f"Good to see you! {user_emotion['emoji']} What brings you here today?"
            ]
            message = random.choice(greetings)
            
            return {
                'intent': 'greeting',
                'message': message,
                'suggestions': [
                    "Find a professor",
                    "Search by subject",
                    "View schedules"
                ]
            }
        
        # How are you
        elif intent == 'how_are_you':
            responses = [
                f"I'm doing great, thanks for asking! 😊 I'm here and ready to help you find professors and schedules. How are YOU doing?",
                f"I'm functioning perfectly! 🤖💚 More importantly, how can I help you today?",
                f"I'm excellent! 😄 Always happy to assist students like you. What do you need help with?",
                f"Doing wonderful! ✨ Thanks for asking! Now, what can I help you discover today?"
            ]
            return {
                'intent': 'how_are_you',
                'message': random.choice(responses),
                'suggestions': [
                    "I'm doing great!",
                    "Find a professor",
                    "I need help"
                ]
            }
        
        # Feeling Good
        elif intent == 'feeling_good':
            responses = [
                f"That's wonderful to hear! 😊 Your positive energy is contagious! Now, how can I help make your day even better?",
                f"So happy for you! 🎉 Love to see you in such great spirits! What can I assist you with?",
                f"Awesome! 🌟 Keep that amazing energy! Need help finding a professor or schedule?",
                f"That's fantastic! 💫 Your happiness makes me happy too! What brings you here today?"
            ]
            return {
                'intent': 'feeling_good',
                'message': random.choice(responses),
                'suggestions': [
                    "Find my professor",
                    "View schedules",
                    "Tell me a joke"
                ]
            }
        
        # Feeling Bad
        elif intent == 'feeling_bad':
            responses = [
                f"I'm sorry you're feeling down 😢. Remember, tough times don't last, but tough people do! 💪 How can I help lighten your load?",
                f"Aw, I wish I could give you a hug! 🤗 Let me help you with what you need - sometimes getting things done helps us feel better.",
                f"I hear you 💙. It's okay to have difficult days. Let me assist you so at least one thing goes smoothly today. What do you need?",
                f"Sending virtual support your way! 🌈 You've got this! Now, how can I help make things easier for you?"
            ]
            return {
                'intent': 'feeling_bad',
                'message': random.choice(responses),
                'suggestions': [
                    "Find my professor",
                    "Need motivation",
                    "Tell me something nice"
                ]
            }
        
        # Feeling Tired
        elif intent == 'feeling_tired':
            responses = [
                f"I can tell you're exhausted 😴. Remember to take breaks and rest! Meanwhile, let me help you find what you need quickly so you can relax.",
                f"Hang in there! ☕ Maybe grab some coffee and let me do the searching for you. What are you looking for?",
                f"Rest is important! 💤 Let me handle the heavy lifting. Tell me what you need and I'll find it fast!",
                f"You deserve a break! 🛋️ Let's get your questions answered quickly so you can rest. What do you need help with?"
            ]
            return {
                'intent': 'feeling_tired',
                'message': random.choice(responses),
                'suggestions': [
                    "Find a professor",
                    "Quick search",
                    "Study tips"
                ]
            }
        
        # Feeling Confused
        elif intent == 'feeling_confused':
            responses = [
                f"Don't worry, confusion is just a step before clarity! 🤔➡️💡 Let me help clear things up. What's puzzling you?",
                f"I'm here to help you figure it out! 🧩 No question is too simple. What do you need explained?",
                f"Let's untangle this together! 🎯 Take it one step at a time. What are you confused about?",
                f"Confusion is totally normal! 😊 I'll break things down for you. What can I clarify?"
            ]
            return {
                'intent': 'feeling_confused',
                'message': random.choice(responses),
                'suggestions': [
                    "Help me understand",
                    "What can you do?",
                    "Show me examples"
                ]
            }
        
        # Feeling Bored
        elif intent == 'feeling_bored':
            responses = [
                f"Bored, huh? 😏 Let's fix that! How about exploring some interesting subjects or professors? What catches your interest?",
                f"Perfect timing! Let's discover something new together! 🔍✨ What topic intrigues you?",
                f"Boredom is just creativity waiting to happen! 🎨 Let me help you find something fascinating. Any interests?",
                f"Let's turn that boredom into curiosity! 🚀 Browse professors, subjects, or ask me anything!"
            ]
            return {
                'intent': 'feeling_bored',
                'message': random.choice(responses),
                'suggestions': [
                    "Browse professors",
                    "Tell me a joke",
                    "Surprise me"
                ]
            }
        
        # Compliment to Bot
        elif intent == 'compliment_bot':
            responses = [
                f"Aww, thank you so much! 🥰 You're pretty awesome yourself! Now, how can this amazing bot help you? 😄",
                f"You're making me blush! 😊💕 I really appreciate that! What can I do for you today?",
                f"That's so kind of you! 🌟 You just made my day! Now let's make YOUR day better - what do you need?",
                f"Thank you! 😄 Compliments like yours are why I love my job! How can I assist you?"
            ]
            return {
                'intent': 'compliment_bot',
                'message': random.choice(responses),
                'suggestions': [
                    "Find a professor",
                    "You're welcome!",
                    "Search subjects"
                ]
            }
        
        # Love Declaration
        elif intent == 'love_declaration':
            responses = [
                f"Aww! 💕 While I'm flattered, I'm just an AI, but I love helping you too! 🤖❤️ What can I do for you today?",
                f"You're sweet! 🥰 I care about helping you succeed! Now, what do you need assistance with?",
                f"Love you too, in my own AI way! 😊💙 Let's channel that positive energy - what are you looking for?",
                f"That's adorable! 💖 I'm here for you anytime! Now, how can I help you today?"
            ]
            return {
                'intent': 'love_declaration',
                'message': random.choice(responses),
                'suggestions': [
                    "Help me find something",
                    "Tell me a joke",
                    "You're awesome"
                ]
            }
        
        # Joke
        elif intent == 'joke':
            jokes = [
                f"Why did the professor bring a ladder to class? 🪜\nTo reach the high-level concepts! 😄",
                f"Why don't scientists trust atoms? ⚛️\nBecause they make up everything! 😂",
                f"What did the student say to the professor? 📚\n'I'm in a parallel class!' 😅",
                f"Why did the student eat their homework? 📝\nThe teacher said it was a piece of cake! 🍰😂",
                f"What's a professor's favorite type of music? 🎵\nClass-ical! 😄"
            ]
            return {
                'intent': 'joke',
                'message': random.choice(jokes),
                'suggestions': [
                    "Another joke!",
                    "Find a professor",
                    "That was funny!"
                ]
            }
        
        # Age
        elif intent == 'age':
            responses = [
                f"I'm timeless! ⏰✨ Created to help students like you, and I get better every day! Age is just a number anyway! 😄",
                f"I'm as old as the database I'm connected to! 📊 But in AI years, I'm pretty young and energetic! 🤖",
                f"Let's just say I'm young enough to understand memes and old enough to know my stuff! 😎 How can I help you?"
            ]
            return {
                'intent': 'age',
                'message': random.choice(responses),
                'suggestions': [
                    "What can you do?",
                    "Find a professor",
                    "Tell me more"
                ]
            }
        
        # Name
        elif intent == 'name':
            responses = [
                f"I'm FindMyProf AI! 🤖 Your friendly assistant for all things professors, schedules, and subjects! What's your name?",
                f"You can call me FindMyProf! 😊 I'm here to make your academic life easier! How can I help you today?",
                f"I'm your AI assistant for this platform! 🌟 I help students find professors, schedules, and more! What shall I call you?"
            ]
            return {
                'intent': 'name',
                'message': random.choice(responses),
                'suggestions': [
                    "What can you do?",
                    "Find a professor",
                    "Help me"
                ]
            }
        
        # Capability
        elif intent == 'capability':
            message = f"I'm quite capable! 💪 Here's what I can do:\n\n🔍 Find professors by name\n📚 Search by subject\n📅 Show schedules\n📍 Locate classrooms\n📧 Provide contact info\n📎 Find course materials\n💬 Chat naturally with you!\n\nPlus, I understand emotions and try to respond with empathy! ❤️"
            return {
                'intent': 'capability',
                'message': message,
                'suggestions': [
                    "Find a professor",
                    "Search subjects",
                    "That's cool!"
                ]
            }
        
        # Motivation
        elif intent == 'motivation':
            motivations = [
                f"You've got this! 💪 Every expert was once a beginner. Keep pushing forward! 🌟 Now, what can I help you accomplish today?",
                f"Believe in yourself! 🚀 You're capable of amazing things! Let's tackle your questions one at a time. What do you need?",
                f"Remember: The only way to do great work is to love what you do! ❤️ You're on the right path! How can I help you today?",
                f"Success is not final, failure is not fatal! 💫 Keep going, you're doing great! What are you working on?",
                f"You're stronger than you think! 🦾 Every day is a chance to grow. Let me help you with what you need! 🌱"
            ]
            return {
                'intent': 'motivation',
                'message': random.choice(motivations),
                'suggestions': [
                    "Thank you!",
                    "Find my professor",
                    "I needed that"
                ]
            }
        
        # Study Tips
        elif intent == 'study_tips':
            tips = [
                f"Here are some study tips! 📚✨\n\n1. 📅 Use the Pomodoro Technique (25 min study, 5 min break)\n2. 📝 Take handwritten notes\n3. 🔄 Review within 24 hours\n4. 👥 Study in groups\n5. 🎯 Set specific goals\n\nNow, need help finding professor info or schedules?",
                f"Study smarter, not harder! 🧠💡\n\n✅ Space out your studying\n✅ Test yourself regularly\n✅ Teach someone else\n✅ Get enough sleep\n✅ Stay organized\n\nWhat else can I help with?",
                f"Pro study tips! 📖🌟\n\n• Find a quiet study spot 🤫\n• Eliminate distractions 📵\n• Stay hydrated 💧\n• Take regular breaks 🌿\n• Ask questions! (like right now!) 😊\n\nHow can I assist you today?"
            ]
            return {
                'intent': 'study_tips',
                'message': random.choice(tips),
                'suggestions': [
                    "Thanks for the tips!",
                    "Find my professor",
                    "More tips"
                ]
            }
        
        # Farewell
        elif intent == 'farewell':
            farewells = [
                f"Goodbye! {user_emotion['emoji']} Feel free to ask anytime!",
                f"Take care! 👋 Come back whenever you need help!",
                f"See you later! 😊 Good luck with your studies!",
                f"Bye! 🌟 You've got this! Come back anytime!"
            ]
            return {
                'intent': 'farewell',
                'message': random.choice(farewells),
                'suggestions': []
            }
        
        # Thanks
        elif intent == 'thanks':
            thanks_responses = [
                f"You're welcome! {user_emotion['emoji']} Happy to help!",
                f"Anytime! 😊 That's what I'm here for!",
                f"My pleasure! ✨ Glad I could assist!",
                f"You're very welcome! 💙 Need anything else?"
            ]
            return {
                'intent': 'thanks',
                'message': random.choice(thanks_responses),
                'suggestions': [
                    "Find another professor",
                    "Search by subject"
                ]
            }
        
        # Help
        elif intent == 'help':
            message = f"I can help with:\n\n🔍 Find professors\n📚 Search subjects\n📅 View schedules\n📍 Find locations\n📧 Get contacts\n💬 Just chat!\n\nJust ask naturally! I understand emotions too! ❤️"
            
            return {
                'intent': 'help',
                'message': self.format_response_with_emotion(message, user_emotion),
                'suggestions': [
                    "Find Prof. Santos",
                    "Who teaches Database?",
                    "Show me schedules"
                ]
            }
        
        return None
    
    def process_message(self, message: str, session_id: str = 'default') -> Dict:
        """Process user message and generate response"""
        
        # Detect emotion
        user_emotion = self.emotion_detector.analyze_sentiment(message)
        
        # Detect intent
        intent = self.detect_intent(message)
        
        # Handle simple intents
        simple_response = self.generate_short_response(intent, None, user_emotion)
        if simple_response:
            simple_response['emotion'] = user_emotion
            return simple_response
        
        # Professor-related intents
        if intent in ['professor_info', 'schedule', 'classroom', 'contact', 'professor_search', 'attachment']:
            professor = self.find_professor(message)
            
            if professor:
                # Get attachments
                attachments = self.get_attachments(professor['id'])
                
                # Build response based on intent
                if intent == 'schedule':
                    schedule_info = self.format_schedule_short(professor['schedules'])
                    response_msg = f"📋 **{professor['name']}'s Schedule**\n\n{schedule_info}"
                
                elif intent == 'classroom':
                    if professor['office_location']:
                        response_msg = f"📍 **{professor['name']}**\n\nOffice: {professor['office_location']}"
                    else:
                        response_msg = f"Office location not available for {professor['name']}."
                    
                    if professor['schedules']:
                        classrooms = list(set(s['classroom'] for s in professor['schedules'] if s['classroom']))
                        if classrooms:
                            response_msg += f"\n\n🏫 Classrooms: {', '.join(classrooms[:3])}"
                
                elif intent == 'contact':
                    contact_parts = []
                    if professor['email']:
                        contact_parts.append(f"📧 {professor['email']}")
                    if professor['contact']:
                        contact_parts.append(f"📱 {professor['contact']}")
                    
                    if contact_parts:
                        response_msg = f"📞 **{professor['name']}**\n\n" + "\n".join(contact_parts)
                    else:
                        response_msg = f"No contact info available for {professor['name']}."
                
                elif intent == 'attachment':
                    if attachments:
                        response_msg = f"📎 **{professor['name']}'s Materials** ({len(attachments)})\n\n"
                        for att in attachments[:3]:
                            response_msg += f"• {att['file_name']}"
                            if att.get('subject_name'):
                                response_msg += f" ({att['subject_code']})"
                            response_msg += "\n"
                        
                        if len(attachments) > 3:
                            response_msg += f"\n...and {len(attachments) - 3} more files"
                    else:
                        response_msg = f"No attachments found for {professor['name']}."
                
                else:
                    # General info
                    subjects = ", ".join([s['code'] for s in professor['subjects'][:3]]) if professor['subjects'] else "None"
                    response_msg = f"👨‍🏫 **{professor['name']}**\n\n"
                    response_msg += f"🏛️ {professor['department']}\n"
                    response_msg += f"📚 {subjects}\n"
                    
                    if professor['office_location']:
                        response_msg += f"📍 {professor['office_location']}\n"
                    
                    if professor['email']:
                        response_msg += f"📧 {professor['email']}"
                
                # Add emotion-based opening
                response_msg = self.format_response_with_emotion(response_msg, user_emotion)
                
                return {
                    'intent': intent,
                    'message': response_msg,
                    'data': professor,
                    'attachments': attachments if attachments else None,
                    'image_url': professor.get('image_url'),
                    'emotion': user_emotion,
                    'suggestions': [
                        f"{professor['name']}'s schedule",
                        f"Contact {professor['name']}",
                        "Find another prof"
                    ]
                }
            else:
                message_response = f"Hmm, couldn't find that professor {user_emotion['emoji']}. Try another name?"
                return {
                    'intent': intent,
                    'message': message_response,
                    'emotion': user_emotion,
                    'suggestions': [
                        "List all professors",
                        "Search by subject"
                    ]
                }
        
        # Subject search
        elif intent == 'subject':
            results = self.find_by_subject(message)
            
            if results:
                if len(results) == 1:
                    prof = results[0]['professor']
                    subject = results[0]['subject']
                    response_msg = f"📚 **{subject['name']}** ({subject['code']})\n\n"
                    response_msg += f"👨‍🏫 {prof['name']}\n"
                    response_msg += f"🏛️ {prof['department']}"
                else:
                    response_msg = f"Found {len(results)} professors:\n\n"
                    for i, result in enumerate(results[:3], 1):
                        prof = result['professor']
                        subject = result['subject']
                        response_msg += f"{i}. **{prof['name']}** - {subject['code']}\n"
                    
                    if len(results) > 3:
                        response_msg += f"\n...and {len(results) - 3} more"
                
                response_msg = self.format_response_with_emotion(response_msg, user_emotion)
                
                return {
                    'intent': 'subject',
                    'message': response_msg,
                    'data': results,
                    'emotion': user_emotion,
                    'image_url': results[0]['professor'].get('image_url') if len(results) == 1 else None,
                    'suggestions': [
                        f"{results[0]['professor']['name']}'s schedule" if results else "Search again"
                    ]
                }
            else:
                message_response = f"Couldn't find that subject {user_emotion['emoji']}. Try a different search?"
                return {
                    'intent': 'subject',
                    'message': message_response,
                    'emotion': user_emotion,
                    'suggestions': [
                        "Search by professor",
                        "View all subjects"
                    ]
                }
        
        # Unknown intent
        else:
            message_response = f"Not sure what you're asking {user_emotion['emoji']}. Try:\n\n'Find Prof. [name]'\n'Who teaches [subject]?'\n'Show [prof]'s schedule'"
            
            return {
                'intent': 'unknown',
                'message': message_response,
                'emotion': user_emotion,
                'suggestions': [
                    "Help",
                    "Find a professor",
                    "Search subjects"
                ]
            }
