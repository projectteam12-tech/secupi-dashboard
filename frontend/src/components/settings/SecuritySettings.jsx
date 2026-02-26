import { useEffect, useState } from 'react'
import api from '../../services/api'
import ToggleSwitch from '../ToggleSwitch'

/**
 * Security Settings tab.
 * Configure session timeout, log retention, 2FA, and live monitoring.
 */
const SecuritySettings = ({ showToast }) => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        session_timeout_minutes: 30,
        log_retention_days: 90,
        two_factor_enabled: false,
        live_monitoring_enabled: true,
    })
    const [original, setOriginal] = useState({})

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings/security/')
            setFormData(response.data)
            setOriginal(response.data)
        } catch (error) {
            showToast('Failed to load security settings', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        // Validation
        if (formData.session_timeout_minutes < 1) {
            showToast('Session timeout must be at least 1 minute', 'error')
            return
        }
        if (formData.log_retention_days < 1) {
            showToast('Log retention must be at least 1 day', 'error')
            return
        }
        try {
            setSaving(true)
            const response = await api.put('/settings/security/', formData)
            setOriginal(response.data)
            showToast('Security settings saved successfully')
        } catch (error) {
            showToast('Failed to save security settings', 'error')
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>

            <div className="space-y-4">
                {/* Session Timeout */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Session Timeout</label>
                            <p className="text-xs text-gray-500 mt-1">Duration of inactivity before auto-logout</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                min="1"
                                value={formData.session_timeout_minutes}
                                onChange={(e) => setFormData({ ...formData, session_timeout_minutes: parseInt(e.target.value) || 1 })}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-xs text-gray-500">minutes</span>
                        </div>
                    </div>
                </div>

                {/* Log Retention */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Log Retention Period</label>
                            <p className="text-xs text-gray-500 mt-1">Number of days to keep log data before archival</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                min="1"
                                value={formData.log_retention_days}
                                onChange={(e) => setFormData({ ...formData, log_retention_days: parseInt(e.target.value) || 1 })}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-xs text-gray-500">days</span>
                        </div>
                    </div>
                </div>

                {/* 2FA Toggle */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <ToggleSwitch
                        label="Two-Factor Authentication (2FA)"
                        enabled={formData.two_factor_enabled}
                        onChange={(val) => setFormData({ ...formData, two_factor_enabled: val })}
                    />
                    <p className="text-xs text-gray-500 mt-2">Require 2FA for all user logins</p>
                </div>

                {/* Live Monitoring Toggle */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <ToggleSwitch
                        label="Live Monitoring"
                        enabled={formData.live_monitoring_enabled}
                        onChange={(val) => setFormData({ ...formData, live_monitoring_enabled: val })}
                    />
                    <p className="text-xs text-gray-500 mt-2">Enable or disable real-time traffic monitoring</p>
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

export default SecuritySettings
