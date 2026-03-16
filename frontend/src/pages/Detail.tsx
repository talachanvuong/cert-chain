import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import type { Address } from 'viem'
import { publicClient } from '../config/client'
import { certificate } from '../config/contract'
import { useAuth } from '../hooks/useAuth'

type Classification = 'Xuất sắc' | 'Giỏi' | 'Khá'
type Status = 'Pending' | 'Verified' | 'Revoked' | 'Rejected'

interface CertificateData {
  hash: Address
  name: string
  classification: Classification
  issuer: Address
  issuedAt: number
  status: Status
  verifier: Address
  verifiedAt: number
  revokedAt?: number
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

const STATUS_MAP: Record<number, Status> = {
  0: 'Pending',
  1: 'Verified',
  2: 'Revoked',
  3: 'Rejected',
}

const STATUS_COLORS: Record<Status, string> = {
  Pending: 'bg-yellow-500',
  Verified: 'bg-green-500',
  Revoked: 'bg-red-500',
  Rejected: 'bg-orange-500',
}

const STATUS_LABELS: Record<Status, string> = {
  Pending: 'Chờ xác thực',
  Verified: 'Đã xác thực',
  Revoked: 'Đã thu hồi',
  Rejected: 'Bị từ chối',
}

const formatDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString('vi-VN')

const formatDateTime = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleString('vi-VN')

export const Detail = () => {
  const { hash } = useParams<{ hash: Address }>()
  const { address } = useAuth()

  const [cert, setCert] = useState<CertificateData | null>(null)
  const [isRevoking, setIsRevoking] = useState<boolean>(false)

  useEffect(() => {
    if (!hash) {
      setCert(null)
      return
    }

    const loadCertificate = async () => {
      const data = await certificate.read.getCertificate([hash])

      const status = STATUS_MAP[data.status]
      let revokedAt: number | undefined

      if (status === 'Revoked') {
        const events = (
          await certificate.getEvents.CertificateUpdated(
            { _certificateHash: hash },
            { fromBlock: 0n, toBlock: 'latest' }
          )
        ).filter((e) => e.args._certificateAction === 2)

        if (events.length > 0) {
          const block = await publicClient.getBlock({
            blockNumber: events[0].blockNumber,
          })
          revokedAt = Number(block.timestamp)
        }
      }

      setCert({
        hash,
        name: data.certificateName,
        classification: CLASSIFICATION_MAP[data.classification],
        issuer: data.issuer,
        issuedAt: Number(data.issuedAt),
        status,
        verifier: data.verifier,
        verifiedAt: Number(data.verifiedAt),
        revokedAt,
        studentId: data.studentId,
        studentName: data.studentName,
        dob: Number(data.dateOfBirth),
      })
    }

    loadCertificate()
  }, [hash])

  const handleRevoke = async () => {
    if (!cert || isRevoking) return
    if (!window.confirm('Bạn có chắc chắn muốn thu hồi chứng chỉ này?')) return

    setIsRevoking(true)

    try {
      const txHash = await certificate.write.revokeCertificate([cert.hash], {
        account: address,
      })

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      })

      const block = await publicClient.getBlock({
        blockNumber: receipt.blockNumber,
      })

      toast.success('Thu hồi chứng chỉ thành công')
      setCert({
        ...cert,
        status: 'Revoked',
        revokedAt: Number(block.timestamp),
      })
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
            className={`px-5 py-3 font-semibold rounded-lg ${STATUS_COLORS[cert.status]}`}
          >
            {STATUS_LABELS[cert.status]}
          </p>
        </div>
      </div>

      <div className="p-8 bg-white shadow-lg rounded-b-xl">
        {/* Thông tin sinh viên */}
        <div className="mb-8">
          <p className="mb-4 text-xl font-semibold text-gray-800">
            Thông tin sinh viên
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="mb-2 text-sm text-gray-600">Họ và tên</p>
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

        <div className="my-8 border-t border-gray-200" />

        {/* Thông tin chứng chỉ */}
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

          <div className="p-4 mb-4 rounded-lg bg-gray-50">
            <p className="mb-2 text-sm text-gray-600">Ngày cấp</p>
            <p className="font-semibold text-gray-900">
              {formatDateTime(cert.issuedAt)}
            </p>
          </div>

          {/* Hiển thị thông tin xác thực nếu đã từng được xác thực hoặc từ chối */}
          {cert.verifiedAt > 0 && (
            <div
              className={`p-4 mb-4 border-2 rounded-lg ${
                cert.status === 'Rejected' ||
                (cert.status === 'Revoked' && cert.verifier)
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-green-300 bg-green-50'
              }`}
            >
              <p
                className={`mb-3 text-sm font-semibold ${
                  cert.status === 'Rejected'
                    ? 'text-orange-700'
                    : 'text-green-700'
                }`}
              >
                {cert.status === 'Rejected'
                  ? 'Thông tin từ chối'
                  : 'Thông tin xác thực'}
              </p>
              <div className="mb-3">
                <p
                  className={`mb-1 text-xs ${
                    cert.status === 'Rejected'
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}
                >
                  {cert.status === 'Rejected'
                    ? 'Người từ chối'
                    : 'Người xác thực'}
                </p>
                <div
                  className={`p-2 overflow-x-auto font-mono text-sm bg-white border rounded ${
                    cert.status === 'Rejected'
                      ? 'text-orange-800 border-orange-200'
                      : 'text-green-800 border-green-200'
                  }`}
                >
                  {cert.verifier}
                </div>
              </div>
              <div>
                <p
                  className={`mb-1 text-xs ${
                    cert.status === 'Rejected'
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}
                >
                  {cert.status === 'Rejected'
                    ? 'Ngày từ chối'
                    : 'Ngày xác thực'}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    cert.status === 'Rejected'
                      ? 'text-orange-800'
                      : 'text-green-800'
                  }`}
                >
                  {formatDateTime(cert.verifiedAt)}
                </p>
              </div>
            </div>
          )}

          {cert.status === 'Revoked' && cert.revokedAt && (
            <div className="p-4 mb-4 border-2 border-red-300 rounded-lg bg-red-50">
              <p className="mb-2 text-sm text-red-600">Ngày thu hồi</p>
              <p className="font-semibold text-red-900">
                {formatDateTime(cert.revokedAt)}
              </p>
            </div>
          )}
        </div>

        {/* Nút thu hồi — chỉ hiện khi Pending hoặc Verified */}
        {cert.status !== 'Revoked' && cert.status !== 'Rejected' && (
          <>
            <div className="my-8 border-t border-gray-200" />
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
