import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 学习注释：这里使用动态 import，访问某个路由时才加载对应页面文件。
// 这种写法叫路由级代码分割，可以减小首屏加载体积。
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Projects = () => import('@/views/Projects.vue')
const ProjectDetail = () => import('@/views/ProjectDetail.vue')
const Tasks = () => import('@/views/Tasks.vue')

// 学习注释：routes 是“URL 路径 -> 页面组件”的映射表。
// meta 是自定义元信息，下面的路由守卫会用 requiresAuth / guestOnly 判断能不能进入。
const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: Login, meta: { guestOnly: true } },
  { path: '/register', component: Register, meta: { guestOnly: true } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/projects', component: Projects, meta: { requiresAuth: true } },
  { path: '/projects/:id', component: ProjectDetail, meta: { requiresAuth: true } },
  { path: '/tasks', component: Tasks, meta: { requiresAuth: true } },
]

// 学习注释：createWebHistory 使用浏览器 History API，URL 看起来像 /dashboard。
// 生产环境需要 Nginx 的 try_files 回退到 index.html，否则刷新深层路由会 404。
const router = createRouter({ history: createWebHistory(), routes })

// 学习注释：全局前置守卫。
// 每次路由跳转前都会运行，用来做登录校验、权限判断、重定向等。
router.beforeEach((to) => {
  const auth = useAuthStore()

  // 需要登录的页面，如果没有 token，就跳到登录页，并记录原目标地址。
  if (to.meta?.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 登录/注册页只给游客看；已经登录的用户再访问就送回仪表盘。
  if (to.meta?.guestOnly && auth.isLoggedIn) {
    return '/dashboard'
  }
})

export default router
