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
          <h2 class="display-name">{{ infoForm.nickname || userInfo.nickname || '匿名玩家' }}</h2>
          <el-tag :type="getRoleTagType(userInfo.role)" effect="light" round class="role-badge">
            {{ getRoleName(userInfo.role) }}
          </el-tag>
        </div>
      </div>

      <div class="form-wrapper">
        <el-tabs v-model="activeTab" class="custom-tabs">

          <el-tab-pane label="📝 基本资料" name="info">
            <div class="tab-content">
              <el-form :model="infoForm" label-position="top" class="modern-form">
                <el-form-item label="通行证账号 (不可修改)">
                  <el-input v-model="userInfo.username" disabled prefix-icon="User" size="large" class="anime-input disabled-input" />
                </el-form-item>

                <el-form-item label="异世界昵称">
                  <el-input v-model="infoForm.nickname" placeholder="请输入新的昵称" prefix-icon="Edit" size="large" class="anime-input" />
                </el-form-item>

                <div class="action-row">
                  <el-button type="primary" round class="shimmer-btn save-btn" @click="handleUpdateInfo">
                    <el-icon style="margin-right: 6px;"><Check /></el-icon> 保存资料
                  </el-button>
                </div>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane label="🛡️ 账号安全" name="security">
            <div class="tab-content">

              <div class="security-email-box">
                <div class="email-info">
                  <span class="label">绑定密保邮箱</span>
                  <span class="value">{{ maskEmail(userInfo.email) }}</span>
                </div>
                <el-tag type="success" effect="dark" round size="small">
                  <el-icon><CircleCheck /></el-icon> 已验证
                </el-tag>
              </div>

              <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-position="top" class="modern-form">

                <div class="pwd-header-row">
                  <span class="pwd-label">当前通行证密码</span>
                  <span class="forgot-link" @click="openForgotDialog">忘记原密码？通过邮箱重置</span>
                </div>

                <el-form-item prop="oldPassword">
                  <el-input v-model="pwdForm.oldPassword" type="password" show-password prefix-icon="Lock" size="large" class="anime-input" placeholder="请输入您当前的密码验证身份" />
                </el-form-item>

                <el-form-item label="重塑新密码" prop="newPassword">
                  <el-input v-model="pwdForm.newPassword" type="password" show-password prefix-icon="Key" size="large" class="anime-input" placeholder="请输入 6-30 位的新密码" />
                </el-form-item>

                <el-form-item label="确认新密码" prop="confirmPassword">
                  <el-input v-model="pwdForm.confirmPassword" type="password" show-password prefix-icon="Lock" size="large" class="anime-input" placeholder="请再次输入新密码以防手滑" />
                </el-form-item>

                <div class="action-row">
                  <el-button type="danger" round class="shimmer-btn-danger save-btn" @click="handleChangePassword">
                    <el-icon style="margin-right: 6px;"><WarningFilled /></el-icon> 确认修改密码
                  </el-button>
                </div>
              </el-form>
            </div>
          </el-tab-pane>

        </el-tabs>
      </div>
    </div>

    <el-dialog
        v-model="forgotDialogVisible"
        title="通过邮箱重塑密码"
        width="460px"
        append-to-body
        class="anime-forgot-dialog"
    >
      <div class="security-email-box compact-email-box">
        <div class="email-info">
          <span class="label">验证码将发送至您绑定的密保邮箱：</span>
          <span class="value highlight-email">{{ maskEmail(userInfo.email) }}</span>
        </div>
      </div>

      <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" label-position="top">
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
          <el-button @click="forgotDialogVisible = false" round>取 消</el-button>
          <el-button type="primary" class="shimmer-btn reset-confirm-btn" round @click="handleResetByEmail">确认重塑密码</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Edit, Check, Key, CircleCheck, WarningFilled } from '@element-plus/icons-vue'
// ⭐️ 引入完整 API
import { updateUserInfoAPI, changePasswordAPI, sendEmailCodeAPI, resetPasswordAPI } from '../api/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userInfo = ref({})
const activeTab = ref('info')

// 表单 1：基本资料
const infoForm = reactive({
  id: null,
  nickname: ''
})

// 表单 2：使用旧密码修改
const pwdFormRef = ref(null)
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单 3：使用邮箱重置 (弹窗内)
const forgotDialogVisible = ref(false)
const forgotFormRef = ref(null)
const forgotForm = reactive({ code: '', newPassword: '', confirmPassword: '' })
const isSendingForgot = ref(false)
const forgotCountdown = ref(0)
let forgotTimer = null

