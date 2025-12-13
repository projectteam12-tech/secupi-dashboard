import api from './api'

export const authService = {
  register: async (username, email, password, passwordConfirm, role = 'observer', adminKey = '') => {
    const payload = {
      username,
      email,
      password,
      password_confirm: passwordConfirm,
      role,
    }
    if (role === 'admin' && adminKey) {
      payload.admin_key = adminKey
    }
    const response = await api.post('/auth/register/', payload)
    const { access, refresh, user } = response.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(user))
    return { access, refresh, user }
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login/', { username, password })
    const { access, refresh, user } = response.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(user))
    return { access, refresh, user }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh_token: refreshToken })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token')
  },
}


