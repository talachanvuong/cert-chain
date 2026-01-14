import { createContext } from 'react'

interface ProviderProps {
  address: string | null
  loading: boolean
  login: (address: string) => void
  logout: () => void
}

export const AuthContext = createContext<ProviderProps | undefined>(undefined)
