import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useSidebar } from '../contexts/SidebarContext'

const AdminLayout = ({ children, setIsAuthenticated }) => {
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
      <Sidebar />
      
      <div 
        className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}
      >
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
