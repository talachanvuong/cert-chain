import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import type { Address } from 'viem'
import { publicClient } from '../config/client'
import { certificate } from '../config/contract'
import { useAuth } from '../hooks/useAuth'

type Classification = 'Xuất sắc' | 'Giỏi' | 'Khá'

interface PendingCert {
  hash: Address
  certificateName: string
  classification: Classification
  issuer: Address
  issuedAt: number
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
  'Xuất sắc': 'bg-yellow-100 text-yellow-800',
  Giỏi: 'bg-blue-100 text-blue-800',
  Khá: 'bg-green-100 text-green-800',
}

const formatDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString('vi-VN')

const formatDateTime = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleString('vi-VN')

export const VerifierDashboard = () => {
  const { address } = useAuth()

  const [certs, setCerts] = useState<PendingCert[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [approvingHash, setApprovingHash] = useState<Address | null>(null)
  const [rejectingHash, setRejectingHash] = useState<Address | null>(null)

  const fetchPendingCerts = async () => {
    setLoading(true)

    const events = (
      await certificate.getEvents.CertificateUpdated(
        {},
        { fromBlock: 0n, toBlock: 'latest' }
      )
    ).filter((e) => e.args._certificateAction === 0) // Issued only

    const results: PendingCert[] = []

    for (const event of events) {
      const hash = event.args._certificateHash as Address

      const data = await certificate.read.getCertificate([hash])

      // status: 0 = Pending
      if (data.status !== 0) continue

      const block = await publicClient.getBlock({
        blockNumber: event.blockNumber,
      })

      results.push({
        hash,
        certificateName: data.certificateName,
        classification: CLASSIFICATION_MAP[data.classification],
        issuer: data.issuer,
        issuedAt: Number(block.timestamp),
        studentId: data.studentId,
        studentName: data.studentName,
        dob: Number(data.dateOfBirth),
      })
    }

    setCerts(results)
    setLoading(false)
  }

  useEffect(() => {
    fetchPendingCerts()
  }, [])

  const handleApprove = async (hash: Address) => {
    if (approvingHash || rejectingHash) return

    setApprovingHash(hash)

    try {
      const txHash = await certificate.write.approveCertificate([hash], {
        account: address,
      })

      await publicClient.waitForTransactionReceipt({ hash: txHash })

      toast.success('Xác thực chứng chỉ thành công')
      setCerts((prev) => prev.filter((c) => c.hash !== hash))
    } catch {
      toast.error('Giao dịch thất bại')
    } finally {
      setApprovingHash(null)
    }
  }

  const handleReject = async (hash: Address) => {
    if (approvingHash || rejectingHash) return
    if (!window.confirm('Bạn có chắc chắn muốn từ chối chứng chỉ này?')) return

    setRejectingHash(hash)

    try {
      const txHash = await certificate.write.rejectCertificate([hash], {
        account: address,
      })

      await publicClient.waitForTransactionReceipt({ hash: txHash })

      toast.success('Đã từ chối chứng chỉ')
      setCerts((prev) => prev.filter((c) => c.hash !== hash))
    } catch {
      toast.error('Giao dịch thất bại')
    } finally {
      setRejectingHash(null)
    }
  }

  const isBusy = !!approvingHash || !!rejectingHash

  return (
    <div className="max-w-4xl mx-auto my-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Chứng chỉ chờ xác thực
        </h1>
        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {certs.length} chứng chỉ
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Đang tải...</p>
        </div>
      ) : certs.length === 0 ? (
        <div className="py-20 text-center border-2 border-gray-200 border-dashed bg-gray-50 rounded-2xl">
          <p className="font-medium text-gray-400">
            Không có chứng chỉ nào chờ xác thực
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {certs.map((cert) => (
            <div
              key={cert.hash}
              className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-linear-to-r from-blue-600 to-blue-700 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-white">
                    {cert.certificateName}
                  </p>
                  <span
                    className={`inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full ${CLASSIFICATION_COLORS[cert.classification]}`}
                  >
                    {cert.classification}
                  </span>
                </div>
                <span className="px-3 py-1 text-xs font-bold tracking-wide text-yellow-800 bg-yellow-100 rounded-full">
                  Chờ xác thực
                </span>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-400 uppercase">
                      Họ và tên
                    </p>
                    <p className="font-semibold text-gray-800">
                      {cert.studentName}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-400 uppercase">
                      Mã số sinh viên
                    </p>
                    <p className="font-semibold text-gray-800">
                      {cert.studentId}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-400 uppercase">
                      Ngày sinh
                    </p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(cert.dob)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-1 text-xs font-semibold text-gray-400 uppercase">
                    Người cấp
                  </p>
                  <p className="font-mono text-sm text-blue-600 bg-gray-50 border border-gray-200 rounded px-3 py-2 overflow-x-auto">
                    {cert.issuer}
                  </p>
                </div>

                <div className="mb-5">
                  <p className="mb-1 text-xs font-semibold text-gray-400 uppercase">
                    Mã chứng chỉ
                  </p>
                  <p className="font-mono text-sm text-blue-600 bg-gray-50 border border-gray-200 rounded px-3 py-2 overflow-x-auto">
                    {cert.hash}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-400">
                    Ngày cấp: {formatDateTime(cert.issuedAt)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(cert.hash)}
                      disabled={isBusy}
                      className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg cursor-pointer hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {rejectingHash === cert.hash
                        ? 'Đang xử lý...'
                        : 'Từ chối'}
                    </button>
                    <button
                      onClick={() => handleApprove(cert.hash)}
                      disabled={isBusy}
                      className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {approvingHash === cert.hash
                        ? 'Đang xử lý...'
                        : 'Xác thực'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
