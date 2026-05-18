import { defineStore } from 'pinia'
import api from '@/api'

interface User {
  id?: number
  name?: string
  email?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: (typeof localStorage !== 'undefined') ? (localStorage.getItem('token') || '') : '',
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(email: string, password: string) {
      const res = await api.post('/auth/login', { email, password })
      const token = res.data?.accessToken || ''
      this.token = token
      if (typeof localStorage !== 'undefined') localStorage.setItem('token', token)
    },
    async register(name: string, email: string, password: string) {
      const res = await api.post('/auth/register', { name, email, password })
      const token = res.data?.accessToken || ''
      this.token = token
      if (typeof localStorage !== 'undefined') localStorage.setItem('token', token)
    },
    logout() {
      this.token = ''
      if (typeof localStorage !== 'undefined') localStorage.removeItem('token')
    }
  }
})
