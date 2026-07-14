import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { Plus, RotateCcw, Calendar } from 'lucide-react'
import Button from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import Input from '../components/ui/input'
import Label from '../components/ui/label'
import { format } from 'date-fns'

const Loans = () => {
  const { isLibrarian } = useAuth()
  const navigate = useNavigate()
  const [loans, setLoans] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  useEffect(() => {
    fetchLoans()
  }, [statusFilter])

  const fetchLoans = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const response = await axios.get('/api/loans', { params })
      setLoans(response.data.loans)
    } catch (error) {
      console.error('Failed to fetch loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (loanId) => {
    if (!confirm('Are you sure you want to return this book?')) return

    try {
      await axios.patch(`/api/loans/${loanId}/return`)
      fetchLoans()
    } catch (error) {
      console.error('Failed to return book:', error)
      alert('Failed to return book')
    }
  }

  const handleRenew = async (loanId) => {
    const newDueDate = prompt('Enter new due date (YYYY-MM-DD):')
    if (!newDueDate) return

    try {
      await axios.patch(`/api/loans/${loanId}/renew`, { newDueDate })
      fetchLoans()
    } catch (error) {
      console.error('Failed to renew loan:', error)
      alert('Failed to renew loan')
    }
  }

  const statusBadgeClass = (status) => {
    if (status === 'ACTIVE') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    if (status === 'OVERDUE') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }

  if (loading) {
    return <div className="text-center py-8">Loading loans...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Loans</h1>
          <p className="text-muted-foreground">Manage book circulation</p>
        </div>
        {isLibrarian && (
          <Button onClick={() => setShowCheckoutModal(true)} className="self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            Checkout Book
          </Button>
        )}
      </div>

      {/* Filter */}
      <div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-11 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="RETURNED">Returned</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Mobile cards (below md) */}
      <div className="md:hidden space-y-3">
        {loans.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No loans found</div>
        ) : (
          loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3"
            >
              {/* Title + Status */}
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900 dark:text-gray-100 flex-1 leading-tight">
                  {loan.copy.book.title}
                </p>
                <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(loan.status)}`}>
                  {loan.status}
                </span>
              </div>

              {/* Member */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {loan.member.firstName} {loan.member.lastName}
              </p>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide">Due</span>
                  <span className={`font-medium ${loan.status === 'OVERDUE' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    {format(new Date(loan.dueDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide">Borrowed</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {format(new Date(loan.loanDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                {loan.returnDate && (
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide">Returned</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {format(new Date(loan.returnDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {isLibrarian && loan.status === 'ACTIVE' && (
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReturn(loan.id)}
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Return
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRenew(loan.id)}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Renew
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop table (md and up) */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Loan Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
                {isLibrarian && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isLibrarian ? 7 : 6} className="text-center text-muted-foreground">
                    No loans found
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.copy.book.title}</TableCell>
                    <TableCell>
                      {loan.member.firstName} {loan.member.lastName}
                    </TableCell>
                    <TableCell>{format(new Date(loan.loanDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(loan.dueDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {loan.returnDate ? format(new Date(loan.returnDate), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeClass(loan.status)}`}>
                        {loan.status}
                      </span>
                    </TableCell>
                    {isLibrarian && (
                      <TableCell>
                        <div className="flex space-x-2">
                          {loan.status === 'ACTIVE' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReturn(loan.id)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRenew(loan.id)}
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Checkout Book</CardTitle>
              <CardDescription>Enter loan details</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutForm
                onSuccess={() => {
                  setShowCheckoutModal(false)
                  fetchLoans()
                }}
                onCancel={() => setShowCheckoutModal(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

const CheckoutForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    copyId: '',
    dueDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 14)
    setFormData({ ...formData, dueDate: defaultDueDate.toISOString().split('T')[0] })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.post('/api/loans', formData)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to checkout book')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label>Member ID *</Label>
        <Input
          name="memberId"
          value={formData.memberId}
          onChange={handleChange}
          placeholder="Enter member ID"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Copy ID *</Label>
        <Input
          name="copyId"
          value={formData.copyId}
          onChange={handleChange}
          placeholder="Enter copy ID"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Due Date *</Label>
        <Input
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Processing...' : 'Checkout'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default Loans
