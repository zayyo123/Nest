<template>
  <div class="auth-page">
    <section class="auth-card">
      <div class="auth-header">
        <h1>欢迎回来</h1>
        <p>登录后管理你的项目和任务。</p>
      </div>

      <!-- 学习注释：v-if 为 true 时才渲染提示条；sessionExpired 来自路由 query。 -->
      <el-alert
        v-if="sessionExpired"
        title="登录状态已过期，请重新登录。"
        type="warning"
        show-icon
        :closable="false"
      />

      <!-- 学习注释：@submit.prevent 会阻止浏览器默认提交刷新页面，改由 submit 函数处理。 -->
      <el-form :model="form" class="auth-form" @submit.prevent="submit">
        <el-form-item>
          <!-- v-model 是双向绑定：输入框变化会更新 form.email，form.email 变化也会更新输入框。 -->
          <el-input v-model="form.email" type="email" autocomplete="username" placeholder="邮箱" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="密码"
            show-password
          />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">登录</el-button>
      </el-form>

      <p class="auth-switch">
        还没有账号？
        <router-link to="/register">立即注册</router-link>
      </p>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getApiErrorMessage } from '@/api'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'Login',
  setup() {
    // 学习注释：setup 是 Composition API 的入口。
    // 这里声明的数据和函数 return 出去后，template 才能访问。
    // route 用来读取 query 参数，例如 redirect 和 expired；
    // router 用来在登录成功后主动跳转到目标页面。
    const route = useRoute()
    const router = useRouter()
    const auth = useAuthStore()
    const loading = ref(false)
    // 学习项目预填 demo 账号，方便第一次运行项目时直接体验登录流程。
    const form = reactive({ email: 'demo@example.com', password: 'password123' })
    // api.ts 在收到 401 时会跳转到 /login?expired=1，这里据此显示会话过期提示。
    const sessionExpired = computed(() => route.query.expired === '1')

    const submit = async () => {
      // 登录前做最基本的空值校验；邮箱格式和密码长度仍由后端 DTO 再校验一次。
      if (!form.email.trim() || !form.password) {
        ElMessage.warning('请输入邮箱和密码')
        return
      }

      loading.value = true
      try {
        // auth.login 会调用后端 /auth/login，并把 token/user 保存到 Pinia 和 localStorage。
        await auth.login(form.email.trim(), form.password)
        ElMessage.success('登录成功')
        // 如果用户原本想访问受保护页面，登录后回到 redirect；否则进入 dashboard。
        router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard')
      } catch (err) {
        // 优先展示后端返回的错误信息，例如账号密码错误；没有后端信息时使用兜底文案。
        ElMessage.error(getApiErrorMessage(err, '登录失败'))
      } finally {
        // 无论请求成功或失败，都要关闭 loading，避免按钮一直处于提交状态。
        loading.value = false
      }
    }

    return { form, loading, sessionExpired, submit }
  },
})
</script>
