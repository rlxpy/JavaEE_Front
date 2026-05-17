<template>
  <div class="common-layout">
    <el-container class="dashboard-container">

      <el-aside :width="isCollapse ? '64px' : '240px'" class="aside-menu">
        <div class="logo-box">
          <el-icon class="logo-icon"><Platform /></el-icon>
          <h3 v-show="!isCollapse" class="gradient-text">平台管理中心</h3>
        </div>

        <el-menu
            :collapse="isCollapse"
            :collapse-transition="false"
            router
            default-active="/dashboard/profile"
            class="el-menu-vertical custom-menu"
        >
          <el-menu-item index="/dashboard/profile">
            <el-icon><User /></el-icon>
            <template #title><span>个人中心</span></template>
          </el-menu-item>

          <el-menu-item index="/dashboard/messages">
            <el-icon><Bell /></el-icon>
            <template #title>
              <div class="custom-menu-title">
                <span>消息中心</span>
                <el-badge v-if="globalUnreadCount > 0" :value="globalUnreadCount" type="danger" />
              </div>
            </template>
          </el-menu-item>

          <el-menu-item index="/dashboard/favorites">
            <el-icon><Star /></el-icon>
            <template #title><span>我的收藏</span></template>
          </el-menu-item>

          <el-menu-item index="/dashboard/my-posts">
            <el-icon><Document /></el-icon>
            <template #title><span>我的发帖</span></template>
          </el-menu-item>

          <el-sub-menu index="dev" v-if="user.role === 1">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>开发者中心</span>
            </template>
            <el-menu-item index="/dashboard/publish">发布新游戏</el-menu-item>
            <el-menu-item index="/dashboard/my-games">我的游戏库</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="admin" v-if="user.role === 2">
            <template #title>
              <el-icon><Key /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/dashboard/overview">平台数据总览</el-menu-item>
            <el-menu-item index="/dashboard/users">用户管理</el-menu-item>
            <el-menu-item index="/dashboard/audit">上架审核</el-menu-item>
            <el-menu-item index="/dashboard/admin-games">游戏管理</el-menu-item>
            <el-menu-item index="/dashboard/admin-forum">内容治理</el-menu-item>

            <el-menu-item index="/dashboard/admin-report">举报处理中心</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-container class="right-container">
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="toggleCollapse">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
            <span class="breadcrumb">欢迎回来，<span class="nickname-highlight">{{ user.nickname }}</span></span>
          </div>

          <div class="header-right">
            <el-badge :value="globalUnreadCount" :max="99" :hidden="globalUnreadCount === 0" @click="router.push('/dashboard/messages')">
              <el-icon class="bell-icon"><Bell /></el-icon>
            </el-badge>

            <el-button type="primary" round plain class="nav-btn" @click="router.push('/home')">返回游戏大厅</el-button>
            <el-button type="info" round plain class="nav-btn logout-btn" @click="handleLogout">退出</el-button>
          </div>
        </el-header>

        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>

        <el-footer class="footer">
          © 2026 游戏交流与开发平台 - 课堂项目演示
        </el-footer>
      </el-container>

    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// ⭐️ 引入所有需要用的高级 SVG 图标
import { Bell, Platform, User, Star, Document, Setting, Key, Warning, Fold, Expand } from '@element-plus/icons-vue'
import { globalUnreadCount, fetchUnreadCount, initWebSocket, closeWebSocket } from '@/store/messageStore.js'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user')) || {}
const isCollapse = ref(false)

onMounted(() => {
  fetchUnreadCount()
  initWebSocket()
})

const handleLogout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  sessionStorage.clear()
  if (typeof closeWebSocket === 'function') closeWebSocket()
  router.push('/login')
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  background-color: #f4f7f9; /* 统一的极浅灰蓝大底色 */
}

/* ================= 侧边栏样式 ================= */
.aside-menu {
  background-color: #ffffff;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow-x: hidden;
  /* 极其温柔的右侧弥散阴影，代替边框 */
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.03);
  z-index: 10;
}
.logo-box {
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f2f5;
}
.logo-icon {
  font-size: 24px;
  color: #409eff;
}
.gradient-text {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  white-space: nowrap;
  background: linear-gradient(90deg, #409eff 0%, #7367f0 100%);
  -webkit-background-clip: text;
  color: transparent;
}

/* ================= 菜单项重构 ================= */
.custom-menu {
  border-right: none;
  padding: 10px 0;
}
:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  margin: 4px 12px;
  border-radius: 8px;
  color: #5c6b77;
  font-weight: 500;
  transition: all 0.3s;
}
:deep(.el-menu-item:hover), :deep(.el-sub-menu__title:hover) {
  background-color: #f4f6fc;
  color: #409eff;
}
:deep(.el-menu-item.is-active) {
  background-color: #f4f6fc;
  color: #409eff;
  font-weight: bold;
}
:deep(.el-menu-item .el-icon), :deep(.el-sub-menu__title .el-icon) {
  font-size: 18px;
  margin-right: 12px;
}

/* ⭐️ 修复：当侧边栏收起时，去除图标的右边距，使其完美居中 */
.el-menu--collapse :deep(.el-menu-item .el-icon),
.el-menu--collapse :deep(.el-sub-menu__title .el-icon) {
  margin: 0;
}
/* ⭐️ 修复：收起时，背景色块稍微变窄居中，显得更精致 */
.el-menu--collapse :deep(.el-menu-item),
.el-menu--collapse :deep(.el-sub-menu__title) {
  padding: 0 !important;
  justify-content: center;
  margin: 4px 8px;
}

.custom-menu-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* ================= 右侧与顶部栏样式 ================= */
.right-container {
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  height: 64px;
  padding: 0 30px 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  z-index: 5;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.collapse-btn {
  font-size: 22px;
  color: #5c6b77;
  cursor: pointer;
  transition: color 0.3s;
}
.collapse-btn:hover { color: #409eff; }

.breadcrumb { color: #8a9bb1; font-size: 14px; }
.nickname-highlight { color: #2c3e50; font-weight: 700; }

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.bell-icon {
  font-size: 22px;
  color: #5c6b77;
  cursor: pointer;
  margin-top: 5px;
  transition: color 0.3s;
}
.bell-icon:hover { color: #409eff; }

.nav-btn {
  border: none;
  background-color: #f4f6fc;
  font-weight: 600;
  transition: all 0.3s;
}
.nav-btn:hover { background-color: #e4e9f2; transform: translateY(-1px); }
.logout-btn { background-color: transparent; }

/* ================= 主内容与动画 ================= */
.main-content {
  background-color: transparent; /* 继承全局大底色 */
  padding: 24px;
  overflow-x: hidden;
}

.footer {
  height: 40px !important;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #a0aec0;
  font-size: 13px;
  background-color: transparent;
}

/* 内容区切换时的平滑微动效 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(15px); /* 从右边微微滑入 */
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-15px); /* 向左边微微滑出 */
}
</style>