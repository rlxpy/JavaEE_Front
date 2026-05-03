import axios from 'axios'

// 1. 创建一个 axios 实例（相当于配置一部对讲机）
const request = axios.create({
    baseURL: 'http://localhost:8080', // 你 Java 后端的地址
    timeout: 5000 // 请求超时时间
})

// 2. 封装登录接口并导出
export const loginAPI = (data) => {
    // 这会向 http://localhost:8080/user/login 发送 POST 请求，并带上账号密码数据
    return request.post('/user/login', data)
}

// 用户注册接口
export const registerAPI = (data) => {
    return request.post('/user/register', data)
}

// 更新用户基本信息
export const updateUserInfoAPI = (data) => {
    return request.post('/user/update', data)
}

// 获取所有用户列表 (超级管理员专属)
export const getAllUsersAPI = () => {
    // 对应你后端的 @GetMapping("/getAll")
    return request.get('/user/getAll')
}

// 获取分页和条件搜索的用户列表 (大厂级接口)
export const getUsersByPageAPI = (params) => {
    // axios 的 get 请求，第二个参数使用 { params: ... } 可以自动把参数拼接到 URL 后面
    // 相当于 http://localhost:8080/user/page?page=1&size=10&keyword=xxx
    return request.get('/user/page', { params: params })
}