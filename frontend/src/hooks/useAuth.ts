import { useContext } from 'react'
import { AuthContext } from '../contexts/auth/AuthContext'

export const useAuth = () => {
  const authContext = useContext(AuthContext)

  if (!authContext) {
    throw new Error('Missing AuthProvider')
  }

  return authContext
}
