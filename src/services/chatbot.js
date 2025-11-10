import axios from 'axios'

const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5000'

const chatbotApi = axios.create({
  baseURL: CHATBOT_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const sendMessage = (message, sessionId = 'default') => 
  chatbotApi.post('/chat', { message, session_id: sessionId })

// Alias for compatibility
export const sendChatMessage = sendMessage

export const reloadChatbotData = () => 
  chatbotApi.post('/reload-data')

export const getChatbotHealth = () => 
  chatbotApi.get('/health')

export default chatbotApi
