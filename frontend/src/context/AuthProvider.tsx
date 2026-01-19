import { useEffect, useState, type ReactNode } from 'react'
import { zeroAddress, type Address } from 'viem'
import { AuthContext } from './AuthContext'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<Address>(zeroAddress)

  useEffect(() => {
    const savedAddress = sessionStorage.getItem('address') as Address | null

    if (savedAddress) {
      setAddress(savedAddress)
    }
  }, [])

  const login = (address: Address) => {
    setAddress(address)
    sessionStorage.setItem('address', address)
  }

  const logout = () => {
    setAddress(zeroAddress)
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
