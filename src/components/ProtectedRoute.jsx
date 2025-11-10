import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, requireAuth = true, requireRole = null, redirectToLogin = true }) => {
  const location = useLocation()
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // If user is already logged in and trying to access login page
  if (!requireAuth && token && user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else {
      return <Navigate to="/home" replace />
    }
  }

  // If route requires authentication
  if (requireAuth) {
    if (!token || !user) {
      // Not logged in, redirect to login
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check role requirement
    if (requireRole && user.role !== requireRole) {
      // Wrong role, redirect to appropriate page
      if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />
      } else {
        return <Navigate to="/home" replace />
      }
    }
  }

  return children
}

export default ProtectedRoute
