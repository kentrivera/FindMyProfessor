const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();
const {
  detectEmotionEnhanced,
  detectEmotionalIntent,
  generateEmotionalResponse,
  addEmotionalContext
} = require('./emotional-intents');

const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());

// Serve static files from PHP uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../php/uploads')));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'findmyprofessor'
};

let dbData = {
  professors: [],
  subjects: [],
  schedules: [],
  attachments: []
};

// Emotion detection (simple sentiment analysis)
function detectEmotion(text) {
  const lowerText = text.toLowerCase();
  
  // Emotion keywords
  const emotions = {
    very_happy: { keywords: ['love', 'amazing', 'excellent', 'perfect', 'wonderful', 'fantastic'], emoji: '😊', polarity: 0.8 },
    happy: { keywords: ['good', 'nice', 'great', 'thanks', 'thank you', 'awesome'], emoji: '🙂', polarity: 0.5 },
    grateful: { keywords: ['thank', 'appreciate', 'grateful'], emoji: '🙏', polarity: 0.6 },
    excited: { keywords: ['exciting', 'excited', 'wow', 'cool'], emoji: '🤩', polarity: 0.7 },
    needy: { keywords: ['help', 'please', 'need', 'urgent'], emoji: '🆘', polarity: -0.2 },
    confused: { keywords: ['confused', 'don\'t understand', 'what', 'how', 'unclear'], emoji: '😕', polarity: -0.3 },
    sad: { keywords: ['sad', 'unfortunately', 'sorry', 'bad'], emoji: '😢', polarity: -0.5 },
    neutral: { keywords: [], emoji: '😐', polarity: 0 }
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

  return { emotion: 'neutral', emoji: '😐', polarity: 0, subjectivity: 0.5 };
}

// Fuzzy search function
function fuzzyMatch(str1, str2, threshold = 0.6) {
  if (!str1 || !str2) return false;
  
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Exact match
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // Calculate similarity
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return false;
  
  const editDistance = levenshteinDistance(longer, shorter);
  const similarity = (longer.length - editDistance) / longer.length;
  
  return similarity >= threshold;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Enhanced Intent Detection
function detectIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  // Priority order matters - check specific intents first
  const intents = {
    // List all professors (check before professor_search)
    list_professors: [
      'list professors', 'list all professors', 'show all professors',
      'all professors', 'every professor', 'available professors',
      'list teachers', 'show teachers', 'faculty list', 'list faculty',
      'show all teachers', 'show every professor'
    ],
    
    // List all subjects (check early)
    list_subjects: [
      'list all subjects', 'list all courses', 'show all subjects',
      'show all courses', 'all subjects', 'all courses', 'every subject',
      'list subjects', 'list courses', 'subject list', 'course list'
    ],
    
    // List all schedules (check early)
    list_schedules: [
      'list schedules', 'list all schedules', 'show all schedules',
      'all schedules', 'every schedule', 'available schedules',
      'show schedules', 'show all scheds', 'list scheds'
    ],
    
    // Professor search patterns (specific searches)
    professor_search: [
      'find professor', 'find prof', 'search professor', 'search prof',
      'who is professor', 'who is prof', 'tell me about professor', 'tell me about prof',
      'show me professor', 'show me prof', 'get professor', 'get prof',
      'look for professor', 'look for prof', 'looking for professor', 'looking for prof',
      'info about professor', 'info about prof', 'information about professor'
    ],
    
    // Who teaches what (subject-based professor search)
    who_teaches: [
      'who teaches', 'who is teaching', 'who handles', 'who\'s teaching',
      'teacher of', 'instructor of', 'professor for', 'prof for',
      'find teacher for', 'find instructor for', 'find professor for'
    ],
    
    // Professor schedule (specific professor's schedule)
    professor_schedule: [
      'schedule of', 'sched of', 'schedule for', 'sched for',
      'timetable of', 'timetable for', 'classes of', 'classes for',
      'what time does prof', 'what time does professor',
      'when does prof', 'when does professor',
      'show schedule of', 'show sched of', 'get schedule of',
      'view schedule of', 'display schedule of'
    ],
    
    // Subject schedule (when is a specific subject/class) - Check before general schedule
    subject_schedule: [
      'schedule of subject', 'schedule for subject',
      'schedule of course', 'schedule for course',
      'time for subject', 'time for course', 'class time for',
      'when is cs', 'when is it', 'when is eng', 'when is math',
      'when is database', 'when is programming', 'when is algorithm'
    ],
    
    // Day filter (schedules on specific day)
    day_schedule: [
      'schedule on monday', 'schedule on tuesday', 'schedule on wednesday',
      'schedule on thursday', 'schedule on friday', 'schedule on saturday',
      'classes on monday', 'classes on tuesday', 'classes on wednesday',
      'classes on thursday', 'classes on friday', 'monday schedule',
      'tuesday schedule', 'wednesday schedule', 'thursday schedule', 'friday schedule',
      'what classes on monday', 'what classes on tuesday', 'what classes on wednesday',
      'what classes on thursday', 'what classes on friday'
    ],
    
    // Room filter (schedules in specific room)
    room_schedule: [
      'schedule in room', 'schedule in classroom', 'classes in room',
      'what classes in room', 'who uses room', 'room schedule',
      'classroom schedule', 'schedule for room'
    ],
    
    // Section filter (schedules for specific section)
    section_schedule: [
      'schedule for section', 'section schedule', 'classes for section',
      'what section', 'which section'
    ],
    
    // General schedule queries
    schedule: [
      'schedule', 'sched', 'timetable', 'time table',
      'when is', 'when does', 'when do', 'what time is', 'what time does',
      'class time', 'class schedule', 'class sched',
      'show schedule', 'show sched', 'get schedule', 'get sched',
      'view schedule', 'see schedule', 'display schedule',
      'available time', 'free time'
    ],
    
    // Subject/Course queries
    subject: [
      'subject', 'subjects', 'course', 'courses', 'class',
      'what subjects', 'what courses', 'show subjects', 'show courses',
      'list subjects', 'list courses', 'available subjects', 'available courses',
      'what classes', 'find subject', 'find course', 'search subject', 'search course',
      'subject code', 'course code', 'subject list', 'course list'
    ],
    
    // Location/Classroom queries
    classroom: [
      'where is', 'where\'s', 'location', 'room', 'classroom',
      'what room', 'which room', 'find room', 'room number',
      'office', 'office location', 'building', 'where can i find',
      'how do i get to', 'directions to'
    ],
    
    // Contact information
    contact: [
      'contact', 'email', 'phone', 'reach', 'get in touch',
      'how to contact', 'contact info', 'contact information',
      'phone number', 'email address', 'how do i reach',
      'how can i contact', 'communicate with'
    ],
    
    // Attachments/Materials
    attachment: [
      'attachment', 'attachments', 'file', 'files', 'document', 'documents',
      'material', 'materials', 'resource', 'resources',
      'syllabus', 'handout', 'handouts', 'notes',
      'download', 'uploads', 'course material', 'study material',
      'slides', 'presentation', 'pdf'
    ],
    
    // Department queries
    department: [
      'department', 'what department', 'which department',
      'from department', 'in department', 'department of'
    ],
    
    // Greetings
    greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
    
    // Farewell
    farewell: ['bye', 'goodbye', 'see you', 'later', 'exit', 'quit'],
    
    // Thanks
    thanks: ['thank', 'thanks', 'appreciate', 'grateful'],
    
    // Help
    help: ['help me', 'i need help', 'how do i', 'guide', 'assist', 'support', 'commands', 'what can you']
  };

  // Check each intent in priority order
  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => lowerMsg.includes(keyword))) {
      return intent;
    }
  }

  return 'general';
}

