<template>
  <div class="common-layout">
    <el-header class="header blur-header">
      <div class="logo">
        <el-icon class="logo-icon"><Monitor /></el-icon>
        <h2 class="gradient-text">游戏交流平台</h2>
      </div>

      <el-menu mode="horizontal" :ellipsis="false" class="nav-menu" :default-active="route.path" router>
        <el-menu-item index="/home">
          <el-icon><House /></el-icon>
          <span>游戏大厅</span>
        </el-menu-item>
        <el-menu-item index="/forum">
          <el-icon><ChatDotRound /></el-icon>
          <span>交流论坛</span>
        </el-menu-item>
      </el-menu>

      <div class="user-profile" v-if="user">
        <el-badge :value="globalUnreadCount" :max="99" :hidden="globalUnreadCount === 0" class="bell-badge" @click="router.push('/dashboard/messages')">
          <el-icon :size="20" class="bell-icon"><Bell /></el-icon>
        </el-badge>

        <span class="greeting">你好，<span class="nickname-highlight">{{ user.nickname }}</span></span>
        <el-tag :type="getRoleTagType(user.role)" effect="light" round class="role-tag">
          {{ getRoleName(user.role) }}
        </el-tag>

        <el-button type="primary" plain round class="nav-btn" @click="router.push('/dashboard')">
          <el-icon><User v-if="user?.role === 0" /><Setting v-else /></el-icon>
          <span style="margin-left: 4px;">{{ user?.role === 0 ? '个人中心' : '前往后台' }}</span>
        </el-button>
        <el-button type="info" plain round class="nav-btn logout-btn" @click="handleLogout">退出</el-button>
      </div>

      <div class="user-profile" v-else>
        <el-button type="primary" round class="shimmer-btn login-btn" @click="router.push('/login')">登录 / 注册</el-button>
      </div>
    </el-header>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// ⭐️ 导入所有需要用到的高级 Icon
import { Bell, Monitor, House, ChatDotRound, User, Setting } from '@element-plus/icons-vue'
import { globalUnreadCount, fetchUnreadCount, initWebSocket, closeWebSocket } from '@/store/messageStore.js'

const router = useRouter()
const route = useRoute()
const user = ref(null)

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    user.value = JSON.parse(storedUser)
    fetchUnreadCount()
    initWebSocket()
  }
})

const handleLogout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  sessionStorage.clear()
  if (typeof closeWebSocket === 'function') closeWebSocket()
  router.push('/login')
}

const getRoleTagType = (role) => {
  if (role === 1) return 'warning'
  if (role === 2) return 'danger'
  return 'info' // 普通玩家改为不那么突兀的 info 灰色
}
const getRoleName = (role) => {
  if (role === 1) return '开发者'
  if (role === 2) return '超级管理员'
  return '普通玩家'
}
</script>

<style scoped>
/* 全局大底色：极其干净的灰蓝纯色 */
.common-layout {
  min-height: 100vh;
  background-color: #f4f7f9;
  display: flex;
  flex-direction: column;
}

/* ⭐️ 核心：磨砂玻璃质感的顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  /* 背景改为半透明白色 */
  background-color: rgba(255, 255, 255, 0.85);
  /* 亚克力高斯模糊魔法 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  /* 移除死板的边框，换成温柔的弥散阴影 */
  border-bottom: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 0 30px;
  height: 64px; /* 稍微加高一点点显得更大气 */
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

/* 左侧 Logo 区 */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
}
.logo-icon {
  font-size: 24px;
  color: #409eff;
}
.gradient-text {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 1px;
  /* 渐变色文字 */
  background: linear-gradient(90deg, #409eff 0%, #7367f0 100%);
  -webkit-background-clip: text;
  color: transparent;
}

/* 居中菜单区 */
.nav-menu {
  flex: 1;
  border-bottom: none;
  background: transparent; /* 确保菜单本身背景透明 */
  display: flex;
  justify-content: flex-start;
  padding-left: 40px;
}
:deep(.el-menu-item) {
  font-size: 15px;
  font-weight: 600;
  color: #606266;
  border-radius: 8px; /* 内部悬浮响应变成圆角 */
  margin: 0 5px;
  height: 50px;
  line-height: 50px;
  margin-top: 7px;
}
:deep(.el-menu-item.is-active) {
  background-color: #f4f6fc;
  color: #409eff !important;
  border-bottom: none !important;
}
:deep(.el-menu-item:hover) {
  background-color: #f4f7f9 !important;
}

/* 右侧用户区 */
.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 250px;
  justify-content: flex-end;
}

.bell-badge {
  margin-right: 10px;
}
.bell-icon {
  cursor: pointer;
  color: #5c6b77;
  margin-top: 5px;
  transition: color 0.3s;
}
.bell-icon:hover { color: #409eff; }

.greeting { font-size: 14px; color: #8a9bb1; }
.nickname-highlight { color: #2c3e50; font-weight: 700; }

.role-tag { font-weight: bold; padding: 0 10px; }

/* 导航栏按钮微调 */
.nav-btn {
  border: none;
  background-color: #f4f6fc;
  font-weight: 600;
  transition: all 0.3s;
}
.nav-btn:hover { background-color: #e4e9f2; transform: translateY(-1px); }
.logout-btn { background-color: transparent; }

.login-btn {
  padding: 0 25px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  border: none;
  transition: all 0.3s;
}
.login-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4); }

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}
.fade-enter-from { opacity: 0; transform: translateY(10px); /* 加入微微的向上浮现感 */ }
.fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>