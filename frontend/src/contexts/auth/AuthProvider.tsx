import { useEffect, useState, type ReactNode } from 'react'
import { isAddress, zeroAddress, type Address } from 'viem'
import { certificate } from '../../config/contract'
import { AuthContext } from './AuthContext'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<Address>(zeroAddress)
  const [isOwner, setIsOwner] = useState<boolean>(false)

  useEffect(() => {
    const savedAddress = sessionStorage.getItem('address')

    if (!savedAddress) {
      return
    }

    if (!isAddress(savedAddress)) {
      return
    }

    if (savedAddress === zeroAddress) {
      return
    }

    setAddress(savedAddress)
  }, [])

  useEffect(() => {
    if (address === zeroAddress) {
      return
    }

    const checkOwner = async () => {
      const owner = (await certificate.read.owner()) as Address
      setIsOwner(address === owner)
    }

    checkOwner()
  }, [address])

  const login = (address: Address) => {
    setAddress(address)
    sessionStorage.setItem('address', address)
  }

  const logout = () => {
    setAddress(zeroAddress)
    setIsOwner(false)
    sessionStorage.removeItem('address')
  }

  return (
    <AuthContext.Provider
      value={{
        address,
        isOwner,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
