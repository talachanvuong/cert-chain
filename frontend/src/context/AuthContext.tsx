import { createContext } from 'react'
import type { Address } from 'viem'

interface ProviderProps {
  address: Address
  login: (address: Address) => void
  logout: () => void
}

export const AuthContext = createContext<ProviderProps | undefined>(undefined)
