import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Home, LogIn } from 'lucide-react'
import Button from '../components/ui/button'

const NotFound = () => {
  const { user } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center">
      {/* Icon */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 rounded-2xl shadow-lg mb-6">
        <BookOpen className="h-12 w-12 text-white" />
      </div>

      {/* 404 */}
      <h1 className="text-7xl sm:text-8xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent leading-none">
        404
      </h1>

      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-4">
        Page Not Found
      </h2>

      <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      {/* Action */}
      <Link to={user ? '/dashboard' : '/login'} className="mt-8">
        <Button className="h-12 px-8 text-base">
          {user ? (
            <>
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2" />
              Sign in
            </>
          )}
        </Button>
      </Link>
    </div>
  )
}

export default NotFound
