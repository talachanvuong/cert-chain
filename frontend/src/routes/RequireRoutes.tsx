import { Navigate, Outlet } from 'react-router-dom'
import { zeroAddress } from 'viem'
import { useAuth } from '../hooks/useAuth'
import { AdminLayout } from '../layouts/AdminLayout'

export const RequireAdmin = () => {
  const { address } = useAuth()

  if (address === zeroAddress) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export const RequireAnonymous = () => {
  const { address } = useAuth()

  if (address !== zeroAddress) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}
