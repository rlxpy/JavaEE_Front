<template>
  <div class="common-layout">
    <el-header class="header">
      <div class="logo">
        <h2>🎮 游戏交流平台</h2>
      </div>

      <el-menu mode="horizontal" :ellipsis="false" class="nav-menu" :default-active="route.path" router>
        <el-menu-item index="/home">游戏大厅</el-menu-item>
        <el-menu-item index="/forum">💬 交流论坛</el-menu-item>
      </el-menu>

      <div class="user-profile" v-if="user">
        <span class="greeting">你好，{{ user.nickname }}</span>
        <el-tag :type="getRoleTagType(user.role)" size="small" class="role-tag">
          {{ getRoleName(user.role) }}
        </el-tag>
        <el-button type="primary" plain size="small" @click="router.push('/dashboard')">
          {{ user?.role === 0 ? '👤 个人中心' : '⚙️ 前往后台' }}
        </el-button>
        <el-button type="danger" plain size="small" @click="handleLogout">退出登录</el-button>
      </div>
      <div class="user-profile" v-else>
        <el-button type="primary" @click="router.push('/login')">登录 / 注册</el-button>
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

const router = useRouter()
const route = useRoute()
const user = ref(null)

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) user.value = JSON.parse(storedUser)
})

const handleLogout = () => {
  sessionStorage.clear()
  localStorage.removeItem('user')
  router.push('/login')
}

const getRoleTagType = (role) => {
  if (role === 1) return 'warning'
  if (role === 2) return 'danger'
  return 'success'
}
const getRoleName = (role) => {
  if (role === 1) return '开发者'
  if (role === 2) return '超级管理员'
  return '普通玩家'
}
</script>

<style scoped>
.common-layout {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.logo h2 { margin: 0; color: #409eff; min-width: 200px; }
.nav-menu { flex: 1; border-bottom: none; }
.user-profile { display: flex; align-items: center; gap: 15px; min-width: 250px; justify-content: flex-end; }
.greeting { font-size: 14px; color: #606266; }

/* 页面切换时的丝滑淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>