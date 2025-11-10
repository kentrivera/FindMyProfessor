/**
 * Emotional Intents Handler
 * Handles conversational and emotional responses for the chatbot
 */

// Enhanced emotion detection
function detectEmotionEnhanced(text) {
  const lowerText = text.toLowerCase();
  
  const emotions = {
    loving: { 
      keywords: ['love', 'loving', 'adore', 'i love you', 'love you'], 
      emoji: '💕', 
      polarity: 0.9 
    },
    grateful: { 
      keywords: ['thanks', 'thank you', 'appreciate', 'grateful', 'tysm', 'thx', 'ty'], 
      emoji: '🙏', 
      polarity: 0.7 
    },
    sad: { 
      keywords: ['sad', 'depressed', 'upset', 'crying', 'unhappy', 'miserable', 'down'], 
      emoji: '😢', 
      polarity: -0.6 
    },
    angry: { 
      keywords: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'pissed', 'frustrated'], 
      emoji: '😠', 
      polarity: -0.5 
    },
    tired: { 
      keywords: ['tired', 'exhausted', 'sleepy', 'fatigue', 'burned out', 'drained', 'weary'], 
      emoji: '😴', 
      polarity: -0.3 
    },
    stressed: { 
      keywords: ['stressed', 'stressed out', 'anxious', 'worried', 'nervous', 'overwhelmed', 'panic'], 
      emoji: '😰', 
      polarity: -0.4 
    },
    bored: { 
      keywords: ['bored', 'boring', 'dull', 'meh', 'uninteresting'], 
      emoji: '😑', 
      polarity: -0.2 
    },
    excited: { 
      keywords: ['excited', 'awesome', 'amazing', 'fantastic', 'wonderful', 'yay', 'woohoo', 'cool'], 
      emoji: '🤩', 
      polarity: 0.8 
    },
    happy: { 
      keywords: ['happy', 'glad', 'joyful', 'cheerful', 'delighted', 'pleased', 'great'], 
      emoji: '😊', 
      polarity: 0.6 
    },
    confused: { 
      keywords: ['confused', 'lost', "don't understand", "dont understand", 'unclear', 'puzzled', 'what'], 
      emoji: '😕', 
      polarity: -0.3 
    },
    needy: { 
      keywords: ['help', 'please', 'need', 'urgent', 'asap', 'emergency'], 
      emoji: '🆘', 
      polarity: -0.2 
    },
    content: { 
      keywords: ['fine', 'okay', 'alright', 'ok', 'good'], 
      emoji: '🙂', 
      polarity: 0.3 
    },
    neutral: { 
      keywords: [], 
      emoji: '😐', 
      polarity: 0 
    }
  };

  // Check for emotion keywords
  for (const [emotion, data] of Object.entries(emotions)) {
    if (data.keywords.some(keyword => lowerText.includes(keyword))) {
      return {
        emotion,
        emoji: data.emoji,
        polarity: data.polarity,
        subjectivity: 0.5
      };
    }
  }

  return emotions.neutral;
}

