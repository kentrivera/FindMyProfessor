import { useState, useEffect } from 'react'
import { Upload, Trash2, Download, FileText, Eye, X } from 'lucide-react'
import { getAttachments, uploadAttachment, deleteAttachment, getProfessors } from '../services/api'
import Swal from 'sweetalert2'

const Attachments = () => {
  const [attachments, setAttachments] = useState([])
  const [professors, setProfessors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingAttachment, setViewingAttachment] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formData, setFormData] = useState({
    professor_id: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [attachRes, profsRes] = await Promise.all([
        getAttachments(),
        getProfessors()
      ])
      setAttachments(attachRes.data)
      setProfessors(profsRes.data)
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
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedFile) {
      Swal.fire('Error', 'Please select a file', 'error')
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', selectedFile)
      formDataToSend.append('professor_id', formData.professor_id)
      formDataToSend.append('description', formData.description)

      await uploadAttachment(formDataToSend)
      
      Swal.fire('Success', 'File uploaded successfully', 'success')
      setIsModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Upload failed', 'error')
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the attachment',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await deleteAttachment(id)
        Swal.fire('Deleted!', 'Attachment has been deleted', 'success')
        fetchData()
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Delete failed', 'error')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      professor_id: '',
      description: ''
    })
    setSelectedFile(null)
  }

  const openUploadModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleView = (attachment) => {
    setViewingAttachment(attachment)
    setIsViewModalOpen(true)
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setViewingAttachment(null)
  }

  const isImageFile = (fileType) => {
    return ['jpg', 'jpeg', 'png', 'gif'].includes(fileType?.toLowerCase())
  }

  const isPdfFile = (fileType) => {
    return fileType?.toLowerCase() === 'pdf'
  }

  const getFileIcon = (fileType) => {
    return <FileText className="w-8 h-8 text-blue-600" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Attachments</h1>
        <button onClick={openUploadModal} className="btn-primary">
          <Upload className="inline w-5 h-5 mr-2" />
          Upload File
        </button>
      </div>

      {/* Attachments Grid */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
        </div>
      ) : attachments.length === 0 ? (
        <div className="py-12 text-center card">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-600">No attachments yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="transition-shadow card hover:shadow-lg">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-start flex-1 min-w-0 space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(attachment.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold break-words text-slate-900">
                      {attachment.file_name}
                    </h3>
                    <p className="text-xs text-slate-500">{formatFileSize(attachment.file_size)}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4 space-y-2">
                {attachment.professor_name && (
                  <div className="text-sm">
                    <span className="text-slate-600">Professor:</span>
                    <span className="ml-2 font-medium text-slate-900">{attachment.professor_name}</span>
                  </div>
                )}
                {attachment.subject_name && (
                  <div className="text-sm">
                    <span className="text-slate-600">Subject:</span>
                    <span className="ml-2 font-medium text-slate-900">{attachment.subject_name}</span>
                  </div>
                )}
                {attachment.classroom && (
                  <div className="text-sm">
                    <span className="text-slate-600">Classroom:</span>
                    <span className="ml-2 font-medium text-slate-900">{attachment.classroom}</span>
                  </div>
                )}
                {attachment.day && attachment.time_start && (
                  <div className="text-sm">
                    <span className="text-slate-600">Schedule:</span>
                    <span className="ml-2 font-medium text-slate-900">
                      {attachment.day} {attachment.time_start}
                      {attachment.time_end && ` - ${attachment.time_end}`}
                    </span>
                  </div>
                )}
                {attachment.description && (
                  <p className="mt-2 text-sm text-slate-600">{attachment.description}</p>
                )}
              </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    {new Date(attachment.uploaded_at).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(attachment)}
                      className="p-1 text-green-600 hover:text-green-900"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={`http://localhost:8000/uploads/${attachment.file_path}`}
                      download
                      className="p-1 text-blue-600 hover:text-blue-900"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="p-1 text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-xl">
              <div className="p-6">
                <h2 className="mb-6 text-2xl font-bold">Upload Attachment</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <option key={prof.id} value={prof.id}>
                          {prof.name} - {prof.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">File *</label>
                    <input
                      type="file"
                      required
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      className="input-field"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Allowed: PDF, DOC, DOCX, JPG, PNG, GIF (Max 10MB)
                    </p>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="input-field"
                      placeholder="Optional description..."
                    />
                  </div>

                  <div className="flex justify-end pt-4 space-x-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Upload
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && viewingAttachment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold truncate text-slate-900">{viewingAttachment.file_name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatFileSize(viewingAttachment.file_size)} • {viewingAttachment.file_type?.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={closeViewModal}
                  className="p-2 ml-4 transition-colors rounded-lg hover:bg-slate-100"
                  title="Close"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-auto bg-slate-50">
                {isImageFile(viewingAttachment.file_type) ? (
                  <div className="flex items-center justify-center h-full">
                    <img 
                      src={`http://localhost:8000/uploads/${viewingAttachment.file_path}`}
                      alt={viewingAttachment.file_name}
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>
                ) : isPdfFile(viewingAttachment.file_type) ? (
                  <iframe
                    src={`http://localhost:8000/uploads/${viewingAttachment.file_path}`}
                    className="w-full h-full min-h-[600px]"
                    title={viewingAttachment.file_name}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <FileText className="w-16 h-16 mb-4 text-slate-400" />
                    <p className="mb-4 text-slate-600">Preview not available for this file type</p>
                    <a
                      href={`http://localhost:8000/uploads/${viewingAttachment.file_path}`}
                      download
                      className="btn-primary"
                    >
                      <Download className="inline w-4 h-4 mr-2" />
                      Download File
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    {viewingAttachment.professor_name && (
                      <span className="mr-4">
                        <strong>Professor:</strong> {viewingAttachment.professor_name}
                      </span>
                    )}
                    {viewingAttachment.subject_name && (
                      <span className="mr-4">
                        <strong>Subject:</strong> {viewingAttachment.subject_name}
                      </span>
                    )}
                    {viewingAttachment.classroom && (
                      <span>
                        <strong>Classroom:</strong> {viewingAttachment.classroom}
                      </span>
                    )}
                  </div>
                  <a
                    href={`http://localhost:8000/uploads/${viewingAttachment.file_path}`}
                    download
                    className="btn-primary"
                  >
                    <Download className="inline w-4 h-4 mr-2" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  )
}

export default Attachments
