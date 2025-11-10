import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, GraduationCap, BookOpen, MapPin, MessageCircle, Sparkles, Calendar, Clock, Users, FileText, ChevronDown, ChevronUp, Download, Eye, X } from 'lucide-react'
import Chatbot from '../components/Chatbot'
import LogoutButton from '../components/LogoutButton'
import { getProfessors, getSchedules, getSubjects, getAttachments } from '../services/api'
import Swal from 'sweetalert2'

const UserView = ({ setIsAuthenticated }) => {
  const navigate = useNavigate()
  const [professors, setProfessors] = useState([])
  const [schedules, setSchedules] = useState([])
  const [subjects, setSubjects] = useState([])
  const [attachments, setAttachments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedProfessor, setSelectedProfessor] = useState(null)
  const [selectedAttachment, setSelectedAttachment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [professorsPerPage] = useState(5)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    // Trigger fade-in animation
    setIsPageLoaded(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profsRes, schedsRes, subsRes, attachRes] = await Promise.all([
        getProfessors(),
        getSchedules(),
        getSubjects(),
        getAttachments()
      ])
      setProfessors(profsRes.data)
      setSchedules(schedsRes.data)
      setSubjects(subsRes.data)
      setAttachments(attachRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load data. Please try again.',
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

  const uniqueSubjects = [...new Set(subjects.map(s => s.subject_name))]

  // Get professor's schedules
  const getProfessorSchedules = (profId) => {
    return schedules.filter(sched => sched.professor_id === profId)
  }

  // Get professor's subjects
  const getProfessorSubjects = (profId) => {
    const profSchedules = schedules.filter(sched => sched.professor_id === profId)
    const subjectIds = [...new Set(profSchedules.map(s => s.subject_id).filter(Boolean))]
    return subjects.filter(sub => subjectIds.includes(sub.id))
  }

  // Get professor's attachments (through schedules)
  const getProfessorAttachments = (profId) => {
    const profSchedules = schedules.filter(sched => sched.professor_id === profId)
    const scheduleIds = profSchedules.map(s => s.id)
    return attachments.filter(att => scheduleIds.includes(att.schedule_id))
  }

  const filteredProfessors = professors.filter(prof => {
    const matchesSearch = prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prof.department.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by subject if selected
    let matchesSubject = true
    if (selectedSubject) {
      const profSubjects = getProfessorSubjects(prof.id)
      matchesSubject = profSubjects.some(sub => sub.subject_name === selectedSubject)
    }
    
    return matchesSearch && matchesSubject
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredProfessors.length / professorsPerPage)
  const indexOfLastProfessor = currentPage * professorsPerPage
  const indexOfFirstProfessor = indexOfLastProfessor - professorsPerPage
  const currentProfessors = filteredProfessors.slice(indexOfFirstProfessor, indexOfLastProfessor)

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedSubject])

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewAttachment = (attachment) => {
    console.log('Opening attachment:', attachment);
    console.log('File name:', attachment.file_name);
    console.log('File path (actual):', attachment.file_path);
    console.log('Full URL will be:', `http://localhost:5000/uploads/${attachment.file_path}`);
    setSelectedAttachment(attachment)
  }

  const isImageFile = (filename) => {
    return /\.(jpg|jpeg|png|gif)$/i.test(filename)
  }

  const isPdfFile = (filename) => {
    return /\.pdf$/i.test(filename)
  }

  return (
    <div className={`min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50 transition-opacity duration-700 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b shadow-sm border-violet-100/50 bg-white/95 backdrop-blur-md">
        <div className="px-2 py-2 mx-auto max-w-7xl sm:px-4 sm:py-3 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg shadow-md bg-gradient-to-br from-blue-500 to-violet-600 sm:p-2">
                <GraduationCap className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
              </div>
              <div>
                <h1 className="text-xs font-bold text-transparent sm:text-base bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text">
                  FindMyProfessor
                </h1>
                <p className="hidden text-[10px] text-slate-500 sm:block sm:text-xs">AI-powered search assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {user.full_name && (
                <>
                  <div className="flex items-center gap-1.5 px-2 py-1 border border-violet-200 rounded-full sm:gap-2 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-50 to-violet-50">
                    <div className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-violet-600">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden text-xs font-medium sm:inline sm:text-sm text-slate-700">
                      {user.full_name}
                    </span>
                  </div>
                  <LogoutButton 
                    setIsAuthenticated={setIsAuthenticated}
                    className="items-center gap-1 px-2 py-1 text-xs font-medium text-white transition-all duration-200 rounded-full sm:gap-1.5 sm:px-3 sm:py-1.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-lg flex"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="py-4 text-white sm:py-6 lg:py-8 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600">
        <div className="px-3 mx-auto text-center max-w-7xl sm:px-4 lg:px-8">
          <h2 className="mb-2 text-xl font-bold sm:mb-3 sm:text-3xl lg:text-4xl">
            Find Your Professor
          </h2>
          <p className="max-w-2xl px-2 mx-auto mb-4 text-sm text-blue-100 sm:px-4 sm:text-base sm:mb-5 lg:text-lg">
            Search professors, view schedules, and chat with AI
          </p>
          
          {/* Chat Button */}
          <button
            onClick={() => navigate('/chat')}
            className="inline-flex items-center gap-2 px-5 py-2 mb-4 text-sm font-semibold transition-all transform bg-white rounded-full shadow-lg sm:gap-2.5 sm:px-6 sm:py-2.5 text-violet-700 hover:bg-blue-50 hover:shadow-xl hover:scale-105 sm:mb-5 sm:text-base lg:text-lg"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Chat with AI</span>
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search professor or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 pl-4 pr-11 text-sm shadow-lg sm:py-3 sm:pl-5 sm:pr-14 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300 sm:text-base lg:text-lg"
              />
              <Search className="absolute w-4 h-4 transform -translate-y-1/2 right-3.5 sm:right-4 top-1/2 text-slate-400 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-2 py-2 mx-auto max-w-7xl sm:px-4 lg:px-8 sm:py-3">
        <div>
          <h3 className="mb-1 text-[10px] font-semibold sm:text-xs text-slate-700">Filter by Subject</h3>
          <div className="flex flex-wrap gap-1 sm:gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedSubject('')}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md font-medium transition-all text-[10px] sm:text-xs flex-shrink-0 ${
                !selectedSubject
                  ? 'bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-pink-50 border border-slate-200'
              }`}
            >
              All
            </button>
            {uniqueSubjects.map(subject => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md font-medium transition-all text-[10px] sm:text-xs flex-shrink-0 ${
                  selectedSubject === subject
                    ? 'bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-pink-50 border border-slate-200'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Professors List */}
      <div className="px-2 py-3 pb-16 mx-auto max-w-7xl sm:px-4 sm:py-4 lg:px-8 sm:pb-20">
        {isLoading ? (
          <div className="py-8 text-center sm:py-12">
            <div className="inline-block w-10 h-10 mb-3 border-4 border-blue-200 rounded-full animate-spin sm:h-12 sm:w-12 border-t-violet-600"></div>
            <p className="mt-3 text-xs text-slate-600 sm:text-sm">Loading professors...</p>
          </div>
        ) : filteredProfessors.length === 0 ? (
          <div className="py-8 text-center bg-white shadow-sm sm:py-12 rounded-xl">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 sm:w-12 sm:h-12 text-slate-300" />
            <p className="text-xs text-slate-600 sm:text-sm">No professors found</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 sm:space-y-3">
              {currentProfessors.map(professor => {
                const profSchedules = getProfessorSchedules(professor.id)
                const profSubjects = getProfessorSubjects(professor.id)
                const profAttachments = getProfessorAttachments(professor.id)

                return (
                  <div key={professor.id} className="flex items-center justify-between gap-3 p-3 transition-all duration-300 bg-white border-l-4 shadow-sm sm:p-4 sm:gap-4 rounded-xl hover:shadow-md border-violet-500">
                    {/* Left: Professor Info */}
                    <div className="flex items-center flex-1 min-w-0 gap-2 sm:gap-3">
                      {professor.image ? (
                        <img
                          src={professor.image.startsWith('/') || professor.image.startsWith('http') 
                            ? `http://localhost:5000${professor.image}` 
                            : `http://localhost:5000/uploads/professors/${professor.image}`}
                          alt={professor.name}
                          className="flex-shrink-0 object-cover w-10 h-10 border-2 rounded-full sm:w-12 sm:h-12 border-violet-200"
                          onError={(e) => {
                            console.log('Image failed to load:', professor.image);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`flex-shrink-0 p-1.5 rounded-full sm:p-2 bg-gradient-to-br from-blue-100 to-violet-100 ${professor.image ? 'hidden' : ''}`}>
                        <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                      </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold truncate sm:text-sm text-slate-900">{professor.name}</h3>
                      <p className="text-[10px] font-medium truncate text-violet-600 sm:text-xs">{professor.department}</p>
                      
                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-1 mt-0.5 sm:gap-1.5 sm:mt-1">
                        <div className="flex items-center px-1 py-0.5 text-[9px] font-medium text-blue-600 rounded bg-blue-50 sm:px-1.5 sm:text-[10px]">
                          <BookOpen className="flex-shrink-0 w-2 h-2 mr-0.5 sm:w-2.5 sm:h-2.5" />
                          {profSubjects.length}
                        </div>
                        <div className="flex items-center px-1 py-0.5 text-[9px] font-medium text-green-600 rounded bg-green-50 sm:px-1.5 sm:text-[10px]">
                          <Calendar className="flex-shrink-0 w-2 h-2 mr-0.5 sm:w-2.5 sm:h-2.5" />
                          {profSchedules.length}
                        </div>
                        {profAttachments.length > 0 && (
                          <div className="flex items-center px-1 py-0.5 text-[9px] font-medium text-orange-600 rounded bg-orange-50 sm:px-1.5 sm:text-[10px]">
                            <FileText className="flex-shrink-0 w-2 h-2 mr-0.5 sm:w-2.5 sm:h-2.5" />
                            {profAttachments.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Show Details Button */}
                  <button
                    onClick={() => {
                      console.log('Button clicked, professor:', professor)
                      setSelectedProfessor(professor)
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white transition-all rounded-lg sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-md hover:shadow-lg flex-shrink-0"
                  >
                    <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">Show Details</span>
                    <span className="sm:hidden">Details</span>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-1.5 mt-3 sm:gap-2 sm:mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-lg transition-all ${
                  currentPage === 1
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-violet-600 border border-violet-200 hover:bg-violet-50 hover:border-violet-300 shadow-sm'
                }`}
              >
                Previous
              </button>

              <div className="flex gap-1 sm:gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-6 h-6 sm:w-8 sm:h-8 text-[10px] sm:text-xs font-medium rounded-lg transition-all ${
                          currentPage === pageNumber
                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-violet-50 hover:border-violet-300'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="flex items-center px-0.5 text-[10px] text-slate-400">...</span>
                  }
                  return null
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-lg transition-all ${
                  currentPage === totalPages
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-violet-600 border border-violet-200 hover:bg-violet-50 hover:border-violet-300 shadow-sm'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* Results Info */}
          <div className="mt-2 text-[10px] text-center sm:mt-3 sm:text-xs text-slate-500">
            Showing {indexOfFirstProfessor + 1} - {Math.min(indexOfLastProfessor, filteredProfessors.length)} of {filteredProfessors.length} professors
          </div>
        </>
        )}
      </div>

      {/* Professor Details Modal */}
      {selectedProfessor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedProfessor(null)}>
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b sm:px-6 sm:py-4 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600">
              <div className="flex items-center gap-3">
                {selectedProfessor.image ? (
                  <img
                    src={selectedProfessor.image.startsWith('/') || selectedProfessor.image.startsWith('http') 
                      ? `http://localhost:5000${selectedProfessor.image}` 
                      : `http://localhost:5000/uploads/professors/${selectedProfessor.image}`}
                    alt={selectedProfessor.name}
                    className="object-cover w-12 h-12 border-2 border-white rounded-full sm:w-14 sm:h-14"
                    onError={(e) => {
                      console.log('Modal image failed to load:', selectedProfessor.image);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`p-2.5 bg-white rounded-full sm:p-3 ${selectedProfessor.image ? 'hidden' : ''}`}>
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white sm:text-xl">{selectedProfessor.name}</h2>
                  <p className="text-xs font-medium text-blue-100 sm:text-sm">{selectedProfessor.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfessor(null)}
                className="p-1.5 transition-colors bg-white/20 hover:bg-white/30 rounded-lg"
              >
                <X className="w-5 h-5 text-white sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto sm:p-6 max-h-[calc(90vh-80px)]">
              {/* Professor Info */}
              <div className="pb-4 mb-4 space-y-3 border-b sm:pb-5 sm:mb-5">
                {selectedProfessor.bio && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold sm:text-base text-slate-900">About</h3>
                    <p className="text-xs leading-relaxed sm:text-sm text-slate-600">{selectedProfessor.bio}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                  {selectedProfessor.office_location && (
                    <div className="flex items-center gap-2 p-2 rounded-lg sm:p-3 bg-blue-50">
                      <MapPin className="w-4 h-4 text-blue-600 sm:w-5 sm:h-5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Office</p>
                        <p className="text-xs font-semibold sm:text-sm text-slate-900">{selectedProfessor.office_location}</p>
                      </div>
                    </div>
                  )}
                  {selectedProfessor.email && (
                    <div className="flex items-center gap-2 p-2 rounded-lg sm:p-3 bg-violet-50">
                      <span className="text-lg sm:text-xl">📧</span>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Email</p>
                        <p className="text-xs font-semibold break-all sm:text-sm text-slate-900">{selectedProfessor.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subjects Section */}
              {(() => {
                const profSubjects = getProfessorSubjects(selectedProfessor.id)
                return profSubjects.length > 0 && (
                  <div className="mb-6">
                    <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-slate-900">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Subjects
                    </h3>
                    <div className="space-y-2">
                      {profSubjects.map(subject => (
                        <div key={subject.id} className="p-3 border border-blue-200 rounded-xl bg-blue-50">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{subject.subject_code}</p>
                              <p className="mt-1 text-sm text-slate-700">{subject.subject_name}</p>
                              {subject.description && (
                                <p className="mt-1.5 text-xs text-slate-500">{subject.description}</p>
                              )}
                            </div>
                            <span className="px-2 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-lg whitespace-nowrap">
                              {subject.units} units
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Schedules Section */}
                        {(() => {
                          const profSchedules = getProfessorSchedules(selectedProfessor.id)
                          const profAttachments = getProfessorAttachments(selectedProfessor.id)
                          return profSchedules.length > 0 && (
                            <div className="mb-6">
                              <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-slate-900">
                                <Calendar className="w-5 h-5 text-green-600" />
                                Schedules
                              </h3>
                              <div className="space-y-3">
                                {profSchedules.map(schedule => {
                                  const schedSubject = subjects.find(s => s.id === schedule.subject_id)
                                  const scheduleAttachment = profAttachments.find(att => att.schedule_id === schedule.id)
                                  
                                  return (
                                    <div key={schedule.id} className="overflow-hidden border border-green-200 rounded-xl bg-green-50">
                                      {scheduleAttachment && isImageFile(scheduleAttachment.file_name) && (
                                        <div 
                                          className="relative cursor-pointer group"
                                          onClick={() => handleViewAttachment(scheduleAttachment)}
                                        >
                                          <img
                                            src={`http://localhost:5000/uploads/${scheduleAttachment.file_path}`}
                                            alt={scheduleAttachment.file_name}
                                            className="object-cover w-full h-48 transition-transform group-hover:scale-105"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-40 group-hover:opacity-100">
                                            <Eye className="w-12 h-12 text-white" />
                                          </div>
                                        </div>
                                      )}
                                      <div className="p-4">
                                        {schedSubject && (
                                          <p className="mb-2 text-base font-semibold text-slate-900">
                                            {schedSubject.subject_code} - {schedSubject.subject_name}
                                          </p>
                                        )}
                                        <div className="flex flex-wrap gap-2 mb-2">
                                          {schedule.day && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg">
                                              <Calendar className="w-4 h-4 text-green-600" />
                                              <span className="text-sm font-medium text-slate-700">{schedule.day}</span>
                                            </div>
                                          )}
                                          {schedule.time_start && schedule.time_end && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg">
                                              <Clock className="w-4 h-4 text-green-600" />
                                              <span className="text-sm font-medium text-slate-700">
                                                {schedule.time_start} - {schedule.time_end}
                                              </span>
                                            </div>
                                          )}
                                          {schedule.classroom && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg">
                                              <MapPin className="w-4 h-4 text-green-600" />
                                              <span className="text-sm font-medium text-slate-700">{schedule.classroom}</span>
                                            </div>
                                          )}
                                          {schedule.section && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg">
                                              <Users className="w-4 h-4 text-green-600" />
                                              <span className="text-sm font-medium text-slate-700">{schedule.section}</span>
                                            </div>
                                          )}
                                        </div>
                                        {schedule.description && (
                                          <p className="mb-2 text-sm text-slate-600">{schedule.description}</p>
                                        )}
                                        {scheduleAttachment && !isImageFile(scheduleAttachment.file_name) && (
                                          <div className="flex items-center gap-2 p-3 mt-2 bg-white rounded-lg">
                                            <FileText className="flex-shrink-0 w-5 h-5 text-orange-600" />
                                            <span className="flex-1 text-sm truncate text-slate-700">{scheduleAttachment.file_name}</span>
                                            <button
                                              onClick={() => handleViewAttachment(scheduleAttachment)}
                                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700"
                                            >
                                              <Eye className="w-4 h-4" />
                                              View
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })()}

                        {/* Resources/Attachments Section */}
                        {(() => {
                          const profAttachments = getProfessorAttachments(selectedProfessor.id)
                          return profAttachments.length > 0 && (
                            <div>
                              <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-slate-900">
                                <FileText className="w-5 h-5 text-orange-600" />
                                Resources & Materials
                              </h3>
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {profAttachments.map(attachment => (
                                  <div key={attachment.id} className="overflow-hidden border border-orange-200 rounded-xl bg-orange-50">
                                    {isImageFile(attachment.file_path) ? (
                                      <div 
                                        className="relative cursor-pointer group"
                                        onClick={() => handleViewAttachment(attachment)}
                                      >
                                        <img
                                          src={`http://localhost:5000/uploads/${attachment.file_path}`}
                                          alt={attachment.file_name}
                                          className="object-cover w-full h-32 transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-40 group-hover:opacity-100">
                                          <Eye className="w-8 h-8 text-white" />
                                        </div>
                                        {attachment.description && (
                                          <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-white bg-black bg-opacity-60">
                                            <p className="truncate">{attachment.description}</p>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="p-3">
                                        <div className="flex items-center justify-center w-full h-20 mb-2 bg-white rounded-lg">
                                          <FileText className="w-10 h-10 text-orange-600" />
                                        </div>
                                        <p className="mb-2 text-xs truncate text-slate-900">{attachment.file_name}</p>
                                        <button
                                          onClick={() => handleViewAttachment(attachment)}
                                          className="flex items-center justify-center w-full gap-1 px-2 py-1.5 text-xs font-medium text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          View
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })()}
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot Prompt */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-12">
        <div className="p-6 text-center border border-orange-200 sm:p-8 bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-orange-600 sm:w-12 sm:h-12 sm:mb-4" />
          <h3 className="mb-2 text-lg font-bold sm:text-2xl text-slate-900">
            Need Quick Answers?
          </h3>
          <p className="mb-4 text-sm sm:text-base text-slate-600">
            Chat with our AI assistant for instant information about professors, schedules, subjects, and more!
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 text-xs sm:text-sm">
            <span className="px-2.5 sm:px-3 py-1 bg-white rounded-full text-slate-700">📚 Find Subjects</span>
            <span className="px-2.5 sm:px-3 py-1 bg-white rounded-full text-slate-700">⏰ Check Schedules</span>
            <span className="px-2.5 sm:px-3 py-1 bg-white rounded-full text-slate-700">👨‍🏫 Professor Info</span>
            <span className="px-2.5 sm:px-3 py-1 bg-white rounded-full text-slate-700">📍 Room Locations</span>
          </div>
          <button
            onClick={() => navigate('/chat')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base font-semibold text-white transition-all transform rounded-full shadow-lg bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 hover:shadow-xl hover:scale-105"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Start Chatting
          </button>
        </div>
      </div>

      {/* Chatbot Component */}
      <Chatbot />

      {/* Attachment Viewer Modal */}
      {selectedAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b sm:p-4 border-slate-200 bg-gradient-to-r from-orange-50 to-pink-50">
              <div className="flex-1 min-w-0 mr-2">
                <h3 className="text-sm font-semibold truncate sm:text-lg text-slate-900">{selectedAttachment.file_name}</h3>
                {selectedAttachment.description && (
                  <p className="text-xs truncate sm:text-sm text-slate-600">{selectedAttachment.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedAttachment(null)}
                className="flex-shrink-0 p-1.5 sm:p-2 transition-colors rounded-lg hover:bg-red-100"
              >
                <X className="w-4 h-4 text-red-600 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-2 sm:p-4 overflow-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-100px)]">
              {(() => {
                const isImage = isImageFile(selectedAttachment.file_path);
                const isPdf = isPdfFile(selectedAttachment.file_path);
                console.log('File type check:', {
                  fileName: selectedAttachment.file_name,
                  filePath: selectedAttachment.file_path,
                  isImage,
                  isPdf,
                  url: `http://localhost:5000/uploads/${selectedAttachment.file_path}`
                });
                
                if (isImage) {
                  return (
                    <img
                      src={`http://localhost:5000/uploads/${selectedAttachment.file_path}`}
                      alt={selectedAttachment.file_name}
                      className="h-auto max-w-full mx-auto rounded-lg shadow-lg"
                      onError={(e) => {
                        console.error('Failed to load image:', e.target.src);
                        console.log('Attachment object:', selectedAttachment);
                      }}
                      onLoad={() => console.log('Image loaded successfully!')}
                    />
                  );
                }
                
                if (isPdf) {
                  return (
                    <iframe
                      src={`http://localhost:5000/uploads/${selectedAttachment.file_path}`}
                      className="w-full h-[60vh] sm:h-[70vh] rounded-lg border-2 border-slate-200"
                      title={selectedAttachment.file_name}
                    />
                  );
                }
                
                return (
                  <div className="py-8 text-center sm:py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 sm:w-16 sm:h-16 text-slate-300" />
                    <p className="mb-4 text-sm sm:text-base text-slate-600">Preview not available for this file type</p>
                    <a
                      href={`http://localhost:5000/uploads/${selectedAttachment.file_path}`}
                      download={selectedAttachment.file_name}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white transition-all rounded-lg sm:px-6 sm:py-3 sm:text-base bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      Download File
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserView
