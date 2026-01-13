import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    const savedAddress = sessionStorage.getItem('address')

    if (savedAddress) {
      setAddress(savedAddress)
    }
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
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
