import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const RequireAdmin = () => {
  const { address } = useAuth()

  if (!address) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

export const RequireAnonymous = () => {
  const { address } = useAuth()

  if (address) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}
