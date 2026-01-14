import { useAuth } from '../hooks/useAuth'
import { useClient } from '../hooks/useClient'

export const Login = () => {
  const { login } = useAuth()
  const { connectWallet } = useClient()

  const handleLogin = async () => {
    const account = await connectWallet()
    login(account)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-2xl rounded-xl">
        <p className="mb-6 text-5xl font-extrabold text-center text-gray-800">
          cert-chain
        </p>

        <button
          className="flex items-center justify-center px-4 py-3 mx-auto space-x-3 font-semibold text-gray-800 rounded-lg shadow-md cursor-pointer bg-amber-500"
          onClick={handleLogin}
        >
          <img
            className="w-12 h-12"
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
          />
          <p>Đăng nhập với MetaMask</p>
        </button>
      </div>
    </div>
  )
}
