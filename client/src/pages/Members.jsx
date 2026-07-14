import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { Search, UserCheck, UserX } from 'lucide-react'
import Button from '../components/ui/button'
import Input from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'

const Members = () => {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [search])

  const fetchMembers = async () => {
    try {
      const params = search ? { search } : {}
      const response = await axios.get('/api/members', { params })
      setMembers(response.data.members)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (memberId, isActive) => {
    const action = isActive ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${action} this member?`)) return

    try {
      await axios.patch(`/api/members/${memberId}/${action}`)
      fetchMembers()
    } catch (error) {
      console.error(`Failed to ${action} member:`, error)
      alert(`Failed to ${action} member`)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Members</h1>
        <p className="text-muted-foreground">Manage library members</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mobile cards (below md) */}
      <div className="md:hidden space-y-3">
        {members.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No members found</div>
        ) : (
          members.map((member) => {
            const activeLoans = member.loans.filter((l) => l.status === 'ACTIVE').length
            return (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/members/${member.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {member.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        member.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleStatus(member.id, member.isActive)
                      }}
                      aria-label={member.isActive ? 'Deactivate member' : 'Activate member'}
                    >
                      {member.isActive
                        ? <UserX className="h-4 w-4 text-destructive" />
                        : <UserCheck className="h-4 w-4 text-green-600" />
                      }
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {activeLoans} active loan{activeLoans !== 1 ? 's' : ''}
                  {member.city ? ` · ${member.city}` : ''}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop table (md and up) */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Active Loans</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow
                    key={member.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/members/${member.id}`)}
                  >
                    <TableCell className="font-medium">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell>
                      {member.city ? `${member.city}, ${member.state}` : 'Not set'}
                    </TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {member.loans.filter((loan) => loan.status === 'ACTIVE').length}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(member.id, member.isActive)}
                      >
                        {member.isActive ? (
                          <UserX className="h-4 w-4 text-destructive" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
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

export default Members
