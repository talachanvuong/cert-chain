import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Address } from 'viem'
import { publicClient } from '../config/client'
import { certificate } from '../config/contract'

type CertificateAction = 'Đã tạo' | 'Đã thu hồi'

interface CertificateEvent {
  hash: Address
  action: CertificateAction
  timestamp: number
}

const ACTIONS: CertificateAction[] = ['Đã tạo', 'Đã thu hồi']

const ACTION_MAP: Record<number, CertificateAction> = {
  0: 'Đã tạo',
  1: 'Đã thu hồi',
}

export const List = () => {
  const navigate = useNavigate()

  const [filters, setFilters] = useState<CertificateAction[]>(ACTIONS)
  const [data, setData] = useState<CertificateEvent[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await certificate.getEvents.CertificateUpdated(
        {},
        { fromBlock: 0n, toBlock: 'latest' }
      )

      const result: CertificateEvent[] = []

      for (const event of events) {
        const { _certificateHash, _certificateAction } = event.args

        if (!_certificateHash || _certificateAction === undefined) continue
        if (!ACTION_MAP[_certificateAction]) continue

        const block = await publicClient.getBlock({
          blockNumber: event.blockNumber,
        })

        result.push({
          hash: _certificateHash as Address,
          action: ACTION_MAP[_certificateAction],
          timestamp: Number(block.timestamp),
        })
      }

      setData(result)
    }

    fetchEvents()
  }, [])

  const filteredData = useMemo(() => {
    return data
      .filter((item) => filters.includes(item.action))
      .sort((a, b) => b.timestamp - a.timestamp)
  }, [data, filters])

  const toggleFilter = (action: CertificateAction) => {
    setFilters((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex justify-center gap-4 mb-6">
        {ACTIONS.map((action) => (
          <button
            className={`px-5 py-2 font-medium rounded-full border transition-all cursor-pointer ${
              filters.includes(action)
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-800 border-gray-300'
            }`}
            key={action}
            onClick={() => toggleFilter(action)}
          >
            {action}
          </button>
        ))}
      </div>

      <div className="grid px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase grid-cols-23">
        <div className="col-span-16">Mã chứng chỉ</div>
        <div className="col-span-3 text-center">Trạng thái</div>
        <div className="col-span-4 text-right">Ngày tạo</div>
      </div>

      <div className="space-y-3">
        {filteredData.map((item) => (
          <div
            className="grid items-center px-6 py-4 transition bg-white border border-gray-100 shadow-sm cursor-pointer grid-cols-23 rounded-xl hover:border-blue-200 hover:shadow-md"
            key={`${item.hash}-${item.timestamp}`}
            onClick={() => navigate(`/admin/detail/${item.hash}`)}
          >
            <div className="font-mono text-sm text-blue-600 col-span-16">
              {item.hash}
            </div>

            <div className="flex justify-center col-span-3">
              <p
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  item.action === 'Đã tạo'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {item.action}
              </p>
            </div>

            <div className="col-span-4 text-sm text-right text-gray-600">
              {new Date(item.timestamp * 1000).toLocaleString('vi-VN')}
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="py-20 text-center border-2 border-gray-200 border-dashed bg-gray-50 rounded-2xl">
            <p className="font-medium text-gray-400">
              Không tìm thấy chứng chỉ nào
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
