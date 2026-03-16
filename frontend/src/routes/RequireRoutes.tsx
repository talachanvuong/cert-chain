import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AdminLayout } from '../layouts/AdminLayout'
import { VerifierLayout } from '../layouts/VerifierLayout'

export const RequireOwner = () => {
  const { role } = useAuth()
  const location = useLocation()

  if (role === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role === 'verifier') {
    return <Navigate to="/verifier/dashboard" replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export const RequireVerifier = () => {
  const { role } = useAuth()
  const location = useLocation()

  if (role === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role === 'owner') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <VerifierLayout>
      <Outlet />
    </VerifierLayout>
  )
}

export const RequireGuest = () => {
  const { role } = useAuth()

  if (role === 'owner') return <Navigate to="/admin/dashboard" replace />
  if (role === 'verifier') return <Navigate to="/verifier/dashboard" replace />

  return <Outlet />
}
