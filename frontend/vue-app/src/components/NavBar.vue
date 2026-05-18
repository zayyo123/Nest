<template>
  <header class="app-navbar">
    <router-link class="brand" to="/dashboard">任务管理系统</router-link>

    <nav class="nav-links">
      <router-link to="/dashboard">仪表盘</router-link>
      <router-link to="/projects">项目</router-link>
      <router-link to="/tasks">任务</router-link>
    </nav>

    <div class="nav-actions">
      <span v-if="isLoggedIn" class="nav-user">{{ displayName }}</span>
      <router-link v-if="!isLoggedIn" to="/login">登录</router-link>
      <el-button v-else text @click="logout">退出</el-button>
    </div>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'NavBar',
  setup() {
    const router = useRouter()
    const auth = useAuthStore()

    const isLoggedIn = computed(() => auth.isLoggedIn)
    const displayName = computed(() => auth.displayName)
    const logout = () => {
      auth.logout()
      router.push('/login')
    }

    return { displayName, isLoggedIn, logout }
  },
})
</script>
