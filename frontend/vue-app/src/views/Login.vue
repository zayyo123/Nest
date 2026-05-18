<template>
  <div class="auth-page">
    <section class="auth-card">
      <div class="auth-header">
        <h1>欢迎回来</h1>
        <p>登录后继续管理项目与任务。</p>
      </div>

      <el-form :model="form" class="auth-form" @submit.prevent="submit">
        <el-form-item>
          <el-input
            v-model="form.email"
            type="email"
            autocomplete="username"
            placeholder="邮箱"
          />
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
        <el-button type="primary" native-type="submit" :loading="loading"
          >登录</el-button
        >
      </el-form>

      <p class="auth-switch">
        还没有账号？<router-link to="/register">创建账号</router-link>
      </p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";

export default defineComponent({
  name: "Login",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const loading = ref(false);
    const form = reactive({ email: "", password: "" });

    const submit = async () => {
      if (!form.email || !form.password) {
        ElMessage.warning("请输入邮箱和密码");
        return;
      }

      loading.value = true;
      try {
        await auth.login(form.email, form.password);
        ElMessage.success("登录成功");
        router.push("/dashboard");
      } catch {
        ElMessage.error("登录失败，请检查后端服务");
      } finally {
        loading.value = false;
      }
    };

    return { form, loading, submit };
  },
});
</script>
