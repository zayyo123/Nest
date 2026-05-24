<template>
  <!-- 学习注释：NavBar 是全局导航栏，放在 App.vue 中，因此每个页面都会显示。 -->
  <header class="app-navbar">
    <!-- router-link 会生成 <a> 标签，但点击时由 Vue Router 接管，不会整页刷新。 -->
    <router-link class="brand" to="/dashboard">任务管理系统</router-link>

    <nav class="nav-links">
      <router-link to="/dashboard">仪表盘</router-link>
      <router-link to="/projects">项目</router-link>
      <router-link to="/tasks">任务</router-link>
    </nav>

    <div class="nav-actions">
      <!-- v-if / v-else 根据登录状态切换展示内容。 -->
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

    // 学习注释：computed 会根据依赖自动更新。
    // auth.isLoggedIn 或 auth.displayName 改变时，导航栏也会自动重新渲染。
    const isLoggedIn = computed(() => auth.isLoggedIn)
    const displayName = computed(() => auth.displayName)
    const logout = () => {
      // 先清理 Pinia/localStorage，再跳转到登录页。
      auth.logout()
      router.push('/login')
    }

    return { displayName, isLoggedIn, logout }
  },
})
</script>
