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

  if (loading) {
    return <div className="text-center py-8">Loading loans...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground">Manage book circulation</p>
        </div>
        {isLibrarian && (
          <Button onClick={() => setShowCheckoutModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Checkout Book
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="RETURNED">Returned</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Loans Table */}
      <Card>
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === 'ACTIVE'
                            ? 'bg-blue-100 text-blue-800'
                            : loan.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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

  // Set default due date to 14 days from now
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
