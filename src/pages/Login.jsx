import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { login } from '../services/api'
import Swal from 'sweetalert2'

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      const user = JSON.parse(userStr)
      // Redirect to appropriate dashboard
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/home', { replace: true })
      }
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await login(formData)
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Store token expiry if provided
        if (response.data.expires_at) {
          localStorage.setItem('token_expires_at', response.data.expires_at)
        }
        
        setIsAuthenticated(true)
        
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          html: `
            <p>Welcome back, <strong>${response.data.user.full_name}</strong>!</p>
            ${response.data.expires_at ? `<p class="text-sm text-gray-600 mt-2">Session expires in 24 hours</p>` : ''}
          `,
          timer: 2000,
          showConfirmButton: false
        })

        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/home')
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Invalid credentials'
      
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        html: `
          <p>${errorMessage}</p>
          <p class="text-sm text-gray-600 mt-2">Admin: admin / admin123<br/>Student: user / user123</p>
        `
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-transparent sm:text-3xl lg:text-4xl bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text">
            FindMyProfessor
          </h1>
          <p className="text-xs text-slate-600 sm:text-sm">
            Sign in to your account
          </p>
        </div>

        <div className="p-6 border shadow-xl bg-white/80 backdrop-blur-md rounded-2xl sm:p-8 border-violet-200">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full sm:p-4 bg-gradient-to-r from-blue-100 via-violet-100 to-pink-100">
              <LogIn className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-violet-600" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="username" className="block mb-2 text-xs font-medium sm:text-sm text-slate-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-field text-sm sm:text-base"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-xs font-medium sm:text-sm text-slate-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field text-sm sm:text-base"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-700 hover:via-violet-700 hover:to-pink-700 text-white py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>
          </form>

          

          <div className="pt-6 mt-6 text-center border-t border-slate-200">
            <p className="text-xs text-slate-600 sm:text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-semibold transition-colors duration-200 text-violet-600 hover:text-violet-700"
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center sm:mt-6">
          <a href="/" className="text-xs font-medium transition-colors duration-200 sm:text-sm text-violet-600 hover:text-violet-700">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login