// Find professor
function findProfessor(query) {
  if (!query) return null;
  
  return dbData.professors.find(prof => 
    fuzzyMatch(prof.name, query) || 
    fuzzyMatch(prof.department, query)
  );
}

// Search professors by subject
function searchBySubject(query) {
  const matchingSubjects = dbData.subjects.filter(sub => 
    fuzzyMatch(sub.subject_name, query) || 
    fuzzyMatch(sub.subject_code, query)
  );

  if (matchingSubjects.length === 0) return [];

  const subjectIds = matchingSubjects.map(s => s.id);
  const schedules = dbData.schedules.filter(sch => subjectIds.includes(sch.subject_id));
  const professorIds = [...new Set(schedules.map(s => s.professor_id))];

  return dbData.professors.filter(p => professorIds.includes(p.id));
}

// Get professor attachments
function getProfessorAttachments(professorId) {
  return dbData.attachments.filter(att => att.professor_id === professorId);
}

// Get professor schedules
function getProfessorSchedules(professorId) {
  return dbData.schedules.filter(sch => sch.professor_id === professorId);
}

// Format schedule (short version)
function formatScheduleShort(schedules) {
  if (!schedules || schedules.length === 0) return 'No schedules available.';
  
  const maxItems = 3;
  const schedulesToShow = schedules.slice(0, maxItems);
  
  let result = schedulesToShow.map(sch => {
    const subject = dbData.subjects.find(s => s.id === sch.subject_id);
    const parts = [];
    
    if (subject) parts.push(subject.subject_code);
    if (sch.day) parts.push(sch.day);
    if (sch.time_start && sch.time_end) parts.push(`${sch.time_start}-${sch.time_end}`);
    if (sch.classroom) parts.push(`Room ${sch.classroom}`);
    
    return parts.join(' • ');
  }).join('\n');

  if (schedules.length > maxItems) {
    result += `\n...and ${schedules.length - maxItems} more`;
  }

  return result;
}

// Extract query from message (improved extraction with intent-specific handling)
function extractQuery(message, intent) {
  let cleanQuery = message.toLowerCase().trim();
  
  // Intent-specific extraction
  if (intent === 'professor_schedule') {
    // For "schedule of santos" -> "santos"
    cleanQuery = cleanQuery
      .replace(/^(schedule|sched|timetable|classes)\s+(of|for)\s+/i, '')
      .replace(/^(show|get|view)\s+(schedule|sched|timetable|classes)\s+(of|for)\s+/i, '')
      .replace(/\s+(schedule|sched|timetable|classes)$/i, '')
      .replace(/^(what|when)\s+(time\s+)?(does|is)\s+(prof|professor|teacher)?\s*/i, '')
      .replace(/\s+(teach|have|hold|conduct)$/i, '');
  } else if (intent === 'subject_schedule') {
    // For "schedule of database" or "when is database"
    cleanQuery = cleanQuery
      .replace(/^(schedule|sched|timetable|classes)\s+(of|for)\s+/i, '')
      .replace(/^(when|what\s+time)\s+(is|does)\s+(the\s+)?/i, '')
      .replace(/\s+(class|course|subject)$/i, '');
  } else if (intent === 'room_schedule') {
    // For "classes in room 301" -> "301"
    cleanQuery = cleanQuery
      .replace(/^(schedule|classes|what\s+classes|who\s+uses)\s+(in|for|of)\s+/i, '')
      .replace(/(room|classroom)\s*/gi, '')
      .replace(/^(schedule|sched)\s+(for|in|of)?\s*/i, '');
  } else if (intent === 'section_schedule') {
    // For "schedule for section A" -> "A"
    cleanQuery = cleanQuery
      .replace(/^(schedule|classes)\s+(for|of)\s+/i, '')
      .replace(/section\s*/gi, '');
  } else if (intent === 'who_teaches') {
    // For "who teaches database" -> "database"
    cleanQuery = cleanQuery
      .replace(/^(who|what)\s+(teaches|is\s+teaching|handles)\s+/i, '');
  } else {
    // General cleaning for other intents
    const patterns = [
      /^(find|search|show|get|view|display|see)\s+(me\s+)?(the\s+)?/i,
      /^(who\s+is|what\s+is|where\s+is|when\s+is|when\s+does)\s+/i,
      /^(tell\s+me\s+about|info\s+about|information\s+about)\s+/i,
      /^(list\s+(all\s+)?|show\s+all\s+)/i,
      /\s+(professor|prof|teacher|instructor|faculty)$/i,
      /^(professor|prof|teacher|instructor)\s+/i
    ];
    
    patterns.forEach(pattern => {
      cleanQuery = cleanQuery.replace(pattern, '');
    });
  }
  
  // Remove punctuation and extra spaces
  cleanQuery = cleanQuery.replace(/[?!.,;:]/g, '').replace(/\s+/g, ' ').trim();
  
  // If query is too short after cleaning, return original message minus obvious prefixes
  if (cleanQuery.length < 2) {
    cleanQuery = message.toLowerCase()
      .replace(/^(find|show|get|who|what|where|when|tell me)\s+/i, '')
      .replace(/[?!.,;:]/g, '')
      .trim();
  }
  
  return cleanQuery;
}

