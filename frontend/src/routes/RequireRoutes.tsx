import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AdminLayout } from '../layouts/AdminLayout'

export const RequireAdmin = () => {
  const { address, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!address) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export const RequireAnonymous = () => {
  const { address, loading } = useAuth()

  if (loading) {
    return null
  }

  if (address) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}
