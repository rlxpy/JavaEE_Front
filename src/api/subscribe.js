import request from '@/utils/request'

// 获取我关注的游戏
export const getMySubscribedGamesAPI = () => {
    return request.get('/subscribe/my')
}

// 切换关注状态
export const toggleSubscribeGameAPI = (gameId) => {
    return request.post(`/subscribe/toggle?gameId=${gameId}`)
}