// Generate response
function generateResponse(intent, message, emotion) {
  let response = '';
  let data = null;
  let attachments = [];
  let imageUrl = null;
  let suggestions = [];
  let schedules = [];
  let professorData = null;

  // Extract query from message
  const query = extractQuery(message, intent);

  switch (intent) {
    case 'greeting':
      response = `Hello! 👋 I'm here to help you find professors, schedules, and courses. What would you like to know?`;
      suggestions = ['Find a professor', 'Show schedules', 'List subjects', 'Help me'];
      break;

    case 'farewell':
      response = `Goodbye! Feel free to come back if you need more help. Have a great day! 👋`;
      break;

    case 'thanks':
      response = `You're welcome! 😊 Is there anything else I can help you with?`;
      suggestions = ['Find another professor', 'Show more schedules', 'List subjects'];
      break;

    case 'professor_search':
      const professors = searchBySubject(query) || [];
      if (professors.length > 0) {
        const prof = professors[0];
        professorData = prof;
        data = prof;
        imageUrl = prof.image || null; // Get image from database
        attachments = getProfessorAttachments(prof.id);
        schedules = getProfessorSchedules(prof.id);
        
        response = `I found ${prof.name} from ${prof.department}!\n\n`;
        if (prof.bio) response += `${prof.bio}\n\n`;
        if (prof.specialization) response += `🎯 Specialization: ${prof.specialization}\n`;
        if (prof.email) response += `📧 Contact: ${prof.email}\n`;
        if (prof.office_location) response += `📍 Office: ${prof.office_location}\n`;
        if (schedules.length > 0) {
          response += `\n📅 ${schedules.length} schedule(s) available (see details below)`;
        }
        if (attachments.length > 0) {
          response += `\n📎 ${attachments.length} attachment(s) available`;
        }
        
        suggestions = ['Show more details', 'Other professors', 'View schedules'];
      } else {
        // Try finding by name
        const profByName = findProfessor(query);
        if (profByName) {
          professorData = profByName;
          data = profByName;
          imageUrl = profByName.image || null;
          attachments = getProfessorAttachments(profByName.id);
          schedules = getProfessorSchedules(profByName.id);
          
          response = `Found ${profByName.name}!\n\n`;
          response += `Department: ${profByName.department}\n`;
          if (profByName.specialization) response += `Specialization: ${profByName.specialization}\n`;
          if (profByName.email) response += `Email: ${profByName.email}\n`;
          if (profByName.office_location) response += `Office: ${profByName.office_location}\n`;
          if (schedules.length > 0) {
            response += `\n📅 ${schedules.length} schedule(s) available (see details below)`;
          }
          if (attachments.length > 0) {
            response += `\n📎 ${attachments.length} attachment(s) available`;
          }
        } else {
          response = `I couldn't find that professor. Try searching by name or subject.`;
          suggestions = ['List all professors', 'Search by subject', 'Help'];
        }
      }
      break;

    case 'professor_schedule':
      // Get schedule for a specific professor
      const schedProf = findProfessor(query);
      if (schedProf) {
        schedules = getProfessorSchedules(schedProf.id);
        attachments = getProfessorAttachments(schedProf.id);
        professorData = schedProf;
        data = schedProf;
        imageUrl = schedProf.image || null;
        
        if (schedules.length > 0) {
          response = `📅 **${schedProf.name}'s Schedule**\n\n`;
          response += `Found ${schedules.length} class(es):\n\n`;
          
          schedules.forEach((sch, idx) => {
            const subject = dbData.subjects.find(s => s.id === sch.subject_id);
            response += `${idx + 1}. `;
            if (subject) response += `**${subject.subject_code}** - ${subject.subject_name}\n`;
            if (sch.day) response += `   📆 ${sch.day}`;
            if (sch.time_start && sch.time_end) response += ` ${sch.time_start}-${sch.time_end}`;
            if (sch.classroom) response += ` | 🏫 ${sch.classroom}`;
            if (sch.section) response += ` | 👥 ${sch.section}`;
            response += '\n';
          });
          
          if (attachments.length > 0) {
            response += `\n📎 ${attachments.length} attachment(s) available for this professor's classes`;
          }
        } else {
          response = `📅 ${schedProf.name}\n\nNo schedules available yet.`;
        }
        
        // Generate accurate suggestions with professor names
        const otherProfs = dbData.professors.filter(p => p.id !== schedProf.id).slice(0, 2);
        suggestions = [
          schedProf.email ? `Contact ${schedProf.name.split(' ')[0]}` : 'View profile',
          otherProfs.length > 0 ? `Schedule of ${otherProfs[0].name.split(' ').pop()}` : 'List all professors',
          'Show all schedules'
        ];
      } else {
        response = `I couldn't find that professor's schedule. Try:\n• Full professor name\n• "List all professors"`;
        // Get random professors for suggestions
        const randomProfs = dbData.professors.slice(0, 3);
        suggestions = [
          'List all professors',
          randomProfs.length > 0 ? `Schedule of ${randomProfs[0].name}` : 'Find a professor',
          'Help'
        ];
      }
      break;

    case 'subject_schedule':
      // Get schedule for a specific subject
      const subjectMatch = dbData.subjects.find(s => 
        fuzzyMatch(s.subject_name, query) || fuzzyMatch(s.subject_code, query)
      );
      
      if (subjectMatch) {
        schedules = dbData.schedules.filter(sch => sch.subject_id === subjectMatch.id);
        
        // Get attachments for this subject's schedules
        const subjectScheduleIds = schedules.map(sch => sch.id);
        attachments = dbData.attachments.filter(att => 
          subjectScheduleIds.includes(att.schedule_id)
        );
        
        if (schedules.length > 0) {
          response = `📚 **${subjectMatch.subject_code} - ${subjectMatch.subject_name}**\n\n`;
          response += `${schedules.length} class(es) available:\n\n`;
          
          schedules.forEach((sch, idx) => {
            const prof = dbData.professors.find(p => p.id === sch.professor_id);
            response += `${idx + 1}. `;
            if (prof) response += `👨‍🏫 ${prof.name}\n`;
            if (sch.day) response += `   📆 ${sch.day}`;
            if (sch.time_start && sch.time_end) response += ` ${sch.time_start}-${sch.time_end}`;
            if (sch.classroom) response += ` | 🏫 ${sch.classroom}`;
            if (sch.section) response += ` | 👥 ${sch.section}`;
            response += '\n';
          });
          
          if (attachments.length > 0) {
            response += `\n📎 ${attachments.length} attachment(s) available for this subject`;
          }
        } else {
          response = `📚 ${subjectMatch.subject_name}\n\nNo schedules available yet for this subject.`;
        }
        
        // Get professor names for accurate suggestions
        const professorIds = [...new Set(schedules.map(sch => sch.professor_id))];
        const subjectProfessors = dbData.professors.filter(p => professorIds.includes(p.id));
        
        suggestions = [
          subjectProfessors.length > 0 ? `Schedule of ${subjectProfessors[0].name}` : 'List all professors',
          'List all subjects',
          'Show all schedules'
        ];
      } else {
        response = `I couldn't find that subject's schedule. Try:\n• Subject code (e.g., CS101)\n• Subject name\n• "List all subjects"`;
        const randomSubjects = dbData.subjects.slice(0, 2);
        suggestions = [
          'List all subjects',
          randomSubjects.length > 0 ? `When is ${randomSubjects[0].subject_code}` : 'List schedules',
          'Help'
        ];
      }
      break;

    case 'day_schedule':
      // Get schedules for a specific day
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayMatch = days.find(day => message.toLowerCase().includes(day));
      
      if (dayMatch) {
        const dayCapitalized = dayMatch.charAt(0).toUpperCase() + dayMatch.slice(1);
        schedules = dbData.schedules.filter(sch => 
          sch.day && sch.day.toLowerCase().includes(dayMatch)
        );
        
        // Get attachments for this day's schedules
        const dayScheduleIds = schedules.map(sch => sch.id);
        attachments = dbData.attachments.filter(att => 
          dayScheduleIds.includes(att.schedule_id)
        );
        
        if (schedules.length > 0) {
          response = `📆 **${dayCapitalized} Schedule**\n\n`;
          response += `Found ${schedules.length} class(es):\n\n`;
          
          // Group by time for better readability
          const sortedSchedules = schedules.sort((a, b) => {
            if (a.time_start && b.time_start) {
              return a.time_start.localeCompare(b.time_start);
            }
            return 0;
          });
          
          sortedSchedules.slice(0, 15).forEach((sch, idx) => {
            const prof = dbData.professors.find(p => p.id === sch.professor_id);
            const subject = dbData.subjects.find(s => s.id === sch.subject_id);
            
            response += `${idx + 1}. `;
            if (sch.time_start && sch.time_end) response += `⏰ ${sch.time_start}-${sch.time_end}\n`;
            if (subject) response += `   📚 ${subject.subject_code} - ${subject.subject_name}\n`;
            if (prof) response += `   👨‍🏫 ${prof.name}`;
            if (sch.classroom) response += ` | 🏫 ${sch.classroom}`;
            if (sch.section) response += ` | 👥 ${sch.section}`;
            response += '\n';
          });
          
          if (schedules.length > 15) {
            response += `\n...and ${schedules.length - 15} more classes`;
          }
          
          if (attachments.length > 0) {
            response += `\n\n📎 ${attachments.length} attachment(s) available for ${dayCapitalized} classes`;
          }
        } else {
          response = `📆 ${dayCapitalized}\n\nNo classes scheduled for this day.`;
        }
        
        // Get professors teaching on this day for suggestions
        const dayProfessorIds = [...new Set(schedules.map(sch => sch.professor_id))];
        const dayProfessors = dbData.professors.filter(p => dayProfessorIds.includes(p.id)).slice(0, 2);
        
        suggestions = [
          dayProfessors.length > 0 ? `Schedule of ${dayProfessors[0].name}` : 'List all professors',
          'Show all schedules',
          'Find a professor'
        ];
      } else {
        response = `Please specify a day:\n• Monday\n• Tuesday\n• Wednesday\n• Thursday\n• Friday\n• Saturday\n• Sunday`;
        suggestions = ['Monday schedule', 'List all schedules', 'Help'];
      }
      break;

    case 'room_schedule':
      // Get schedules for a specific room
      const roomQuery = query.replace(/room\s*/gi, '').replace(/classroom\s*/gi, '').trim();
      schedules = dbData.schedules.filter(sch => 
        sch.classroom && fuzzyMatch(sch.classroom, roomQuery)
      );
      
      // Get attachments for this room's schedules
      const roomScheduleIds = schedules.map(sch => sch.id);
      attachments = dbData.attachments.filter(att => 
        roomScheduleIds.includes(att.schedule_id)
      );
      
      if (schedules.length > 0) {
        const roomName = schedules[0].classroom;
        response = `🏫 **Room ${roomName}**\n\n`;
        response += `${schedules.length} class(es) scheduled:\n\n`;
        
        // Sort by day and time
        const sortedSchedules = schedules.sort((a, b) => {
          const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const dayA = dayOrder.indexOf(a.day || '');
          const dayB = dayOrder.indexOf(b.day || '');
          if (dayA !== dayB) return dayA - dayB;
          return (a.time_start || '').localeCompare(b.time_start || '');
        });
        
        sortedSchedules.forEach((sch, idx) => {
          const prof = dbData.professors.find(p => p.id === sch.professor_id);
          const subject = dbData.subjects.find(s => s.id === sch.subject_id);
          
          response += `${idx + 1}. `;
          if (sch.day) response += `📆 ${sch.day}`;
          if (sch.time_start && sch.time_end) response += ` ⏰ ${sch.time_start}-${sch.time_end}\n`;
          else response += '\n';
          if (subject) response += `   📚 ${subject.subject_code} - ${subject.subject_name}\n`;
          if (prof) response += `   👨‍🏫 ${prof.name}`;
          if (sch.section) response += ` | 👥 ${sch.section}`;
          response += '\n';
        });
        
        if (attachments.length > 0) {
          response += `\n📎 ${attachments.length} attachment(s) available for classes in this room`;
        }
        
        // Get professors teaching in this room for suggestions
        const roomProfessorIds = [...new Set(schedules.map(sch => sch.professor_id))];
        const roomProfessors = dbData.professors.filter(p => roomProfessorIds.includes(p.id)).slice(0, 2);
        
        suggestions = [
          roomProfessors.length > 0 ? `Schedule of ${roomProfessors[0].name}` : 'List all professors',
          'Show all schedules',
          'List all rooms'
        ];
      } else {
        response = `🏫 Room ${roomQuery}\n\nNo classes found in this room. Try:\n• Different room number\n• "List all schedules"`;
        suggestions = ['List all schedules', 'Find professor', 'Help'];
      }
      break;

    case 'section_schedule':
      // Get schedules for a specific section
      const sectionQuery = query.replace(/section\s*/gi, '').trim();
      schedules = dbData.schedules.filter(sch => 
        sch.section && fuzzyMatch(sch.section, sectionQuery)
      );
      
      // Get attachments for this section's schedules
      const sectionScheduleIds = schedules.map(sch => sch.id);
      attachments = dbData.attachments.filter(att => 
        sectionScheduleIds.includes(att.schedule_id)
      );
      
      if (schedules.length > 0) {
        const sectionName = schedules[0].section;
        response = `👥 **Section ${sectionName}**\n\n`;
        response += `${schedules.length} class(es) for this section:\n\n`;
        
        schedules.forEach((sch, idx) => {
          const prof = dbData.professors.find(p => p.id === sch.professor_id);
          const subject = dbData.subjects.find(s => s.id === sch.subject_id);
          
          response += `${idx + 1}. `;
          if (subject) response += `📚 ${subject.subject_code} - ${subject.subject_name}\n`;
          if (prof) response += `   👨‍🏫 ${prof.name}\n`;
          if (sch.day) response += `   📆 ${sch.day}`;
          if (sch.time_start && sch.time_end) response += ` ⏰ ${sch.time_start}-${sch.time_end}`;
          if (sch.classroom) response += ` | 🏫 ${sch.classroom}`;
          response += '\n';
        });
        
        if (attachments.length > 0) {
          response += `\n📎 ${attachments.length} attachment(s) available for this section`;
        }
        
        // Get professors teaching this section for suggestions
        const sectionProfessorIds = [...new Set(schedules.map(sch => sch.professor_id))];
        const sectionProfessors = dbData.professors.filter(p => sectionProfessorIds.includes(p.id)).slice(0, 2);
        
        suggestions = [
          sectionProfessors.length > 0 ? `Schedule of ${sectionProfessors[0].name}` : 'List all professors',
          'Show all schedules',
          'Find a professor'
        ];
      } else {
        response = `👥 Section ${sectionQuery}\n\nNo classes found for this section.`;
        suggestions = ['List all schedules', 'Find professor', 'Help'];
      }
      break;

    case 'schedule':
      schedules = dbData.schedules.slice(0, 10);
      
      // Get attachments for these schedules
      const generalScheduleIds = schedules.map(sch => sch.id);
      attachments = dbData.attachments.filter(att => 
        generalScheduleIds.includes(att.schedule_id)
      );
      
      response = `Here are ${schedules.length} schedules (see table below):`;
      
      if (attachments.length > 0) {
        response += `\n\n📎 ${attachments.length} attachment(s) available`;
      }
      
      // Get professors from schedules for suggestions
      const genScheduleProfIds = [...new Set(schedules.map(sch => sch.professor_id))];
      const genScheduleProfs = dbData.professors.filter(p => genScheduleProfIds.includes(p.id)).slice(0, 2);
      
      suggestions = genScheduleProfs.length >= 1 ? [
        `Schedule of ${genScheduleProfs[0].name}`,
        'Monday schedule',
        'List all professors'
      ] : [
        'Find specific professor',
        'Show more schedules',
        'List subjects'
      ];
      break;

    case 'subject':
      const subjects = dbData.subjects.slice(0, 5);
      response = `Available subjects:\n\n` + subjects.map(s => 
        `📚 ${s.subject_code} - ${s.subject_name} (${s.credits || 3} credits)`
      ).join('\n');
      if (dbData.subjects.length > 5) {
        response += `\n\n...and ${dbData.subjects.length - 5} more subjects`;
      }
      suggestions = ['Find professor for subject', 'Show schedules', 'Help'];
      break;

    case 'help':
      response = `I can help you with:\n\n` +
        `👨‍🏫 Find professors\n` +
        `📅 View schedules\n` +
        `📚 List subjects\n` +
        `📍 Room locations\n` +
        `📧 Contact information\n` +
        `📎 Course materials\n\n` +
        `Just ask me anything!`;
      
      // Generate helpful suggestions with real data
      const helpProfs = dbData.professors.slice(0, 2);
      const helpSubjects = dbData.subjects.slice(0, 1);
      
      suggestions = [
        helpProfs.length > 0 ? `Find ${helpProfs[0].name}` : 'List all professors',
        helpSubjects.length > 0 ? `When is ${helpSubjects[0].subject_code}` : 'Show schedules',
        'Monday schedule'
      ];
      break;

    case 'who_teaches':
      // Search for professor who teaches a specific subject
      const teacherProfs = searchBySubject(query);
      if (teacherProfs.length > 0) {
        const prof = teacherProfs[0];
        professorData = prof;
        data = prof;
        imageUrl = prof.image || null;
        attachments = getProfessorAttachments(prof.id);
        schedules = getProfessorSchedules(prof.id);
        
        const matchingSubject = dbData.subjects.find(s => 
          fuzzyMatch(s.subject_name, query) || fuzzyMatch(s.subject_code, query)
        );
        
        if (matchingSubject) {
          response = `📚 **${matchingSubject.subject_code} - ${matchingSubject.subject_name}**\n\n`;
          response += `👨‍🏫 Taught by: **${prof.name}**\n`;
          response += `🏛️ Department: ${prof.department}\n`;
          if (prof.email) response += `📧 ${prof.email}\n`;
          if (prof.office_location) response += `📍 Office: ${prof.office_location}\n`;
          
          if (attachments.length > 0) {
            response += `\n📎 ${attachments.length} attachment(s) available`;
          }
        } else {
          response = `**${prof.name}** teaches this subject!\n\n`;
          response += `Department: ${prof.department}\n`;
          if (prof.email) response += `Email: ${prof.email}\n`;
        }
        
        if (schedules.length > 0) {
          response += `\n📅 ${schedules.length} schedule(s) available (see details below)`;
        }
        
        // Get other professors from same department for suggestions
        const otherDeptProfs = dbData.professors.filter(p => 
          p.department === prof.department && p.id !== prof.id
        ).slice(0, 2);
        
        suggestions = [
          `Schedule of ${prof.name}`,
          otherDeptProfs.length > 0 ? `Find ${otherDeptProfs[0].name}` : 'List all professors',
          'List all subjects'
        ];
      } else {
        response = `I couldn't find a professor teaching "${query}". Try:\n• A different subject name\n• Subject code\n• Browse all subjects`;
        
        const randomSubjects = dbData.subjects.slice(0, 2);
        suggestions = [
          'List all subjects',
          randomSubjects.length > 0 ? `Who teaches ${randomSubjects[0].subject_code}` : 'List all professors',
          'Help'
        ];
      }
      break;

    case 'list_professors':
      const allProfs = dbData.professors.slice(0, 10);
      response = `📋 **All Professors** (${dbData.professors.length} total):\n\n`;
      allProfs.forEach((prof, idx) => {
        response += `${idx + 1}. **${prof.name}** - ${prof.department}\n`;
        if (prof.specialization) response += `   🎯 ${prof.specialization}\n`;
      });
      if (dbData.professors.length > 10) {
        response += `\n...and ${dbData.professors.length - 10} more professors`;
      }
      response += `\n\n💡 Type a professor's name to see their full profile!`;
      
      // Generate accurate suggestions with real professor names
      const suggestedProfs = dbData.professors.slice(0, 3);
      suggestions = suggestedProfs.length >= 3 ? [
        `Schedule of ${suggestedProfs[0].name}`,
        `Find ${suggestedProfs[1].name.split(' ')[0]}`,
        `Contact ${suggestedProfs[2].name.split(' ').pop()}`
      ] : [
        'Find specific professor',
        'Search by subject',
        'Show schedules'
      ];
      break;

    case 'list_subjects':
      const allSubjects = dbData.subjects.slice(0, 10);
      response = `📚 **All Subjects** (${dbData.subjects.length} total):\n\n`;
      allSubjects.forEach((sub, idx) => {
        response += `${idx + 1}. **${sub.subject_code}** - ${sub.subject_name}\n`;
        if (sub.description) response += `   ${sub.description.substring(0, 50)}...\n`;
      });
      if (dbData.subjects.length > 10) {
        response += `\n...and ${dbData.subjects.length - 10} more subjects`;
      }
      response += `\n\n💡 Ask "Who teaches [subject]?" to find the professor!`;
      
      // Generate accurate suggestions with real subject names
      const suggestedSubjects = dbData.subjects.slice(0, 3);
      suggestions = suggestedSubjects.length >= 3 ? [
        `Who teaches ${suggestedSubjects[0].subject_code}`,
        `When is ${suggestedSubjects[1].subject_name}`,
        'List all professors'
      ] : [
        'Who teaches a subject?',
        'Find professor',
        'Show schedules'
      ];
      break;

    case 'list_schedules':
      schedules = dbData.schedules.slice(0, 15);
      
      // Get attachments for these schedules
      const listScheduleIds = schedules.map(sch => sch.id);
      attachments = dbData.attachments.filter(att => 
        listScheduleIds.includes(att.schedule_id)
      );
      
      response = `📅 **All Schedules** (${dbData.schedules.length} total):\n\nSee details below 👇`;
      
      if (attachments.length > 0) {
        response += `\n\n📎 ${attachments.length} attachment(s) available`;
      }
      
      // Get professors from the schedules for accurate suggestions
      const scheduleProfessorIds = [...new Set(schedules.map(sch => sch.professor_id))];
      const scheduleProfessors = dbData.professors.filter(p => scheduleProfessorIds.includes(p.id)).slice(0, 3);
      
      suggestions = scheduleProfessors.length >= 2 ? [
        `Schedule of ${scheduleProfessors[0].name}`,
        'Monday schedule',
        'List all professors'
      ] : [
        'Find specific professor',
        'Show specific subject',
        'Help'
      ];
      break;

    case 'department':
      // Search by department
      const deptQuery = query;
      const deptProfs = dbData.professors.filter(p => 
        fuzzyMatch(p.department, deptQuery)
      );
      
      if (deptProfs.length > 0) {
        const deptName = deptProfs[0].department;
        response = `🏛️ **${deptName} Department**\n\n`;
        response += `👨‍🏫 ${deptProfs.length} professor(s):\n\n`;
        deptProfs.forEach((prof, idx) => {
          response += `${idx + 1}. ${prof.name}`;
          if (prof.specialization) response += ` - ${prof.specialization}`;
          response += '\n';
        });
        suggestions = ['Find specific professor', 'Show schedules', 'Other departments'];
      } else {
        response = `I couldn't find that department. Available departments:\n\n`;
        const uniqueDepts = [...new Set(dbData.professors.map(p => p.department))];
        uniqueDepts.forEach((dept, idx) => {
          response += `${idx + 1}. ${dept}\n`;
        });
        suggestions = ['Find a professor', 'List all professors', 'Help'];
      }
      break;

    case 'classroom':
      // Search for classroom/location
      const locationProf = findProfessor(query);
      if (locationProf && locationProf.office_location) {
        response = `📍 **${locationProf.name}**\n\nOffice Location: ${locationProf.office_location}\n`;
        
        schedules = getProfessorSchedules(locationProf.id);
        if (schedules.length > 0) {
          const rooms = [...new Set(schedules.map(s => s.classroom).filter(Boolean))];
          if (rooms.length > 0) {
            response += `\n🏫 Classrooms:\n`;
            rooms.forEach(room => response += `• ${room}\n`);
          }
        }
        
        professorData = locationProf;
        data = locationProf;
        imageUrl = locationProf.image || null;
        suggestions = [`${locationProf.name}'s schedule`, 'Find another professor', 'Help'];
      } else {
        // Try to find by room number in schedules
        const roomSchedules = dbData.schedules.filter(s => 
          s.classroom && fuzzyMatch(s.classroom, query)
        );
        
        if (roomSchedules.length > 0) {
          const room = roomSchedules[0].classroom;
          response = `🏫 **Room ${room}**\n\n`;
          response += `${roomSchedules.length} class(es) in this room:\n\n`;
          roomSchedules.forEach((sch, idx) => {
            const prof = dbData.professors.find(p => p.id === sch.professor_id);
            const sub = dbData.subjects.find(s => s.id === sch.subject_id);
            if (prof && sub) {
              response += `${idx + 1}. ${sub.subject_code} - ${prof.name}\n`;
              if (sch.day && sch.time_start) {
                response += `   ${sch.day} ${sch.time_start}-${sch.time_end}\n`;
              }
            }
          });
          schedules = roomSchedules;
          suggestions = ['Find professor', 'Show other rooms', 'Help'];
        } else {
          response = `I couldn't find that location. Try:\n• Professor name to find office\n• Room number to see schedule\n• "List all professors"`;
          suggestions = ['List all professors', 'Show schedules', 'Help'];
        }
      }
      break;

    case 'contact':
      // Find contact information
      const contactProf = findProfessor(query);
      if (contactProf) {
        response = `📞 **Contact Information**\n\n**${contactProf.name}**\n`;
        response += `${contactProf.department}\n\n`;
        
        if (contactProf.email) response += `📧 Email: ${contactProf.email}\n`;
        if (contactProf.contact) response += `📱 Phone: ${contactProf.contact}\n`;
        if (contactProf.office_location) response += `📍 Office: ${contactProf.office_location}\n`;
        
        if (!contactProf.email && !contactProf.contact) {
          response += `\n⚠️ Contact information not available yet.`;
        }
        
        professorData = contactProf;
        data = contactProf;
        imageUrl = contactProf.image || null;
        suggestions = [`${contactProf.name}'s schedule`, 'Find another professor', 'Help'];
      } else {
        response = `I couldn't find that professor's contact info. Try:\n• Full name\n• "List all professors"`;
        suggestions = ['List all professors', 'Find a professor', 'Help'];
      }
      break;

    case 'attachment':
      // Find attachments
      const attachProf = findProfessor(query);
      if (attachProf) {
        attachments = getProfessorAttachments(attachProf.id);
        
        response = `📎 **Course Materials - ${attachProf.name}**\n\n`;
        
        if (attachments.length > 0) {
          response += `Found ${attachments.length} file(s):\n\n`;
          attachments.forEach((att, idx) => {
            response += `${idx + 1}. ${att.file_name}`;
            if (att.subject_code) response += ` (${att.subject_code})`;
            if (att.description) response += `\n   ${att.description}`;
            response += '\n';
          });
          response += `\n📥 See details below to download`;
        } else {
          response += `No materials available yet for ${attachProf.name}.`;
        }
        
        professorData = attachProf;
        data = attachProf;
        imageUrl = attachProf.image || null;
        suggestions = [`${attachProf.name}'s schedule`, 'Find another professor', 'Help'];
      } else {
        response = `I couldn't find attachments. Try specifying:\n• Professor name\n• Subject name`;
        suggestions = ['Find a professor', 'List subjects', 'Help'];
      }
      break;

    default:
      // Try to extract professor name from message
      const foundProf = findProfessor(message);
      if (foundProf) {
        professorData = foundProf;
        data = foundProf;
        imageUrl = foundProf.image || null;
        attachments = getProfessorAttachments(foundProf.id);
        schedules = getProfessorSchedules(foundProf.id);
        
        response = `I found information about ${foundProf.name}!\n\n`;
        response += `Department: ${foundProf.department}\n`;
        if (foundProf.specialization) response += `Specialization: ${foundProf.specialization}\n`;
        if (foundProf.email) response += `Email: ${foundProf.email}\n`;
        if (foundProf.office_location) response += `Office: ${foundProf.office_location}\n`;
        if (schedules.length > 0) {
          response += `\n📅 ${schedules.length} schedule(s) available (see details below)`;
        }
        if (attachments.length > 0) {
          response += `\n📎 ${attachments.length} attachment(s) available`;
        }
      } else {
        response = `I'm not sure what you're asking. Try:\n- "Find professor [name]"\n- "Show schedules"\n- "List subjects"\n- "Help"`;
        suggestions = ['Find a professor', 'Show schedules', 'Help'];
      }
  }

  // Add emotional context to response
  if (emotion.emotion === 'needy') {
    response = `I'm here to help! 🆘 ${response}`;
  } else if (emotion.emotion === 'grateful') {
    response = `I'm happy to help! 🙏 ${response}`;
  }

  return { 
    response, 
    data, 
    attachments, 
    imageUrl, 
    suggestions, 
    schedules,
    professor: professorData 
  };
}

