<template>
  <div class="card" style="max-width:420px;margin:40px auto;">
    <el-card>
      <h2>注册</h2>
      <el-form :model="form" @submit.native.prevent="submit" label-width="80px" class="auth-form">
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" type="email" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">注册</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
  </template>
<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  setup() {
    const router = useRouter()
    const auth = useAuthStore()
    const form = reactive({ name: '', email: '', password: '' })
    const submit = async () => {
      await auth.register(form.name, form.email, form.password)
      router.push('/dashboard')
    }
    return { form, submit }
  }
})
</script>
