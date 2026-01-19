import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AdminLayout } from '../layouts/AdminLayout'

export const RequireAdmin = () => {
  const { isOwner } = useAuth()

  if (!isOwner) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export const RequireAnonymous = () => {
  const { isOwner } = useAuth()

  if (isOwner) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}
