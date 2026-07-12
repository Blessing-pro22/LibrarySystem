import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Plus, Trash2, BookOpen } from 'lucide-react'
import Button from '../components/ui/button'
import Input from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import Label from '../components/ui/label'

const BookDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLibrarian } = useAuth()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddCopyModal, setShowAddCopyModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchBook()
  }, [id])

  const fetchBook = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`)
      setBook(response.data)
      setEditForm(response.data)
    } catch (error) {
      console.error('Failed to fetch book:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/books/${id}`, editForm)
      setEditing(false)
      fetchBook()
    } catch (error) {
      console.error('Failed to update book:', error)
      alert('Failed to update book')
    }
  }

  const handleDeleteCopy = async (copyId) => {
    if (!confirm('Are you sure you want to delete this copy?')) return

    try {
      await axios.delete(`/api/copies/${copyId}`)
      fetchBook()
    } catch (error) {
      console.error('Failed to delete copy:', error)
      alert('Failed to delete copy')
    }
  }

  const handleAddCopy = async (barcode) => {
    try {
      await axios.post('/api/copies', { bookId: id, barcode })
      setShowAddCopyModal(false)
      fetchBook()
    } catch (error) {
      console.error('Failed to add copy:', error)
      alert('Failed to add copy')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading book details...</div>
  }

  if (!book) {
    return <div className="text-center py-8">Book not found</div>
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/books')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Books
      </Button>

      {/* Book Details */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <BookOpen className="h-12 w-12 text-primary mt-1" />
              <div>
                {editing ? (
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="text-2xl font-bold mb-2"
                  />
                ) : (
                  <CardTitle className="text-2xl">{book.title}</CardTitle>
                )}
                {editing ? (
                  <Input
                    value={editForm.author}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    className="text-muted-foreground"
                  />
                ) : (
                  <CardDescription>by {book.author}</CardDescription>
                )}
              </div>
            </div>
            {isLibrarian && (
              <div className="flex space-x-2">
                {editing ? (
                  <>
                    <Button onClick={handleUpdate}>Save</Button>
                    <Button variant="outline" onClick={() => { setEditing(false); setEditForm(book) }}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ISBN</Label>
                  <Input
                    value={editForm.isbn}
                    onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Publisher</Label>
                  <Input
                    value={editForm.publisher || ''}
                    onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Published Year</Label>
                  <Input
                    type="number"
                    value={editForm.publishedYear || ''}
                    onChange={(e) => setEditForm({ ...editForm, publishedYear: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ISBN:</span> {book.isbn}
                </div>
                <div>
                  <span className="font-medium">Publisher:</span> {book.publisher || '-'}
                </div>
                <div>
                  <span className="font-medium">Published Year:</span> {book.publishedYear || '-'}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {book.category || '-'}
                </div>
              </div>
              {book.description && (
                <div className="mt-4">
                  <span className="font-medium">Description:</span>
                  <p className="text-muted-foreground mt-1">{book.description}</p>
                </div>
              )}
              <div className="flex space-x-4 mt-4 pt-4 border-t">
                <div>
                  <span className="text-2xl font-bold">{book.totalCopies}</span>
                  <p className="text-sm text-muted-foreground">Total Copies</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-green-600">{book.availableCopies}</span>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-blue-600">{book.totalCopies - book.availableCopies}</span>
                  <p className="text-sm text-muted-foreground">Borrowed</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Copies */}
      {isLibrarian && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Book Copies</CardTitle>
                <CardDescription>Manage physical copies</CardDescription>
              </div>
              <Button onClick={() => setShowAddCopyModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acquired</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {book.copies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No copies available
                    </TableCell>
                  </TableRow>
                ) : (
                  book.copies.map((copy) => (
                    <TableRow key={copy.id}>
                      <TableCell className="font-medium">{copy.barcode}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            copy.status === 'AVAILABLE'
                              ? 'bg-green-100 text-green-800'
                              : copy.status === 'BORROWED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {copy.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(copy.acquiredAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCopy(copy.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Copy Modal */}
      {showAddCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Copy</CardTitle>
              <CardDescription>Enter barcode for the new copy</CardDescription>
            </CardHeader>
            <CardContent>
              <AddCopyForm
                onSubmit={handleAddCopy}
                onCancel={() => setShowAddCopyModal(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

const AddCopyForm = ({ onSubmit, onCancel }) => {
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    onSubmit(barcode)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Barcode *</Label>
        <Input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Enter barcode"
          required
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Adding...' : 'Add Copy'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default BookDetails
