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

              <div class="forgot-pwd-row">
                <span class="forgot-link" @click="openForgotDialog">忘记契约密码？</span>
              </div>

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
                  <el-radio-button :value="0">🎮 冒险者</el-radio-button>
                  <el-radio-button :value="1">🛠️ 造物主</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item prop="username" class="compact-item">
                <el-input v-model="registerForm.username" placeholder="通行证账号 (4-20位)" prefix-icon="User" class="anime-input" />
              </el-form-item>

              <el-form-item prop="nickname" class="compact-item">
                <el-input v-model="registerForm.nickname" placeholder="异世界昵称" prefix-icon="Edit" class="anime-input" />
              </el-form-item>

              <el-form-item prop="email" class="compact-item">
                <el-input v-model="registerForm.email" placeholder="联络电子邮箱" prefix-icon="Message" class="anime-input" />
              </el-form-item>

              <el-form-item prop="emailCode" class="compact-item">
                <div class="captcha-row">
                  <el-input v-model="registerForm.emailCode" placeholder="邮件验证码" prefix-icon="Key" class="anime-input code-input" />
                  <el-button
                      type="primary"
                      round
                      class="email-code-btn"
                      :disabled="registerCountdown > 0 || isSendingRegister"
                      @click="sendRegisterCode"
                  >
                    {{ isSendingRegister ? '发送中...' : (registerCountdown > 0 ? `${registerCountdown}s` : '获取验证码') }}
                  </el-button>
                </div>
              </el-form-item>

              <el-form-item prop="password" class="compact-item">
                <el-input v-model="registerForm.password" type="password" placeholder="契约密码 (6-30位)" show-password prefix-icon="Lock" class="anime-input" />
              </el-form-item>

              <el-form-item prop="confirmPassword" class="compact-item">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认契约密码" show-password prefix-icon="Lock" class="anime-input" />
              </el-form-item>

              <el-form-item class="btn-item register-btn-item">
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

    <el-dialog
        v-model="forgotDialogVisible"
        title="重塑核心密码契约"
        width="460px"
        append-to-body
        class="anime-forgot-dialog"
    >
      <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" label-position="top">
        <el-form-item label="您的注册邮箱" prop="email">
          <el-input v-model="forgotForm.email" placeholder="请输入当时绑定的电子邮箱" prefix-icon="Message" class="anime-input" />
        </el-form-item>

        <el-form-item label="动态重置验证码" prop="code">
          <div class="captcha-row">
            <el-input v-model="forgotForm.code" placeholder="请输入邮箱里的6位验证码" prefix-icon="Key" class="anime-input code-input" />
            <el-button
                type="primary"
                round
                class="email-code-btn"
                :disabled="forgotCountdown > 0 || isSendingForgot"
                @click="sendForgotCode"
            >
              {{ isSendingForgot ? '发送中...' : (forgotCountdown > 0 ? `${forgotCountdown}s` : '获取验证码') }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="全新重塑密码" prop="newPassword">
          <el-input v-model="forgotForm.newPassword" type="password" show-password placeholder="请输入新密码 (6-30位)" prefix-icon="Lock" class="anime-input" />
        </el-form-item>

        <el-form-item label="再次确认密码" prop="confirmPassword">
          <el-input v-model="forgotForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" prefix-icon="Lock" class="anime-input" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="forgotDialogVisible = false" round>残留在记忆中</el-button>
          <el-button type="primary" class="shimmer-btn reset-confirm-btn" round @click="handleResetPassword">确认重塑密码</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginAPI, registerAPI, getCaptchaAPI, sendEmailCodeAPI, resetPasswordAPI } from '../api/user.js'
import { ElMessage } from 'element-plus'
import { User, Lock, Key, Edit, Message, Picture, Link, Check, Close, Promotion } from '@element-plus/icons-vue'

const router = useRouter()
const isFlipped = ref(false)

// ⭐️ 新增：网络请求防抖状态
const isSendingRegister = ref(false)
const isSendingForgot = ref(false)

// 倒计时状态
const registerCountdown = ref(0)
const forgotCountdown = ref(0)
let registerTimer = null
let forgotTimer = null

const forgotDialogVisible = ref(false)

const flipToRegister = () => {
  isFlipped.value = true
  fetchCaptcha()
}
const flipToLogin = () => {
  isFlipped.value = false
  fetchCaptcha()
}

