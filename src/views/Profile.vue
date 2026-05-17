<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-banner"></div>

      <div class="avatar-section">
        <div class="avatar-wrapper">
          <el-avatar :size="90" :src="userInfo.avatar" class="avatar-img">
            {{ userInfo.nickname?.charAt(0) || '匿' }}
          </el-avatar>
        </div>
        <div class="user-name-box">
          <h2 class="display-name">{{ formData.nickname || userInfo.nickname || '匿名玩家' }}</h2>
          <el-tag :type="getRoleTagType(userInfo.role)" effect="light" round class="role-badge">
            {{ getRoleName(userInfo.role) }}
          </el-tag>
        </div>
      </div>

      <div class="form-wrapper">
        <el-form :model="formData" label-position="top" class="modern-form">
          <el-form-item label="通行证账号 (不可修改)">
            <el-input
                v-model="userInfo.username"
                disabled
                prefix-icon="User"
                size="large"
                class="anime-input disabled-input"
            />
          </el-form-item>

          <el-form-item label="异世界昵称">
            <el-input
                v-model="formData.nickname"
                placeholder="请输入新的昵称"
                prefix-icon="Edit"
                size="large"
                class="anime-input"
            />
          </el-form-item>

          <el-form-item label="重塑契约密码 (选填)">
            <el-input
                v-model="formData.password"
                type="password"
                show-password
                prefix-icon="Lock"
                size="large"
                class="anime-input"
                placeholder="如果不修改密码，请留空"
            />
          </el-form-item>

          <div class="action-row">
            <el-button type="primary" round class="shimmer-btn save-btn" @click="handleUpdate">
              <el-icon style="margin-right: 6px;"><Check /></el-icon> 保存修改
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { User, Lock, Edit, Check } from '@element-plus/icons-vue' // 引入高级图标
import { updateUserInfoAPI } from '../api/user.js'
import { ElMessage } from 'element-plus'

const userInfo = ref({})

const formData = reactive({
  id: null,
  nickname: '',
  password: ''
})

onMounted(() => {
  const storedUser = JSON.parse(localStorage.getItem('user'))
  if (storedUser) {
    userInfo.value = storedUser
    formData.id = storedUser.id
    formData.nickname = storedUser.nickname
  }
})

const handleUpdate = async () => {
  try {
    const postData = { id: formData.id }
    if (formData.nickname) postData.nickname = formData.nickname
    if (formData.password) postData.password = formData.password

    const res = await updateUserInfoAPI(postData)

    if (res.code === 200) {
      ElMessage.success('个人信息保存成功！')

      const updatedUser = res.data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      formData.password = ''

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      ElMessage.error(res.msg || '保存失败，请稍后再试')
    }
  } catch (error) {
    ElMessage.error('网络请求失败')
  }
}

// 标签色彩微调，配合浅色底
const getRoleTagType = (role) => {
  if (role === 1) return 'warning'
  if (role === 2) return 'danger'
  return 'info' // 普通玩家用低调的灰色
}

const getRoleName = (role) => {
  if (role === 1) return '开发者'
  if (role === 2) return '超级管理员'
  return '普通玩家'
}
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2vh;
}

/* ================= 核心卡片容器 ================= */
.profile-card {
  width: 100%;
  max-width: 650px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: transform 0.3s;
}
.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.06);
}

/* ================= 顶部横幅 ================= */
.profile-banner {
  height: 140px;
  width: 100%;
  /* 借用登录页梦幻渐变基因，产生品牌连贯感 */
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  position: relative;
}
.profile-banner::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0; height: 40%;
  background: linear-gradient(to top, rgba(255,255,255,0.3), transparent);
}

/* ================= 悬浮立体头像区 ================= */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -45px; /* 负边距，让头像向上跨界悬浮 */
  position: relative;
  z-index: 2;
}
.avatar-wrapper {
  padding: 4px;
  background: #ffffff; /* 纯白遮罩描边 */
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.avatar-img {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.user-name-box {
  text-align: center;
  margin-top: 15px;
}
.display-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 800;
  color: #2c3e50;
}
.role-badge {
  font-weight: bold;
  padding: 0 12px;
}

/* ================= 现代无边框表单 ================= */
.form-wrapper {
  padding: 30px 50px 50px;
}
:deep(.el-form-item__label) {
  font-weight: bold;
  color: #5c6b77;
  padding-bottom: 8px;
}

:deep(.anime-input .el-input__wrapper) {
  border-radius: 16px !important;
  background-color: #f4f6fc !important;
  box-shadow: none !important;
  border: 1px solid transparent;
  padding: 8px 15px;
  transition: all 0.3s;
}
:deep(.anime-input .el-input__wrapper:focus-within),
:deep(.anime-input .el-input__wrapper:hover) {
  background-color: #ffffff !important;
  border: 1px solid #a8edea;
  box-shadow: 0 0 0 4px rgba(168, 237, 234, 0.3) !important;
}

/* 禁用的输入框要有辨识度，但不难看 */
:deep(.disabled-input .el-input__wrapper) {
  background-color: #eef2f6 !important;
  cursor: not-allowed;
}
:deep(.disabled-input .el-input__inner) {
  color: #a0aec0 !important;
}

.action-row {
  margin-top: 40px;
}
.save-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 25px;
  border: none;
}

/* ================= 按钮流光特效 ================= */
.shimmer-btn {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #409eff 0%, #7367f0 100%);
}
.shimmer-btn::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
  background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }
</style>