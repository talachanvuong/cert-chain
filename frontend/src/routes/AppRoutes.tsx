import { Navigate, Route, Routes } from 'react-router-dom'
import { Certificate } from '../pages/Certificate'
import { Create } from '../pages/Create'
import { Dashboard } from '../pages/Dashboard'
import { Detail } from '../pages/Detail'
import { Find } from '../pages/Find'
import { List } from '../pages/List'
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
      <Route path="list" element={<List />} />
      <Route path="detail/:hash" element={<Detail />} />
    </Route>

    <Route path="/find" element={<Find />} />
    <Route path="/certificate/:hash" element={<Certificate />} />

    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
  </Routes>
)
