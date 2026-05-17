import request from '../utils/request'

// 检查当前用户是否点赞了某条评论
export const checkCommentLikeAPI = (commentId) => {
    return request.get(`/comment/like/check?commentId=${commentId}`)
}

// 切换点赞状态
export const toggleCommentLikeAPI = (commentId) => {
    return request.post(`/comment/like/toggle?commentId=${commentId}`)
}