<template>
  <div class="common-layout">
    <el-container class="dashboard-container">

      <el-aside :width="isCollapse ? '64px' : '220px'" class="aside-menu">
        <div class="logo-box">
          <h3 v-show="!isCollapse">🎮 平台管理台</h3>
          <h3 v-show="isCollapse">🎮</h3>
        </div>

        <el-menu
            :collapse="isCollapse"
            :collapse-transition="false"
            router
            default-active="/dashboard/profile"
            class="el-menu-vertical"
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#409eff"
        >
          <el-menu-item index="/dashboard/profile">
            <span>👤 个人中心</span>
          </el-menu-item>

          <el-menu-item index="/dashboard/favorites">
            <span>❤️ 我的收藏</span>
          </el-menu-item>

          <el-menu-item index="/dashboard/my-posts">
            <span>📝 我的发帖</span>
          </el-menu-item>

          <el-sub-menu index="dev" v-if="user.role === 1">
            <template #title>
              <span>🛠️ 开发者中心</span>
            </template>
            <el-menu-item index="/dashboard/publish">发布新游戏</el-menu-item>
            <el-menu-item index="/dashboard/my-games">我的游戏库</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="admin" v-if="user.role === 2">
            <template #title>
              <span>👑 系统管理</span>
            </template>
            <el-menu-item index="/dashboard/overview">平台数据总览</el-menu-item>
            <el-menu-item index="/dashboard/users">用户管理</el-menu-item>
            <el-menu-item index="/dashboard/audit"><span>上架审核</span></el-menu-item>
            <el-menu-item index="/dashboard/admin-games">游戏管理</el-menu-item>
            <el-menu-item index="/dashboard/admin-forum">内容治理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-container>

        <el-header class="header">
          <div class="header-left">
            <el-button @click="toggleCollapse" text>
              {{ isCollapse ? '展开 ➡️' : '⬅️ 收起' }}
            </el-button>
            <span class="breadcrumb">欢迎回来，{{ user.nickname }}</span>
          </div>
          <div class="header-right">
            <el-button type="primary" link @click="router.push('/home')">返回游戏大厅</el-button>
            <el-button type="danger" link @click="handleLogout">退出登录</el-button>
          </div>
        </el-header>

        <el-main class="main-content">
          <router-view></router-view>
        </el-main>

        <el-footer class="footer">
          © 2026 游戏交流与开发平台 - 课堂项目演示
        </el-footer>

      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// 从本地获取登录状态，拿到角色信息
const user = JSON.parse(localStorage.getItem('user')) || {}

// 控制菜单折叠的变量
const isCollapse = ref(false)
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
}

/* 侧边栏样式 */
.aside-menu {
  background-color: #304156;
  transition: width 0.3s; /* 折叠时的平滑动画 */
  overflow-x: hidden;
}
.logo-box {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  background-color: #2b3643;
}
.el-menu-vertical {
  border-right: none; /* 去掉默认边框，更好看 */
}

/* 顶部栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fff;
}
.breadcrumb {
  margin-left: 20px;
  color: #606266;
  font-size: 14px;
}

/* 中间内容区 */
.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}

/* 底部栏样式 */
.footer {
  height: 40px !important;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 13px;
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
}
</style>