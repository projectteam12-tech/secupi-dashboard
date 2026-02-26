import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import api from '../../services/api'
import Modal from '../Modal'

/**
 * User Management tab — Admin-only section for full user CRUD.
 * Features: add/edit/delete users, toggle enable/disable, change password, role selection.
 */
const UserManagement = ({ showToast }) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'observer',
        is_active: true,
    })
    const [newPassword, setNewPassword] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings/users/')
            setUsers(response.data.results || response.data)
        } catch (error) {
            console.error('Error fetching users:', error)
            showToast('Failed to load users', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        try {
            await api.post('/settings/users/', formData)
            setShowAddModal(false)
            setFormData({ username: '', email: '', password: '', role: 'observer', is_active: true })
            fetchUsers()
            showToast('User created successfully')
        } catch (error) {
            showToast(error.response?.data?.detail || 'Failed to create user', 'error')
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault()
        try {
            await api.patch(`/settings/users/${selectedUser.id}/`, {
                username: formData.username,
                email: formData.email,
                role: formData.role,
                is_active: formData.is_active,
            })
            setShowEditModal(false)
            fetchUsers()
            showToast('User updated successfully')
        } catch (error) {
            showToast(error.response?.data?.detail || 'Failed to update user', 'error')
        }
    }

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return
        try {
            await api.delete(`/settings/users/${userId}/`)
            fetchUsers()
            showToast('User deleted successfully')
        } catch (error) {
            showToast('Failed to delete user', 'error')
        }
    }

    const handleToggleActive = async (userId) => {
        try {
            const response = await api.patch(`/settings/users/${userId}/toggle-active/`)
            fetchUsers()
            showToast(response.data.message)
        } catch (error) {
            showToast('Failed to toggle user status', 'error')
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        try {
            await api.patch(`/settings/users/${selectedUser.id}/change-password/`, {
                new_password: newPassword,
            })
            setShowPasswordModal(false)
            setNewPassword('')
            showToast('Password changed successfully')
        } catch (error) {
            showToast(error.response?.data?.new_password?.[0] || 'Failed to change password', 'error')
        }
    }

    const openEditModal = (user) => {
        setSelectedUser(user)
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role,
            is_active: user.is_active,
        })
        setShowEditModal(true)
    }

    const openPasswordModal = (user) => {
        setSelectedUser(user)
        setNewPassword('')
        setShowPasswordModal(true)
    }

    if (loading) return <div className="text-center py-8">Loading users...</div>

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <button
                    onClick={() => {
                        setFormData({ username: '', email: '', password: '', role: 'observer', is_active: true })
                        setShowAddModal(true)
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                >
                    + Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Username', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {u.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {u.last_login ? format(new Date(u.last_login), 'yyyy-MM-dd HH:mm') : 'Never'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => openEditModal(u)} className="text-primary-600 hover:text-primary-900">
                                        Edit
                                    </button>
                                    <button onClick={() => openPasswordModal(u)} className="text-yellow-600 hover:text-yellow-900">
                                        Password
                                    </button>
                                    <button onClick={() => handleToggleActive(u.id)} className="text-blue-600 hover:text-blue-900">
                                        {u.is_active ? 'Disable' : 'Enable'}
                                    </button>
                                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <div className="p-8 text-center text-gray-500">No users found</div>}
            </div>

            {/* Add User Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="admin">Admin</option>
                            <option value="observer">Observer</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 rounded-md text-sm">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">
                            Create User
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
                <form onSubmit={handleEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="admin">Admin</option>
                            <option value="observer">Observer</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 rounded-md text-sm">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Change Password Modal */}
            <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title={`Change Password — ${selectedUser?.username}`}>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Minimum 8 characters"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-gray-200 rounded-md text-sm">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600">
                            Change Password
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default UserManagement
