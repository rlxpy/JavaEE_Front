//1. 引入我们刚才封装好的“智能对讲机”，而不是直接引原始的 axios
import request from '@/utils/request'

// 👑 获取全站大屏统计数据
export const getDashboardStatsAPI = () => {
    return request.get('/stat/dashboard')
}