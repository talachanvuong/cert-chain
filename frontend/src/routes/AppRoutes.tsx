import { Navigate, Route, Routes } from 'react-router-dom'
import { Certificate } from '../pages/Certificate'
import { Create } from '../pages/Create'
import { Dashboard } from '../pages/Dashboard'
import { Detail } from '../pages/Detail'
import { Find } from '../pages/Find'
import { List } from '../pages/List'
import { Login } from '../pages/Login'
import { VerifierDashboard } from '../pages/VerifierDashboard'
import { RequireGuest, RequireOwner, RequireVerifier } from './RequireRoutes'

export const AppRoutes = () => (
  <Routes>
    <Route path="/find" element={<Find />} />
    <Route path="/certificate/:hash" element={<Certificate />} />

    <Route element={<RequireGuest />}>
      <Route path="/login" element={<Login />} />
    </Route>

    <Route path="/admin" element={<RequireOwner />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="create" element={<Create />} />
      <Route path="list" element={<List />} />
      <Route path="detail/:hash" element={<Detail />} />
    </Route>

    <Route path="/verifier" element={<RequireVerifier />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<VerifierDashboard />} />
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
)
