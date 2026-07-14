import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { Search, Plus, Edit, Trash2, BookOpen, Calendar, Clock, MapPin } from 'lucide-react'
import Button from '../components/ui/button'
import Input from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import { format } from 'date-fns'

const Books = () => {
  const { isLibrarian, user } = useAuth()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [borrowing, setBorrowing] = useState(null)
  const [borrowConfirm, setBorrowConfirm] = useState(null)

  useEffect(() => {
    fetchBooks()
  }, [search])

  const fetchBooks = async () => {
    try {
      const params = search ? { search } : {}
      const response = await axios.get('/api/books', { params })
      setBooks(response.data.books)
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      await axios.delete(`/api/books/${id}`)
      fetchBooks()
    } catch (error) {
      console.error('Failed to delete book:', error)
      alert('Failed to delete book')
    }
  }

  const handleBorrow = async (bookId) => {
    // Check if user has member data
    if (!user || !user.member || !user.member.id) {
      alert('User member data not loaded. Please try logging out and back in.')
      return
    }

    // Get available copy
    const copiesRes = await axios.get(`/api/copies/book/${bookId}`)
    const copies = Array.isArray(copiesRes.data) ? copiesRes.data : copiesRes.data.copies || []
    const availableCopy = copies.find(c => c.status === 'AVAILABLE')
    
    if (!availableCopy) {
      alert('No copies available')
      return
    }

    // Show confirmation modal with tracking info
    const book = books.find(b => b.id === bookId)
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    setBorrowConfirm({
      book,
      copy: availableCopy,
      dueDate,
      member: user.member
    })
  }

  const confirmBorrow = async () => {
    if (!borrowConfirm) return
    
    setBorrowing(borrowConfirm.book.id)
    try {
      await axios.post('/api/loans', {
        memberId: borrowConfirm.member.id,
        copyId: borrowConfirm.copy.id,
        dueDate: borrowConfirm.dueDate.toISOString()
      })

      alert('Book borrowed successfully!')
      setBorrowConfirm(null)
      fetchBooks()
    } catch (error) {
      console.error('Failed to borrow book:', error)
      alert(`Failed to borrow book: ${error.response?.data?.error?.message || error.message}`)
    } finally {
      setBorrowing(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading books...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Books</h1>
          <p className="text-gray-600 dark:text-gray-400">{isLibrarian ? 'Manage library catalog' : 'Browse and borrow books'}</p>
        </div>
        {isLibrarian && (
          <Button onClick={() => setShowAddModal(true)} className="self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Books Grid for better visual */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {books.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No books found</p>
          </div>
        ) : (
          books.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100 line-clamp-2">{book.title}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">by {book.author}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">ISBN:</span>
                    <span className="text-gray-900 dark:text-gray-100">{book.isbn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Category:</span>
                    <span className="text-gray-900 dark:text-gray-100">{book.category || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Available:</span>
                    <span className={`font-semibold ${book.availableCopies > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {book.availableCopies}/{book.totalCopies}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    View Details
                  </Button>
                  {!isLibrarian && book.availableCopies > 0 && (
                    <Button 
                      className="flex-1"
                      onClick={() => handleBorrow(book.id)}
                      disabled={borrowing === book.id}
                    >
                      {borrowing === book.id ? 'Borrowing...' : 'Borrow'}
                    </Button>
                  )}
                  {isLibrarian && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Book</CardTitle>
              <CardDescription>Enter book details</CardDescription>
            </CardHeader>
            <CardContent>
              <AddBookForm
                onSuccess={() => {
                  setShowAddModal(false)
                  fetchBooks()
                }}
                onCancel={() => setShowAddModal(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Borrow Confirmation Modal */}
      {borrowConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Confirm Borrow</CardTitle>
              <CardDescription>Review the borrowing details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Book Info */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">{borrowConfirm.book.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">by {borrowConfirm.book.author}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ISBN: {borrowConfirm.book.isbn}</p>
              </div>

              {/* Borrower Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Borrower Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {borrowConfirm.member.city ? `${borrowConfirm.member.city}, ${borrowConfirm.member.state}` : 'Location not set'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Member since: {format(new Date(borrowConfirm.member.joinedAt), 'MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Loan Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400">Borrow Date:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{format(new Date(), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{format(borrowConfirm.dueDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400">Loan Period:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">14 days</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400">Copy Barcode:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{borrowConfirm.copy.barcode}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  ⚠️ Please return the book by the due date to avoid late fees.
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button 
                  onClick={confirmBorrow} 
                  className="flex-1"
                  disabled={borrowing === borrowConfirm.book.id}
                >
                  {borrowing === borrowConfirm.book.id ? 'Processing...' : 'Confirm Borrow'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setBorrowConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

const AddBookForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publishedYear: '',
    category: '',
    description: '',
    totalCopies: 1
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.post('/api/books', formData)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add book')
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
        <label className="text-sm font-medium">ISBN *</label>
        <Input name="isbn" value={formData.isbn} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Title *</label>
        <Input name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Author *</label>
        <Input name="author" value={formData.author} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Publisher</label>
        <Input name="publisher" value={formData.publisher} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Published Year</label>
        <Input
          name="publishedYear"
          type="number"
          value={formData.publishedYear}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Input name="category" value={formData.category} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Total Copies *</label>
        <Input
          name="totalCopies"
          type="number"
          min="1"
          value={formData.totalCopies}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Adding...' : 'Add Book'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default Books
