import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 引入 Element Plus 及其全局 CSS 样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 告诉 Vue 使用路由和 UI 组件库
app.use(router)
app.use(ElementPlus)

// 挂载到 index.html 里的 #app 节点上
app.mount('#app')
