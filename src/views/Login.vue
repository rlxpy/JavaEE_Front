<template>
  <div class="login-wrapper">
    <div class="left-splash">
      <div class="floating-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="orb orb-4"></div>
      </div>

      <div class="splash-content">
        <h1 class="slogan">START<br>YOUR ADVENTURE</h1>
        <p class="sub-slogan">次元交汇，灵感迸发。在这里，构筑你的专属游戏世界。</p>
      </div>
    </div>

    <div class="right-form">
      <div class="perspective-container">
        <div class="flip-card" :class="{ 'is-flipped': isFlipped }">

          <div class="card-face card-front">
            <div class="logo-box">
              <h2 class="anime-title">欢迎回来，旅行者</h2>
              <p class="welcome-text">登录账号，继续你的旅程</p>
            </div>

            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="custom-form login-layout">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="请输入登录账号" prefix-icon="User" size="large" class="anime-input" />
              </el-form-item>

              <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password prefix-icon="Lock" size="large" class="anime-input" />
              </el-form-item>

              <el-form-item prop="code">
                <div class="captcha-row">
                  <el-input v-model="loginForm.code" placeholder="验证码" prefix-icon="Key" class="anime-input code-input" size="large" @keyup.enter="handleLogin" />
                  <img v-if="captchaData.image" :src="captchaData.image" @click="fetchCaptcha" class="captcha-img" title="看不清？点击刷新" />
                </div>
              </el-form-item>

              <el-form-item class="btn-item">
                <el-button class="submit-btn shimmer-btn" @click="handleLogin">登 录</el-button>
              </el-form-item>
            </el-form>

            <div class="switch-action">
              <span class="hint-text">还没有通行证？</span>
              <span class="switch-link" @click="flipToRegister">立即注册 ✧</span>
            </div>
          </div>

          <div class="card-face card-back">
            <div class="logo-box compact">
              <h2 class="anime-title">新星缔约</h2>
              <p class="welcome-text">选择你的职业，签订次元契约</p>
            </div>

            <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="custom-form compact-form" label-position="top">

              <el-form-item class="role-selection">
                <el-radio-group v-model="registerForm.role" class="capsule-radio">
                  <el-radio-button :label="0">🎮 冒险者</el-radio-button>
                  <el-radio-button :label="1">🛠️ 造物主</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item prop="username" class="compact-item">
                <el-input v-model="registerForm.username" placeholder="账号 (4-20位)" prefix-icon="User" size="default" class="anime-input" />
              </el-form-item>

              <el-form-item prop="nickname" class="compact-item">
                <el-input v-model="registerForm.nickname" placeholder="异世界昵称" prefix-icon="Edit" size="default" class="anime-input" />
              </el-form-item>

              <el-form-item prop="password" class="compact-item">
                <el-input v-model="registerForm.password" type="password" placeholder="契约密码" show-password prefix-icon="Lock" size="default" class="anime-input" />
              </el-form-item>

              <el-form-item prop="confirmPassword" class="compact-item">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" show-password prefix-icon="Lock" size="default" class="anime-input" />
              </el-form-item>

              <el-form-item prop="code" class="compact-item">
                <div class="captcha-row">
                  <el-input v-model="registerForm.code" placeholder="验证码" prefix-icon="Key" class="anime-input code-input" size="default" />
                  <img v-if="captchaData.image" :src="captchaData.image" @click="fetchCaptcha" class="captcha-img sm" title="看不清？点击刷新" />
                </div>
              </el-form-item>

              <el-form-item class="btn-item">
                <el-button class="submit-btn shimmer-btn register-btn" @click="handleRegister">缔结契约</el-button>
              </el-form-item>
            </el-form>

            <div class="switch-action compact">
              <span class="hint-text">已有通行证？</span>
              <span class="switch-link back-link" @click="flipToLogin">返回登录 ↩</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginAPI, registerAPI, getCaptchaAPI } from '../api/user.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const isFlipped = ref(false)

const flipToRegister = () => {
  isFlipped.value = true;
  setTimeout(() => { fetchCaptcha() }, 400)
}
const flipToLogin = () => {
  isFlipped.value = false;
  setTimeout(() => { fetchCaptcha() }, 400)
}

