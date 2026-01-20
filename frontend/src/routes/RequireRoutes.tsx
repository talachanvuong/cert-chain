import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AdminLayout } from '../layouts/AdminLayout'

export const RequireAdmin = () => {
  const { isOwner } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOwner) {
      navigate('/admin/login')
    }
  }, [isOwner])

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export const RequireAnonymous = () => {
  const { isOwner } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isOwner) {
      navigate('/admin/dashboard')
    }
  }, [isOwner])

  return <Outlet />
}
