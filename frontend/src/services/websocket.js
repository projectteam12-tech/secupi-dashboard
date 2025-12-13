const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

class WebSocketService {
  constructor() {
    this.logSocket = null
    this.alertSocket = null
    this.logCallbacks = []
    this.alertCallbacks = []
  }

  connectLogs() {
    if (this.logSocket?.readyState === WebSocket.OPEN) {
      return
    }

    this.logSocket = new WebSocket(`${WS_URL}/ws/logs/`)

    this.logSocket.onopen = () => {
      console.log('Logs WebSocket connected')
    }

    this.logSocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.logCallbacks.forEach((callback) => callback(data))
    }

    this.logSocket.onerror = (error) => {
      console.error('Logs WebSocket error:', error)
    }

    this.logSocket.onclose = () => {
      console.log('Logs WebSocket disconnected')
      // Reconnect after 3 seconds
      setTimeout(() => this.connectLogs(), 3000)
    }
  }

  connectAlerts() {
    if (this.alertSocket?.readyState === WebSocket.OPEN) {
      return
    }

    this.alertSocket = new WebSocket(`${WS_URL}/ws/alerts/`)

    this.alertSocket.onopen = () => {
      console.log('Alerts WebSocket connected')
    }

    this.alertSocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.alertCallbacks.forEach((callback) => callback(data))
    }

    this.alertSocket.onerror = (error) => {
      console.error('Alerts WebSocket error:', error)
    }

    this.alertSocket.onclose = () => {
      console.log('Alerts WebSocket disconnected')
      // Reconnect after 3 seconds
      setTimeout(() => this.connectAlerts(), 3000)
    }
  }

  onLog(callback) {
    this.logCallbacks.push(callback)
    return () => {
      this.logCallbacks = this.logCallbacks.filter((cb) => cb !== callback)
    }
  }

  onAlert(callback) {
    this.alertCallbacks.push(callback)
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter((cb) => cb !== callback)
    }
  }

  disconnect() {
    if (this.logSocket) {
      this.logSocket.close()
      this.logSocket = null
    }
    if (this.alertSocket) {
      this.alertSocket.close()
      this.alertSocket = null
    }
    this.logCallbacks = []
    this.alertCallbacks = []
  }
}

export default new WebSocketService()



