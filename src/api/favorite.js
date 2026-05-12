//1. 引入我们刚才封装好的“智能对讲机”，而不是直接引原始的 axios
import request from '@/utils/request'

// 查询是否已收藏
export const checkFavoriteAPI = (userId, gameId) => {
    return request.get(`/favorite/check?userId=${userId}&gameId=${gameId}`)
}

// 切换收藏状态（添加/取消）
export const toggleFavoriteAPI = (userId, gameId) => {
    return request.post(`/favorite/toggle?userId=${userId}&gameId=${gameId}`)
}

// 获取用户的收藏列表
export const getFavoriteListAPI = (userId) => {
    return request.get(`/favorite/list/${userId}`)
}