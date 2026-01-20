import { ToastContainer } from 'react-toastify'
import { AppRoutes } from './routes/AppRoutes'

export const App = () => {
  return (
    <>
      <AppRoutes />
      <ToastContainer position="bottom-left" autoClose={2000} />
    </>
  )
}
