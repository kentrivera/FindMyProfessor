import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BookOpen, 
  Paperclip, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'
import { useSidebar } from '../contexts/SidebarContext'

const Sidebar = () => {
  const location = useLocation()
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar()

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', gradient: 'from-blue-400 to-violet-400' },
    { path: '/admin/professors', icon: Users, label: 'Professors', gradient: 'from-violet-400 to-pink-400' },
    { path: '/admin/subjects', icon: BookOpen, label: 'Subjects', gradient: 'from-pink-400 to-blue-400' },
    { path: '/admin/schedules', icon: Calendar, label: 'Schedules', gradient: 'from-blue-400 via-violet-400 to-pink-400' },
    { path: '/admin/attachments', icon: Paperclip, label: 'Attachments', gradient: 'from-violet-500 to-pink-500' },
    { path: '/admin/logs', icon: Activity, label: 'Activity Logs', gradient: 'from-pink-500 to-violet-500' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-blue-950 via-violet-950 to-pink-950 shadow-2xl shadow-violet-500/20 z-50 transition-all duration-300 ease-in-out border-r border-violet-500/20
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Brand Section with Collapse Button */}
        <div className={`h-14 flex items-center border-b border-violet-500/30 bg-gradient-to-r from-blue-900/30 via-violet-900/30 to-pink-900/30 backdrop-blur-sm relative transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}>
          <div className="flex items-center gap-2.5">
            {/* Logo Icon with Gradient Animation */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/50 hover:shadow-violet-500/70 transition-shadow duration-300">
              <span className="text-white font-bold text-base">F</span>
            </div>
            
            {/* Brand Text with Fade Animation */}
            {!isCollapsed && (
              <div className="flex flex-col animate-fadeIn">
                <span className="text-xs font-bold leading-tight bg-gradient-to-r from-blue-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                  FindMyProfessor
                </span>
                <span className="text-[9px] text-violet-300/60 leading-tight uppercase tracking-wide">Admin Portal</span>
              </div>
            )}
          </div>
          
          {/* Desktop Collapse Button - Top Right */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center rounded-md bg-violet-500/20 hover:bg-gradient-to-r hover:from-blue-500 hover:via-violet-500 hover:to-pink-500 text-violet-300 hover:text-white transition-all duration-200 hover:scale-110 group shadow-sm hover:shadow-violet-500/50 border border-violet-500/30"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
            )}
          </button>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 text-violet-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-pink-500 p-1 rounded-md transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2 mb-1 rounded-lg transition-all duration-200 text-xs
                  ${active 
                    ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 text-white shadow-lg shadow-violet-500/50 scale-[1.02] border border-violet-400/30' 
                    : 'text-violet-200/80 hover:bg-gradient-to-r hover:from-blue-500/10 hover:via-violet-500/10 hover:to-pink-500/10 hover:text-white hover:shadow-md hover:shadow-violet-500/20 hover:scale-[1.01] hover:border hover:border-violet-500/30'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  active ? 'text-white' : `text-transparent bg-gradient-to-br ${item.gradient} bg-clip-text`
                }`} 
                  strokeWidth={2.5}
                  style={!active ? {
                    stroke: `url(#icon-gradient-${item.path.split('/').pop()})`
                  } : {}}
                />
                {!isCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
                {/* Active Indicator */}
                {active && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* Hidden SVG for Icon Gradients */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="icon-gradient-dashboard" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="icon-gradient-professors" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <linearGradient id="icon-gradient-subjects" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <linearGradient id="icon-gradient-schedules" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <linearGradient id="icon-gradient-attachments" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="icon-gradient-logs" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
      </aside>
    </>
  )
}

export default Sidebar
