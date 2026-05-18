import axios from 'axios'

// 统一创建 Axios 实例，所有业务请求都从这里发出。
// baseURL 设置为 /api，开发环境由 Vite 代理到 Nest，生产容器中由 Nginx 代理到 Nest。
const api = axios.create({ baseURL: '/api' })

export const getApiErrorMessage = (error: unknown, fallback = '请求失败') => {
  // 后端 ValidationPipe 可能返回 message 数组，也可能返回普通字符串。
  // 这里统一整理成适合 Element Plus message 组件展示的文本。
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }

  return fallback
}

api.interceptors.request.use((config) => {
  // 每次请求前从 localStorage 读取 token，而不是只从 Pinia 读。
  // 这样即使页面刷新后 store 还没完全使用，API 仍然能带上已保存的登录凭证。
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : ''

  if (token) {
    config.headers = config.headers || {}
    // 后端 JwtAuthGuard 只识别 Authorization: Bearer <token> 这种标准格式。
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一处理登录过期或 token 无效。
    // 只要后端返回 401，就清除本地登录状态，并跳转到登录页提示重新登录。
    if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // 避免已经在登录页时重复跳转；expired=1 用于登录页显示会话过期提示。
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?expired=1')
      }
    }

    return Promise.reject(error)
  },
)

export default api
