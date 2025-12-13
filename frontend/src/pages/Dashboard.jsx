import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import api from '../services/api'
import Card from '../components/Card'
import wsService from '../services/websocket'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
  const [trafficData, setTrafficData] = useState({ labels: [], datasets: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
    wsService.connectAlerts()

    const unsubscribe = wsService.onAlert((data) => {
      // Refresh summary when new alert arrives
      fetchSummary()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const fetchSummary = async () => {
    try {
      const response = await api.get('/dashboard/summary/')
      setSummary(response.data)

      // Prepare traffic chart data
      if (response.data.traffic_by_proto) {
        const labels = response.data.traffic_by_proto.map((item) => item.proto)
        const data = response.data.traffic_by_proto.map((item) => item.total_bytes || 0)

        setTrafficData({
          labels,
          datasets: [
            {
              label: 'Traffic (bytes)',
              data,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.1,
            },
          ],
        })
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          title="Active Alerts"
          value={summary?.active_alerts || 0}
          subtitle="Open alerts requiring attention"
          icon="⚠️"
        />
        <Card
          title="Blocked IPs"
          value={summary?.blocked_ips || 0}
          subtitle="Active firewall rules"
          icon="🚫"
        />
        <Card
          title="Traffic Rate"
          value={`${summary?.traffic_rate || 0} B/s`}
          subtitle="Bytes per second"
          icon="📊"
        />
        <Card
          title="Devices Online"
          value={summary?.devices_online || 0}
          subtitle="Active in last 5 minutes"
          icon="🖥️"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Traffic by Protocol</h2>
          {trafficData.labels.length > 0 ? (
            <Line
              data={trafficData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          ) : (
            <p className="text-gray-500">No traffic data available</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Alerts by Type</h2>
          {summary?.alerts_by_type && summary.alerts_by_type.length > 0 ? (
            <div className="space-y-2">
              {summary.alerts_by_type.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.alert_type}</span>
                  <span className="font-semibold text-primary-600">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No alerts data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard



