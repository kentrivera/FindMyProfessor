import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { SidebarProvider } from './contexts/SidebarContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import UserView from './pages/UserView'
import ChatInterface from './pages/ChatInterface'
import AdminDashboard from './pages/AdminDashboard'
import Professors from './pages/Professors'
import Subjects from './pages/Subjects'
import Schedules from './pages/Schedules'
import Attachments from './pages/Attachments'
import Logs from './pages/Logs'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Landing Page - Public */}
        <Route path="/" element={<Landing />} />
        
        {/* Login Route - Redirects to home if already logged in */}
        <Route 
          path="/login" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Login setIsAuthenticated={setIsAuthenticated} />
            </ProtectedRoute>
          } 
        />
        
        {/* Register Route */}
        <Route 
          path="/register" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect old admin login to unified login */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        
        {/* Protected Routes - Require login */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute requireAuth={true}>
              <UserView setIsAuthenticated={setIsAuthenticated} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ChatInterface setIsAuthenticated={setIsAuthenticated} />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes - Wrapped with SidebarProvider */}
        <Route path="/admin/*" element={
          <SidebarProvider>
            <Routes>
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute requireAuth={true} requireRole="admin">
                    <AdminLayout setIsAuthenticated={setIsAuthenticated}>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="professors" 
                element={
                  <ProtectedRoute requireAuth={true} requireRole="admin">
                    <AdminLayout setIsAuthenticated={setIsAuthenticated}>
                      <Professors />
                    </AdminLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="subjects" 
                element={
                  <ProtectedRoute requireAuth={true} requireRole="admin">
                    <AdminLayout setIsAuthenticated={setIsAuthenticated}>
                      <Subjects />
                    </AdminLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="schedules" 
                element={
                  <ProtectedRoute requireAuth={true} requireRole="admin">
                    <AdminLayout setIsAuthenticated={setIsAuthenticated}>
                      <Schedules />
                    </AdminLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="attachments" 
                element={
                  <ProtectedRoute requireAuth={true} requireRole="admin">
                    <AdminLayout setIsAuthenticated={setIsAuthenticated}>
                      <Attachments />
                    </AdminLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="logs" 
                element={
                  <ProtectedRoute requireAuth={true} requireRole="admin">
                    <AdminLayout setIsAuthenticated={setIsAuthenticated}>
                      <Logs />
                    </AdminLayout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </SidebarProvider>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
