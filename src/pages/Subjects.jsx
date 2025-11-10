import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, BookOpen } from 'lucide-react'
import { getSubjects, createSubject, updateSubject, deleteSubject, getProfessors } from '../services/api'
import Swal from 'sweetalert2'

const Subjects = () => {
  const [subjects, setSubjects] = useState([])
  const [professors, setProfessors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    credits: '',
    professor_id: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [subjectsRes, professorsRes] = await Promise.all([
        getSubjects({ search: searchTerm }),
        getProfessors()
      ])
      const subjectsData = Array.isArray(subjectsRes.data) ? subjectsRes.data : []
      const professorsData = Array.isArray(professorsRes.data) ? professorsRes.data : []
      setSubjects(subjectsData)
      setProfessors(professorsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData)
        Swal.fire('Success', 'Subject updated successfully', 'success')
      } else {
        await createSubject(formData)
        Swal.fire('Success', 'Subject created successfully', 'success')
      }
      
      setIsModalOpen(false)
      setEditingSubject(null)
      resetForm()
      fetchData()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Operation failed', 'error')
    }
  }

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setFormData({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      credits: subject.credits,
      professor_id: subject.professor_id || '',
      description: subject.description || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the subject and all related data',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await deleteSubject(id)
        Swal.fire('Deleted!', 'Subject has been deleted', 'success')
        fetchData()
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Delete failed', 'error')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      subject_code: '',
      subject_name: '',
      credits: '',
      professor_id: '',
      description: ''
    })
  }

  const openCreateModal = () => {
    setEditingSubject(null)
    resetForm()
    setIsModalOpen(true)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
            Subjects
          </h1>
          <p className="text-slate-600 mt-1">Manage courses and subjects</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-6 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Subject
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search subjects by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-violet-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No subjects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div 
                  key={subject.id} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-violet-100 p-6 hover:shadow-xl transition-all duration-200 group"
                >
                  {/* Subject Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-violet-100 rounded-lg">
                          <BookOpen className="w-5 h-5 text-violet-600" />
                        </div>
                        <span className="text-sm font-semibold text-violet-600 bg-gradient-to-r from-violet-100 to-pink-100 px-3 py-1 rounded-full">
                          {subject.subject_code}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                        {subject.subject_name}
                      </h3>
                    </div>
                  </div>

                  {/* Subject Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Credits:</span>
                      <span className="font-semibold text-slate-900">{subject.credits}</span>
                    </div>
                    {subject.professor_name && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Professor:</span>
                        <span className="font-medium text-slate-900">{subject.professor_name}</span>
                      </div>
                    )}
                    {subject.department && (
                      <div className="text-sm text-slate-600">
                        Department: <span className="text-slate-900">{subject.department}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {subject.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {subject.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => handleEdit(subject)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(subject.id)}
                      className="bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create/Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-violet-600 text-white p-6 rounded-t-2xl">
                  <h2 className="text-2xl font-bold">
                    {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                  </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Subject Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject_code}
                        onChange={(e) => setFormData({...formData, subject_code: e.target.value})}
                        placeholder="e.g., CS101"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Credits *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="10"
                        value={formData.credits}
                        onChange={(e) => setFormData({...formData, credits: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject_name}
                      onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
                      placeholder="e.g., Introduction to Computer Science"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Assigned Professor
                    </label>
                    <select
                      value={formData.professor_id}
                      onChange={(e) => setFormData({...formData, professor_id: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Select a professor</option>
                      {professors.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name} - {prof.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of the subject..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-lg shadow-lg transition-all duration-200"
                    >
                      {editingSubject ? 'Update Subject' : 'Create Subject'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </>
  )
}

export default Subjects
