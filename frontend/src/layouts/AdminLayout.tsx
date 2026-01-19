import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatEther, type Address } from 'viem'
import { publicClient } from '../config/client'
import { useAuth } from '../hooks/useAuth'

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { address, logout } = useAuth()
  const [balance, setBalance] = useState<string>('0 ETH')

  const formattedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`

  useEffect(() => {
    const getBalance = async (address: Address) => {
      const balance = await publicClient.getBalance({ address })
      const ethBalance = Number(formatEther(balance))

      const formatter = new Intl.NumberFormat('vi-vn')
      const formattedBalance = formatter.format(ethBalance) + ' ETH'

      setBalance(formattedBalance)
    }

    getBalance(address)
  }, [address])

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white shadow-md">
        <Link
          className="text-2xl font-extrabold text-gray-800"
          to="/admin/dashboard"
        >
          cert-chain
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
            <Link
              className="transition-colors hover:text-gray-800"
              to="/admin/create"
            >
              Tạo
            </Link>
            <Link
              className="transition-colors hover:text-gray-800"
              to="/admin/list"
            >
              Danh sách
            </Link>
          </div>

          <div className="flex items-center gap-3 py-1 pl-4 pr-1 bg-white border border-gray-300 rounded-full shadow-sm">
            <div className="flex flex-col">
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                {balance}
              </p>
              <p className="font-mono text-sm font-semibold text-gray-700">
                {formattedAddress}
              </p>
            </div>

            <button
              className="flex items-center justify-center w-8 h-8 transition-colors rounded-full cursor-pointer group bg-red-50 hover:bg-red-500"
              onClick={handleLogout}
            >
              <svg
                className="w-4 h-4 transition-colors fill-red-500 group-hover:fill-white"
                viewBox="0 -960 960 960"
              >
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
