<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">

      <div class="logo-box">
        <h2>🎮 游戏交流与开发平台</h2>
      </div>

      <el-tabs v-model="activeTab" stretch>

        <el-tab-pane label="账号登录" name="login">
          <el-form :model="loginForm" class="form-box">
            <el-form-item>
              <el-input v-model="loginForm.username" placeholder="请输入登录账号" prefix-icon="User" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password prefix-icon="Lock" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="submit-btn" @click="handleLogin">登 录</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="新用户注册" name="register">
          <el-form :model="registerForm" class="form-box" label-position="top">

            <el-form-item label="你想以什么身份加入我们？">
              <el-radio-group v-model="registerForm.role">
                <el-radio :label="0">🎮 普通玩家</el-radio>
                <el-radio :label="1">🛠️ 游戏开发者</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item>
              <el-input v-model="registerForm.username" placeholder="设置登录账号 (需唯一)" prefix-icon="User" />
            </el-form-item>

            <el-form-item>
              <el-input v-model="registerForm.nickname" placeholder="设置平台展示昵称" prefix-icon="Edit" />
            </el-form-item>

            <el-form-item>
              <el-input v-model="registerForm.password" type="password" placeholder="设置密码" show-password prefix-icon="Lock" />
            </el-form-item>

            <el-form-item>
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次确认密码" show-password prefix-icon="Lock" />
            </el-form-item>

            <el-form-item>
              <el-button type="success" class="submit-btn" @click="handleRegister">立即注册</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { loginAPI, registerAPI } from '../api/user.js' // 确保引入了两个 API
import { ElMessage } from 'element-plus'

const router = useRouter()

// 控制当前显示的是登录还是注册
const activeTab = ref('login')

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单数据
const registerForm = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  role: 0 // 默认选中普通玩家
})

// 登录逻辑
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入账号和密码！')
    return
  }
  try {
    const res = await loginAPI(loginForm)
    if (res.code == 200) {
      ElMessage.success('登录成功！')
      // 1. ⭐️ 核心操作：把后端发来的护照（Token）存进钱包（localStorage）
      // 我们之前的全局请求拦截器，每次发请求都会从这里拿 token！
      localStorage.setItem('token', res.token)
      // 2. 保存脱敏后的用户基本信息（用于页面展示头像、昵称等）
      localStorage.setItem('user', JSON.stringify(res.data))
      router.push('/home')
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (error) {
    console.error('真正的报错原因：', error)
    ElMessage.error('网络请求失败')
  }
}

// 注册逻辑
const handleRegister = async () => {
  // 1. 基础校验
  if (!registerForm.username || !registerForm.nickname || !registerForm.password) {
    ElMessage.warning('请将注册信息填写完整！')
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致！')
    return
  }

  try {
    // 2. 构造传给后端的数据
    const postData = {
      username: registerForm.username,
      nickname: registerForm.nickname,
      password: registerForm.password,
      role: registerForm.role // 0 或 1
    }

    // 3. 调用注册接口
    const res = await registerAPI(postData)
    if (res.code == 200) {
      ElMessage.success('注册成功！快去登录吧。')
      // 注册成功后，自动帮你切换到登录面板，并且把账号填好
      activeTab.value = 'login'
      loginForm.username = registerForm.username
      loginForm.password = ''

      // 清空注册表单
      registerForm.username = ''
      registerForm.nickname = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
    } else {
      ElMessage.error(res.msg || '注册失败，账号可能已被占用')
    }
  } catch (error) {
    ElMessage.error('网络请求失败')
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2b3643; /* 深色炫酷背景 */
}

.login-card {
  width: 450px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.logo-box {
  text-align: center;
  margin-bottom: 20px;
  color: #409eff;
}

.form-box {
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  font-size: 16px;
  padding: 12px;
}
</style>