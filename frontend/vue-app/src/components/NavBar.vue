<template>
  <el-menu mode="horizontal" class="navbar" :default-active="'dashboard'">
    <el-menu-item index="/dashboard"><router-link to="/dashboard">仪表盘</router-link></el-menu-item>
    <el-menu-item index="/projects"><router-link to="/projects">项目</router-link></el-menu-item>
    <el-menu-item index="/tasks"><router-link to="/tasks">任务</router-link></el-menu-item>
    <div class="spacer" style="flex:1"></div>
    <el-menu-item v-if="!isLoggedIn" index="/login"><router-link to="/login">登录</router-link></el-menu-item>
    <el-menu-item v-else @click="logout">退出</el-menu-item>
  </el-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  setup() {
    const router = useRouter()
    const auth = useAuthStore()
    const go = (path: string) => router.push(path)
    const logout = () => { auth.logout(); router.push('/login') }
    return { isLoggedIn: auth.isLoggedIn, go, logout }
  }
})
</script>
