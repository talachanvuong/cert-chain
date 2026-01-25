import { useState } from 'react'
import { isHex, type Hex } from 'viem'
import { publicClient } from '../config/client'
import { certificate } from '../config/contract'

type CertificateAction = 'Đã tạo' | 'Đã thu hồi'

interface CertificateResult {
  hash: Hex
  action: CertificateAction
  issuedAt: number
}

const ACTION_MAP: Record<number, CertificateAction> = {
  0: 'Đã tạo',
  1: 'Đã thu hồi',
}

const formatDateTime = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleString('vi-VN')

const isCertHash = (value: string): value is Hex => {
  return isHex(value) && value.length === 66
}

export const Find = () => {
  const [activeTab, setActiveTab] = useState<'hash' | 'student'>('hash')

  const [certHash, setCertHash] = useState<string>('')
  const [studentId, setStudentId] = useState<string>('')

  const [certResult, setCertResult] = useState<CertificateResult | null>(null)
  const [studentResults, setStudentResults] = useState<CertificateResult[]>([])

  const [certError, setCertError] = useState<string>('')
  const [studentError, setStudentError] = useState<string>('')

  const handleSearchByCertHash = async () => {
    setCertError('')
    setCertResult(null)

    if (!certHash.trim()) {
      setCertError('Vui lòng nhập mã chứng chỉ')
      return
    }

    if (!isCertHash(certHash)) {
      setCertError('Mã chứng chỉ không hợp lệ')
      return
    }

    const events = await certificate.getEvents.CertificateUpdated(
      { _certificateHash: certHash },
      { fromBlock: 0n, toBlock: 'latest' }
    )

    if (events.length === 0) {
      setCertError('Không tìm thấy chứng chỉ')
      return
    }

    const issuedEvent = events.find(
      (e) => ACTION_MAP[e.args._certificateAction!] === 'Đã tạo'
    )
    const revokedEvent = events.find(
      (e) => ACTION_MAP[e.args._certificateAction!] === 'Đã thu hồi'
    )

    if (!issuedEvent) {
      setCertError('Không tìm thấy chứng chỉ')
      return
    }

    const issuedBlock = await publicClient.getBlock({
      blockNumber: issuedEvent.blockNumber,
    })

    setCertResult({
      hash: issuedEvent.args._certificateHash!,
      action: revokedEvent ? 'Đã thu hồi' : 'Đã tạo',
      issuedAt: Number(issuedBlock.timestamp),
    })
  }

  const handleSearchByStudentId = async () => {
    setStudentError('')
    setStudentResults([])

    if (!studentId.trim()) {
      setStudentError('Vui lòng nhập mã số sinh viên')
      return
    }

    const events = await certificate.getEvents.StudentReceived(
      { _studentId: studentId },
      { fromBlock: 0n, toBlock: 'latest' }
    )

    if (events.length === 0) {
      setStudentError('Không tìm thấy chứng chỉ nào')
      return
    }

    const results: CertificateResult[] = []

    for (const event of events) {
      const certHash = event.args._certificateHash!

      const certEvents = await certificate.getEvents.CertificateUpdated(
        { _certificateHash: certHash },
        { fromBlock: 0n, toBlock: 'latest' }
      )

      const issuedEvent = certEvents.find(
        (e) => ACTION_MAP[e.args._certificateAction!] === 'Đã tạo'
      )
      const revokedEvent = certEvents.find(
        (e) => ACTION_MAP[e.args._certificateAction!] === 'Đã thu hồi'
      )

      if (!issuedEvent) continue

      const issuedBlock = await publicClient.getBlock({
        blockNumber: issuedEvent.blockNumber,
      })

      results.push({
        hash: certHash,
        action: revokedEvent ? 'Đã thu hồi' : 'Đã tạo',
        issuedAt: Number(issuedBlock.timestamp),
      })
    }

    setStudentResults(results)
  }

  const CertificateCard = ({ result }: { result: CertificateResult }) => {
    const isRevoked = result.action === 'Đã thu hồi'

    return (
      <div className="overflow-hidden transition-shadow bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md">
        <div
          className={`px-6 py-4 border-b ${isRevoked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-2 h-2 rounded-full ${isRevoked ? 'bg-red-600' : 'bg-green-600'}`}
              ></div>
              <p
                className={`font-semibold ${isRevoked ? 'text-red-900' : 'text-green-900'}`}
              >
                {isRevoked ? 'Đã thu hồi' : 'Hợp lệ'}
              </p>
            </div>
            <p
              className={`px-3 py-1 text-xs font-medium rounded ${isRevoked ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'}`}
            >
              {isRevoked ? 'THU HỒI' : 'HỢP LỆ'}
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-600 uppercase">
              Mã chứng chỉ
            </p>
            <div className="p-3 overflow-x-auto font-mono text-sm text-gray-800 border border-gray-200 rounded bg-gray-50">
              {result.hash}
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">
              Ngày cấp
            </p>
            <p className="text-sm font-medium text-gray-900">
              {formatDateTime(result.issuedAt)}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button className="w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-800 rounded cursor-pointer hover:bg-gray-900">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-4xl px-6 mx-auto">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            Tra cứu chứng chỉ
          </h1>
        </div>

        <div className="overflow-hidden bg-white border border-gray-300 shadow-sm rounded-xl">
          <div className="flex border-b border-gray-300">
            <button
              onClick={() => {
                setActiveTab('hash')
                setCertError('')
                setStudentError('')
              }}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                activeTab === 'hash'
                  ? 'text-gray-900 bg-white border-b-2 border-gray-900'
                  : 'text-gray-500 bg-gray-50 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                <p>Mã chứng chỉ</p>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('student')
                setCertError('')
                setStudentError('')
              }}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                activeTab === 'student'
                  ? 'text-gray-900 bg-white border-b-2 border-gray-900'
                  : 'text-gray-500 bg-gray-50 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p>Mã số sinh viên</p>
              </div>
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'hash' ? (
              <div>
                <div className="mb-6">
                  <p className="block mb-2 text-sm font-semibold text-gray-700">
                    Nhập mã chứng chỉ
                  </p>
                  <input
                    type="text"
                    value={certHash}
                    onChange={(e) => setCertHash(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleSearchByCertHash()
                    }
                    className="w-full h-12 px-4 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <button
                  onClick={handleSearchByCertHash}
                  className="w-full px-6 py-3 font-semibold text-white transition-colors bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800"
                >
                  Tìm kiếm
                </button>

                {certError && (
                  <div className="p-4 mt-6 text-sm text-red-800 border border-red-200 rounded-lg bg-red-50">
                    {certError}
                  </div>
                )}

                {certResult && (
                  <div className="mt-6">
                    <CertificateCard result={certResult} />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <p className="block mb-2 text-sm font-semibold text-gray-700">
                    Nhập mã số sinh viên
                  </p>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleSearchByStudentId()
                    }
                    className="w-full h-12 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <button
                  onClick={handleSearchByStudentId}
                  className="w-full px-6 py-3 font-semibold text-white transition-colors bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800"
                >
                  Tìm kiếm
                </button>

                {studentError && (
                  <div className="p-4 mt-6 text-sm text-red-800 border border-red-200 rounded-lg bg-red-50">
                    {studentError}
                  </div>
                )}

                {studentResults.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700">
                        Tìm thấy {studentResults.length} chứng chỉ
                      </p>
                    </div>
                    <div className="pr-2 space-y-4 overflow-y-auto max-h-150">
                      {studentResults.map((result, index) => (
                        <CertificateCard key={index} result={result} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
