import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Users, Clock, AlertCircle, MapPin, TrendingUp, Book, BookMarked, Bell, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import { format } from 'date-fns'

const Dashboard = () => {
  const { isLibrarian, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentLoans, setRecentLoans] = useState([])
  const [overdueLoans, setOverdueLoans] = useState([])
  const [myLoans, setMyLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [readingBook, setReadingBook] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    
    // Update countdown every minute
    const interval = setInterval(() => {
      if (!isLibrarian && myLoans.length > 0) {
        // Force re-render to update countdowns
        setMyLoans([...myLoans])
      }
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (isLibrarian) {
        const [statsRes, recentRes, overdueRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/recent-loans'),
          axios.get('/api/dashboard/overdue-loans')
        ])
        setStats(statsRes.data)
        setRecentLoans(recentRes.data)
        setOverdueLoans(overdueRes.data)
      } else {
        // Client portal - show their loans
        const loansRes = await axios.get('/api/loans')
        const activeLoans = loansRes.data.loans.filter(loan => loan.status === 'ACTIVE')
        setMyLoans(activeLoans)
        
        // Check for due/overdue books and create notifications
        checkDueNotifications(activeLoans)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkDueNotifications = (loans) => {
    const newNotifications = []
    const now = new Date()
    
    loans.forEach(loan => {
      const dueDate = new Date(loan.dueDate)
      const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      
      if (daysRemaining <= 0) {
        newNotifications.push({
          id: loan.id,
          type: 'overdue',
          message: `"${loan.copy.book.title}" is overdue by ${Math.abs(daysRemaining)} days`,
          book: loan.copy.book.title,
          dueDate: loan.dueDate
        })
      } else if (daysRemaining <= 3) {
        newNotifications.push({
          id: loan.id,
          type: 'due-soon',
          message: `"${loan.copy.book.title}" is due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
          book: loan.copy.book.title,
          dueDate: loan.dueDate
        })
      }
    })
    
    setNotifications(newNotifications)
  }

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const startReading = (loan) => {
    setReadingBook(loan)
  }

  const getTimeRemaining = (dueDate) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = due - now
    
    if (diff <= 0) {
      return 'OVERDUE'
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading dashboard...</div>
  }

  // Client Portal View
  if (!isLibrarian) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Welcome, {user?.member?.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Your library portal</p>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">No notifications</p>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.id} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Due: {format(new Date(notification.dueDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <button 
                            onClick={() => dismissNotification(notification.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Client Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard 
            title="Books Borrowed" 
            value={myLoans.length} 
            subtitle="Currently in your possession"
            icon={<Book className="h-5 w-5" />}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard 
            title="Available Books" 
            value={stats?.books?.available || 0} 
            subtitle="Ready to borrow"
            icon={<BookOpen className="h-5 w-5" />}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard 
            title="Your Location" 
            value={user?.member?.city || 'Not set'} 
            subtitle={user?.member?.state || ''}
            icon={<MapPin className="h-5 w-5" />}
            gradient="from-green-500 to-green-600"
          />
        </div>

        {/* My Current Loans */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Current Loans</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Books you currently have borrowed</CardDescription>
          </CardHeader>
          <CardContent>
            {myLoans.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>You don't have any books borrowed currently.</p>
                <button 
                  onClick={() => window.location.href = '/books'}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                >
                  Browse Books
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myLoans.map((loan) => {
                  const daysRemaining = Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
                  const isOverdue = daysRemaining < 0
                  const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0
                  
                  return (
                    <div key={loan.id} className="p-4 border rounded-xl hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{loan.copy.book.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">by {loan.copy.book.author}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={loan.status} />
                          <button 
                            onClick={() => startReading(loan)}
                            className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg transition-shadow"
                            title="Read Book"
                          >
                            <BookMarked className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400">Borrowed Date:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{format(new Date(loan.loanDate), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                          <span className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {format(new Date(loan.dueDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400">Time Remaining:</span>
                          <span className={`font-bold ${isOverdue ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                            {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400">Barcode:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{loan.copy.barcode}</span>
                        </div>
                      </div>
                      
                      {/* Countdown Timer */}
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Time until due:</span>
                          </div>
                          <span className={`font-mono font-bold ${isOverdue ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                            {getTimeRemaining(loan.dueDate)}
                          </span>
                        </div>
                      </div>
                      
                      {isOverdue && (
                        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                            ⚠️ This book is overdue! Please return it as soon as possible.
                          </p>
                        </div>
                      )}
                      
                      {isDueSoon && !isOverdue && (
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                            ⏰ Due soon! Please return or renew before the due date.
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reading Modal */}
        {readingBook && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Reading Mode</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">{readingBook.copy.book.title}</CardDescription>
                  </div>
                  <button 
                    onClick={() => setReadingBook(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Book Info */}
                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{readingBook.copy.book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">by {readingBook.copy.book.author}</p>
                  {readingBook.copy.book.description && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{readingBook.copy.book.description}</p>
                  )}
                </div>

                {/* Reading Content */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="prose dark:prose-invert max-w-none">
                    <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Chapter 1</h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      This is a placeholder for the book content. In a real implementation, you would integrate with a digital book service or provide PDF/eBook reading functionality.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      For now, this reading mode demonstrates the interface where users would read their borrowed books. The system tracks your reading progress and shows the countdown timer for when the book is due.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      You have {getTimeRemaining(readingBook.dueDate)} remaining to return this book.
                    </p>
                  </div>
                </div>

                {/* Reading Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Reading Progress</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }} />
                  </div>
                </div>

                {/* Due Date Warning */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    ⏰ Remember to return this book by {format(new Date(readingBook.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // Admin Dashboard View
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Library management and analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Books" 
          value={stats?.books?.total || 0} 
          subtitle={`${stats?.books?.available || 0} available`}
          icon={<BookOpen className="h-5 w-5" />}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard 
          title="Active Members" 
          value={stats?.members?.active || 0} 
          subtitle={`${stats?.members?.newThisMonth || 0} new this month`}
          icon={<Users className="h-5 w-5" />}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard 
          title="Active Loans" 
          value={stats?.loans?.active || 0} 
          subtitle={`${stats?.loans?.returnedToday || 0} returned today`}
          icon={<Clock className="h-5 w-5" />}
          gradient="from-green-500 to-green-600"
        />
        <StatCard 
          title="Overdue Loans" 
          value={stats?.loans?.overdue || 0} 
          subtitle="Require attention"
          icon={<AlertCircle className="h-5 w-5" />}
          gradient="from-red-500 to-red-600"
          warning
        />
      </div>

      {/* Member Location Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-600" />
              Members by City
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Top locations</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.members?.byCity?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No location data available</p>
            ) : (
              <div className="space-y-3">
                {stats?.members?.byCity?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.city}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                          style={{ width: `${(item.count / stats.members.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Members by State
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Regional distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.members?.byState?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No location data available</p>
            ) : (
              <div className="space-y-3">
                {stats?.members?.byState?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.state}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" 
                          style={{ width: `${(item.count / stats.members.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Recent Loans</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Latest book checkouts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Loan Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 dark:text-gray-400">
                    No recent loans
                  </TableCell>
                </TableRow>
              ) : (
                recentLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.copy.book.title}</TableCell>
                    <TableCell>
                      {loan.member.firstName} {loan.member.lastName}
                    </TableCell>
                    <TableCell>
                      {loan.member.city ? `${loan.member.city}, ${loan.member.state}` : 'Not set'}
                    </TableCell>
                    <TableCell>{format(new Date(loan.loanDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <StatusBadge status={loan.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Overdue Loans - Librarian Only */}
      {overdueLoans.length > 0 && (
        <Card className="border-2 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">Overdue Loans</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Books that need to be returned</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueLoans.map((loan) => {
                  const daysOverdue = Math.floor(
                    (new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.copy.book.title}</TableCell>
                      <TableCell>
                        {loan.member.firstName} {loan.member.lastName}
                      </TableCell>
                      <TableCell>
                        {loan.member.city ? `${loan.member.city}, ${loan.member.state}` : 'Not set'}
                      </TableCell>
                      <TableCell>{format(new Date(loan.dueDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-red-600 dark:text-red-400 font-bold">{daysOverdue} days</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const StatCard = ({ title, value, subtitle, icon, gradient, warning }) => (
  <Card className="hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
      <div className={`bg-gradient-to-r ${gradient} p-2 rounded-lg`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold ${warning ? 'text-red-600 dark:text-red-400' : 'bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent'}`}>
        {value}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    </CardContent>
  </Card>
)

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    RETURNED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  )
}

export default Dashboard
