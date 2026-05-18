// 引入封装好的“智能对讲机”
import request from '@/utils/request'

// 1. 用户登录接口
export const loginAPI = (data) => {
    return request.post('/user/login', data)
}

// 2. ⭐️ 升级版用户注册接口：将邮箱验证码 emailCode 作为 Query 参数动态拼接
export const registerAPI = (data, emailCode) => {
    return request.post(`/user/register?emailCode=${emailCode}`, data)
}

// 3. ⭐️ 新增：向后端发起发送邮箱验证码的 POST 请求
export const sendEmailCodeAPI = (email, type) => {
    return request.post(`/email/sendCode?email=${email}&type=${type}`)
}

// 4. ⭐️ 新增：忘记密码 - 重置密码接口
export const resetPasswordAPI = (email, code, newPassword) => {
    return request.post(`/user/resetPassword?email=${email}&code=${code}&newPassword=${newPassword}`)
}

export const changePasswordAPI = (id, oldPassword, newPassword) => {
    return request.post(`/user/changePassword?id=${id}&oldPassword=${oldPassword}&newPassword=${newPassword}`)
}

// 5. 更新用户基本信息
export const updateUserInfoAPI = (data) => {
    return request.post('/user/update', data)
}

// 6. 获取所有用户列表 (超级管理员专享)
export const getAllUsersAPI = () => {
    return request.get('/user/getAll')
}

// 7. 获取分页和条件搜索的用户列表
export const getUsersByPageAPI = (params) => {
    return request.get('/user/page', { params: params })
}

// 8. 获取图形验证码 (仅用于登录防爆破)
export const getCaptchaAPI = () => {
    return request.get('/api/captcha')
}