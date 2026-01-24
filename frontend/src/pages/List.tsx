import { useEffect, useMemo, useState } from 'react'
import type { Address } from 'viem'
import { publicClient } from '../config/client'
import { certificate } from '../config/contract'

type CertificateAction = 'Đã tạo' | 'Đã chỉnh sửa' | 'Đã thu hồi'

interface CertificateEvent {
  hash: Address
  action: CertificateAction
  timestamp: number
}

export const List = () => {
  const actions: CertificateAction[] = ['Đã tạo', 'Đã chỉnh sửa', 'Đã thu hồi']

  const [filters, setFilters] = useState<CertificateAction[]>(actions)
  const [data, setData] = useState<CertificateEvent[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await certificate.getEvents.CertificateUpdated(
        {},
        { fromBlock: 0n, toBlock: 'latest' }
      )

      const convertToAction = (raw: number) => {
        const map: Record<number, CertificateAction> = {
          0: 'Đã tạo',
          1: 'Đã chỉnh sửa',
          2: 'Đã thu hồi',
        }

        return map[raw]
      }

      const data: CertificateEvent[] = await Promise.all(
        events.map(async (event) => {
          const { _certificateHash, _certificateAction } = event.args

          const block = await publicClient.getBlock({
            blockNumber: event.blockNumber,
          })

          return {
            hash: _certificateHash as Address,
            action: convertToAction(_certificateAction as number),
            timestamp: Number(block.timestamp),
          }
        })
      )

      setData(data)
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
        {actions.map((action) => (
          <button
            className={`px-5 py-2 font-medium rounded-full border transition-all duration-200 cursor-pointer ${
              filters.includes(action)
                ? 'bg-gray-800 text-white shadow-lg scale-105'
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
            className="grid items-center px-6 py-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm cursor-pointer grid-cols-23 group rounded-xl hover:shadow-md hover:border-blue-200"
            key={item.hash}
          >
            <div className="col-span-16">
              <p className="font-mono text-sm text-blue-600 group-hover:text-blue-700">
                {item.hash}
              </p>
            </div>

            <div className="flex justify-center col-span-3">
              <p
                className={`text-[12px] px-3 py-1 rounded-md font-medium ${
                  item.action === 'Đã tạo'
                    ? 'bg-green-50 text-green-700'
                    : item.action === 'Đã thu hồi'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-orange-50 text-orange-700'
                }`}
              >
                {item.action}
              </p>
            </div>

            <div className="col-span-4 text-right">
              <p className="text-sm text-gray-600">
                {new Date(item.timestamp * 1000).toLocaleString('vi-vn')}
              </p>
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
