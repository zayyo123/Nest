<template>
  <div class="auth-page">
    <section class="auth-card">
      <div class="auth-header">
        <h1>创建账号</h1>
        <p>创建属于你的项目和任务工作区。</p>
      </div>

      <el-form :model="form" class="auth-form" @submit.prevent="submit">
        <el-form-item>
          <el-input v-model="form.name" autocomplete="name" placeholder="姓名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.email" type="email" autocomplete="username" placeholder="邮箱" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            placeholder="密码"
            show-password
          />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">注册</el-button>
      </el-form>

      <p class="auth-switch">
        已经有账号？
        <router-link to="/login">去登录</router-link>
      </p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getApiErrorMessage } from '@/api'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'Register',
  setup() {
    const router = useRouter()
    const auth = useAuthStore()
    const loading = ref(false)
    // 注册表单使用 reactive，模板中的 v-model 会直接同步这里的字段。
    const form = reactive({ name: '', email: '', password: '' })

    const submit = async () => {
      // 前端只做轻量必填校验；邮箱格式、密码长度、邮箱重复等由后端负责兜底。
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        ElMessage.warning('请完整填写表单')
        return
      }

      loading.value = true
      try {
        // 注册成功后后端直接返回 token，因此这里和登录一样会进入已登录状态。
        await auth.register(form.name.trim(), form.email.trim(), form.password)
        ElMessage.success('账号创建成功')
        router.push('/dashboard')
      } catch (err) {
        // 邮箱重复等业务错误会从后端返回，getApiErrorMessage 会提取 message 展示。
        ElMessage.error(getApiErrorMessage(err, '注册失败'))
      } finally {
        loading.value = false
      }
    }

    return { form, loading, submit }
  },
})
</script>
