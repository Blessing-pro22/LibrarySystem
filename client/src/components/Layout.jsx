import { Navigate, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Users, LogOut, User, LayoutDashboard } from 'lucide-react'
import Button from './ui/button'

const Layout = () => {
  const { user, loading, logout, isLibrarian } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <nav className="border-b-2 border-purple-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-3 group">
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-2 rounded-xl group-hover:shadow-lg transition-shadow duration-300">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Library System</span>
              </Link>
              <div className="flex space-x-1">
                <NavLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavLink>
                <NavLink to="/books" icon={<BookOpen className="h-4 w-4" />}>Books</NavLink>
                <NavLink to="/loans" icon={<Users className="h-4 w-4" />}>Loans</NavLink>
                {isLibrarian && (
                  <NavLink to="/members" icon={<Users className="h-4 w-4" />}>Members</NavLink>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-1.5 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.member?.firstName} {user.member?.lastName}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

const NavLink = ({ to, children, icon }) => (
  <Link 
    to={to} 
    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
  >
    {icon}
    <span>{children}</span>
  </Link>
)

export default Layout
