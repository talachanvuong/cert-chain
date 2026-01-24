import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import type { Address } from 'viem'
import { publicClient } from '../config/client'
import { certificate } from '../config/contract'
import { useAuth } from '../hooks/useAuth'

type Classification = 'Xuất sắc' | 'Giỏi' | 'Khá'

interface Certificate {
  hash: Address
  name: string
  classification: Classification
  issuer: Address
  issuedAt: number
  revoked: boolean
  studentId: string
  studentName: string
  dob: number
}

const CLASSIFICATION_MAP: Record<string, Classification> = {
  excellent: 'Xuất sắc',
  veryGood: 'Giỏi',
  good: 'Khá',
}

const CLASSIFICATION_COLORS: Record<Classification, string> = {
  'Xuất sắc': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Giỏi: 'bg-blue-100 text-blue-800 border-blue-300',
  Khá: 'bg-green-100 text-green-800 border-green-300',
}

const formatDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString('vi-VN')

const formatDateTime = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleString('vi-VN')

export const Detail = () => {
  const { hash } = useParams<{ hash: Address }>()
  const { address } = useAuth()

  const [cert, setCert] = useState<Certificate | null>(null)
  const [isRevoking, setIsRevoking] = useState<boolean>(false)

  useEffect(() => {
    if (!hash) {
      setCert(null)
      return
    }

    const loadCertificate = async () => {
      const data = await certificate.read.certificates([hash])

      const issuedAt = Number(data[4])

      if (!issuedAt) {
        setCert(null)
        return
      }

      setCert({
        hash,
        name: data[1],
        classification: CLASSIFICATION_MAP[data[2]],
        issuer: data[3],
        issuedAt,
        revoked: data[5],
        studentId: data[6],
        studentName: data[7],
        dob: Number(data[8]),
      })
    }

    loadCertificate()
  }, [hash])

  const handleRevoke = async () => {
    if (!cert || isRevoking) return
    if (!window.confirm('Bạn có chắc chắn muốn thu hồi chứng chỉ này?')) return

    setIsRevoking(true)

    try {
      const processHash = await certificate.write.revokeCertificate(
        [cert.hash],
        { account: address }
      )

      await publicClient.waitForTransactionReceipt({ hash: processHash })

      toast.success('Thu hồi chứng chỉ thành công')

      setCert({ ...cert, revoked: true })
    } catch {
      toast.error('Giao dịch thất bại')
    } finally {
      setIsRevoking(false)
    }
  }

  if (!cert) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="mb-2 text-2xl font-semibold text-gray-700">
          Không tìm thấy chứng chỉ
        </p>
        <p className="text-gray-500">Vui lòng kiểm tra lại mã chứng chỉ</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl p-6 mx-auto mt-8">
      <div className="p-8 text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-t-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-3 text-3xl font-bold">Chi tiết chứng chỉ</p>
            <p className="mb-4 text-xl">{cert.name}</p>
            <p
              className={`inline-block px-4 py-2 font-semibold border-2 rounded-lg ${CLASSIFICATION_COLORS[cert.classification]}`}
            >
              {cert.classification}
            </p>
          </div>
          <p
            className={`px-5 py-3 font-semibold rounded-lg ${
              cert.revoked ? 'bg-red-500' : 'bg-green-500'
            }`}
          >
            {cert.revoked ? 'Đã thu hồi' : 'Hợp lệ'}
          </p>
        </div>
      </div>

      <div className="p-8 bg-white shadow-lg rounded-b-xl">
        <div className="mb-8">
          <p className="mb-4 text-xl font-semibold text-gray-800">
            Thông tin sinh viên
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="mb-2 text-sm text-gray-600">Tên học sinh</p>
              <p className="font-semibold text-gray-900">{cert.studentName}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="mb-2 text-sm text-gray-600">Mã số sinh viên</p>
              <p className="font-semibold text-gray-900">{cert.studentId}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="mb-2 text-sm text-gray-600">Ngày sinh</p>
              <p className="font-semibold text-gray-900">
                {formatDate(cert.dob)}
              </p>
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-gray-200"></div>

        <div className="mb-8">
          <p className="mb-4 text-xl font-semibold text-gray-800">
            Thông tin chứng chỉ
          </p>

          <div className="p-4 mb-4 rounded-lg bg-gray-50">
            <p className="mb-2 text-sm text-gray-600">Mã chứng chỉ</p>
            <p className="block px-3 py-2 overflow-x-auto font-mono text-sm text-blue-600 bg-white border rounded">
              {cert.hash}
            </p>
          </div>

          <div className="p-4 mb-4 rounded-lg bg-gray-50">
            <p className="mb-2 text-sm text-gray-600">Người cấp</p>
            <p className="block px-3 py-2 overflow-x-auto font-mono text-sm text-blue-600 bg-white border rounded">
              {cert.issuer}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-gray-50">
            <p className="mb-2 text-sm text-gray-600">Ngày cấp</p>
            <p className="font-semibold text-gray-900">
              {formatDateTime(cert.issuedAt)}
            </p>
          </div>
        </div>

        {!cert.revoked && (
          <>
            <div className="my-8 border-t border-gray-200"></div>
            <div className="flex justify-end">
              <button
                onClick={handleRevoke}
                disabled={isRevoking}
                className="px-6 py-3 font-medium text-white transition-colors bg-red-600 rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed hover:shadow-lg"
              >
                {isRevoking ? 'Đang thu hồi...' : 'Thu hồi chứng chỉ'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
