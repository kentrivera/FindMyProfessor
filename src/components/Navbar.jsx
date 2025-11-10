import { LogOut, Menu, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { logout as logoutAPI } from '../services/api'
import { useSidebar } from '../contexts/SidebarContext'

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { setIsMobileOpen } = useSidebar()

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
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
        await logoutAPI()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('token_expires_at')
        setIsAuthenticated(false)
        
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been successfully logged out',
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
        
        navigate('/login')
      }
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Spacer for desktop */}
          <div className="hidden lg:block flex-1"></div>

          {/* Right Section - User Info & Logout */}
          <div className="flex items-center gap-3 ml-auto">
            {/* User Info */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg border border-violet-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-900">{user.full_name || 'Admin'}</p>
                <p className="text-[10px] text-slate-500 capitalize">{user.role || 'Administrator'}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg shadow-md transition-all duration-200 text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
