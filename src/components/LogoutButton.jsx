import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Swal from 'sweetalert2'
import { logout as logoutAPI } from '../services/api'

const LogoutButton = ({ setIsAuthenticated, className = '' }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: 'linear-gradient(135deg, #dbeafe 0%, #ddd6fe 50%, #fce7f3 100%)',
      iconColor: '#8b5cf6',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border-2 border-violet-200',
        title: 'text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent',
        htmlContainer: 'text-slate-600',
        confirmButton: 'bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-700 hover:via-violet-700 hover:to-pink-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg transition-all duration-200',
        cancelButton: 'bg-slate-500 hover:bg-slate-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg transition-all duration-200'
      }
    })

    if (result.isConfirmed) {
      try {
        // Call logout API
        await logoutAPI()
      } catch (error) {
        console.error('Logout API error:', error)
      } finally {
        // Clear local storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('token_expires_at')
        
        // Update authentication state
        setIsAuthenticated(false)
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          timer: 1500,
          showConfirmButton: false,
          background: 'linear-gradient(135deg, #dbeafe 0%, #ddd6fe 50%, #fce7f3 100%)',
          iconColor: '#8b5cf6',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-2 border-violet-200',
            title: 'text-xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent',
            htmlContainer: 'text-slate-600'
          }
        })
        
        // Redirect to login
        navigate('/login', { replace: true })
      }
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={className || "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-all duration-200 shadow-lg"}
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  )
}

export default LogoutButton
