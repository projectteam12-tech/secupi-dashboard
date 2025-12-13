import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import api from '../services/api'
import Table from '../components/Table'
import Modal from '../components/Modal'
import FilterBar from '../components/FilterBar'
import wsService from '../services/websocket'

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    alert_type: '',
    severity: '',
    status: '',
  })

  useEffect(() => {
    fetchAlerts()
    wsService.connectAlerts()

    const unsubscribe = wsService.onAlert((data) => {
      if (data.type === 'alert') {
        setAlerts((prev) => [data.data, ...prev])
      }
    })

    return () => {
      unsubscribe()
    }
  }, [page, filters])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      })
      const response = await api.get(`/alerts/?${params}`)
      setAlerts(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 20))
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/resolve/`)
      fetchAlerts()
      setSelectedAlert(null)
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    }
    return colors[severity] || 'bg-gray-100 text-gray-800'
  }

  const filterConfig = [
    {
      key: 'alert_type',
      label: 'Alert Type',
      type: 'select',
      options: [
        { value: 'port_scan', label: 'Port Scan' },
        { value: 'brute_force', label: 'Brute Force' },
        { value: 'ddos', label: 'DDoS' },
        { value: 'malware', label: 'Malware' },
        { value: 'suspicious_traffic', label: 'Suspicious Traffic' },
      ],
    },
    {
      key: 'severity',
      label: 'Severity',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'open', label: 'Open' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'ignored', label: 'Ignored' },
      ],
    },
  ]

  const headers = ['Timestamp', 'Type', 'Severity', 'Source IP', 'Status', 'Actions']

  const renderRow = (alert) => (
    <tr key={alert.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {format(new Date(alert.timestamp), 'yyyy-MM-dd HH:mm:ss')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.alert_type}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
          {alert.severity}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.src_ip}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            alert.status === 'open'
              ? 'bg-red-100 text-red-800'
              : alert.status === 'resolved'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {alert.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => setSelectedAlert(alert)}
          className="text-primary-600 hover:text-primary-900 mr-4"
        >
          View
        </button>
        {alert.status === 'open' && (
          <button
            onClick={() => handleResolve(alert.id)}
            className="text-green-600 hover:text-green-900"
          >
            Resolve
          </button>
        )}
      </td>
    </tr>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Alerts</h1>

      <FilterBar filters={filterConfig} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <Table headers={headers} data={alerts} renderRow={renderRow} />

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

      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title="Alert Details"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div>
              <strong>Type:</strong> {selectedAlert.alert_type}
            </div>
            <div>
              <strong>Severity:</strong>{' '}
              <span className={getSeverityColor(selectedAlert.severity)}>
                {selectedAlert.severity}
              </span>
            </div>
            <div>
              <strong>Source IP:</strong> {selectedAlert.src_ip}
            </div>
            {selectedAlert.dst_ip && (
              <div>
                <strong>Destination IP:</strong> {selectedAlert.dst_ip}
              </div>
            )}
            <div>
              <strong>Status:</strong> {selectedAlert.status}
            </div>
            <div>
              <strong>Message:</strong>
              <p className="mt-1 text-gray-700">{selectedAlert.message}</p>
            </div>
            <div>
              <strong>Timestamp:</strong>{' '}
              {format(new Date(selectedAlert.timestamp), 'yyyy-MM-dd HH:mm:ss')}
            </div>
            {selectedAlert.metadata && (
              <div>
                <strong>Metadata:</strong>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(selectedAlert.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Alerts