// Detect emotional intents
function detectEmotionalIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  const emotionalIntents = {
    how_are_you: ['how are you', 'how r u', 'how are u', 'whats up', "what's up", 'hows it going', 'how do you do'],
    feeling_good: ['i\'m happy', 'im happy', 'i\'m excited', 'im excited', 'i\'m great', 'im great', 'feeling wonderful', 'feeling fantastic', 'feeling amazing', 'feeling great', 'i feel awesome', 'i feel great', 'i feel happy'],
    feeling_bad: ['i\'m sad', 'im sad', 'i\'m depressed', 'im depressed', 'i\'m stressed', 'im stressed', 'feeling sad', 'feeling worried', 'feeling anxious', 'feeling down', 'feeling bad', 'i\'m frustrated', 'im frustrated', 'i\'m upset', 'im upset', 'i feel sad', 'i feel bad', 'i feel down'],
    feeling_tired: ['i\'m tired', 'im tired', 'i\'m exhausted', 'im exhausted', 'i\'m sleepy', 'im sleepy', 'feeling tired', 'feeling burned out', 'feeling exhausted', 'so tired', 'very tired', 'i feel tired'],
    feeling_confused: ['i\'m confused', 'im confused', 'i\'m lost', 'im lost', 'i\'m stuck', 'im stuck', "i don't understand", "i dont understand", 'feeling confused', 'feeling unclear', 'feeling puzzled', 'feeling lost', 'i feel confused'],
    feeling_bored: ['i\'m bored', 'im bored', 'this is boring', 'feeling bored', 'nothing to do', 'so bored', 'i feel bored'],
    compliment_bot: ['you are amazing', 'youre amazing', 'you are awesome', 'youre awesome', 'you are great', 'youre great', 'good job', 'well done', 'you\'re nice', 'youre nice', 'you\'re smart', 'youre smart', 'you\'re helpful', 'youre helpful', 'you\'re the best', 'youre the best'],
    love_declaration: ['i love you', 'love you', 'i like you', 'you are the best', 'you\'re the best', 'youre the best'],
    joke: ['tell me a joke', 'tell a joke', 'make me laugh', 'say something funny', 'be funny', 'another joke'],
    age: ['how old are you', 'your age', 'when were you born', 'what\'s your age', 'whats your age'],
    name: ['what is your name', 'your name', 'who are you', 'what are you called', 'whats your name'],
    capability: ['what can you do', 'your abilities', 'your features', 'what do you know', 'tell me what you can do'],
    motivation: ['motivate me', 'inspire me', 'encourage me', 'i need motivation', 'give me inspiration', 'i need encouragement'],
    study_tips: ['study tips', 'how to study', 'study advice', 'exam tips', 'study help', 'how do i study', 'help me study']
  };

  for (const [intent, patterns] of Object.entries(emotionalIntents)) {
    if (patterns.some(pattern => lowerMsg.includes(pattern))) {
      return intent;
    }
  }

  return null;
}

