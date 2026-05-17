import request from '@/utils/request' // 确保路径正确

// 提交举报
export const submitReportAPI = (data) => {
    return request.post('/report/submit', data)
}

// 获取举报列表 (带分页和状态筛选)
export const getAdminReportListAPI = (params) => {
    return request.get('/report/admin/list', { params })
}

// 处理举报 (action: 1=清理并警告, 2=驳回)
// 因为后端用的是 @RequestParam，所以参数拼在 URL 上，或者用 URLSearchParams
// 处理举报 (升级版：支持传自定义警告语)
export const processReportAPI = (reportId, action, customMessage = '') => {
    return request.post('/report/admin/process', null, {
        params: {
            reportId,
            action,
            customMessage // ⭐️ 新增参数
        }
    })
}