import { useState, useEffect } from 'react'
import { Activity, Filter } from 'lucide-react'
import { getLogs } from '../services/api'

const Logs = () => {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    limit: 50,
    offset: 0
  })

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchLogs = async () => {
    try {
      const response = await getLogs(filters)
      setLogs(response.data.logs)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Activity Logs</h1>
        <p className="text-slate-600 mt-1">Monitor all admin activities and changes</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-slate-600" />
          
          <select
            value={filters.action}
            onChange={(e) => setFilters({...filters, action: e.target.value, offset: 0})}
            className="input-field w-48"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
          </select>

          <select
            value={filters.entity_type}
            onChange={(e) => setFilters({...filters, entity_type: e.target.value, offset: 0})}
            className="input-field w-48"
          >
            <option value="">All Types</option>
            <option value="professor">Professor</option>
            <option value="subject">Subject</option>
            <option value="schedule">Schedule</option>
            <option value="attachment">Attachment</option>
          </select>

          <div className="flex-1"></div>

          <div className="text-sm text-slate-600">
            Showing {logs.length} of {total} total logs
          </div>
        </div>
      </div>

      {/* Logs List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-12">
            <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No activity logs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-full ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-600' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                        {log.entity_type && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                            {log.entity_type}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-900 font-medium">{log.details}</p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                        <span>👤 {log.full_name}</span>
                        <span>•</span>
                        <span>🕒 {new Date(log.created_at).toLocaleString()}</span>
                        {log.ip_address && (
                          <>
                            <span>•</span>
                            <span>📍 {log.ip_address}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > filters.limit && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setFilters({...filters, offset: Math.max(0, filters.offset - filters.limit)})}
              disabled={filters.offset === 0}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({...filters, offset: filters.offset + filters.limit})}
              disabled={filters.offset + filters.limit >= total}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
    </>
  )
}

export default Logs
