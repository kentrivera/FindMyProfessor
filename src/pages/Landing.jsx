import { useNavigate } from 'react-router-dom'
import { Search, MessageCircle, Calendar, Users, BookOpen, ArrowRight, Sparkles } from 'lucide-react'

const Landing = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Search,
      title: 'Find Professors',
      description: 'Easily search and discover professors by name, department, or subject'
    },
    {
      icon: Calendar,
      title: 'View Schedules',
      description: 'Access complete class schedules, room locations, and time slots'
    },
    {
      icon: MessageCircle,
      title: 'AI Chatbot',
      description: 'Ask questions and get instant answers about professors and subjects'
    },
    {
      icon: BookOpen,
      title: 'Subject Details',
      description: 'Explore subjects, course descriptions, and available resources'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-violet-200 shadow-sm">
        <div className="container mx-auto px-2 xs:px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-20">
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3">
              <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xs xs:text-sm sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                FindMyProfessor
              </h1>
            </div>
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-2 xs:px-2.5 sm:px-6 py-1 xs:py-1.5 sm:py-2.5 text-[10px] xs:text-xs sm:text-base font-semibold text-violet-600 hover:text-violet-700 transition-colors duration-200"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-2 xs:px-2.5 sm:px-6 py-1 xs:py-1.5 sm:py-2.5 text-[10px] xs:text-xs sm:text-base font-semibold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-700 hover:via-violet-700 hover:to-pink-700 text-white rounded-md sm:rounded-lg transition-all duration-200 shadow-lg shadow-violet-500/30"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 py-6 xs:py-8 sm:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 bg-gradient-to-r from-blue-100 via-violet-100 to-pink-100 rounded-full mb-3 xs:mb-4 sm:mb-8">
            <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-5 sm:h-5 text-violet-600" />
            <span className="text-[9px] xs:text-[10px] sm:text-sm font-semibold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
              Your Academic Assistant
            </span>
          </div>
          
          <h2 className="text-lg xs:text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-2 xs:mb-3 sm:mb-6 leading-tight px-1 xs:px-2">
            Find Your Perfect{' '}
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
              Professor
            </span>
            <br />
            With Ease
          </h2>
          
          <p className="text-[11px] xs:text-xs sm:text-lg md:text-xl text-slate-600 mb-4 xs:mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2 xs:px-3 sm:px-4">
            Your comprehensive platform to discover professors, explore schedules, 
            and get instant answers about your academic journey all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 xs:gap-3 sm:gap-6 px-2 xs:px-3 sm:px-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-4 xs:px-5 sm:px-8 py-2 xs:py-2.5 sm:py-4 text-xs xs:text-sm sm:text-lg font-semibold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-700 hover:via-violet-700 hover:to-pink-700 text-white rounded-lg sm:rounded-xl transition-all duration-200 shadow-xl shadow-violet-500/30 flex items-center justify-center gap-1.5 xs:gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-4 xs:px-5 sm:px-8 py-2 xs:py-2.5 sm:py-4 text-xs xs:text-sm sm:text-lg font-semibold bg-white hover:bg-slate-50 text-slate-900 rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg border-2 border-slate-200 hover:border-violet-300"
            >
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-8 mt-6 xs:mt-8 sm:mt-16 max-w-2xl mx-auto px-1 xs:px-2">
            <div className="text-center">
              <div className="text-base xs:text-lg sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                50+
              </div>
              <div className="text-[9px] xs:text-[10px] sm:text-sm text-slate-600 mt-0.5 sm:mt-2">Professors</div>
            </div>
            <div className="text-center">
              <div className="text-base xs:text-lg sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                100+
              </div>
              <div className="text-[9px] xs:text-[10px] sm:text-sm text-slate-600 mt-0.5 sm:mt-2">Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-base xs:text-lg sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-[9px] xs:text-[10px] sm:text-sm text-slate-600 mt-0.5 sm:mt-2">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 py-6 xs:py-8 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4 xs:mb-6 sm:mb-16">
            <h3 className="text-base xs:text-lg sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-1.5 xs:mb-2 sm:mb-4 px-1 xs:px-2">
              Everything You Need
            </h3>
            <p className="text-[11px] xs:text-xs sm:text-lg text-slate-600 max-w-2xl mx-auto px-2 xs:px-3 sm:px-4">
              Powerful features designed to make your academic life easier
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm p-3 xs:p-4 sm:p-8 rounded-lg xs:rounded-xl sm:rounded-2xl border-2 border-violet-100 hover:border-violet-300 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1"
              >
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-100 via-violet-100 to-pink-100 rounded-lg xs:rounded-xl flex items-center justify-center mb-2 xs:mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-7 sm:h-7 text-violet-600" />
                </div>
                <h4 className="text-sm xs:text-base sm:text-xl font-bold text-slate-900 mb-1 xs:mb-1.5 sm:mb-3">
                  {feature.title}
                </h4>
                <p className="text-[10px] xs:text-xs sm:text-base text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 py-6 xs:py-8 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 rounded-lg xs:rounded-xl sm:rounded-3xl p-4 xs:p-5 sm:p-12 lg:p-16 text-center shadow-2xl">
            <h3 className="text-sm xs:text-base sm:text-3xl lg:text-4xl font-bold text-white mb-1.5 xs:mb-2 sm:mb-4 px-1 xs:px-2">
              Ready to Get Started?
            </h3>
            <p className="text-[10px] xs:text-xs sm:text-lg lg:text-xl text-white/90 mb-3 xs:mb-4 sm:mb-8 max-w-2xl mx-auto px-1 xs:px-2">
              Join thousands of students who are already using FindMyProfessor to enhance their academic experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 xs:gap-2.5 sm:gap-4">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-3 xs:px-4 sm:px-8 py-2 xs:py-2.5 sm:py-4 text-[10px] xs:text-xs sm:text-lg font-semibold bg-white hover:bg-slate-50 text-violet-600 rounded-md xs:rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-3 xs:px-4 sm:px-8 py-2 xs:py-2.5 sm:py-4 text-[10px] xs:text-xs sm:text-lg font-semibold bg-white/10 hover:bg-white/20 text-white rounded-md xs:rounded-lg sm:rounded-xl transition-all duration-200 border-2 border-white/30"
              >
                Sign In Instead
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-violet-200 py-3 xs:py-4 sm:py-8">
        <div className="container mx-auto px-2 xs:px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 xs:gap-3 sm:gap-4">
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3">
              <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 rounded-md xs:rounded-lg flex items-center justify-center">
                <Users className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-[11px] xs:text-xs sm:text-lg font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                FindMyProfessor
              </span>
            </div>
            <p className="text-[9px] xs:text-[10px] sm:text-sm text-slate-600 text-center">
              © 2025 FindMyProfessor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
