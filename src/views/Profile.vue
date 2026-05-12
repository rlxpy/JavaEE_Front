<template>
  <div class="profile-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">👤 个人基本信息</span>
        </div>
      </template>

      <div class="avatar-section">
        <el-avatar :size="80" :src="userInfo.avatar" class="avatar">
          {{ userInfo.nickname?.charAt(0) }}
        </el-avatar>
        <div class="role-badge">
          <el-tag :type="getRoleTagType(userInfo.role)" effect="dark">
            {{ getRoleName(userInfo.role) }}
          </el-tag>
        </div>
      </div>

      <el-form :model="formData" label-width="80px" class="profile-form">
        <el-form-item label="登录账号">
          <el-input v-model="userInfo.username" disabled placeholder="账号不可修改" />
        </el-form-item>

        <el-form-item label="玩家昵称">
          <el-input v-model="formData.nickname" placeholder="请输入新的昵称" />
        </el-form-item>

        <el-form-item label="新密码">
          <el-input
              v-model="formData.password"
              type="password"
              show-password
              placeholder="如果不修改密码，请留空"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleUpdate" class="save-btn">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { updateUserInfoAPI } from '../api/user.js'
import { ElMessage } from 'element-plus'

// 存放完整的用户信息展示
const userInfo = ref({})

// 存放表单里要修改的数据
const formData = reactive({
  id: null,
  nickname: '',
  password: ''
})

// 页面加载时执行
onMounted(() => {
  // 从本地缓存加载用户信息
  const storedUser = JSON.parse(localStorage.getItem('user'))
  if (storedUser) {
    userInfo.value = storedUser
    formData.id = storedUser.id
    formData.nickname = storedUser.nickname
    // 密码留空，除非用户想修改
  }
})

// 提交修改
const handleUpdate = async () => {
  try {
    // 构造发给后端的数据：只发有值的数据
    const postData = { id: formData.id }
    if (formData.nickname) postData.nickname = formData.nickname
    if (formData.password) postData.password = formData.password // 如果没填就不传，配合后端的动态 SQL

    // 调用后端接口
    const res = await updateUserInfoAPI(postData)

    if (res.code === 200) {
      ElMessage.success('个人信息保存成功！')

      // ⭐️ 核心：用后端返回的最新数据覆盖本地 localStorage
      const updatedUser = res.data
      localStorage.setItem('user', JSON.stringify(updatedUser))

      // 清空密码输入框
      formData.password = ''

      // 简单粗暴地刷新页面，让整个大厅的头部导航栏也更新成新昵称
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

// 辅助函数：推导标签颜色和名称
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
.profile-container {
  padding: 20px;
}

.box-card {
  max-width: 600px;
  margin: 0 auto; /* 居中显示 */
  border-radius: 10px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  margin-top: 20px;
}

.avatar {
  font-size: 30px;
  background-color: #409eff; /* 头像默认背景色 */
}

.role-badge {
  margin-top: 15px;
}

.profile-form {
  max-width: 450px;
  margin: 0 auto;
}

.save-btn {
  width: 100%;
  margin-top: 20px;
}
</style>