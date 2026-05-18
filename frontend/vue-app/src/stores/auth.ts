import { defineStore } from 'pinia'
import api from '@/api'

export interface User {
  id: number
  name: string
  email: string
}

interface AuthPayload {
  // 后端登录/注册成功时返回的 JWT，前端会持久化并放入后续请求头。
  accessToken?: string
  // 后端同时返回基础用户信息，供导航栏显示账号名称。
  user?: User
}

const readStoredUser = (): User | null => {
  // SSR 或测试环境可能没有 localStorage，因此访问前先判断。
  if (typeof localStorage === 'undefined') return null

  const raw = localStorage.getItem('user')
  if (!raw) return null

  try {
    // 从本地缓存恢复用户信息，避免刷新页面后导航栏状态丢失。
    return JSON.parse(raw) as User
  } catch {
    // 如果缓存被手动改坏，清理后返回 null，避免应用启动时报错。
    localStorage.removeItem('user')
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 页面刷新时从 localStorage 恢复 user/token，让用户不必重新登录。
    user: readStoredUser(),
    token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') || '' : '',
  }),
  getters: {
    // 只要有 token 就认为处于登录态；token 是否有效由后端和响应拦截器兜底。
    isLoggedIn: (state) => Boolean(state.token),
    // 导航栏优先显示名称，没有名称时退回显示邮箱。
    displayName: (state) => state.user?.name || state.user?.email || '账号',
  },
  actions: {
    async login(email: string, password: string) {
      // 登录接口返回 AuthPayload；保存逻辑集中放在 persistSession，避免重复代码。
      const res = await api.post<AuthPayload>('/auth/login', { email, password })
      this.persistSession(res.data)
    },
    async register(name: string, email: string, password: string) {
      // 注册成功后同样保存会话，因此用户注册完可以直接进入系统。
      const res = await api.post<AuthPayload>('/auth/register', { name, email, password })
      this.persistSession(res.data)
    },
    persistSession(payload: AuthPayload) {
      // 兼容后端异常或字段缺失的情况：没有 token 时保存空字符串，没有 user 时保存 null。
      const token = payload.accessToken || ''
      const user = payload.user || null

      // Pinia 中的值用于当前页面响应式更新。
      this.token = token
      this.user = user

      if (typeof localStorage !== 'undefined') {
        // localStorage 中的值用于刷新页面后的恢复，以及 api.ts 请求拦截器读取 token。
        localStorage.setItem('token', token)
        if (user) localStorage.setItem('user', JSON.stringify(user))
        else localStorage.removeItem('user')
      }
    },
    logout() {
      // 退出登录必须同时清理内存状态和本地缓存，否则刷新后可能又恢复成登录态。
      this.token = ''
      this.user = null

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },
  },
})