// Load data from database
async function loadData() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Load professors with all fields including image
    const [professors] = await connection.execute(`
      SELECT id, name, department, office_location, email, bio, contact, 
             image, expertise, specialization, education, experience, 
             research_interests, publications, created_at, updated_at
      FROM professors 
      ORDER BY name
    `);
    dbData.professors = professors;

    // Load subjects
    const [subjects] = await connection.execute(`
      SELECT id, subject_code, subject_name, description, professor_id, credits 
      FROM subjects 
      ORDER BY subject_code
    `);
    dbData.subjects = subjects;

    // Load schedules
    const [schedules] = await connection.execute(`
      SELECT s.*, p.name as professor_name, sub.subject_code, sub.subject_name
      FROM schedules s
      LEFT JOIN professors p ON s.professor_id = p.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      ORDER BY s.day, s.time_start
    `);
    dbData.schedules = schedules;

    // Load attachments with professor info
    const [attachments] = await connection.execute(`
      SELECT a.*, s.subject_code, s.subject_name, sch.professor_id
      FROM attachments a
      LEFT JOIN schedules sch ON a.schedule_id = sch.id
      LEFT JOIN subjects s ON sch.subject_id = s.id
      ORDER BY a.uploaded_at DESC
    `);
    dbData.attachments = attachments;

    await connection.end();
    
    console.log(`✅ Data loaded: ${professors.length} professors, ${subjects.length} subjects, ${schedules.length} schedules, ${attachments.length} attachments`);
  } catch (error) {
    console.error('Error loading data:', error.message);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'FindMyProfessor AI Chatbot API',
    version: '1.0.0',
    status: 'running',
    engine: 'Node.js'
  });
});

