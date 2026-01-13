import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin, RequireAnonymous } from './RequireRoutes'

export const AppRoutes = () => (
  <Routes>
    <Route element={<RequireAnonymous />}>
      <Route path="/admin/login" element={<p>Login</p>} />
    </Route>

    <Route path="/admin" element={<RequireAdmin />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<p>Dashboard</p>} />
    </Route>
  </Routes>
)
