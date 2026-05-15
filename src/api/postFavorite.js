import request from '@/utils/request'

// 1. 检查当前帖子是否已收藏
export const checkPostFavoriteAPI = (postId) => {
    return request.get(`/post/favorite/check?postId=${postId}`)
}

// 2. 切换收藏状态（收藏/取消收藏）
export const togglePostFavoriteAPI = (postId) => {
    return request.post(`/post/favorite/toggle?postId=${postId}`)
}

// 3. 获取我的帖子收藏列表 (不需要传 userId，后端自己从 Token 里拿！)
export const getMyPostFavoritesAPI = () => {
    return request.get('/post/favorite/my')
}