//1. 引入我们刚才封装好的“智能对讲机”，而不是直接引原始的 axios
import request from '@/utils/request'

// 获取游戏列表 (带搜索)
export const getGameListAPI = (keyword = '') => {
    return request.get(`/game/list?keyword=${keyword}`)
}

// ⭐ 新增：根据游戏 ID 获取详情
export const getGameDetailAPI = (id) => {
    // 注意这里使用的是反引号 ` `，这样可以动态拼接传入的 id
    return request.get(`/game/detail/${id}`)
}

// 发布新游戏
export const addGameAPI = (data) => {
    return request.post('/game/add', data)
}

// 分页获取游戏列表 (带搜索)
export const getGamesByPageAPI = (page, size, keyword = '') => {
    return request.get(`/game/page?page=${page}&size=${size}&keyword=${keyword}`)
}

// 获取特定状态的游戏列表（传 0 获取待审核列表）
export const getAuditGameListAPI = (status) => {
    return request.get(`/game/audit/list?status=${status}`)
}

// 审核游戏（通过或驳回）
export const processGameAuditAPI = (id, status) => {
    return request.post(`/game/audit/process?id=${id}&status=${status}`)
}

// ================= 开发者专属 API =================

// 获取开发者自己的游戏列表
export const getDeveloperGamesAPI = (developerId) => {
    return request.get(`/game/developer/${developerId}`)
}

// 开发者删除游戏
export const deleteGameAPI = (id, developerId) => {
    return request.delete(`/game/delete?id=${id}&developerId=${developerId}`)
}

// 开发者修改游戏信息 (传入整个 game 对象)
export const updateGameAPI = (gameData) => {
    return request.post('/game/update', gameData)
}

// 👑 管理员获取全站所有游戏 (包含各种状态，带分页和搜索)
export const getAllGamesForAdminAPI = (page, size, keyword = '') => {
    return request.get(`/game/admin/all?page=${page}&size=${size}&keyword=${keyword}`)
}

// 👑 管理员强制下架任意游戏
export const deleteGameByAdminAPI = (id) => {
    return request.delete(`/game/admin/delete?id=${id}`)
}