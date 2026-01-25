import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Address } from 'viem'
import { publicClient } from '../config/client'
import { certificate } from '../config/contract'

type Classification = 'Xuất sắc' | 'Giỏi' | 'Khá'

interface CertificateData {
  hash: Address
  name: string
  classification: Classification
  issuer: Address
  issuedAt: number
  revoked: boolean
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
      const data = await certificate.read.verifyCertificate([hash])

      const issuedAt = Number(data.issuedAt)

      if (!issuedAt) {
        setCert(null)
        return
      }

      const revoked = data.revoked
      let revokedAt: number | undefined

      if (revoked) {
        const events = await certificate.getEvents.CertificateUpdated(
          { _certificateHash: hash },
          { fromBlock: 0n, toBlock: 'latest' }
        )

        const revokedEvent = events.find((event) => {
          const action = event.args._certificateAction
          return action === 1
        })

        if (revokedEvent) {
          const block = await publicClient.getBlock({
            blockNumber: revokedEvent.blockNumber,
          })
          revokedAt = Number(block.timestamp)
        }
      }

      setCert({
        hash,
        name: data.certificateName,
        classification: CLASSIFICATION_MAP[data.classification],
        issuer: data.issuer,
        issuedAt,
        revoked,
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
        <div className="relative flex flex-col flex-1 p-8 md:p-12">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-900 to-amber-500"></div>

          <div className="mb-8">
            <p className="text-4xl font-extrabold tracking-tight text-blue-900 uppercase">
              Vinh danh thành tích
            </p>
            <div className="w-24 h-1 mt-3 bg-linear-to-r from-blue-900 to-amber-500"></div>
          </div>

          <div className="flex flex-col justify-center flex-1 space-y-8">
            <div>
              <p className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                {cert.studentName}
              </p>
            </div>

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
          </div>

          <div className="pt-6 mt-6 border-t border-gray-200">
            <p className="mb-2 text-xs font-bold text-gray-400 uppercase">
              Mã chứng chỉ
            </p>
            <div className="overflow-x-auto">
              <p className="font-mono text-xs text-gray-600 whitespace-nowrap">
                {cert.hash}
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-between p-8 border-l border-gray-200 w-80 bg-gray-50">
          {cert.revoked ? (
            <div className="p-4 mb-6 text-center bg-red-100 border border-red-200 rounded-lg">
              <p className="text-sm font-bold text-red-700 uppercase">
                Đã thu hồi
              </p>
              <p className="mt-1 text-xs text-red-600">
                {formatDateLong(cert.issuedAt)}
              </p>
            </div>
          ) : (
            <div className="p-2 mb-6 text-center bg-green-100 border border-green-200 rounded">
              <p className="text-xs font-bold tracking-wide text-green-700 uppercase">
                Đang hiệu lực
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
