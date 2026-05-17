import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request' // 确保你的 axios 请求工具路径正确

export const globalUnreadCount = ref(0)
let ws = null

// 从后端拉取真实的未读数量
export const fetchUnreadCount = async () => {
    try {
        const res = await request.get('/notification/unread')
        if (res.code === 200) {
            globalUnreadCount.value = res.data
        }
    } catch (error) {
        console.error('获取未读消息失败', error)
    }
}

// 建立全双工实时连接
export const initWebSocket = () => {
    const token = localStorage.getItem('token')
    // 如果没登录，或者已经连上了，就不管它
    if (!token || ws) return

    ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`)

    // ⭐️ 核心：监听到后端发来的 "NEW_MSG" 时，未读数 +1 并弹窗！
    ws.onmessage = (event) => {
        if (event.data === 'NEW_MSG') {
            globalUnreadCount.value++
            ElMessage.success({ message: '🔔 您有一条新的互动消息！', grouping: true })
        }
    }

    ws.onclose = () => { ws = null }
}

// 退出登录时切断连接
export const closeWebSocket = () => {
    if (ws) {
        ws.close()
        ws = null
    }
    globalUnreadCount.value = 0
}

export const setUnreadCount = (count) => {
    globalUnreadCount.value = count
}

// 减少未读数（预留给以后单条消息已读时使用）
export const decrementUnread = () => {
    if (globalUnreadCount.value > 0) {
        globalUnreadCount.value--
    }
}