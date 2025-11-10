import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import Swal from 'sweetalert2'
import { register } from '../services/api'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match!',
        background: 'linear-gradient(135deg, #dbeafe 0%, #ddd6fe 50%, #fce7f3 100%)',
        iconColor: '#dc2626',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-2 border-violet-200',
          title: 'text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent',
          htmlContainer: 'text-slate-600',
          confirmButton: 'bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-700 hover:via-violet-700 hover:to-pink-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg transition-all duration-200'
        }
      })
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be at least 6 characters long!',
        background: 'linear-gradient(135deg, #dbeafe 0%, #ddd6fe 50%, #fce7f3 100%)',
        iconColor: '#dc2626',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-2 border-violet-200',
          title: 'text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent',
          htmlContainer: 'text-slate-600',
          confirmButton: 'bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-700 hover:via-violet-700 hover:to-pink-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg transition-all duration-200'
        }
      })
      return
    }

    setIsLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      // Always register as student
      registerData.role = 'student'
      const response = await register(registerData)

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          html: `
            <p>Welcome, <strong>${formData.full_name}</strong>!</p>
            <p class="text-sm text-slate-600 mt-2">You can now login with your credentials</p>
          `,
          timer: 2000,
          showConfirmButton: false,
          background: 'linear-gradient(135deg, #dbeafe 0%, #ddd6fe 50%, #fce7f3 100%)',
          iconColor: '#8b5cf6',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-2 border-violet-200',
            title: 'text-xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent',
            htmlContainer: 'text-slate-600'
          }
        })

        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.'

      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMessage,
        background: 'linear-gradient(135deg, #dbeafe 0%, #ddd6fe 50%, #fce7f3 100%)',
        iconColor: '#dc2626',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-2 border-violet-200',
          title: 'text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent',
          htmlContainer: 'text-slate-600',
          confirmButton: 'bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-700 hover:via-violet-700 hover:to-pink-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg transition-all duration-200'
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent mb-2">
            FindMyProfessor
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Create your account
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 border border-violet-200">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-100 via-violet-100 to-pink-100 p-3 sm:p-4 rounded-full">
              <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-violet-600" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="input-field text-sm sm:text-base"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
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
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
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
                placeholder="Create a password (min. 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field text-sm sm:text-base"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-700 hover:via-violet-700 hover:to-pink-700 text-white py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Register'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-violet-600 hover:text-violet-700 font-semibold transition-colors duration-200"
              >
                Login here
              </button>
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <a href="/" className="text-violet-600 hover:text-violet-700 text-xs sm:text-sm font-medium transition-colors duration-200">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default Register
