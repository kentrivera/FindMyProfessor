import { useState, useEffect } from 'react'
import { Users, Calendar, BookOpen, Activity, TrendingUp, Mail, MapPin } from 'lucide-react'
import { getProfessors, getSchedules, getSubjects, getLogs } from '../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    professors: 0,
    schedules: 0,
    subjects: 0,
    recentLogs: []
  })
  const [professors, setProfessors] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [profsRes, schedsRes, subsRes, logsRes] = await Promise.all([
        getProfessors(),
        getSchedules(),
        getSubjects(),
        getLogs({ limit: 10 })
      ])

      // API returns data directly in response.data
      const professorsData = Array.isArray(profsRes.data) ? profsRes.data : []
      const schedulesData = Array.isArray(schedsRes.data) ? schedsRes.data : []
      const subjectsData = Array.isArray(subsRes.data) ? subsRes.data : []
      const logsData = logsRes.data?.logs || []

      setProfessors(professorsData.slice(0, 5)) // Top 5 professors
      setStats({
        professors: professorsData.length,
        schedules: schedulesData.length,
        subjects: subjectsData.length,
        recentLogs: logsData
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      console.error('Error details:', error.response?.data || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      'from-blue-500 to-violet-500',
      'from-violet-500 to-pink-500',
      'from-pink-500 to-blue-500',
      'from-blue-600 via-violet-600 to-pink-600',
      'from-violet-600 to-pink-600'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const statCards = [
    { icon: Users, label: 'Total Professors', value: stats.professors, color: 'from-blue-500 to-violet-500', bgColor: 'from-blue-50 to-violet-50', shadowColor: 'shadow-blue-500/20' },
    { icon: Calendar, label: 'Total Schedules', value: stats.schedules, color: 'from-violet-500 to-pink-500', bgColor: 'from-violet-50 to-pink-50', shadowColor: 'shadow-violet-500/20' },
    { icon: BookOpen, label: 'Total Subjects', value: stats.subjects, color: 'from-pink-500 to-blue-500', bgColor: 'from-pink-50 to-blue-50', shadowColor: 'shadow-pink-500/20' },
    { icon: Activity, label: 'Recent Activities', value: stats.recentLogs.length, color: 'from-blue-600 via-violet-600 to-pink-600', bgColor: 'from-blue-50 via-violet-50 to-pink-50', shadowColor: 'shadow-violet-500/20' },
  ]

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">Welcome to FindMyProfessor Admin Panel</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-violet-200 border-t-violet-600 mx-auto shadow-lg shadow-violet-500/30"></div>
          <p className="mt-4 text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent font-semibold">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div 
                    key={index} 
                    className={`group relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg ${stat.shadowColor} border-2 border-violet-200 hover:border-violet-400 p-4 sm:p-5 lg:p-6 hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
                  >
                    {/* Animated Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon Badge - Now visible on mobile */}
                      <div className={`inline-flex bg-gradient-to-br ${stat.color} p-2.5 sm:p-3 lg:p-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-violet-500/30 mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" strokeWidth={2.5} />
                      </div>
                      
                      {/* Label */}
                      <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-slate-600 group-hover:text-slate-700 mb-2 truncate uppercase tracking-wide">
                        {stat.label}
                      </p>
                      
                      {/* Value */}
                      <div className="flex items-end justify-between">
                        <p className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                          {stat.value}
                        </p>
                        
                        {/* Active Badge */}
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-100 to-pink-100 rounded-full border border-violet-200 group-hover:border-violet-300 group-hover:shadow-sm transition-all duration-300">
                          <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-600" strokeWidth={2.5} />
                          <span className="text-[9px] sm:text-[10px] text-violet-600 font-bold uppercase tracking-wide">Live</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3 sm:mt-4 h-1 sm:h-1.5 bg-violet-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${stat.color} rounded-full group-hover:animate-pulse transition-all duration-500`}
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Top Professors */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg shadow-violet-500/10 border border-violet-200 hover:border-violet-300 hover:shadow-violet-500/20 transition-all duration-200 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                  Top Professors
                </h2>
                
                {professors.length === 0 ? (
                  <p className="text-xs sm:text-sm text-slate-600 text-center py-8">No professors available</p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {professors.map((prof) => (
                      <div key={prof.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50/50 via-violet-50/50 to-pink-50/50 rounded-xl border border-violet-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/20 hover:scale-[1.01] transition-all duration-200">
                        {/* Avatar/Profile Image */}
                        {prof.profile_image ? (
                          <img 
                            src={`http://localhost:5000/uploads/professors/${prof.profile_image}`}
                            alt={prof.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-violet-300 shadow-lg shadow-violet-500/30 flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br ${getAvatarColor(prof.name)} flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-xl shadow-lg shadow-violet-500/30 flex-shrink-0 ${prof.profile_image ? 'hidden' : ''}`}>
                          {prof.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm lg:text-base truncate">{prof.name}</h3>
                          <p className="text-[10px] sm:text-xs text-slate-600 flex items-center gap-1 truncate">
                            <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className="truncate">{prof.department}</span>
                          </p>
                          {prof.email && (
                            <p className="text-[9px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5 sm:mt-1 truncate">
                              <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                              <span className="truncate">{prof.email}</span>
                            </p>
                          )}
                          {prof.office_location && (
                            <p className="hidden sm:flex text-xs text-slate-500 items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{prof.office_location}</span>
                            </p>
                          )}
                        </div>
                        
                        {/* Badge */}
                        <div className="text-center flex-shrink-0">
                          <div className="bg-gradient-to-r from-blue-100 via-violet-100 to-pink-100 text-violet-700 text-[9px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap border border-violet-200">
                            Active
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg shadow-violet-500/10 border border-violet-200 hover:border-violet-300 hover:shadow-violet-500/20 transition-all duration-200 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                  Recent Activity
                </h2>
                
                {stats.recentLogs.length === 0 ? (
                  <p className="text-xs sm:text-sm text-slate-600 text-center py-8">No recent activity</p>
                ) : (
                  <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                    {stats.recentLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-blue-50/50 via-violet-50/50 to-pink-50/50 rounded-xl border border-violet-200 hover:border-violet-300 hover:shadow-sm hover:shadow-violet-500/20 hover:scale-[1.01] transition-all duration-200">
                        <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 shadow-sm ${
                          log.action === 'CREATE' ? 'bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600' :
                          log.action === 'UPDATE' ? 'bg-gradient-to-br from-violet-100 to-pink-100 text-violet-600' :
                          log.action === 'DELETE' ? 'bg-gradient-to-br from-pink-100 to-blue-100 text-pink-600' :
                          log.action === 'LOGIN' ? 'bg-gradient-to-br from-violet-100 to-pink-100 text-violet-600' :
                          'bg-gradient-to-br from-blue-100 to-violet-100 text-slate-600'
                        }`}>
                          <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-slate-900 truncate">{log.details}</p>
                          <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
                            {log.full_name || 'System'} • {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
    </>
  )
}

export default AdminDashboard
