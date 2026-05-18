import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('token') : ''
  if (token && config) {
    if (!config.headers) config.headers = {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
  }
  return config
}, (err) => Promise.reject(err))

export default api
