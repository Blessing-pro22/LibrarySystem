import { useState, useEffect } from 'react'
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Users, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react'
import Button from './ui/button'

const Layout = () => {
  const { user, loading, logout, isLibrarian } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

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
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3 group shrink-0">
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-2 rounded-xl group-hover:shadow-lg transition-shadow duration-300">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg md:text-xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Library System
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex space-x-1">
              <NavLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavLink>
              <NavLink to="/books" icon={<BookOpen className="h-4 w-4" />}>Books</NavLink>
              <NavLink to="/loans" icon={<Users className="h-4 w-4" />}>Loans</NavLink>
              {isLibrarian && (
                <NavLink to="/members" icon={<Users className="h-4 w-4" />}>Members</NavLink>
              )}
            </div>

            {/* Desktop user actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-1.5 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.member?.firstName} {user.member?.lastName}
                </span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen
                ? <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                : <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              }
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-purple-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-3 flex flex-col space-y-1">
              <MobileNavLink to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />}>Dashboard</MobileNavLink>
              <MobileNavLink to="/books" icon={<BookOpen className="h-5 w-5" />}>Books</MobileNavLink>
              <MobileNavLink to="/loans" icon={<Users className="h-5 w-5" />}>Loans</MobileNavLink>
              {isLibrarian && (
                <MobileNavLink to="/members" icon={<Users className="h-5 w-5" />}>Members</MobileNavLink>
              )}

              <div className="pt-3 mt-1 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 flex-1 min-w-0 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-1.5 rounded-lg shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {user.member?.firstName} {user.member?.lastName}
                  </span>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl shrink-0">
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="container mx-auto px-4 py-6 md:py-8">
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

const MobileNavLink = ({ to, children, icon }) => (
  <Link
    to={to}
    className="flex items-center space-x-3 px-3 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
  >
    {icon}
    <span>{children}</span>
  </Link>
)

export default Layout
