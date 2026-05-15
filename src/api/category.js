import request from '@/utils/request'

// 获取所有分区列表
export const getCategoryListAPI = () => {
    return request.get('/category/list')
}