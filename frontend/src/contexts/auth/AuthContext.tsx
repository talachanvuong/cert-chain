import { createContext } from 'react'
import type { Address } from 'viem'

export type UserRole = 'owner' | 'verifier' | 'guest'

interface ProviderProps {
  address: Address
  role: UserRole
  login: (address: Address) => void
  logout: () => void
}

export const AuthContext = createContext<ProviderProps | undefined>(undefined)