const loginFormRef = ref(null)
const registerFormRef = ref(null)
const forgotFormRef = ref(null)

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
const registerForm = reactive({ username: '', nickname: '', email: '', emailCode: '', password: '', confirmPassword: '', role: 0 })
const forgotForm = reactive({ email: '', code: '', newPassword: '', confirmPassword: '' })

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') { callback(new Error('请再次输入密码')) }
  else if (value !== registerForm.password) { callback(new Error('两次输入的密码不一致！')) }
  else { callback() }
}
const validateForgotConfirmPassword = (rule, value, callback) => {
  if (value === '') { callback(new Error('请再次输入密码')) }
  else if (value !== forgotForm.newPassword) { callback(new Error('两次输入的密码不一致！')) }
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
  email: [
    { required: true, message: '电子邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  emailCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度在 6 到 30 个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
})

const forgotRules = reactive({
  email: [
    { required: true, message: '电子邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度必须在 6 到 30 个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validateForgotConfirmPassword, trigger: 'blur' }]
})

// ================== ⭐️ 升级的请求流水线 ==================
const sendRegisterCode = async () => {
  if (!registerForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    ElMessage.warning('请先输入正确的邮箱地址！')
    return
  }
  // 防止重复点击
  if (isSendingRegister.value) return

  isSendingRegister.value = true // 上锁
  try {
    const res = await sendEmailCodeAPI(registerForm.email, 1)
    if (res.code === 200) {
      ElMessage.success(res.msg || '验证码已发送，请前往邮箱查收！')
      registerCountdown.value = 60
      registerTimer = setInterval(() => {
        registerCountdown.value--
        if (registerCountdown.value <= 0) clearInterval(registerTimer)
      }, 1000)
    } else { ElMessage.error(res.msg || '发送失败') }
  } catch (e) { ElMessage.error('获取验证码网络异常') }
  finally { isSendingRegister.value = false } // 解锁
}

const sendForgotCode = async () => {
  if (!forgotForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotForm.email)) {
    ElMessage.warning('请先输入正确的邮箱地址！')
    return
  }
  if (isSendingForgot.value) return

  isSendingForgot.value = true // 上锁
  try {
    const res = await sendEmailCodeAPI(forgotForm.email, 2)
    if (res.code === 200) {
      ElMessage.success(res.msg || '验证码已发送，请前往邮箱查收！')
      forgotCountdown.value = 60
      forgotTimer = setInterval(() => {
        forgotCountdown.value--
        if (forgotCountdown.value <= 0) clearInterval(forgotTimer)
      }, 1000)
    } else { ElMessage.error(res.msg || '发送失败') }
  } catch (e) { ElMessage.error('获取验证码网络异常') }
  finally { isSendingForgot.value = false } // 解锁
}

const openForgotDialog = () => {
  forgotDialogVisible.value = true
  if (forgotFormRef.value) forgotFormRef.value.resetFields()
}

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
    }
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
          email: registerForm.email
        }
        const res = await registerAPI(postData, registerForm.emailCode)
        if (res.code == 200) {
          ElMessage.success('契约签订成功！快去登录吧。')
          isFlipped.value = false
          loginForm.username = registerForm.username
          loginForm.password = ''
          loginForm.code = ''
          registerFormRef.value.resetFields()
          if (registerTimer) clearInterval(registerTimer)
          registerCountdown.value = 0
          setTimeout(() => { fetchCaptcha() }, 400)
        } else {
          ElMessage.error(res.msg || '注册失败')
        }
      } catch (error) { ElMessage.error('网络请求失败') }
    }
  })
}

const handleResetPassword = () => {
  if (!forgotFormRef.value) return
  forgotFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await resetPasswordAPI(forgotForm.email, forgotForm.code, forgotForm.newPassword)
        if (res.code === 200) {
          ElMessage.success(res.msg || '密码修改成功，请前往登录！')
          forgotDialogVisible.value = false
          loginForm.username = ''
          loginForm.password = ''
          if (forgotTimer) clearInterval(forgotTimer)
          forgotCountdown.value = 0
        } else { ElMessage.error(res.msg || '密码重置失败') }
      } catch (e) { ElMessage.error('网络请求异常') }
    }
  })
}
</script>

<style scoped>
/* ================== 全局布局 ================== */
.login-wrapper { display: flex; height: 100vh; width: 100vw; overflow: hidden; background-color: #f4f7f9; }

.left-splash {
  flex: 5.5; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;
}
.splash-content { text-align: left; color: #fff; z-index: 10; padding: 0 50px; text-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.slogan { font-size: 64px; font-weight: 900; letter-spacing: 4px; line-height: 1.1; margin-bottom: 20px; font-family: 'Arial Black', sans-serif; }
.sub-slogan { font-size: 20px; font-weight: 500; letter-spacing: 2px; opacity: 0.9; }

.floating-orbs { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; z-index: 1; }
.orb { position: absolute; background: rgba(255, 255, 255, 0.4); border-radius: 50%; filter: blur(8px); animation: floatUp 15s infinite linear; }
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

.right-form { flex: 4.5; background: transparent; display: flex; justify-content: center; align-items: center; z-index: 2; }

/* ⭐️ 扩建卡片高度：从 620px 增加到了 680px，留足报错文字空间 */
.perspective-container { width: 420px; height: 680px; perspective: 1500px; }
.flip-card { width: 100%; height: 100%; position: relative; transition: transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1); transform-style: preserve-3d; }
.flip-card.is-flipped { transform: rotateY(180deg); }

.card-face {
  position: absolute; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.96);
  border-radius: 28px; padding: 40px 35px; box-sizing: border-box;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06); display: flex; flex-direction: column; backface-visibility: hidden;
}
.card-back { transform: rotateY(180deg); padding: 35px 35px; } /* 微调内边距 */

