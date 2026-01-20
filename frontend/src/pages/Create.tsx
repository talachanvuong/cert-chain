import { useNavigate } from 'react-router-dom'
import { UserRejectedRequestError } from 'viem'
import { publicClient } from '../config/client'
import { certificate } from '../config/contract'
import { useAuth } from '../hooks/useAuth'

export const Create = () => {
  const { address } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)

    const certificateName = formData.get('certificateName') as string
    const classification = formData.get('classification') as string
    const studentId = formData.get('studentId') as string
    const studentName = formData.get('studentName') as string
    const dateOfBirth = BigInt(
      Date.parse(formData.get('dateOfBirth') as string) / 1000
    )

    try {
      const hash = await certificate.write.issueCertificate(
        [certificateName, classification, studentId, studentName, dateOfBirth],
        { account: address }
      )

      await publicClient.waitForTransactionReceipt({ hash })

      navigate('/admin/list')
    } catch (error) {
      if (error instanceof UserRejectedRequestError) {
        return
      }
    }
  }

  return (
    <div className="max-w-3xl p-6 mx-auto mt-10 bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="pb-4 mb-6 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Tạo chứng chỉ mới</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">
                Mã số sinh viên
              </p>
              <input
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                name="studentId"
                type="text"
                required
              />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">
                Họ và tên
              </p>
              <input
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                name="studentName"
                type="text"
                required
              />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">
                Ngày sinh
              </p>
              <input
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                name="dateOfBirth"
                type="date"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">
                Tên chứng chỉ
              </p>
              <input
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                name="certificateName"
                type="text"
                required
              />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">Xếp loại</p>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                name="classification"
              >
                <option value="excellent">Xuất sắc</option>
                <option value="veryGood">Giỏi</option>
                <option value="good">Khá</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            className="px-6 py-2 mr-4 text-gray-600 transition-colors bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
            type="reset"
          >
            Làm mới
          </button>
          <button
            className="px-8 py-2 font-medium text-white transition-colors bg-blue-600 rounded cursor-pointer hover:bg-blue-700"
            type="submit"
          >
            Tạo
          </button>
        </div>
      </form>
    </div>
  )
}