// Random response picker
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate emotional responses
function generateEmotionalResponse(intent, emotion) {
  const emoji = emotion.emoji;
  let response = '';
  let suggestions = [];

  switch (intent) {
    case 'how_are_you':
      response = pickRandom([
        `I'm doing great, thanks for asking! 😊 I'm here and ready to help you find professors and schedules. How are YOU doing?`,
        `I'm functioning perfectly! 🤖💚 More importantly, how can I help you today?`,
        `I'm excellent! 😄 Always happy to assist students like you. What do you need help with?`,
        `Doing wonderful! ✨ Thanks for asking! Now, what can I help you discover today?`
      ]);
      suggestions = ["I'm doing great!", "Find a professor", "I need help"];
      break;

    case 'feeling_good':
      response = pickRandom([
        `That's wonderful to hear! 😊 Your positive energy is contagious! Now, how can I help make your day even better?`,
        `So happy for you! 🎉 Love to see you in such great spirits! What can I assist you with?`,
        `Awesome! 🌟 Keep that amazing energy! Need help finding a professor or schedule?`,
        `That's fantastic! 💫 Your happiness makes me happy too! What brings you here today?`
      ]);
      suggestions = ["Find my professor", "View schedules", "Tell me a joke"];
      break;

    case 'feeling_bad':
      response = pickRandom([
        `I'm sorry you're feeling down 😢. Remember, tough times don't last, but tough people do! 💪 How can I help lighten your load?`,
        `Aw, I wish I could give you a hug! 🤗 Let me help you with what you need - sometimes getting things done helps us feel better.`,
        `I hear you 💙. It's okay to have difficult days. Let me assist you so at least one thing goes smoothly today. What do you need?`,
        `Sending virtual support your way! 🌈 You've got this! Now, how can I help make things easier for you?`
      ]);
      suggestions = ["Find my professor", "Need motivation", "Tell me something nice"];
      break;

    case 'feeling_tired':
      response = pickRandom([
        `I can tell you're exhausted 😴. Remember to take breaks and rest! Meanwhile, let me help you find what you need quickly so you can relax.`,
        `Hang in there! ☕ Maybe grab some coffee and let me do the searching for you. What are you looking for?`,
        `Rest is important! 💤 Let me handle the heavy lifting. Tell me what you need and I'll find it fast!`,
        `You deserve a break! 🛋️ Let's get your questions answered quickly so you can rest. What do you need help with?`
      ]);
      suggestions = ["Find a professor", "Quick search", "Study tips"];
      break;

    case 'feeling_confused':
      response = pickRandom([
        `Don't worry, confusion is just a step before clarity! 🤔➡️💡 Let me help clear things up. What's puzzling you?`,
        `I'm here to help you figure it out! 🧩 No question is too simple. What do you need explained?`,
        `Let's untangle this together! 🎯 Take it one step at a time. What are you confused about?`,
        `Confusion is totally normal! 😊 I'll break things down for you. What can I clarify?`
      ]);
      suggestions = ["Help me understand", "What can you do?", "Show me examples"];
      break;

    case 'feeling_bored':
      response = pickRandom([
        `Bored, huh? 😏 Let's fix that! How about exploring some interesting subjects or professors? What catches your interest?`,
        `Perfect timing! Let's discover something new together! 🔍✨ What topic intrigues you?`,
        `Boredom is just creativity waiting to happen! 🎨 Let me help you find something fascinating. Any interests?`,
        `Let's turn that boredom into curiosity! 🚀 Browse professors, subjects, or ask me anything!`
      ]);
      suggestions = ["Browse professors", "Tell me a joke", "Surprise me"];
      break;

    case 'compliment_bot':
      response = pickRandom([
        `Aww, thank you so much! 🥰 You're pretty awesome yourself! Now, how can this amazing bot help you? 😄`,
        `You're making me blush! 😊💕 I really appreciate that! What can I do for you today?`,
        `That's so kind of you! 🌟 You just made my day! Now let's make YOUR day better - what do you need?`,
        `Thank you! 😄 Compliments like yours are why I love my job! How can I assist you?`
      ]);
      suggestions = ["Find a professor", "You're welcome!", "Search subjects"];
      break;

    case 'love_declaration':
      response = pickRandom([
        `Aww! 💕 While I'm flattered, I'm just an AI, but I love helping you too! 🤖❤️ What can I do for you today?`,
        `You're sweet! 🥰 I care about helping you succeed! Now, what do you need assistance with?`,
        `Love you too, in my own AI way! 😊💙 Let's channel that positive energy - what are you looking for?`,
        `That's adorable! 💖 I'm here for you anytime! Now, how can I help you today?`
      ]);
      suggestions = ["Help me find something", "Tell me a joke", "You're awesome"];
      break;

    case 'joke':
      response = pickRandom([
        `Why did the professor bring a ladder to class? 🪜\nTo reach the high-level concepts! 😄`,
        `Why don't scientists trust atoms? ⚛️\nBecause they make up everything! 😂`,
        `What did the student say to the professor? 📚\n"I'm in a parallel class!" 😅`,
        `Why did the student eat their homework? 📝\nThe teacher said it was a piece of cake! 🍰😂`,
        `What's a professor's favorite type of music? 🎵\nClass-ical! 😄`,
        `Why did the math book look sad? 📖\nBecause it had too many problems! 😆`,
        `What do you call a professor who never farts in public? 💨\nA private tutor! 🤣`
      ]);
      suggestions = ["Another joke!", "Find a professor", "That was funny!"];
      break;

    case 'age':
      response = pickRandom([
        `I'm timeless! ⏰✨ Created to help students like you, and I get better every day! Age is just a number anyway! 😄`,
        `I'm as old as the database I'm connected to! 📊 But in AI years, I'm pretty young and energetic! 🤖`,
        `Let's just say I'm young enough to understand memes and old enough to know my stuff! 😎 How can I help you?`
      ]);
      suggestions = ["What can you do?", "Find a professor", "Tell me more"];
      break;

    case 'name':
      response = pickRandom([
        `I'm FindMyProf AI! 🤖 Your friendly assistant for all things professors, schedules, and subjects! What's your name?`,
        `You can call me FindMyProf! 😊 I'm here to make your academic life easier! How can I help you today?`,
        `I'm your AI assistant for this platform! 🌟 I help students find professors, schedules, and more! What shall I call you?`
      ]);
      suggestions = ["What can you do?", "Find a professor", "Help me"];
      break;

    case 'capability':
      response = `I'm quite capable! 💪 Here's what I can do:\n\n🔍 Find professors by name\n📚 Search by subject\n📅 Show schedules\n📍 Locate classrooms\n📧 Provide contact info\n📎 Find course materials\n💬 Chat naturally with you!\n\nPlus, I understand emotions and try to respond with empathy! ❤️`;
      suggestions = ["Find a professor", "Search subjects", "That's cool!"];
      break;

    case 'motivation':
      response = pickRandom([
        `You've got this! 💪 Every expert was once a beginner. Keep pushing forward! 🌟 Now, what can I help you accomplish today?`,
        `Believe in yourself! 🚀 You're capable of amazing things! Let's tackle your questions one at a time. What do you need?`,
        `Remember: The only way to do great work is to love what you do! ❤️ You're on the right path! How can I help you today?`,
        `Success is not final, failure is not fatal! 💫 Keep going, you're doing great! What are you working on?`,
        `You're stronger than you think! 🦾 Every day is a chance to grow. Let me help you with what you need! 🌱`,
        `The future belongs to those who believe in the beauty of their dreams! ✨ Now, what can I do for you?`
      ]);
      suggestions = ["Thank you!", "Find my professor", "I needed that"];
      break;

    case 'study_tips':
      response = pickRandom([
        `Here are some study tips! 📚✨\n\n1. 📅 Use the Pomodoro Technique (25 min study, 5 min break)\n2. 📝 Take handwritten notes\n3. 🔄 Review within 24 hours\n4. 👥 Study in groups\n5. 🎯 Set specific goals\n\nNow, need help finding professor info or schedules?`,
        `Study smarter, not harder! 🧠💡\n\n✅ Space out your studying\n✅ Test yourself regularly\n✅ Teach someone else\n✅ Get enough sleep\n✅ Stay organized\n\nWhat else can I help with?`,
        `Pro study tips! 📖🌟\n\n• Find a quiet study spot 🤫\n• Eliminate distractions 📵\n• Stay hydrated 💧\n• Take regular breaks 🌿\n• Ask questions! (like right now!) 😊\n\nHow can I assist you today?`
      ]);
      suggestions = ["Thanks for the tips!", "Find my professor", "More tips"];
      break;

    default:
      return null;
  }

  return { response, suggestions };
}

