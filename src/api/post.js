//1. 引入我们刚才封装好的“智能对讲机”，而不是直接引原始的 axios
import request from '@/utils/request'

// 分页获取帖子列表 (⭐️ 增加 keyword 参数)
export const getPostsByPageAPI = (page, size, keyword = '') => {
    return request.get(`/post/page?page=${page}&size=${size}&keyword=${keyword}`)
}
// 发布新帖子
export const addPostAPI = (data) => {
    return request.post('/post/add', data)
}

// 获取单个帖子详情 (含发帖人信息)
export const getPostDetailAPI = (id) => {
    return request.get(`/post/detail/${id}`)
}

// 检查是否点赞
export const checkPostLikeAPI = (userId, postId) => {
    return request.get(`/post/like/check?userId=${userId}&postId=${postId}`)
}
// 切换点赞
export const togglePostLikeAPI = (userId, postId) => {
    return request.post(`/post/like/toggle?userId=${userId}&postId=${postId}`)
}

// 获取我的所有发帖 (增加 keyword 参数，默认是空字符串)
export const getMyPostsAPI = (userId, keyword = '') => {
    return request.get(`/post/user/${userId}?keyword=${keyword}`)
}

// 删除我的帖子
export const deleteMyPostAPI = (id, userId) => {
    return request.delete(`/post/delete?id=${id}&userId=${userId}`)
}

// 👑 管理员强制删帖
export const deletePostByAdminAPI = (id) => {
    return request.delete(`/post/admin/delete?id=${id}`)
}