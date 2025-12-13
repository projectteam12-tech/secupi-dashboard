import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Settings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('thresholds')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'thresholds'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Thresholds
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'export'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Export
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <p className="text-gray-600">
                User management features coming soon. Currently logged in as: <strong>{user?.username}</strong> ({user?.role})
              </p>
            </div>
          )}

          {activeTab === 'thresholds' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Alert Thresholds</h2>
              <p className="text-gray-600">
                Configure alert thresholds and detection rules here. (Coming soon)
              </p>
            </div>
          )}

          {activeTab === 'export' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Data Export</h2>
              <p className="text-gray-600">
                Export logs, alerts, and reports. (Coming soon)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings



