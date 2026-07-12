import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Users, Clock, AlertCircle, MapPin, TrendingUp, Book } from 'lucide-react'
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

  useEffect(() => {
    fetchDashboardData()
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
        setMyLoans(loansRes.data.loans.filter(loan => loan.status === 'ACTIVE'))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading dashboard...</div>
  }

  // Client Portal View
  if (!isLibrarian) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Welcome, {user?.member?.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Your library portal</p>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.copy.book.title}</TableCell>
                      <TableCell>{format(new Date(loan.dueDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <StatusBadge status={loan.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
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
