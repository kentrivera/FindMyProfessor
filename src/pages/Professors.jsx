import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Eye, X, Upload, Mail, Phone, MapPin, BookOpen, Award, GraduationCap, Briefcase, FileText, Lightbulb } from 'lucide-react'
import { getProfessors, getProfessor, createProfessor, updateProfessor, deleteProfessor, uploadProfessorImage } from '../services/api'
import Swal from 'sweetalert2'

const Professors = () => {
  const [professors, setProfessors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState(null)
  const [selectedProfessor, setSelectedProfessor] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    contact: '',
    email: '',
    bio: '',
    office_location: '',
    expertise: '',
    specialization: '',
    education: '',
    experience: '',
    research_interests: '',
    publications: ''
  })

  useEffect(() => {
    fetchProfessors()
  }, [])

  const fetchProfessors = async () => {
    try {
      const response = await getProfessors({ search: searchTerm })
      const data = Array.isArray(response.data) ? response.data : []
      setProfessors(data)
    } catch (error) {
      console.error('Error fetching professors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfessors()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let professorId = editingProfessor?.id

      if (editingProfessor) {
        await updateProfessor(editingProfessor.id, formData)
        Swal.fire('Success', 'Professor updated successfully', 'success')
      } else {
        const response = await createProfessor(formData)
        professorId = response.data.id
        Swal.fire('Success', 'Professor created successfully', 'success')
      }

      // Upload image if selected
      if (imageFile && professorId) {
        const imageFormData = new FormData()
        imageFormData.append('image', imageFile)
        await uploadProfessorImage(professorId, imageFormData)
      }
      
      setIsModalOpen(false)
      setEditingProfessor(null)
      resetForm()
      fetchProfessors()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Operation failed', 'error')
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'Image size must be less than 5MB', 'error')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleEdit = (professor) => {
    setEditingProfessor(professor)
    setFormData({
      name: professor.name,
      department: professor.department,
      contact: professor.contact || '',
      email: professor.email || '',
      bio: professor.bio || '',
      office_location: professor.office_location || '',
      expertise: professor.expertise || '',
      specialization: professor.specialization || '',
      education: professor.education || '',
      experience: professor.experience || '',
      research_interests: professor.research_interests || '',
      publications: professor.publications || ''
    })
    setImagePreview(professor.image ? `http://localhost:8000${professor.image}` : '')
    setIsModalOpen(true)
  }

  const handleViewDetails = async (professor) => {
    try {
      setIsDetailModalOpen(true) // Open modal immediately
      const response = await getProfessor(professor.id)
      console.log('Professor details response:', response)
      setSelectedProfessor(response.data)
    } catch (error) {
      console.error('Error loading professor:', error)
      console.error('Error response:', error.response)
      setIsDetailModalOpen(false)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load professor details'
      Swal.fire('Error', errorMessage, 'error')
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the professor and all related data',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await deleteProfessor(id)
        Swal.fire('Deleted!', 'Professor has been deleted', 'success')
        fetchProfessors()
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Delete failed', 'error')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      department: '',
      contact: '',
      email: '',
      bio: '',
      office_location: '',
      expertise: '',
      specialization: '',
      education: '',
      experience: '',
      research_interests: '',
      publications: ''
    })
    setImageFile(null)
    setImagePreview('')
  }

  const openCreateModal = () => {
    setEditingProfessor(null)
    resetForm()
    setIsModalOpen(true)
  }

  const getAvatarColor = (name) => {
    const colors = [
      'from-blue-500 to-violet-500',
      'from-violet-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-orange-500 to-red-500',
      'from-green-500 to-emerald-500'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:items-center sm:gap-0 sm:mb-6">
        <h1 className="text-xl font-bold text-transparent sm:text-2xl lg:text-3xl bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text">
          Professors
        </h1>
        <button onClick={openCreateModal} className="flex items-center justify-center w-full gap-2 px-4 py-2 text-xs text-white transition-all duration-200 rounded-lg shadow-lg sm:w-auto bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 sm:px-6 sm:text-sm">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Professor
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search professors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pr-4 text-xs border shadow-sm pl-9 sm:pl-10 sm:py-3 sm:text-sm border-violet-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

        {/* Professors Cards Grid */}
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="w-10 h-10 mx-auto border-4 rounded-full animate-spin sm:h-12 sm:w-12 border-violet-200 border-t-violet-600"></div>
            <p className="mt-4 text-xs sm:text-sm text-slate-600">Loading professors...</p>
          </div>
        ) : professors.length === 0 ? (
          <div className="py-12 text-center shadow-lg bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl">
            <BookOpen className="w-12 h-12 mx-auto mb-4 sm:w-16 sm:h-16 text-slate-300" />
            <p className="text-sm sm:text-base text-slate-600">No professors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {professors.map((professor) => (
              <div key={professor.id} className="overflow-hidden transition-all duration-200 border shadow-lg bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border-violet-100 hover:shadow-xl group">
                {/* Professor Image/Avatar */}
                <div className="relative flex items-center justify-center h-40 overflow-hidden sm:h-48 bg-gradient-to-br from-blue-50 to-violet-50">
                  {professor.image ? (
                    <img 
                      src={`http://localhost:8000${professor.image}`} 
                      alt={professor.name}
                      className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${getAvatarColor(professor.name)} flex items-center justify-center text-white font-bold text-2xl sm:text-4xl shadow-xl`}>
                      {professor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                  )}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
                    {professor.department}
                  </div>
                </div>

                {/* Professor Info */}
                <div className="p-3 sm:p-4 lg:p-5">
                  <h3 className="mb-2 text-base font-bold truncate sm:text-lg lg:text-xl text-slate-900">{professor.name}</h3>
                  
                  {professor.specialization && (
                    <p className="flex items-center gap-1 mb-2 text-xs font-medium truncate sm:text-sm text-violet-600 sm:mb-3">
                      <Award className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{professor.specialization}</span>
                    </p>
                  )}

                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    {professor.email && (
                      <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 flex items-center gap-2 truncate">
                        <Mail className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                        <span className="truncate">{professor.email}</span>
                      </p>
                    )}
                    {professor.contact && (
                      <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 flex items-center gap-2 truncate">
                        <Phone className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                        <span className="truncate">{professor.contact}</span>
                      </p>
                    )}
                    {professor.office_location && (
                      <p className="items-center hidden gap-2 text-xs truncate sm:flex lg:text-sm text-slate-600">
                        <MapPin className="flex-shrink-0 w-4 h-4 text-slate-400" />
                        <span className="truncate">{professor.office_location}</span>
                      </p>
                    )}
                  </div>

                  {/* Expertise Tags */}
                  {professor.expertise && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {professor.expertise.split(',').slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-[9px] sm:text-xs bg-gradient-to-r from-blue-100 to-violet-100 text-violet-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full truncate max-w-[120px]">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-[10px] sm:text-xs lg:text-sm text-slate-600 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-100">
                    <span className="flex items-center gap-1">
                      <BookOpen className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{professor.total_subjects || 0} Subjects</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{professor.total_schedules || 0} Schedules</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1.5 sm:gap-2">
                    <button 
                      onClick={() => handleViewDetails(professor)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs lg:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </button>
                    <button 
                      onClick={() => handleEdit(professor)}
                      className="bg-gradient-to-r from-violet-100 to-pink-100 hover:from-violet-200 hover:to-pink-200 text-violet-700 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(professor.id)}
                      className="bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 z-10 p-6 text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {editingProfessor ? 'Edit Professor' : 'Add New Professor'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-white transition-colors rounded-lg hover:bg-white/20">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload */}
                <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
                  <div className="relative">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="object-cover w-32 h-32 border-4 rounded-full shadow-lg border-violet-200" />
                    ) : (
                      <div className="flex items-center justify-center w-32 h-32 border-4 rounded-full shadow-lg bg-gradient-to-br from-blue-100 to-violet-100 border-violet-200">
                        <Upload className="w-12 h-12 text-violet-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-slate-700">Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm cursor-pointer text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-violet-50 file:to-pink-50 file:text-violet-700 hover:file:from-violet-100 hover:file:to-pink-100"
                    />
                    <p className="mt-1 text-xs text-slate-500">JPG, PNG or GIF (Max 5MB)</p>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                    <BookOpen className="w-5 h-5 text-violet-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Department *</label>
                      <input
                        type="text"
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Contact Number</label>
                      <input
                        type="text"
                        value={formData.contact}
                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Office Location</label>
                      <input
                        type="text"
                        value={formData.office_location}
                        onChange={(e) => setFormData({...formData, office_location: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        placeholder="e.g., Machine Learning"
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div>
                  <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                    <Award className="w-5 h-5 text-violet-600" />
                    Professional Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Expertise (comma-separated)</label>
                      <input
                        type="text"
                        value={formData.expertise}
                        onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                        placeholder="e.g., Python, Data Science, AI"
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Education</label>
                      <textarea
                        rows="2"
                        value={formData.education}
                        onChange={(e) => setFormData({...formData, education: e.target.value})}
                        placeholder="e.g., PhD in Computer Science, MIT"
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Experience</label>
                      <textarea
                        rows="2"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        placeholder="e.g., 10+ years in academia and industry"
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Research Interests</label>
                      <textarea
                        rows="2"
                        value={formData.research_interests}
                        onChange={(e) => setFormData({...formData, research_interests: e.target.value})}
                        placeholder="e.g., Artificial Intelligence, Machine Learning, Deep Learning"
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Publications</label>
                      <textarea
                        rows="2"
                        value={formData.publications}
                        onChange={(e) => setFormData({...formData, publications: e.target.value})}
                        placeholder="e.g., 50+ peer-reviewed papers in top-tier conferences"
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Bio</label>
                      <textarea
                        rows="3"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Brief biography..."
                        className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-6 py-2 transition-colors border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                  >
                    {editingProfessor ? 'Update Professor' : 'Create Professor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail View Modal */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setIsDetailModalOpen(false)}>
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 z-10 p-6 text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Professor Details</h2>
                  <button onClick={() => setIsDetailModalOpen(false)} className="p-2 text-white transition-colors rounded-lg hover:bg-white/20">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {!selectedProfessor ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 mx-auto border-4 rounded-full animate-spin border-violet-200 border-t-violet-600"></div>
                  <p className="mt-4 text-slate-600">Loading professor details...</p>
                </div>
              ) : (
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-start gap-6 pb-6 mb-6 border-b border-slate-200">
                  {selectedProfessor.image ? (
                    <img 
                      src={`http://localhost:8000${selectedProfessor.image}`} 
                      alt={selectedProfessor.name}
                      className="object-cover w-32 h-32 border-4 rounded-full shadow-lg border-violet-200"
                    />
                  ) : (
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getAvatarColor(selectedProfessor.name)} flex items-center justify-center text-white font-bold text-4xl border-4 border-violet-200 shadow-lg`}>
                      {selectedProfessor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="mb-2 text-2xl font-bold text-slate-900">{selectedProfessor.name}</h3>
                    <p className="mb-3 font-medium text-violet-600">{selectedProfessor.department}</p>
                    {selectedProfessor.specialization && (
                      <p className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                        <Award className="w-4 h-4" />
                        {selectedProfessor.specialization}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3">
                      {selectedProfessor.email && (
                        <a href={`mailto:${selectedProfessor.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-violet-600">
                          <Mail className="w-4 h-4" />
                          {selectedProfessor.email}
                        </a>
                      )}
                      {selectedProfessor.contact && (
                        <a href={`tel:${selectedProfessor.contact}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-violet-600">
                          <Phone className="w-4 h-4" />
                          {selectedProfessor.contact}
                        </a>
                      )}
                      {selectedProfessor.office_location && (
                        <p className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          {selectedProfessor.office_location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                {selectedProfessor.expertise && (
                  <div className="mb-6">
                    <h4 className="flex items-center gap-2 mb-3 text-lg font-semibold text-slate-900">
                      <Lightbulb className="w-5 h-5 text-violet-600" />
                      Areas of Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfessor.expertise.split(',').map((skill, idx) => (
                        <span key={idx} className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-blue-100 to-violet-100 text-violet-700">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedProfessor.bio && (
                  <div className="mb-6">
                    <h4 className="mb-3 text-lg font-semibold text-slate-900">Biography</h4>
                    <p className="leading-relaxed text-slate-700">{selectedProfessor.bio}</p>
                  </div>
                )}

                {/* Education */}
                {selectedProfessor.education && (
                  <div className="mb-6">
                    <h4 className="flex items-center gap-2 mb-3 text-lg font-semibold text-slate-900">
                      <GraduationCap className="w-5 h-5 text-violet-600" />
                      Education
                    </h4>
                    <p className="leading-relaxed whitespace-pre-line text-slate-700">{selectedProfessor.education}</p>
                  </div>
                )}

                {/* Experience */}
                {selectedProfessor.experience && (
                  <div className="mb-6">
                    <h4 className="flex items-center gap-2 mb-3 text-lg font-semibold text-slate-900">
                      <Briefcase className="w-5 h-5 text-violet-600" />
                      Experience
                    </h4>
                    <p className="leading-relaxed whitespace-pre-line text-slate-700">{selectedProfessor.experience}</p>
                  </div>
                )}

                {/* Research Interests */}
                {selectedProfessor.research_interests && (
                  <div className="mb-6">
                    <h4 className="flex items-center gap-2 mb-3 text-lg font-semibold text-slate-900">
                      <FileText className="w-5 h-5 text-violet-600" />
                      Research Interests
                    </h4>
                    <p className="leading-relaxed whitespace-pre-line text-slate-700">{selectedProfessor.research_interests}</p>
                  </div>
                )}

                {/* Publications */}
                {selectedProfessor.publications && (
                  <div className="mb-6">
                    <h4 className="flex items-center gap-2 mb-3 text-lg font-semibold text-slate-900">
                      <BookOpen className="w-5 h-5 text-violet-600" />
                      Publications
                    </h4>
                    <p className="leading-relaxed whitespace-pre-line text-slate-700">{selectedProfessor.publications}</p>
                  </div>
                )}

                {/* Subjects */}
                {selectedProfessor.subjects && selectedProfessor.subjects.length > 0 && (
                  <div className="mb-6">
                    <h4 className="mb-3 text-lg font-semibold text-slate-900">Teaching Subjects</h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {selectedProfessor.subjects.map((subject) => (
                        <div key={subject.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-violet-50 border-violet-100">
                          <p className="font-semibold text-slate-900">{subject.subject_name}</p>
                          <p className="text-sm text-slate-600">{subject.subject_code} • {subject.credits} credits</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedules */}
                {selectedProfessor.schedules && selectedProfessor.schedules.length > 0 && (
                  <div className="mb-6">
                    <h4 className="mb-3 text-lg font-semibold text-slate-900">Class Schedule</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedProfessor.schedules.map((schedule) => (
                        <div key={schedule.id} className="p-4 border border-pink-100 rounded-lg bg-gradient-to-r from-violet-50 to-pink-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{schedule.day}</p>
                              <p className="text-sm text-slate-600">{schedule.time_start} - {schedule.time_end}</p>
                            </div>
                            <p className="text-sm font-medium text-violet-600">{schedule.classroom}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        )}
    </>
  )
}

export default Professors
