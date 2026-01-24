import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AdminLayout } from '../layouts/AdminLayout'

export const RequireAdmin = () => {
  const { isOwner } = useAuth()
  const location = useLocation()

  if (!isOwner) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export const RequireAnonymous = () => {
  const { isOwner } = useAuth()
  const location = useLocation()

  if (isOwner) {
    const from = location.state?.from?.pathname || '/admin/dashboard'
    return <Navigate to={from} replace />
  }

  return <Outlet />
}