const loginFormRef = ref(null)
const registerFormRef = ref(null)

const captchaData = reactive({ image: '', uuid: '' })
const fetchCaptcha = async () => {
  try {
    const res = await getCaptchaAPI()
    if (res.code === 200) {
      captchaData.image = res.data.image
      captchaData.uuid = res.data.uuid
    }
  } catch (error) { console.error("获取验证码失败", error) }
}
onMounted(() => { fetchCaptcha() })

const loginForm = reactive({ username: '', password: '', code: '' })
const registerForm = reactive({ username: '', nickname: '', password: '', confirmPassword: '', role: 0, code: '' })

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') { callback(new Error('请再次输入密码')) }
  else if (value !== registerForm.password) { callback(new Error('两次输入的密码不一致！')) }
  else { callback() }
}

const loginRules = reactive({
  username: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
})

const registerRules = reactive({
  username: [
    { required: true, message: '账号不能为空', trigger: 'blur' },
    { min: 4, max: 20, message: '长度必须在 4 到 20 个字符之间', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '昵称不能为空', trigger: 'blur' }],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度必须在 6 到 30 个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
})

const handleLogin = () => {
  if (!loginFormRef.value) return
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const postData = { ...loginForm, uuid: captchaData.uuid }
        const res = await loginAPI(postData)
        if (res.code == 200) {
          ElMessage.success('登录成功！')
          localStorage.setItem('token', res.token)
          localStorage.setItem('user', JSON.stringify(res.data))
          router.push('/home')
        } else {
          ElMessage.error(res.msg || '账号或密码错误')
          fetchCaptcha()
        }
      } catch (error) { ElMessage.error('网络请求失败') }
    } else { return false }
  })
}

const handleRegister = () => {
  if (!registerFormRef.value) return
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const postData = {
          username: registerForm.username, nickname: registerForm.nickname,
          password: registerForm.password, role: registerForm.role,
          code: registerForm.code, uuid: captchaData.uuid
        }
        const res = await registerAPI(postData)
        if (res.code == 200) {
          ElMessage.success('契约签订成功！快去登录吧。')
          isFlipped.value = false
          loginForm.username = registerForm.username
          loginForm.password = ''
          loginForm.code = ''
          registerFormRef.value.resetFields()
          setTimeout(() => { fetchCaptcha() }, 400)
        } else {
          ElMessage.error(res.msg || '注册失败，账号可能已被占用')
          fetchCaptcha()
        }
      } catch (error) { ElMessage.error('网络请求失败') }
    } else { return false }
  })
}
</script>

<style scoped>
/* ================== 全局布局 ================== */
.login-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f4f7f9;
}

/* ================= 左侧视觉区 (还原 V1 的梦幻色调与纯白阴影字体) ================= */
.left-splash {
  flex: 5.5;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.splash-content {
  text-align: left;
  color: #fff;
  z-index: 10;
  padding: 0 50px;
  text-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.slogan {
  font-size: 64px;
  font-weight: 900;
  letter-spacing: 4px;
  line-height: 1.1;
  margin-bottom: 20px;
  font-family: 'Arial Black', sans-serif;
}

.sub-slogan {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 2px;
  opacity: 0.9;
}

.floating-orbs {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  z-index: 1;
}
.orb {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  filter: blur(8px);
  animation: floatUp 15s infinite linear;
}
.orb-1 { width: 150px; height: 150px; left: 10%; bottom: -150px; animation-duration: 20s; }
.orb-2 { width: 80px; height: 80px; left: 40%; bottom: -80px; animation-duration: 12s; animation-delay: 2s; }
.orb-3 { width: 200px; height: 200px; left: 70%; bottom: -200px; animation-duration: 25s; animation-delay: 5s; }
.orb-4 { width: 50px; height: 50px; left: 85%; bottom: -50px; animation-duration: 10s; animation-delay: 1s; }

@keyframes floatUp {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateY(-120vh) scale(1.5); opacity: 0; }
}

/* ================= 右侧卡片区 ================= */
.right-form {
  flex: 4.5;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.perspective-container {
  width: 400px;
  height: 600px; /* 卡片固定高度，保证 3D 旋转不塌陷 */
  perspective: 1500px;
}

.flip-card {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1);
  transform-style: preserve-3d;
}
.flip-card.is-flipped { transform: rotateY(180deg); }

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  padding: 40px 35px;
  box-sizing: border-box;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  backface-visibility: hidden;
}
.card-back { transform: rotateY(180deg); }

