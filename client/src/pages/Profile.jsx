import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react'
import Button from '../components/ui/button'
import Input from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import Label from '../components/ui/label'
import { format } from 'date-fns'

const Profile = () => {
  const { user, logout } = useAuth()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/members/profile/me')
      const data = await response.json()
      setMember(data)
      setEditForm(data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      
      if (response.ok) {
        setEditing(false)
        fetchProfile()
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  if (!member) {
    return <div className="text-center py-8">Profile not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary flex items-center justify-center shrink-0">
                <User className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl truncate">
                  {member.firstName} {member.lastName}
                </CardTitle>
                <CardDescription className="truncate">{member.user.email}</CardDescription>
              </div>
            </div>
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
                  Edit Profile
                </Button>
              )}
            </div>
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
                <div>
                  <Label>City</Label>
                  <Input
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={editForm.state || ''}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Zip Code</Label>
                  <Input
                    value={editForm.zipCode || ''}
                    onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={editForm.country || ''}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
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
                {member.city && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.city}, {member.state} {member.zipCode}</span>
                  </div>
                )}
                {member.country && (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.country}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Joined: {format(new Date(member.joinedAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Role: {member.user.role}</span>
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

      {/* Current Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Current Loans</CardTitle>
          <CardDescription>Books you currently have borrowed</CardDescription>
        </CardHeader>
        <CardContent>
          {member.loans.filter((loan) => loan.status === 'ACTIVE').length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No active loans</p>
          ) : (
            <div className="space-y-4">
              {member.loans
                .filter((loan) => loan.status === 'ACTIVE')
                .map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{loan.copy.book.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(loan.dueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        new Date(loan.dueDate) < new Date()
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {new Date(loan.dueDate) < new Date() ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" onClick={logout} className="w-full">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
