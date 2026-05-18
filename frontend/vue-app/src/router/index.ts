import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Dashboard from "@/views/Dashboard.vue";
import Projects from "@/views/Projects.vue";
import Tasks from "@/views/Tasks.vue";
import { useAuthStore } from "@/stores/auth";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/projects", component: Projects, meta: { requiresAuth: true } },
  { path: "/tasks", component: Tasks, meta: { requiresAuth: true } },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  // Protected pages opt in with meta.requiresAuth; public pages stay route-only.
  const needsAuth = to.meta?.requiresAuth;
  const auth = useAuthStore();
  if (needsAuth && !auth.isLoggedIn) return "/login";
});

export default router;
