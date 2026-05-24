import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  ElAlert,
  ElButton,
  ElColorPicker,
  ElContainer,
  ElDatePicker,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElHeader,
  ElInput,
  ElLoading,
  ElMain,
  ElOption,
  ElPagination,
  ElProgress,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles.css'

// 学习注释：main.ts 是前端应用入口。
// 浏览器加载 index.html 后，会通过 <script type="module" src="/src/main.ts"> 执行这里。
const app = createApp(App)

// 学习注释：Element Plus 组件可以按需注册。
// 这里把项目中会用到的组件放进数组，再统一 app.use，避免一行行重复写注册代码。
const components = [
  ElAlert,
  ElButton,
  ElColorPicker,
  ElContainer,
  ElDatePicker,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElHeader,
  ElInput,
  ElMain,
  ElOption,
  ElPagination,
  ElProgress,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
]

// 学习注释：Pinia 是 Vue 官方推荐的状态管理库，用来保存登录状态等跨页面数据。
app.use(createPinia())
// 学习注释：注册 Vue Router 后，模板里的 <router-link> 和 <router-view> 才能工作。
app.use(router)
// 学习注释：把常用 Element Plus 组件注册为全局组件，页面中可直接写 <el-button>。
components.forEach((component) => app.use(component))
// 学习注释：ElLoading 是指令/服务型插件，注册后可以使用 v-loading。
app.use(ElLoading)
// 学习注释：把 Vue 应用挂载到 index.html 的 <div id="app"></div>。
app.mount('#app')
