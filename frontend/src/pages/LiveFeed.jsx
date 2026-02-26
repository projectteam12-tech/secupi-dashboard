import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import api from '../services/api'
import Table from '../components/Table'
import FilterBar from '../components/FilterBar'
import wsService from '../services/websocket'

const LiveFeed = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    src_ip: '',
    dst_ip: '',
    proto: '',
    action: '',
  })

  useEffect(() => {
    fetchLogs()
    wsService.connectLogs()

    const unsubscribe = wsService.onLog((data) => {
      if (data.type === 'log') {
        setLogs((prev) => [data.data, ...prev].slice(0, 100)) // Keep last 100 logs
      }
    })

    return () => {
      unsubscribe()
    }
  }, [page, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      })
      const response = await api.get(`/logs/?${params}`)
      setLogs(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 20))
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const filterConfig = [
    {
      key: 'src_ip',
      label: 'Source IP',
      type: 'text',
      placeholder: 'Filter by source IP',
      value: filters.src_ip,
    },
    {
      key: 'dst_ip',
      label: 'Destination IP',
      type: 'text',
      placeholder: 'Filter by destination IP',
      value: filters.dst_ip,
    },
    {
      key: 'proto',
      label: 'Protocol',
      type: 'select',
      value: filters.proto,
      options: [
        { value: 'TCP', label: 'TCP' },
        { value: 'UDP', label: 'UDP' },
        { value: 'ICMP', label: 'ICMP' },
        { value: 'HTTP', label: 'HTTP' },
        { value: 'HTTPS', label: 'HTTPS' },
      ],
    },
    {
      key: 'action',
      label: 'Action',
      type: 'select',
      value: filters.action,
      options: [
        { value: 'allow', label: 'Allow' },
        { value: 'block', label: 'Block' },
        { value: 'drop', label: 'Drop' },
      ],
    },
  ]

  const headers = ['Timestamp', 'Source IP', 'Destination IP', 'Protocol', 'Size', 'Action']

  const renderRow = (log) => (
    <tr key={log.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.src_ip}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.dst_ip}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.proto}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.packet_size}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.action === 'allow'
              ? 'bg-green-100 text-green-800'
              : log.action === 'block'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
        >
          {log.action}
        </span>
      </td>
    </tr>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Live Traffic Feed</h1>

      <FilterBar filters={filterConfig} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <Table headers={headers} data={logs} renderRow={renderRow} />

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default LiveFeed