/* ================= 表单内容与间距控制 ================= */
.logo-box { text-align: center; margin-bottom: 25px; }
.logo-box.compact { margin-bottom: 15px; }

.anime-title {
  color: #3f51b5;
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 10px 0;
  letter-spacing: 2px;
}
.welcome-text { color: #8a9bb1; font-size: 14px; margin: 0; }

/* ⭐️ 核心：针对登录面的专门布局，利用弹性盒子填补空隙 */
.card-front {
  justify-content: space-between; /* 上下元素推开，分配多余空间 */
}
.login-layout {
  flex: 1; /* 撑开中间区域 */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 将三个输入框完美垂直居中 */
  gap: 10px; /* 增加一点输入框之间的缝隙 */
  margin: 20px 0;
}

/* 注册页的紧凑型配置保持 */
.compact-form { margin-top: 5px; }
.compact-item { margin-bottom: 15px !important; }

/* 输入框微动效 */
:deep(.anime-input .el-input__wrapper) {
  border-radius: 12px !important;
  background-color: #f4f6fc !important;
  box-shadow: none !important;
  border: 1px solid transparent;
  transition: all 0.3s;
}
:deep(.anime-input .el-input__wrapper.is-focus) {
  background-color: #ffffff !important;
  border: 1px solid #a8edea;
  box-shadow: 0 0 0 4px rgba(168, 237, 234, 0.4) !important;
}

.captcha-row { display: flex; width: 100%; gap: 10px; }
.captcha-img { height: 40px; cursor: pointer; border-radius: 8px; transition: 0.2s; }
.captcha-img.sm { height: 32px; }
.captcha-img:hover { transform: scale(1.05); }

/* 胶囊角色选择 */
.role-selection { display: flex; justify-content: center; margin-bottom: 18px !important; }
:deep(.capsule-radio .el-radio-button__inner) {
  border-radius: 20px !important; margin: 0 5px; border: 1px solid #dcdfe6 !important; box-shadow: none !important;
}

/* ================= ⭐️ 找回灵魂动效：流光与重阴影按钮 ================= */
.btn-item { margin-top: 15px !important; }
.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 4px;
  border-radius: 24px;
  border: none;
  color: white;
  margin-top: 10px;
  /* 找回深深的弥散阴影 */
  box-shadow: 0 8px 20px rgba(63, 81, 181, 0.3);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s;
}

.submit-btn:hover {
  /* 找回夸张的悬浮上升感 */
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 14px 28px rgba(63, 81, 181, 0.45);
}

.submit-btn { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); }
/* 还原注册按钮为 V1 那种明亮活泼的粉色 */
.register-btn {
  background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%);
  color: #4a4a4a;
  box-shadow: 0 8px 20px rgba(255, 154, 158, 0.3);
}
.register-btn:hover { box-shadow: 0 14px 28px rgba(255, 154, 158, 0.45); }

/* 找回极速扫过的白光剑刃特效 */
.shimmer-btn { position: relative; overflow: hidden; }
.shimmer-btn::after {
  content: '';
  position: absolute;
  top: -50%; left: -60%;
  width: 20%; height: 200%;
  background: rgba(255,255,255,0.5); /* 提升白光亮度 */
  transform: rotate(30deg);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }

/* ================= 底部切换链接 ================= */
.switch-action { text-align: center; margin-top: auto; padding-top: 15px; font-size: 14px; }
.hint-text { color: #909399; }
.switch-link {
  color: #3f51b5; font-weight: bold; cursor: pointer; margin-left: 5px;
  transition: 0.3s;
}
.switch-link:hover { color: #fed6e3; text-shadow: 0 0 8px rgba(254, 214, 227, 0.8); }
</style>