import axios from 'axios'

// Use proxy in development, direct URL in production
const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiry and authentication errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname
      
      // Clear stored auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Only redirect if not already on login page
      if (!currentPath.includes('/login') && !currentPath.includes('/admin/login')) {
        // Show notification
        if (window.Swal) {
          window.Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            confirmButtonText: 'Go to Login'
          }).then(() => {
            // Redirect based on path
            if (currentPath.includes('/admin')) {
              window.location.href = '/admin/login'
            } else {
              window.location.href = '/'
            }
          })
        } else {
          // Fallback if SweetAlert is not loaded
          alert('Your session has expired. Please login again.')
          if (currentPath.includes('/admin')) {
            window.location.href = '/admin/login'
          } else {
            window.location.href = '/'
          }
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (credentials) => api.post('/auth/login', credentials)
export const register = (userData) => api.post('/auth/register', userData)
export const logout = () => api.post('/auth/logout')

// Professors
export const getProfessors = (params) => api.get('/professors', { params })
export const getProfessor = (id) => api.get(`/professors/${id}`)
export const createProfessor = (data) => api.post('/professors', data)
export const updateProfessor = (id, data) => api.put(`/professors/${id}`, data)
export const deleteProfessor = (id) => api.delete(`/professors/${id}`)
export const uploadProfessorImage = (id, formData) => api.post(`/professors/${id}/upload-image`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// Subjects
export const getSubjects = (params) => api.get('/subjects', { params })
export const getSubject = (id) => api.get(`/subjects/${id}`)
export const createSubject = (data) => api.post('/subjects', data)
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data)
export const deleteSubject = (id) => api.delete(`/subjects/${id}`)

// Schedules
export const getSchedules = (params) => api.get('/schedules', { params })
export const getSchedule = (id) => api.get(`/schedules/${id}`)
export const createSchedule = (data) => {
  // If data is FormData, set multipart header
  if (data instanceof FormData) {
    return api.post('/schedules', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
  return api.post('/schedules', data)
}
export const updateSchedule = (id, data) => {
  // If data is FormData, set multipart header
  if (data instanceof FormData) {
    return api.put(`/schedules/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
  return api.put(`/schedules/${id}`, data)
}
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`)

// Attachments
export const getAttachments = (params) => api.get('/attachments', { params })
export const uploadAttachment = (formData) => api.post('/attachments', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const deleteAttachment = (id) => api.delete(`/attachments/${id}`)

// Logs
export const getLogs = (params) => api.get('/logs', { params })

// Chatbot Data
export const getChatbotData = () => api.get('/chatbot-data')

export default api
