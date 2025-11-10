import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, User, Bot, Sparkles, ArrowLeft, Paperclip, ExternalLink } from 'lucide-react'
import LogoutButton from '../components/LogoutButton'
import { sendChatMessage } from '../services/chatbot'

const ChatInterface = ({ setIsAuthenticated }) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [currentSuggestions, setCurrentSuggestions] = useState([])
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const messagesEndRef = useRef(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Initial suggestions - these will be replaced with API suggestions
  const initialSuggestions = [
    "List all professors",
    "Show me monday schedule",
    "When is database",
    "Help"
  ]

  useEffect(() => {
    // Trigger fade-in animation
    setIsPageLoaded(true)
    
    // Welcome message with initial suggestions
    setMessages([
      {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: `Hello ${user.full_name || 'there'}! 👋 I'm your AI assistant for FindMyProfessor. I can help you find professors, schedules, classrooms, and more. What would you like to know?`,
        timestamp: new Date(),
        isTyping: false
      }
    ])
    // Set initial suggestions
    setCurrentSuggestions(initialSuggestions)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Enhanced send handler with typing animation and structured data support
  const handleSendMessageEnhanced = async (messageText = inputMessage) => {
    if (!messageText.trim()) return

    const id = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const userMessage = {
      id: id + '-user',
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await sendChatMessage(messageText)

      // Update suggestions from API response
      if (response?.data?.suggestions && Array.isArray(response.data.suggestions)) {
        setCurrentSuggestions(response.data.suggestions)
      }

      // Insert a bot placeholder that is typing
      const botId = id + '-bot'
      const botMessage = {
        id: botId,
        type: 'bot',
        content: '',
        timestamp: new Date(),
        isTyping: true,
        professor: response?.data?.professor || null,
        attachments: response?.data?.attachments || [],
        schedules: response?.data?.schedules || []
      }

      setMessages(prev => [...prev, botMessage])

      // Simulate typing: reveal characters one-by-one
      const fullText = response?.data?.response || "I'm sorry, I couldn't process that request."
      let currentIndex = 0
      const typingSpeed = 20 // ms per character

      setTypingText('')

      await new Promise((resolve) => {
        const interval = setInterval(() => {
          currentIndex++
          const partial = fullText.slice(0, currentIndex)
          setTypingText(partial)

          // Update bot message preview
          setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: partial } : m))

          if (currentIndex >= fullText.length) {
            clearInterval(interval)
            // finalize bot message
            setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: fullText, isTyping: false } : m))
            setTypingText('')
            resolve()
          }
        }, typingSpeed)
      })

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: `err-${Date.now()}`,
        type: 'bot',
        content: `I apologize, but I'm having trouble connecting to my knowledge base right now. \n\n📝 You can still:\n• Browse professors on the homepage\n• Search by name or department\n• View professor details and schedules\n\nThe chatbot service may not be running. This is optional - all core features work without it!`,
        timestamp: new Date(),
        isTyping: false
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return

    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await sendChatMessage(messageText)
      
      const botMessage = {
        type: 'bot',
        content: response.data.response || 'I\'m sorry, I couldn\'t process that request.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        type: 'bot',
        content: `I apologize, but I'm having trouble connecting to my knowledge base right now. 

📝 You can still:
• Browse professors on the homepage
• Search by name or department
• View professor details and schedules

The chatbot service may not be running. This is optional - all core features work without it!`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }


  const handleSuggestionClick = (suggestion) => {
    handleSendMessageEnhanced(suggestion)
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={`flex flex-col h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50 transition-opacity duration-700 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="border-b border-blue-100 shadow-sm bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between w-full max-w-5xl px-2 py-2 mx-auto xs:px-3 sm:px-4 sm:py-3 md:py-4">
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={() => navigate('/home')}
              className="p-1 transition-colors rounded-lg xs:p-1.5 sm:p-2 hover:bg-blue-50"
              title="Back to home"
            >
              <ArrowLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 p-1 xs:p-1.5 sm:p-2 rounded-lg xs:rounded-xl shadow-md">
                <Bot className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs font-bold leading-tight text-transparent xs:text-sm sm:text-base md:text-xl bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text">
                  FindMyProf AI
                </h1>
                <p className="hidden text-xs sm:block sm:text-sm text-slate-500">Your assistant</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-4">
            <div className="items-center hidden gap-1.5 px-2 py-1 border border-blue-200 rounded-lg md:flex md:gap-2 md:px-3 md:py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-blue-50 to-violet-50">
              <User className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-violet-600" />
              <span className="text-xs font-medium md:text-sm text-slate-700">{user.full_name}</span>
            </div>
            <LogoutButton 
              setIsAuthenticated={setIsAuthenticated}
              className="flex items-center gap-0.5 px-1.5 py-1 text-xs font-medium text-white transition-all rounded-md xs:gap-1 xs:px-2 xs:py-1.5 sm:gap-1.5 sm:px-3 sm:py-2 sm:rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-4xl px-2 py-3 mx-auto space-y-3 xs:px-3 xs:py-4 sm:px-4 sm:space-y-4 md:py-6 md:space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md ${
                message.type === 'bot'
                  ? 'bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500'
                  : 'bg-gradient-to-br from-pink-500 to-violet-600'
              }`}>
                {message.type === 'bot' ? (
                  <Bot className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                ) : (
                  <User className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-[80%] xs:max-w-[85%] sm:max-w-2xl ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                <div
                  className={`rounded-xl xs:rounded-2xl px-2.5 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 md:py-4 ${
                    message.type === 'bot'
                      ? 'bg-white border border-blue-100 shadow-sm'
                      : 'bg-gradient-to-br from-blue-600 via-violet-600 to-pink-600 text-white shadow-md'
                  }`}
                >
                  {/* Professor Profile Card */}
                  {message.type === 'bot' && message.professor && (
                    <div className="p-2 mb-2 border rounded-lg shadow-sm xs:p-2.5 sm:p-3 xs:mb-2.5 sm:mb-3 bg-gradient-to-br from-blue-50 to-violet-50 border-blue-200 animate-fadeIn">
                      <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                        <div className="relative flex-shrink-0">
                          {message.professor.image && (
                            <img
                              src={`http://localhost:5000/uploads/professors/${message.professor.image}`}
                              alt={message.professor.name}
                              className="object-cover transition-all border-2 rounded-full shadow-md w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 border-violet-300 hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          )}
                          <div
                            className="flex items-center justify-center text-lg font-bold transition-all rounded-full shadow-md w-14 h-14 xs:w-16 xs:h-16 xs:text-xl sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-violet-100 to-pink-100 text-violet-600 hover:scale-105"
                            style={{ display: message.professor.image ? 'none' : 'flex' }}
                          >
                            {message.professor.name?.charAt(0) || '?'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold xs:text-sm text-slate-800">{message.professor.name}</h4>
                          <p className="text-xs xs:text-xs text-slate-600">{message.professor.department}</p>
                          {message.professor.specialization && (
                            <p className="mt-0.5 xs:mt-1 text-xs font-medium text-violet-600">🎯 {message.professor.specialization}</p>
                          )}
                          {message.professor.email && (
                            <p className="mt-0.5 xs:mt-1 text-xs text-slate-600">📧 {message.professor.email}</p>
                          )}
                          {message.professor.office_location && (
                            <p className="mt-0.5 xs:mt-1 text-xs text-slate-500">📍 {message.professor.office_location}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Text with Typing Effect */}
                  <p className={`text-xs leading-relaxed whitespace-pre-wrap break-words xs:text-xs sm:text-sm ${
                    message.type === 'bot' ? 'text-slate-800' : 'text-white'
                  }`}>
                    {message.type === 'bot' && message.isTyping ? (
                      <>
                        {typingText}
                        <span className="inline-block w-0.5 h-3 xs:h-4 ml-1 bg-gradient-to-b from-blue-500 to-pink-500 animate-pulse"></span>
                      </>
                    ) : (
                      message.content
                    )}
                  </p>

                  {/* Schedule Table */}
                  {message.type === 'bot' && message.schedules && message.schedules.length > 0 && (
                    <div className="mt-2 overflow-x-auto xs:mt-2.5 sm:mt-3">
                      <div className="flex items-center gap-1 mb-1.5 xs:mb-2 text-xs font-semibold text-slate-700">
                        📅 Schedule Details
                      </div>
                      <div className="min-w-full overflow-hidden bg-white border rounded-lg border-slate-200">
                        <table className="min-w-full text-xs">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-1.5 xs:px-2 py-1 xs:py-1.5 text-left font-semibold text-slate-700 text-xs">Subject</th>
                              <th className="px-1.5 xs:px-2 py-1 xs:py-1.5 text-left font-semibold text-slate-700 text-xs">Day</th>
                              <th className="px-1.5 xs:px-2 py-1 xs:py-1.5 text-left font-semibold text-slate-700 text-xs">Time</th>
                              <th className="px-1.5 xs:px-2 py-1 xs:py-1.5 text-left font-semibold text-slate-700 text-xs">Room</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {message.schedules.map((schedule, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-1.5 xs:px-2 py-1 xs:py-1.5 text-slate-800">
                                  <div className="text-xs font-medium">{schedule.subject_code || 'N/A'}</div>
                                  <div className="text-slate-500 truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[120px] text-xs">{schedule.subject_name}</div>
                                </td>
                                <td className="px-1.5 xs:px-2 py-1 xs:py-1.5 text-slate-700 text-xs">{schedule.day || 'N/A'}</td>
                                <td className="px-1.5 xs:px-2 py-1 xs:py-1.5 text-slate-700 whitespace-nowrap text-xs">
                                  {schedule.time_start && schedule.time_end 
                                    ? `${schedule.time_start.slice(0,5)}-${schedule.time_end.slice(0,5)}`
                                    : 'N/A'}
                                </td>
                                <td className="px-1.5 xs:px-2 py-1 xs:py-1.5 text-slate-700 text-xs">{schedule.classroom || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {message.type === 'bot' && message.attachments && message.attachments.length > 0 && (
                    <div className="pt-2 mt-2 space-y-1.5 xs:pt-2.5 xs:mt-2.5 xs:space-y-2 sm:pt-3 sm:mt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <Paperclip className="w-3 h-3" />
                        <span>Course Materials ({message.attachments.length})</span>
                      </div>
                      {message.attachments.map((attachment, idx) => {
                        // Use file_path (actual filename on disk) and serve from Node.js port 5000
                        // All files are in backend/php/uploads/ root directory
                        const fileUrl = `http://localhost:5000/uploads/${attachment.file_path}`;
                        
                        const fileExt = attachment.file_type || attachment.file_name?.split('.').pop()?.toLowerCase() || '';
                        const isImage = fileExt.match(/jpg|jpeg|png|gif|webp|bmp/) || attachment.file_type?.startsWith('image/');
                        
                        return (
                        <div key={idx} className="p-1.5 xs:p-2 transition-colors bg-white border rounded-lg border-slate-200 hover:border-violet-300">
                          {/* Image preview */}
                          {isImage && (
                            <div className="mb-1.5 xs:mb-2">
                              <img 
                                src={fileUrl}
                                alt={attachment.file_name}
                                className="object-cover w-full border rounded h-28 xs:h-32 border-slate-200"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                          {/* Document icon */}
                          {!isImage && (
                            <div className="flex items-center justify-center h-16 mb-1.5 rounded xs:h-20 xs:mb-2 bg-slate-100">
                              <div className="text-2xl xs:text-3xl">
                                {fileExt.includes('pdf') ? '📄' : 
                                 fileExt.includes('doc') || fileExt.includes('docx') ? '📝' : 
                                 fileExt.includes('xls') || fileExt.includes('xlsx') ? '📊' : 
                                 fileExt.includes('ppt') || fileExt.includes('pptx') ? '📽️' : 
                                 '📎'}
                              </div>
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-1.5 xs:gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate text-slate-800">{attachment.file_name}</p>
                              {attachment.subject_code && (
                                <p className="text-xs font-medium text-violet-600">{attachment.subject_code}</p>
                              )}
                              {attachment.description && (
                                <p className="mt-0.5 xs:mt-1 text-xs text-slate-500 line-clamp-2">{attachment.description}</p>
                              )}
                            </div>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 p-1 xs:p-1.5 bg-violet-50 hover:bg-violet-100 rounded transition-colors"
                              title="Open file"
                            >
                              <ExternalLink className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-violet-600" />
                            </a>
                          </div>
                        </div>
                      )})}
                    </div>
                  )}

                  <p className={`text-xs mt-1.5 xs:mt-2 ${
                    message.type === 'bot' ? 'text-slate-400' : 'text-blue-100'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
              <div className="flex items-center justify-center flex-shrink-0 rounded-full shadow-md w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500">
                <Bot className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="px-3 py-2 bg-white border border-blue-100 shadow-sm xs:px-4 xs:py-3 sm:px-6 sm:py-4 rounded-xl xs:rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions - Now dynamic from API */}
      {currentSuggestions.length > 0 && !isTyping && (
        <div className="w-full max-w-4xl px-2 pb-2 mx-auto xs:px-3 xs:pb-3 sm:px-4 sm:pb-4">
          <div className="flex items-center gap-1.5 xs:gap-2 mb-1.5 xs:mb-2 sm:mb-3">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600" />
            <span className="text-xs font-medium sm:text-sm text-slate-600">
              {messages.filter(m => m.type === 'user').length === 0 ? 'Try asking:' : 'Quick suggestions:'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 xs:gap-2">
            {currentSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2 py-1 text-xs bg-white border border-blue-200 rounded-full xs:px-2.5 xs:py-1.5 sm:px-3 sm:py-2 sm:text-sm text-slate-700 hover:bg-blue-50 hover:border-violet-300 hover:text-violet-700 transition-all shadow-sm hover:shadow-md flex-shrink-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-blue-100 shadow-lg bg-white/80 backdrop-blur-md">
        <div className="w-full max-w-4xl px-2 py-2 mx-auto xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 md:py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessageEnhanced()
            }}
            className="flex gap-1.5 xs:gap-2 sm:gap-3"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about professors..."
              className="flex-1 px-3 py-2 text-xs bg-white border border-blue-200 rounded-full xs:px-4 xs:py-2.5 sm:px-6 sm:py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-900 placeholder-slate-400 xs:text-sm sm:text-base"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-white transition-all rounded-full shadow-md xs:gap-1.5 xs:px-4 xs:py-2.5 sm:gap-2 sm:px-6 sm:py-3 md:py-4 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-700 hover:via-violet-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg xs:text-sm sm:text-base"
            >
              <Send className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
