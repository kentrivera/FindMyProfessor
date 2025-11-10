import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Filter, Upload, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getProfessors, getSubjects } from '../services/api'
import Swal from 'sweetalert2'

const Schedules = () => {
  const [schedules, setSchedules] = useState([])
  const [professors, setProfessors] = useState([])
  const [subjects, setSubjects] = useState([])
  const [filterDay, setFilterDay] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [formData, setFormData] = useState({
    professor_id: '',
    subject_id: '',
    classroom: '',
    day: 'Monday',
    time_start: '',
    time_end: '',
    semester: '1st Semester',
    academic_year: '2024-2025',
    description: ''
  })

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    fetchData()
  }, [filterDay])

  useEffect(() => {
    // Reset to page 1 when filter changes
    setCurrentPage(1)
  }, [filterDay])

  const fetchData = async () => {
    try {
      const [schedsRes, profsRes, subsRes] = await Promise.all([
        getSchedules(filterDay ? { day: filterDay } : {}),
        getProfessors(),
        getSubjects()
      ])
      setSchedules(schedsRes.data)
      setProfessors(profsRes.data)
      setSubjects(subsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10485760) {
        Swal.fire('Error', 'File size must be less than 10MB', 'error')
        e.target.value = ''
        return
      }

      // Validate file type (images only)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        Swal.fire('Error', 'Only image files (JPG, PNG, GIF) are allowed', 'error')
        e.target.value = ''
        return
      }

      setSelectedFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingSchedule) {
        // For updates, use JSON if no file, FormData if file exists
        if (selectedFile) {
          const formDataToSend = new FormData()
          formDataToSend.append('file', selectedFile)
          Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key])
          })
          await updateSchedule(editingSchedule.id, formDataToSend)
        } else {
          await updateSchedule(editingSchedule.id, formData)
        }
        Swal.fire('Success', 'Schedule updated successfully', 'success')
      } else {
        // For create, use FormData if file exists, JSON otherwise
        if (selectedFile) {
          const formDataToSend = new FormData()
          formDataToSend.append('file', selectedFile)
          Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key])
          })
          await createSchedule(formDataToSend)
        } else {
          await createSchedule(formData)
        }
        Swal.fire('Success', 'Schedule created successfully', 'success')
      }
      
      setIsModalOpen(false)
      setEditingSchedule(null)
      resetForm()
      fetchData()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Operation failed', 'error')
    }
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      professor_id: schedule.professor_id,
      subject_id: schedule.subject_id,
      classroom: schedule.classroom,
      day: schedule.day,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      semester: schedule.semester || '1st Semester',
      academic_year: schedule.academic_year || '2024-2025',
      description: schedule.description || ''
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the schedule',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await deleteSchedule(id)
        Swal.fire('Deleted!', 'Schedule has been deleted', 'success')
        fetchData()
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Delete failed', 'error')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      professor_id: '',
      subject_id: '',
      classroom: '',
      day: 'Monday',
      time_start: '',
      time_end: '',
      semester: '1st Semester',
      academic_year: '2024-2025',
      description: ''
    })
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const openCreateModal = () => {
    setEditingSchedule(null)
    resetForm()
    setIsModalOpen(true)
  }

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentSchedules = schedules.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(schedules.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Schedules</h1>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="inline w-5 h-5 mr-2" />
          Add Schedule
        </button>
      </div>

      {/* Day Filter */}
      <div className="flex items-center mb-6 space-x-2">
        <Filter className="w-5 h-5 text-slate-600" />
        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          className="w-48 input-field"
        >
          <option value="">All Days</option>
          {days.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      {/* Schedules Table */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase text-slate-500">Professor</th>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase text-slate-500">Subject</th>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase text-slate-500">Day</th>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase text-slate-500">Time</th>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase text-slate-500">Classroom</th>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {currentSchedules.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        No schedules found
                      </td>
                    </tr>
                  ) : (
                    currentSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900">
                          {schedule.professor_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{schedule.subject_name || 'N/A'}</div>
                          <div className="text-xs text-slate-500">{schedule.subject_code || ''}</div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">{schedule.day || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">
                          {schedule.time_start && schedule.time_end ? `${schedule.time_start} - ${schedule.time_end}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">{schedule.classroom || 'N/A'}</td>
                        <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                          <button onClick={() => handleEdit(schedule)} className="text-blue-600 hover:text-blue-900">
                            <Edit className="inline w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(schedule.id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="inline w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {schedules.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white border rounded-lg border-slate-200 sm:px-6">
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium bg-white border rounded-md text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium bg-white border rounded-md text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, schedules.length)}</span> of{' '}
                    <span className="font-medium">{schedules.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 text-sm font-medium bg-white border text-slate-500 border-slate-300 rounded-l-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-medium bg-white border text-slate-700 border-slate-300"
                          >
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 text-sm font-medium bg-white border text-slate-500 border-slate-300 rounded-r-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="mb-6 text-2xl font-bold">
                  {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Professor *</label>
                      <select
                        required
                        value={formData.professor_id}
                        onChange={(e) => setFormData({...formData, professor_id: e.target.value})}
                        className="input-field"
                      >
                        <option value="">Select Professor</option>
                        {professors.map(prof => (
                          <option key={prof.id} value={prof.id}>{prof.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Subject</label>
                      <select
                        value={formData.subject_id}
                        onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                        className="input-field"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.subject_code} - {sub.subject_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Day</label>
                      <select
                        value={formData.day}
                        onChange={(e) => setFormData({...formData, day: e.target.value})}
                        className="input-field"
                      >
                        {days.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Classroom</label>
                      <input
                        type="text"
                        value={formData.classroom}
                        onChange={(e) => setFormData({...formData, classroom: e.target.value})}
                        className="input-field"
                        placeholder="e.g., Room 101"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Start Time</label>
                      <input
                        type="time"
                        value={formData.time_start}
                        onChange={(e) => setFormData({...formData, time_start: e.target.value})}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">End Time</label>
                      <input
                        type="time"
                        value={formData.time_end}
                        onChange={(e) => setFormData({...formData, time_end: e.target.value})}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Semester</label>
                      <input
                        type="text"
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                        className="input-field"
                        placeholder="e.g., 1st Semester"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Academic Year</label>
                      <input
                        type="text"
                        value={formData.academic_year}
                        onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                        className="input-field"
                        placeholder="e.g., 2024-2025"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      rows="2"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="input-field"
                      placeholder="Optional description..."
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      <ImageIcon className="inline w-4 h-4 mr-1" />
                      Attach Image (Optional)
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      className="input-field"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Allowed: JPG, PNG, GIF (Max 10MB)
                    </p>
                    {previewUrl && (
                      <div className="mt-3">
                        <p className="mb-2 text-sm font-medium text-slate-700">Preview:</p>
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="object-contain h-32 max-w-full border rounded-lg border-slate-200"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 space-x-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingSchedule ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </>
  )
}

export default Schedules
