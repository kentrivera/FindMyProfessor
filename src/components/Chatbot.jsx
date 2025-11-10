import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, User, Paperclip, ExternalLink } from 'lucide-react'
import { sendMessage } from '../services/chatbot'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingText, setTypingText] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setMessages([
        {
          id: 1,
          type: 'bot',
          text: "Hello! 👋 I'm your FindMyProfessor AI assistant. I can help you find information about professors, their schedules, subjects, and contact details. How can I help you today?",
          timestamp: new Date()
        }
      ])
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await sendMessage(inputMessage)
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response.data.response,
        intent: response.data.intent,
        emotion: response.data.emotion || null,
        professorImage: response.data.image_url || null,
        professor: response.data.professor || null,
        attachments: response.data.attachments || [],
        schedules: response.data.schedules || [],
        suggestions: response.data.suggestions || [],
        timestamp: new Date(),
        isTyping: true
      }

      // Add message with typing indicator
      setMessages(prev => [...prev, botMessage])
      
      // Simulate typing animation
      const fullText = response.data.response
      let currentIndex = 0
      const typingSpeed = 20 // milliseconds per character
      
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setTypingText(fullText.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typingInterval)
          // Update message to stop typing
          setMessages(prev => prev.map(msg => 
            msg.id === botMessage.id ? { ...msg, isTyping: false } : msg
          ))
          setTypingText('')
          setIsTyping(false)
        }
      }, typingSpeed)
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed z-50 p-4 text-white transition-all rounded-full shadow-2xl bottom-6 right-6 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 hover:scale-110 animate-pulseGlow"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[100vh] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 border-t sm:border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="relative flex items-center justify-between p-3 text-white sm:p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient sm:rounded-t-2xl">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-white/10 to-transparent"></div>
            <div className="relative flex items-center space-x-3">
              <div className="p-2 bg-white rounded-full shadow-lg bg-opacity-20 backdrop-blur-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">FindMyProfessor AI</h3>
                <p className="text-xs text-white/90">✨ Smart & Always Available</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="relative p-2 transition-all rounded-full hover:bg-white/20 hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50">
            {messages.map((message, index) => (
              <div 
                key={message.id}
                className={message.type === 'bot' ? 'animate-slideUp' : 'animate-fadeIn'}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="flex-shrink-0 mr-2">
                      <div className="p-2 rounded-full bg-primary-100">
                        <Bot className="w-4 h-4 text-primary-600" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary-600 text-white animate-fadeIn'
                        : 'bg-white text-slate-800 shadow-sm border border-slate-200'
                    }`}
                  >
                    {/* Emotion Indicator */}
                    {message.type === 'bot' && message.emotion && (
                      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-200">
                        <span className="text-lg">{message.emotion.emoji}</span>
                        <span className="text-xs capitalize text-slate-500">{message.emotion.emotion}</span>
                      </div>
                    )}

                    {/* Professor Profile Card */}
                    {message.type === 'bot' && message.professor && (
                      <div className="p-3 mb-3 border rounded-lg bg-gradient-to-br from-slate-50 to-white border-slate-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {message.professor.image ? (
                              <img 
                                src={`http://localhost:8000${message.professor.image}`}
                                alt={message.professor.name}
                                className="object-cover w-16 h-16 border-2 rounded-full border-primary-200"
                                onError={(e) => {
                                  // Fallback to initials if image fails
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="flex items-center justify-center w-16 h-16 text-xl font-bold rounded-full bg-primary-100 text-primary-600"
                              style={{ display: message.professor.image ? 'none' : 'flex' }}
                            >
                              {message.professor.name?.charAt(0) || '?'}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-800">{message.professor.name}</h4>
                            <p className="text-xs text-slate-600">{message.professor.department}</p>
                            {message.professor.specialization && (
                              <p className="mt-1 text-xs font-medium text-primary-600">🎯 {message.professor.specialization}</p>
                            )}
                            {message.professor.email && (
                              <p className="mt-1 text-xs text-slate-600">📧 {message.professor.email}</p>
                            )}
                            {message.professor.office_location && (
                              <p className="mt-1 text-xs text-slate-500">📍 {message.professor.office_location}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message Text with Typing Effect */}
                    <p className="text-sm whitespace-pre-wrap">
                      {message.type === 'bot' && message.isTyping ? (
                        <>
                          {typingText}
                          <span className="inline-block w-0.5 h-4 ml-1 bg-gradient-to-b from-blue-500 to-pink-500 animate-pulse"></span>
                        </>
                      ) : (
                        message.text
                      )}
                    </p>

                    {/* Schedule Table */}
                    {message.type === 'bot' && message.schedules && message.schedules.length > 0 && (
                      <div className="mt-3 overflow-x-auto">
                        <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-slate-700">
                          📅 Schedule Details
                        </div>
                        <div className="min-w-full overflow-hidden bg-white border rounded-lg border-slate-200">
                          <table className="min-w-full text-xs">
                            <thead className="bg-slate-100">
                              <tr>
                                <th className="px-2 py-1.5 text-left font-semibold text-slate-700">Subject</th>
                                <th className="px-2 py-1.5 text-left font-semibold text-slate-700">Day</th>
                                <th className="px-2 py-1.5 text-left font-semibold text-slate-700">Time</th>
                                <th className="px-2 py-1.5 text-left font-semibold text-slate-700">Room</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {message.schedules.map((schedule, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="px-2 py-1.5 text-slate-800">
                                    <div className="font-medium">{schedule.subject_code || 'N/A'}</div>
                                    <div className="text-slate-500 truncate max-w-[120px]">{schedule.subject_name}</div>
                                  </td>
                                  <td className="px-2 py-1.5 text-slate-700">{schedule.day || 'N/A'}</td>
                                  <td className="px-2 py-1.5 text-slate-700 whitespace-nowrap">
                                    {schedule.time_start && schedule.time_end 
                                      ? `${schedule.time_start.slice(0,5)}-${schedule.time_end.slice(0,5)}`
                                      : 'N/A'}
                                  </td>
                                  <td className="px-2 py-1.5 text-slate-700">{schedule.classroom || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {message.type === 'bot' && message.attachments && message.attachments.length > 0 && (
                      <div className="pt-3 mt-3 space-y-2 border-t border-slate-200">
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
                          <div key={idx} className="p-2 transition-colors bg-white border rounded-lg border-slate-200 hover:border-primary-300">
                            {/* Show image preview if it's an image */}
                            {isImage && (
                              <div className="mb-2">
                                <img 
                                  src={fileUrl}
                                  alt={attachment.file_name}
                                  className="object-cover w-full h-32 border rounded border-slate-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                            {/* Show PDF/document icon for other files */}
                            {!isImage && (
                              <div className="flex items-center justify-center h-20 mb-2 rounded bg-slate-100">
                                <div className="text-3xl">
                                  {fileExt.includes('pdf') ? '📄' : 
                                   fileExt.includes('doc') || fileExt.includes('docx') ? '📝' : 
                                   fileExt.includes('xls') || fileExt.includes('xlsx') ? '📊' : 
                                   fileExt.includes('ppt') || fileExt.includes('pptx') ? '📽️' : 
                                   '📎'}
                                </div>
                              </div>
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate text-slate-800">{attachment.file_name}</p>
                                {attachment.subject_code && (
                                  <p className="text-xs font-medium text-primary-600">{attachment.subject_code}</p>
                                )}
                                {attachment.description && (
                                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{attachment.description}</p>
                                )}
                              </div>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 p-1.5 bg-primary-50 hover:bg-primary-100 rounded transition-colors"
                                title="Open file"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-primary-600" />
                              </a>
                            </div>
                          </div>
                        )})}
                      </div>
                    )}

                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary-100' : 'text-slate-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="p-2 rounded-full bg-slate-200">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {message.type === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-10">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-xs transition-colors bg-white border rounded-full border-primary-300 text-primary-700 hover:bg-primary-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-2 animate-fadeIn">
                <div className="flex-shrink-0 p-2 rounded-full shadow-lg bg-gradient-to-br from-blue-100 to-pink-100 animate-pulse">
                  <Bot className="w-4 h-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600" />
                </div>
                <div className="flex-1">
                  <div className="px-4 py-3 bg-white border shadow-lg rounded-2xl border-gradient-to-r from-blue-200 to-pink-200">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 animate-bounce shadow-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600 animate-pulse">AI is thinking...</span>
                    </div>
                  </div>
                  <p className="mt-1 ml-1 text-xs text-slate-400">🔍 Searching database and analyzing...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200 rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isTyping}
                className="flex-1 px-4 py-2 transition-all border rounded-full border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="p-3 text-white transition-all rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed hover:scale-105 active:scale-95 disabled:shadow-none"
              >
                <Send className={`w-5 h-5 ${isTyping ? 'opacity-50' : ''}`} />
              </button>
            </div>
            {isTyping && (
              <p className="mt-2 text-xs text-center animate-pulse text-slate-400">
                Please wait while I process your request...
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
