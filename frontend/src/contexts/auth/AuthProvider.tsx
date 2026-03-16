import { useEffect, useState, type ReactNode } from 'react'
import { isAddress, zeroAddress, type Address } from 'viem'
import { certificate } from '../../config/contract'
import { AuthContext, type UserRole } from './AuthContext'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<Address>(zeroAddress)
  const [role, setRole] = useState<UserRole>('guest')

  useEffect(() => {
    const savedAddress = sessionStorage.getItem('address')

    if (!savedAddress || !isAddress(savedAddress)) return
    if (savedAddress === zeroAddress) return

    setAddress(savedAddress)
  }, [])

  useEffect(() => {
    if (address === zeroAddress) {
      setRole('guest')
      return
    }

    const deriveRole = async () => {
      const owner = await certificate.read.owner()
      setRole(address === owner ? 'owner' : 'verifier')
    }

    deriveRole()
  }, [address])

  const login = (address: Address) => {
    setAddress(address)
    sessionStorage.setItem('address', address)
  }

  const logout = () => {
    setAddress(zeroAddress)
    setRole('guest')
    sessionStorage.removeItem('address')
  }

  return (
    <AuthContext.Provider value={{ address, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
