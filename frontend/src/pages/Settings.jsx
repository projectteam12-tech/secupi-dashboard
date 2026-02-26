import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Toast from '../components/Toast'
import UserManagement from '../components/settings/UserManagement'
import AlertThresholds from '../components/settings/AlertThresholds'
import NotificationSettings from '../components/settings/NotificationSettings'


/**
 * Settings page with 3 tabbed sections.
 * Admin-only sections are gated by role check.
 */
const Settings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const isAdmin = user?.role === 'admin' || user?.is_superuser

  // Shared toast handler passed to all sub-components
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const clearToast = useCallback(() => {
    setToast({ message: '', type: 'success' })
  }, [])

  // Tab definitions with admin-only flag
  const tabs = [
    { key: 'users', label: 'Users', adminOnly: true },
    { key: 'thresholds', label: 'Thresholds', adminOnly: true },
    { key: 'notifications', label: 'Notifications', adminOnly: true },

  ]

  // Filter tabs: non-admins only see non-admin tabs
  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin)

  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return isAdmin ? (
          <UserManagement showToast={showToast} />
        ) : (
          <AccessDenied />
        )
      case 'thresholds':
        return isAdmin ? (
          <AlertThresholds showToast={showToast} />
        ) : (
          <AccessDenied />
        )
      case 'notifications':
        return isAdmin ? (
          <NotificationSettings showToast={showToast} />
        ) : (
          <AccessDenied />
        )

      default:
        return null
    }
  }

  return (
    <div>
      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow-md">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  )
}

/**
 * Small component shown when a non-admin tries to access restricted sections.
 */
const AccessDenied = () => (
  <div className="text-center py-12">
    <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
    <p className="text-lg font-medium text-gray-700">Access Denied</p>
    <p className="text-sm text-gray-500 mt-1">Admin privileges are required to access this section.</p>
  </div>
)

export default Settings