// 密码一致性校验
const validateConfirm = (rule, value, callback) => {
  if (value === '') { callback(new Error('请再次输入新密码')) }
  else if (value !== pwdForm.newPassword) { callback(new Error('两次输入的新密码不一致！')) }
  else { callback() }
}
const validateForgotConfirm = (rule, value, callback) => {
  if (value === '') { callback(new Error('请再次输入新密码')) }
  else if (value !== forgotForm.newPassword) { callback(new Error('两次输入的新密码不一致！')) }
  else { callback() }
}

const pwdRules = reactive({
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度需在 6 到 30 个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validateConfirm, trigger: 'blur' }]
})

const forgotRules = reactive({
  code: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度需在 6 到 30 个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validateForgotConfirm, trigger: 'blur' }]
})

onMounted(() => {
  const storedUser = JSON.parse(localStorage.getItem('user'))
  if (storedUser) {
    userInfo.value = storedUser
    infoForm.id = storedUser.id
    infoForm.nickname = storedUser.nickname
  }
})

// 脱敏邮箱
const maskEmail = (email) => {
  if (!email) return '未绑定邮箱'
  const parts = email.split('@')
  if (parts.length !== 2) return email
  const name = parts[0]
  if (name.length <= 3) return email
  const maskedName = name.substring(0, 3) + '****' + name.substring(name.length - 1)
  return maskedName + '@' + parts[1]
}

// 提交基本资料修改
const handleUpdateInfo = async () => {
  try {
    const postData = { id: infoForm.id, nickname: infoForm.nickname }
    const res = await updateUserInfoAPI(postData)

    if (res.code === 200) {
      ElMessage.success('个人资料保存成功！')
      const updatedUser = res.data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      userInfo.value = updatedUser
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) { ElMessage.error('网络请求失败') }
}

// 提交密码修改 (旧密码方式)
const handleChangePassword = () => {
  if (!pwdFormRef.value) return
  pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      if (pwdForm.oldPassword === pwdForm.newPassword) {
        ElMessage.warning('新密码不能与原密码相同！')
        return
      }
      ElMessageBox.confirm(
          '修改密码后，您将在所有设备上被强制下线。是否确认修改？',
          '安全操作确认',
          { confirmButtonText: '确认修改', cancelButtonText: '手滑了', type: 'warning' }
      ).then(async () => {
        try {
          const res = await changePasswordAPI(infoForm.id, pwdForm.oldPassword, pwdForm.newPassword)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            sessionStorage.clear()
            router.push('/login')
          } else { ElMessage.error(res.msg || '修改失败') }
        } catch (e) { ElMessage.error('网络异常，请重试') }
      }).catch(() => {})
    }
  })
}

// ================== 邮箱重置相关逻辑 ==================
const openForgotDialog = () => {
  if (!userInfo.value.email) {
    ElMessage.warning('您的账号似乎未绑定邮箱，无法使用此功能。')
    return
  }
  forgotDialogVisible.value = true
  if (forgotFormRef.value) forgotFormRef.value.resetFields()
}

const sendForgotCode = async () => {
  if (isSendingForgot.value) return
  isSendingForgot.value = true
  try {
    // ⭐️ 传入 2 代表这是“找回密码场景”
    const res = await sendEmailCodeAPI(userInfo.value.email, 2)
    if (res.code === 200) {
      ElMessage.success(res.msg || '验证码已发送，请前往邮箱查收！')
      forgotCountdown.value = 60
      forgotTimer = setInterval(() => {
        forgotCountdown.value--
        if (forgotCountdown.value <= 0) clearInterval(forgotTimer)
      }, 1000)
    } else { ElMessage.error(res.msg || '发送失败') }
  } catch (e) { ElMessage.error('获取验证码网络异常') }
  finally { isSendingForgot.value = false }
}

const handleResetByEmail = () => {
  if (!forgotFormRef.value) return
  forgotFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await resetPasswordAPI(userInfo.value.email, forgotForm.code, forgotForm.newPassword)
        if (res.code === 200) {
          ElMessage.success('凭证重塑成功！安全起见请重新登录。')
          forgotDialogVisible.value = false
          if (forgotTimer) clearInterval(forgotTimer)
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          sessionStorage.clear()
          router.push('/login')
        } else { ElMessage.error(res.msg || '密码重置失败') }
      } catch (e) { ElMessage.error('网络请求异常') }
    }
  })
}

const getRoleTagType = (role) => {
  if (role === 1) return 'warning'
  if (role === 2) return 'danger'
  return 'info'
}
const getRoleName = (role) => {
  if (role === 1) return '开发者'
  if (role === 2) return '超级管理员'
  return '普通玩家'
}
</script>

<style scoped>
.profile-container { display: flex; justify-content: center; align-items: flex-start; padding-top: 2vh; }

.profile-card {
  width: 100%; max-width: 650px; background: #ffffff; border-radius: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04); overflow: hidden; transition: transform 0.3s;
}
.profile-card:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(0, 0, 0, 0.06); }