.logo-box { text-align: center; margin-bottom: 25px; }
.logo-box.compact { margin-bottom: 10px; }
.anime-title { color: #3f51b5; font-size: 28px; font-weight: bold; margin: 0 0 10px 0; letter-spacing: 2px; }
.welcome-text { color: #8a9bb1; font-size: 14px; margin: 0; }

.card-front { justify-content: space-between; }
.login-layout { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 4px; margin: 15px 0; }

/* ⭐️ 恢复健康的输入框间距 */
.compact-form { margin-top: 5px; }
.compact-item { margin-bottom: 20px !important; }
.register-btn-item { margin-top: 10px !important; }

/* 美化错误提示的红字排版 */
:deep(.el-form-item__error) { padding-top: 3px; font-weight: 500; }

/* 输入框微动效 */
:deep(.anime-input .el-input__wrapper) {
  border-radius: 14px !important; background-color: #f4f6fc !important; box-shadow: none !important; border: 1px solid transparent; transition: all 0.3s;
}
:deep(.anime-input .el-input__wrapper.is-focus),
:deep(.anime-input .el-input__wrapper:hover) {
  background-color: #ffffff !important; border: 1px solid #a8edea; box-shadow: 0 0 0 4px rgba(168, 237, 234, 0.3) !important;
}

.captcha-row { display: flex; width: 100%; gap: 12px; }
.code-input { flex: 1; }
.captcha-img { height: 44px; cursor: pointer; border-radius: 10px; transition: 0.2s; }
.captcha-img:hover { transform: scale(1.04); }

/* ⭐️ 加宽邮箱获取验证码按钮，防止文字挤压 */
.email-code-btn {
  min-width: 120px; height: 40px; border-radius: 14px; font-weight: bold; font-size: 13px;
  background: #f4f6fc; border: 1px solid #e4e7ed; color: #5c6b77; transition: all 0.3s; margin-top: 1px;
}
.email-code-btn:hover:not(:disabled) {
  background: #ffffff; border-color: #a8edea; color: #3f51b5;
  box-shadow: 0 4px 12px rgba(168, 237, 234, 0.2);
}

.role-selection { display: flex; justify-content: center; margin-bottom: 15px !important; }
:deep(.capsule-radio .el-radio-button__inner) { border-radius: 20px !important; margin: 0 5px; border: 1px solid #dcdfe6 !important; box-shadow: none !important; }

/* 忘记密码行 */
.forgot-pwd-row { text-align: right; margin: 2px 5px 12px; }
.forgot-link { font-size: 13px; color: #8a9bb1; cursor: pointer; transition: color 0.3s; font-weight: 500; }
.forgot-link:hover { color: #f472b6; }

/* 按钮及流光 */
.btn-item { margin-top: 10px !important; }
.submit-btn {
  width: 100%; height: 48px; font-size: 16px; font-weight: bold; letter-spacing: 4px; border-radius: 24px; border: none; color: white;
  box-shadow: 0 8px 20px rgba(63, 81, 181, 0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.submit-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(63, 81, 181, 0.35); }
.submit-btn { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); }

.register-btn { background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%); color: #4a4a4a; box-shadow: 0 8px 20px rgba(255, 154, 158, 0.2); }
.register-btn:hover { box-shadow: 0 12px 26px rgba(255, 154, 158, 0.35); }

.shimmer-btn { position: relative; overflow: hidden; }
.shimmer-btn::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
  background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }

.switch-action { text-align: center; margin-top: auto; padding-top: 10px; font-size: 14px; }
.hint-text { color: #909399; }
.switch-link { color: #3f51b5; font-weight: bold; cursor: pointer; margin-left: 5px; transition: 0.3s; }
.switch-link:hover { color: #ff9a9e; }

/* ================== 🔮 找回密码高级弹窗全包穿透样式 ================== */
:deep(.anime-forgot-dialog) {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(20px) !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
:deep(.anime-forgot-dialog .el-dialog__title) { font-weight: 800; color: #2c3e50; letter-spacing: 1px; }
:deep(.anime-forgot-dialog .el-form-item__label) { font-weight: bold; color: #5c6b77; padding-bottom: 4px; }
.reset-confirm-btn { background: linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%); box-shadow: 0 6px 15px rgba(255,126,95,0.3); border: none; }
.reset-confirm-btn:hover { box-shadow: 0 10px 22px rgba(255,126,95,0.45); }
</style>