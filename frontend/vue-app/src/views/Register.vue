<template>
  <div class="auth-page">
    <section class="auth-card">
      <div class="auth-header">
        <h1>创建账号</h1>
        <p>注册后即可进入项目管理工作台。</p>
      </div>

      <el-form :model="form" class="auth-form" @submit.prevent="submit">
        <el-form-item>
          <el-input v-model="form.name" autocomplete="name" placeholder="姓名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.email" type="email" autocomplete="username" placeholder="邮箱" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" autocomplete="new-password" placeholder="密码" show-password />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">注册</el-button>
      </el-form>

      <p class="auth-switch">已有账号？<router-link to="/login">去登录</router-link></p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'Register',
  setup() {
    const router = useRouter()
    const auth = useAuthStore()
    const loading = ref(false)
    const form = reactive({ name: '', email: '', password: '' })

    const submit = async () => {
      if (!form.name || !form.email || !form.password) {
        ElMessage.warning('请完整填写注册信息')
        return
      }

      loading.value = true
      try {
        await auth.register(form.name, form.email, form.password)
        ElMessage.success('注册成功')
        router.push('/dashboard')
      } catch {
        ElMessage.error('注册失败，请检查后端服务')
      } finally {
        loading.value = false
      }
    }

    return { form, loading, submit }
  },
})
</script>
