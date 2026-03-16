import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Address } from 'viem'
import { publicClient } from '../config/client'
import { certificate } from '../config/contract'

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

const STATUS_MAP: Record<number, Status> = {
  0: 'Pending',
  1: 'Verified',
  2: 'Revoked',
  3: 'Rejected',
}

const formatDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const formatDateLong = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return `${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`
}

export const Certificate = () => {
  const { hash } = useParams<{ hash: Address }>()

  const [cert, setCert] = useState<CertificateData | null>(null)
  const [qrCode, setQrCode] = useState<string>('')

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

      const url = `${window.location.origin}/certificate/${hash}`
      const qr = await QRCode.toDataURL(url, { width: 150 })
      setQrCode(qr)
    }

    loadCertificate()
  }, [hash])

  if (!cert) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-8 text-center bg-white rounded-lg shadow-xl">
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            Không tìm thấy chứng chỉ
          </h2>
          <p className="text-gray-600">
            Mã chứng chỉ không tồn tại trong hệ thống
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full h-screen p-4 bg-gray-100">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Left */}
        <div className="relative flex flex-col flex-1 p-8 md:p-12">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-900 to-amber-500" />

          <div className="mb-8">
            <p className="text-4xl font-extrabold tracking-tight text-blue-900 uppercase">
              Vinh danh thành tích
            </p>
            <div className="w-24 h-1 mt-3 bg-linear-to-r from-blue-900 to-amber-500" />
          </div>

          <div className="flex flex-col justify-center flex-1 space-y-8">
            <p className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              {cert.studentName}
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Mã số sinh viên
                </p>
                <p className="font-mono text-lg font-semibold text-blue-900">
                  {cert.studentId}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Ngày sinh
                </p>
                <p className="font-mono text-lg font-semibold text-gray-700">
                  {formatDate(cert.dob)}
                </p>
              </div>
            </div>

            <div className="p-5 border-l-4 border-blue-900 rounded-lg bg-blue-50">
              <p className="mb-1 text-sm font-medium text-blue-800">
                Chứng chỉ:
              </p>
              <p className="text-xl font-bold text-gray-900">{cert.name}</p>
              <div className="inline-flex items-center px-3 py-1 mt-2 text-sm font-bold text-white rounded-full bg-amber-500">
                Xếp loại: {cert.classification}
              </div>
            </div>

            {/* Thông tin xác thực — hiển thị nếu đã từng được xác thực hoặc từ chối */}
            {cert.verifiedAt > 0 && (
              <div
                className={`p-4 border rounded-lg ${
                  cert.status === 'Rejected'
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-green-200 bg-green-50'
                }`}
              >
                <p
                  className={`mb-1 text-xs font-bold uppercase ${
                    cert.status === 'Rejected'
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}
                >
                  {cert.status === 'Rejected'
                    ? 'Bị từ chối bởi'
                    : 'Đã xác thực bởi'}
                </p>
                <p
                  className={`font-mono text-xs break-all ${
                    cert.status === 'Rejected'
                      ? 'text-orange-800'
                      : 'text-green-800'
                  }`}
                >
                  {cert.verifier}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    cert.status === 'Rejected'
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}
                >
                  {formatDateLong(cert.verifiedAt)}
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-gray-200">
            <p className="mb-2 text-xs font-bold text-gray-400 uppercase">
              Mã chứng chỉ
            </p>
            <p className="font-mono text-xs text-gray-600 whitespace-nowrap overflow-x-auto">
              {cert.hash}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="relative flex flex-col justify-between p-8 border-l border-gray-200 w-80 bg-gray-50">
          {cert.status === 'Revoked' ? (
            <div className="p-4 mb-6 text-center bg-red-100 border border-red-200 rounded-lg">
              <p className="text-sm font-bold text-red-700 uppercase">
                Đã thu hồi
              </p>
              {cert.revokedAt && (
                <p className="mt-1 text-xs text-red-600">
                  {formatDateLong(cert.revokedAt)}
                </p>
              )}
            </div>
          ) : cert.status === 'Rejected' ? (
            <div className="p-4 mb-6 text-center bg-orange-100 border border-orange-200 rounded-lg">
              <p className="text-sm font-bold text-orange-700 uppercase">
                Bị từ chối
              </p>
            </div>
          ) : cert.status === 'Pending' ? (
            <div className="p-4 mb-6 text-center bg-yellow-100 border border-yellow-200 rounded-lg">
              <p className="text-xs font-bold tracking-wide text-yellow-700 uppercase">
                Chờ xác thực
              </p>
            </div>
          ) : (
            <div className="p-4 mb-6 text-center bg-green-100 border border-green-200 rounded-lg">
              <p className="text-xs font-bold tracking-wide text-green-700 uppercase">
                Đã xác thực
              </p>
            </div>
          )}

          <div className="flex flex-col items-center justify-center flex-1">
            <div className="p-3 mb-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              {qrCode && (
                <img src={qrCode} className="object-contain w-40 h-40" />
              )}
            </div>
            <div className="text-center">
              <p className="mb-1 text-xs font-bold text-gray-400 uppercase">
                Ngày cấp
              </p>
              <p className="font-bold text-gray-800">
                {formatDateLong(cert.issuedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
