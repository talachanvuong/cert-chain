import { Navigate, Route, Routes } from 'react-router-dom'
import { Create } from '../pages/Create'
import { Dashboard } from '../pages/Dashboard'
import { Login } from '../pages/Login'
import { RequireAdmin, RequireAnonymous } from './RequireRoutes'

export const AppRoutes = () => (
  <Routes>
    <Route element={<RequireAnonymous />}>
      <Route path="/admin/login" element={<Login />} />
    </Route>

    <Route path="/admin" element={<RequireAdmin />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="create" element={<Create />} />
      <Route path="list" element={<p>List</p>} />
    </Route>
  </Routes>
)
