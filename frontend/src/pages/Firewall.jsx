import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Table from '../components/Table'
import Modal from '../components/Modal'

const Firewall = () => {
  const { user } = useAuth()
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    src: '',
    dst: '',
    proto: '*',
    port: '*',
    action: 'block',
  })

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const response = await api.get('/firewall/rules/')
      setRules(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching firewall rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await api.post('/firewall/rules/', formData)
      setShowAddModal(false)
      setFormData({
        name: '',
        src: '',
        dst: '',
        proto: '*',
        port: '*',
        action: 'block',
      })
      fetchRules()
    } catch (error) {
      console.error('Error adding firewall rule:', error)
      alert('Error adding firewall rule: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return
    }
    try {
      await api.delete(`/firewall/rules/${id}/`)
      fetchRules()
    } catch (error) {
      console.error('Error deleting firewall rule:', error)
      alert('Error deleting firewall rule: ' + (error.response?.data?.detail || error.message))
    }
  }

  const headers = ['Name', 'Source', 'Destination', 'Protocol', 'Port', 'Action', 'Status', 'Actions']

  const renderRow = (rule) => (
    <tr key={rule.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.src}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.dst}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.proto}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.port}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            rule.action === 'allow'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {rule.action}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {rule.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {(user?.role === 'admin' || user?.is_superuser) && (
          <button
            onClick={() => handleDelete(rule.id)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  )

  if (!user || (user.role !== 'admin' && !user.is_superuser)) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Firewall Rules</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Add Rule
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <Table headers={headers} data={rules} renderRow={renderRow} />
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Firewall Rule">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <input
              type="text"
              required
              value={formData.src}
              onChange={(e) => setFormData({ ...formData, src: e.target.value })}
              placeholder="IP or CIDR (* for all)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input
              type="text"
              required
              value={formData.dst}
              onChange={(e) => setFormData({ ...formData, dst: e.target.value })}
              placeholder="IP or CIDR (* for all)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Protocol</label>
            <select
              value={formData.proto}
              onChange={(e) => setFormData({ ...formData, proto: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="*">All</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
            <input
              type="text"
              required
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              placeholder="Port number or * for all"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="allow">Allow</option>
              <option value="block">Block</option>
              <option value="drop">Drop</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">
              Add Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Firewall

