import axios from 'axios'

const request = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 5000
})

// 👑 获取全站大屏统计数据
export const getDashboardStatsAPI = () => {
    return request.get('/stat/dashboard')
}