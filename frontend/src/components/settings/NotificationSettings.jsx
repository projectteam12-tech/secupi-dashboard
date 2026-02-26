import { useEffect, useState } from 'react'
import api from '../../services/api'
import ToggleSwitch from '../ToggleSwitch'

/**
 * Notification Settings tab.
 * Toggle email/SMS alerts, configure admin email and severity filter.
 */
const NotificationSettings = ({ showToast }) => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        email_alerts_enabled: true,
        sms_alerts_enabled: false,
        admin_email: '',
        alert_severity_filter: 'medium',
    })
    const [original, setOriginal] = useState({})

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings/notifications/')
            setFormData(response.data)
            setOriginal(response.data)
        } catch (error) {
            showToast('Failed to load notification settings', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        // Basic validation
        if (formData.email_alerts_enabled && !formData.admin_email) {
            showToast('Admin email is required when email alerts are enabled', 'error')
            return
        }
        try {
            setSaving(true)
            const response = await api.put('/settings/notifications/', formData)
            setOriginal(response.data)
            showToast('Notification settings saved successfully')
        } catch (error) {
            showToast('Failed to save notification settings', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({ ...original })
    }

    if (loading) return <div className="text-center py-8">Loading...</div>

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>

            <div className="space-y-4">
                {/* Email Alerts Toggle */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <ToggleSwitch
                        label="Email Alerts"
                        enabled={formData.email_alerts_enabled}
                        onChange={(val) => setFormData({ ...formData, email_alerts_enabled: val })}
                    />
                    <p className="text-xs text-gray-500 mt-2">Send alert notifications via email</p>
                </div>

                {/* SMS Alerts Toggle */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <ToggleSwitch
                        label="SMS Alerts"
                        enabled={formData.sms_alerts_enabled}
                        onChange={(val) => setFormData({ ...formData, sms_alerts_enabled: val })}
                    />
                    <p className="text-xs text-gray-500 mt-2">Send alert notifications via SMS</p>
                </div>

                {/* Admin Email */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email Address</label>
                    <input
                        type="email"
                        value={formData.admin_email}
                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="admin@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email address that will receive alert notifications</p>
                </div>

                {/* Alert Severity Filter */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Alert Severity</label>
                    <select
                        value={formData.alert_severity_filter}
                        onChange={(e) => setFormData({ ...formData, alert_severity_filter: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Only send notifications for alerts at or above this severity</p>
                </div>
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

export default NotificationSettings
