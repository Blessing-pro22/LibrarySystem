import { createContext, useContext, useState, useEffect } from 'react'
import axios from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      const userData = response.data.user
      
      // Fetch member data if user is a member
      if (userData.role === 'MEMBER') {
        try {
          const memberResponse = await axios.get('/api/members/profile/me')
          userData.member = memberResponse.data
        } catch (memberError) {
          console.error('Failed to fetch member data:', memberError)
        }
      }
      
      setUser(userData)
    } catch (error) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password })
    const { token, user } = response.data
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    // Fetch member data if user is a member
    if (user.role === 'MEMBER') {
      try {
        const memberResponse = await axios.get('/api/members/profile/me')
        user.member = memberResponse.data
      } catch (memberError) {
        console.error('Failed to fetch member data:', memberError)
      }
    }
    
    setUser(user)
    return user
  }

  const register = async (userData) => {
    const response = await axios.post('/api/auth/register', userData)
    const { token, user } = response.data
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    // Fetch member data if user is a member
    if (user.role === 'MEMBER') {
      try {
        const memberResponse = await axios.get('/api/members/profile/me')
        user.member = memberResponse.data
      } catch (memberError) {
        console.error('Failed to fetch member data:', memberError)
      }
    }
    
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isLibrarian: user?.role === 'LIBRARIAN',
    isMember: user?.role === 'MEMBER'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