app.post('/chat', (req, res) => {
  try {
    const { message, session_id } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Detect emotion (enhanced version)
    const emotion = detectEmotionEnhanced(message);
    
    // Check for emotional intents first
    const emotionalIntent = detectEmotionalIntent(message);
    
    if (emotionalIntent) {
      // Handle emotional/conversational response
      const emotionalResponse = generateEmotionalResponse(emotionalIntent, emotion);
      
      if (emotionalResponse) {
        return res.json({
          success: true,
          response: emotionalResponse.response,
          intent: emotionalIntent,
          emotion,
          data: null,
          attachments: [],
          image_url: null,
          suggestions: emotionalResponse.suggestions,
          schedules: [],
          professor: null
        });
      }
    }
    
    // If no emotional intent, proceed with regular intent detection
    const intent = detectIntent(message);

    // Generate response
    const result = generateResponse(intent, message, emotion);
    
    // Add emotional context to response if needed
    let finalResponse = result.response;
    if (emotion.emotion !== 'neutral' && emotion.emotion !== 'content') {
      finalResponse = addEmotionalContext(result.response, emotion);
    }

    res.json({
      success: true,
      response: finalResponse,
      intent,
      emotion,
      data: result.data,
      attachments: result.attachments,
      image_url: result.imageUrl,
      suggestions: result.suggestions,
      schedules: result.schedules || [],
      professor: result.professor || null
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/reload-data', async (req, res) => {
  try {
    await loadData();
    res.json({
      success: true,
      message: 'Data reloaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    professors_loaded: dbData.professors.length,
    subjects_loaded: dbData.subjects.length,
    schedules_loaded: dbData.schedules.length,
    attachments_loaded: dbData.attachments.length
  });
});

// Start server
const PORT = process.env.CHATBOT_PORT || 5000;

loadData().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🤖 FindMyProfessor AI Chatbot Server`);
    console.log(`📡 Running on http://localhost:${PORT}`);
    console.log(`🌐 Network access: http://<your-ip>:${PORT}`);
    console.log(`✅ ${dbData.professors.length} professors loaded`);
    console.log(`\nPress Ctrl+C to stop\n`);
  });
});
