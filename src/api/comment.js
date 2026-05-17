//1. 引入我们刚才封装好的“智能对讲机”，而不是直接引原始的 axios
import request from '@/utils/request'

// 1. 根据游戏 ID 获取评论列表 [cite: 74, 76]
export const getCommentsByGameAPI = (gameId) => {
    return request.get(`/comment/game/${gameId}`)
}

// 2. 发表新评论 [cite: 74, 75]
export const addCommentAPI = (data) => {
    return request.post('/comment/add', data)
}

// 获取某个帖子的所有回复
export const getCommentsByPostAPI = (postId) => {
    return request.get(`/comment/post/${postId}`)
}

// ==========================================
// ⭐️ 新增：用户删除自己的评论
// ==========================================
export const deleteMyCommentAPI = (commentId) => {
    return request.delete(`/comment/delete?id=${commentId}`)
}

// 👑 管理员获取全站评论 (分页+搜索)
export const getAllCommentsForAdminAPI = (page, size, keyword = '') => {
    return request.get(`/comment/admin/all?page=${page}&size=${size}&keyword=${keyword}`)
}

// 👑 管理员强制删评
export const deleteCommentByAdminAPI = (id) => {
    return request.delete(`/comment/admin/delete?id=${id}`)
}