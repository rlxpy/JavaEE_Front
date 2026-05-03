// src/api/favorite.js
import axios from 'axios'

const request = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 5000
})

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