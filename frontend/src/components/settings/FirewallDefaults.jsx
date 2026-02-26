import { useEffect, useState } from 'react'
import api from '../../services/api'
import ToggleSwitch from '../ToggleSwitch'

/**
 * Firewall Default Settings tab.
 * Configure default firewall action, logging, and auto-block behaviour.
 */
const FirewallDefaults = ({ showToast }) => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        default_action: 'allow',
        log_blocked_traffic: true,
        auto_block_suspicious_ip: false,
    })
    const [original, setOriginal] = useState({})

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings/firewall/')
            setFormData(response.data)
            setOriginal(response.data)
        } catch (error) {
            showToast('Failed to load firewall settings', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const response = await api.put('/settings/firewall/', formData)
            setOriginal(response.data)
            showToast('Firewall settings saved successfully')
        } catch (error) {
            showToast('Failed to save firewall settings', 'error')
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Firewall Default Settings</h2>

            <div className="space-y-4">
                {/* Default Action */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Action</label>
                    <select
                        value={formData.default_action}
                        onChange={(e) => setFormData({ ...formData, default_action: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="allow">Allow</option>
                        <option value="deny">Deny</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Default action for traffic not matching any rule</p>
                </div>

                {/* Log Blocked Traffic */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <ToggleSwitch
                        label="Log Blocked Traffic"
                        enabled={formData.log_blocked_traffic}
                        onChange={(val) => setFormData({ ...formData, log_blocked_traffic: val })}
                    />
                    <p className="text-xs text-gray-500 mt-2">Create log entries for all blocked/denied traffic</p>
                </div>

                {/* Auto-block Suspicious IPs */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <ToggleSwitch
                        label="Auto-block Suspicious IPs"
                        enabled={formData.auto_block_suspicious_ip}
                        onChange={(val) => setFormData({ ...formData, auto_block_suspicious_ip: val })}
                    />
                    <p className="text-xs text-gray-500 mt-2">Automatically add firewall rules to block IPs flagged as suspicious</p>
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

export default FirewallDefaults
