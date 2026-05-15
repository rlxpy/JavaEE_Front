//1. 引入我们刚才封装好的“智能对讲机”，而不是直接引原始的 axios
import request from '@/utils/request'

// 分页获取帖子列表 (升级版参数)
// ⭐️ 加上 sortBy 参数，默认值为 'time'
export const getPostsByPageAPI = (page, size, keyword = '', categoryId = '', gameId = '', isFollowFeed = false, sortBy = 'time') => {
    let url = `/post/page?page=${page}&size=${size}&keyword=${keyword}&sortBy=${sortBy}`
    if (categoryId) url += `&categoryId=${categoryId}`
    if (gameId) url += `&gameId=${gameId}`
    if (isFollowFeed) url += `&isFollowFeed=true`
    return request.get(url)
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
export const checkPostLikeAPI = (postId) => {
    return request.get(`/post/like/check?postId=${postId}`)
}
// 切换点赞
export const togglePostLikeAPI = (postId) => {
    return request.post(`/post/like/toggle?postId=${postId}`)
}

// 获取我的所有发帖 (增加 keyword 参数，默认是空字符串)
export const getMyPostsAPI = ( keyword = '') => {
    return request.get(`/post/my?keyword=${keyword}`)
}

// 删除我的帖子
export const deleteMyPostAPI = (id, userId) => {
    return request.delete(`/post/delete?id=${id}`)
}

// 👑 管理员强制删帖
export const deletePostByAdminAPI = (id) => {
    return request.delete(`/post/admin/delete?id=${id}`)
}