.profile-banner {
  height: 140px; width: 100%; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); position: relative;
}
.profile-banner::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 40%;
  background: linear-gradient(to top, rgba(255,255,255,0.3), transparent);
}

.avatar-section {
  display: flex; flex-direction: column; align-items: center; margin-top: -45px; position: relative; z-index: 2;
}
.avatar-wrapper { padding: 4px; background: #ffffff; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.avatar-img { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.user-name-box { text-align: center; margin-top: 15px; }
.display-name { margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #2c3e50; }
.role-badge { font-weight: bold; padding: 0 12px; }

.form-wrapper { padding: 10px 50px 40px; }
:deep(.custom-tabs .el-tabs__nav-wrap::after) { height: 1px; background-color: #f0f2f5; }
:deep(.custom-tabs .el-tabs__item) { font-size: 16px; font-weight: bold; color: #8a9bb1; padding: 0 20px; transition: all 0.3s; }
:deep(.custom-tabs .el-tabs__item.is-active) { color: #409eff; }
:deep(.custom-tabs .el-tabs__active-bar) { background-color: #409eff; height: 3px; border-radius: 3px; }

.tab-content { padding-top: 20px; animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* 密保邮箱高级展示条 */
.security-email-box {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc; border-radius: 16px; padding: 18px 25px; margin-bottom: 25px;
  border: 1px solid #eef2f6;
}
.email-info { display: flex; flex-direction: column; gap: 4px; }
.email-info .label { font-size: 13px; color: #8a9bb1; font-weight: bold; }
.email-info .value { font-size: 16px; color: #2c3e50; font-weight: 900; letter-spacing: 1px; }

/* 弹窗内的提示块紧凑化 */
.compact-email-box { padding: 12px 20px; margin-bottom: 20px; justify-content: flex-start; }
.highlight-email { color: #409eff !important; margin-top: 4px; }

/* ⭐️ 忘记密码快捷链接横排布局 */
.pwd-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.pwd-label { font-weight: bold; color: #5c6b77; font-size: 14px; }
.forgot-link { font-size: 13px; color: #409eff; cursor: pointer; transition: color 0.3s; font-weight: bold; }
.forgot-link:hover { color: #f472b6; }

:deep(.el-form-item__label) { font-weight: bold; color: #5c6b77; padding-bottom: 8px; }
:deep(.anime-input .el-input__wrapper) {
  border-radius: 16px !important; background-color: #f4f6fc !important; box-shadow: none !important; border: 1px solid transparent; padding: 8px 15px; transition: all 0.3s;
}
:deep(.anime-input .el-input__wrapper:focus-within), :deep(.anime-input .el-input__wrapper:hover) {
  background-color: #ffffff !important; border: 1px solid #a8edea; box-shadow: 0 0 0 4px rgba(168, 237, 234, 0.3) !important;
}
:deep(.disabled-input .el-input__wrapper) { background-color: #eef2f6 !important; cursor: not-allowed; }
:deep(.disabled-input .el-input__inner) { color: #a0aec0 !important; }

.action-row { margin-top: 35px; }
.save-btn { width: 100%; height: 50px; font-size: 16px; font-weight: bold; border-radius: 25px; border: none; }

.shimmer-btn { position: relative; overflow: hidden; background: linear-gradient(90deg, #409eff 0%, #7367f0 100%); }
.shimmer-btn::after, .shimmer-btn-danger::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%; background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after, .shimmer-btn-danger:hover::after { left: 120%; }

/* 危险操作按钮特效 */
.shimmer-btn-danger { position: relative; overflow: hidden; background: linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%); box-shadow: 0 8px 20px rgba(255,126,95,0.2); }
.shimmer-btn-danger:hover { box-shadow: 0 12px 25px rgba(255,126,95,0.4); transform: translateY(-2px); }

/* ================== 🔮 找回密码高级弹窗全包穿透样式 ================== */
.captcha-row { display: flex; width: 100%; gap: 12px; }
.code-input { flex: 1; }
.email-code-btn {
  min-width: 120px; height: 48px; border-radius: 16px; font-weight: bold; font-size: 13px;
  background: #f4f6fc; border: 1px solid #e4e7ed; color: #5c6b77; transition: all 0.3s;
}
.email-code-btn:hover:not(:disabled) {
  background: #ffffff; border-color: #a8edea; color: #3f51b5; box-shadow: 0 4px 12px rgba(168, 237, 234, 0.2);
}

:deep(.anime-forgot-dialog) {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
:deep(.anime-forgot-dialog .el-dialog__title) { font-weight: 800; color: #2c3e50; letter-spacing: 1px; }
.reset-confirm-btn { background: linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%); box-shadow: 0 6px 15px rgba(255,126,95,0.3); border: none; }
.reset-confirm-btn:hover { box-shadow: 0 10px 22px rgba(255,126,95,0.45); }
</style>