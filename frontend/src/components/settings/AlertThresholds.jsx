import { useEffect, useState } from 'react'
import api from '../../services/api'

/**
 * Alert Thresholds settings tab.
 * Allows admins to configure detection thresholds for the monitoring system.
 */
const AlertThresholds = ({ showToast }) => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        suspicious_traffic_threshold: 100,
        port_scan_limit: 20,
        failed_login_limit: 5,
        packet_size_threshold: 10000,
        monitoring_window_minutes: 5,
    })
    const [original, setOriginal] = useState({})

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings/alerts/')
            setFormData(response.data)
            setOriginal(response.data)
        } catch (error) {
            showToast('Failed to load alert thresholds', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const response = await api.put('/settings/alerts/', formData)
            setOriginal(response.data)
            showToast('Alert thresholds saved successfully')
        } catch (error) {
            showToast('Failed to save alert thresholds', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({ ...original })
    }

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: parseInt(value) || 0 }))
    }

    if (loading) return <div className="text-center py-8">Loading...</div>

    const fields = [
        { key: 'suspicious_traffic_threshold', label: 'Suspicious Traffic Threshold', unit: 'requests/min', desc: 'Maximum requests per minute before flagging as suspicious' },
        { key: 'port_scan_limit', label: 'Port Scan Detection Limit', unit: 'scans', desc: 'Number of port scans to trigger an alert' },
        { key: 'failed_login_limit', label: 'Failed Login Attempt Limit', unit: 'attempts', desc: 'Failed login attempts before lockout/alert' },
        { key: 'packet_size_threshold', label: 'Packet Size Threshold', unit: 'bytes', desc: 'Packet size threshold for anomaly detection' },
        { key: 'monitoring_window_minutes', label: 'Monitoring Time Window', unit: 'minutes', desc: 'Time window for evaluating thresholds' },
    ]

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Alert Threshold Settings</h2>

            <div className="space-y-4">
                {fields.map((field) => (
                    <div key={field.key} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                                <p className="text-xs text-gray-500 mt-1">{field.desc}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                                <input
                                    type="number"
                                    min="1"
                                    value={formData[field.key]}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-xs text-gray-500 w-20">{field.unit}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300">
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}

export default AlertThresholds
