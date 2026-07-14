import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import Button from '../components/ui/button'
import Input from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import Label from '../components/ui/label'
import { format } from 'date-fns'

const MemberDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isLibrarian } = useAuth()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchMember()
  }, [id])

  const fetchMember = async () => {
    try {
      const response = await axios.get(`/api/members/${id}`)
      setMember(response.data)
      setEditForm(response.data)
    } catch (error) {
      console.error('Failed to fetch member:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/members/${id}`, editForm)
      setEditing(false)
      fetchMember()
    } catch (error) {
      console.error('Failed to update member:', error)
      alert('Failed to update member')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading member details...</div>
  }

  if (!member) {
    return <div className="text-center py-8">Member not found</div>
  }

  const canEdit = isLibrarian || user?.member?.id === id

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/members')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Members
      </Button>

      {/* Member Details */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <CardTitle className="text-xl sm:text-2xl">
                {member.firstName} {member.lastName}
              </CardTitle>
              <CardDescription>{member.user.email}</CardDescription>
            </div>
            {canEdit && (
              <div className="flex space-x-2 shrink-0">
                {editing ? (
                  <>
                    <Button onClick={handleUpdate}>Save</Button>
                    <Button variant="outline" onClick={() => { setEditing(false); setEditForm(member) }}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{member.user.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.phone}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center space-x-2 col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Joined: {format(new Date(member.joinedAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
              <div className="flex space-x-4 pt-4 border-t">
                <div>
                  <span className="text-2xl font-bold">{member.loans.length}</span>
                  <p className="text-sm text-muted-foreground">Total Loans</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-blue-600">
                    {member.loans.filter((loan) => loan.status === 'ACTIVE').length}
                  </span>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan History */}
      <Card>
        <CardHeader>
          <CardTitle>Loan History</CardTitle>
          <CardDescription>Member's borrowing history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Loan Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {member.loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No loan history
                  </TableCell>
                </TableRow>
              ) : (
                member.loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.copy.book.title}</TableCell>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default MemberDetails
