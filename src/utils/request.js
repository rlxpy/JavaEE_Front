import axios from "axios";

// 1. 创建全局唯一的 axios 实例（智能对讲机）
const request = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 5000
})

// ==========================================
// 核心魔法 1：请求拦截器 (Request Interceptor)
// 作用：在每次发请求去后端之前，自动把钱包（localStorage）里的护照（Token）拿出来，塞进请求头里！
// ==========================================
request.interceptors.request.use(config => {
    // 1. 从浏览器的本地缓存中拿出 token
    const token = localStorage.getItem('token')
    // 2. 如果有 token，就把它放到请求头里。
    // 注意：这里的 'token' 必须和你后端 JwtInterceptor 里 request.getHeader("token") 保持一致！
    if (token) {
        config.headers['token'] = token
    }
    return config;
}, error => {
    return Promise.reject(error);
})

// ==========================================
// ⭐️ 核心魔法 2：响应拦截器 (Response Interceptor)
// 作用：在后端返回数据到达你的具体的 vue 页面之前，先在这里进行全局的错误排查。
// ==========================================
request.interceptors.response.use(response => {
    // 正常情况：直接把后端的 JSON 里的 data 部分剥离出来返回，让页面里少写一层 .data
    let res = response.data;
    return res;
}, error => {
    // 异常情况：安检门把你拦住了！
    if (error.response && error.response.status === 401) {
        ElMessage.error('登录已过期或未授权，请重新登录！')

        // 1. 销毁本地过期的护照和用户数据
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // 2. 强制跳转回登录页
        router.push('/login')
    } else {
        ElMessage.error('网络请求失败：' + error.message)
    }
    return Promise.reject(error)
})

export default request;
