import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
import Button from '../components/ui/button'
import Input from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'

const Books = () => {
  const { isLibrarian } = useAuth()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

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

  if (loading) {
    return <div className="text-center py-8">Loading books...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Books</h1>
          <p className="text-muted-foreground">Manage library catalog</p>
        </div>
        {isLibrarian && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Books Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Copies</TableHead>
                <TableHead>Available</TableHead>
                {isLibrarian && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isLibrarian ? 7 : 6} className="text-center text-muted-foreground">
                    No books found
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow
                    key={book.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.isbn}</TableCell>
                    <TableCell>{book.category || '-'}</TableCell>
                    <TableCell>{book.totalCopies}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          book.availableCopies > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {book.availableCopies}
                      </span>
                    </TableCell>
                    {isLibrarian && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/books/${book.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(book.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
