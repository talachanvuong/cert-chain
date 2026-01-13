import { createContext } from 'react'

interface ProviderProps {
  address: string | null
  login: (address: string) => void
  logout: () => void
}

export const AuthContext = createContext<ProviderProps | undefined>(undefined)