// Add emotional context to responses
function addEmotionalContext(baseResponse, emotion) {
  const emotionType = emotion.emotion;
  const emoji = emotion.emoji;
  
  let opening = '';
  
  if (emotionType === 'sad') {
    opening = `I can sense you're feeling down ${emoji}. I'm here to help make things easier!\n\n`;
  } else if (emotionType === 'angry') {
    opening = `I understand you're frustrated ${emoji}. Let's work through this together!\n\n`;
  } else if (emotionType === 'tired') {
    opening = `You sound exhausted ${emoji}. Let me help you quickly so you can rest!\n\n`;
  } else if (emotionType === 'stressed') {
    opening = `Take a deep breath ${emoji}. I'll help you sort this out!\n\n`;
  } else if (emotionType === 'confused') {
    opening = `No worries, let me clarify things for you ${emoji}!\n\n`;
  } else if (emotionType === 'bored') {
    opening = `Let's make this interesting ${emoji}!\n\n`;
  } else if (emotionType === 'grateful') {
    opening = `You're very welcome! ${emoji} Glad I could help!\n\n`;
  } else if (emotionType === 'needy') {
    opening = `Don't worry, I'm here to help! ${emoji}\n\n`;
  } else if (['excited', 'happy', 'loving'].includes(emotionType)) {
    opening = `Love your energy! ${emoji}\n\n`;
  } else if (emotionType === 'content') {
    opening = `Great! ${emoji}\n\n`;
  }
  
  return opening + baseResponse;
}

module.exports = {
  detectEmotionEnhanced,
  detectEmotionalIntent,
  generateEmotionalResponse,
  addEmotionalContext
};
