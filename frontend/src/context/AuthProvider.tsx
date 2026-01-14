import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const savedAddress = sessionStorage.getItem('address')

    if (savedAddress) {
      setAddress(savedAddress)
    }

    setLoading(false)
  }, [])

  const login = (address: string) => {
    setAddress(address)
    sessionStorage.setItem('address', address)
  }

  const logout = () => {
    setAddress(null)
    sessionStorage.removeItem('address')
  }

  return (
    <AuthContext.Provider
      value={{
        address,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
