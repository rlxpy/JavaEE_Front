<template>
  <div class="messages-container">
    <div class="message-card">
      <div class="card-header">
        <div class="header-left">
          <el-icon class="header-icon"><BellFilled /></el-icon>
          <span class="title">我的消息中心</span>
        </div>
        <el-button type="primary" round plain class="mark-read-btn" @click="handleMarkAllRead" :disabled="globalUnreadCount === 0">
          <el-icon><Check /></el-icon> 一键已读
        </el-button>
      </div>

      <div class="msg-filter-bar">
        <el-tabs v-model="queryParams.type" @tab-change="handleSearch" class="custom-tabs">
          <el-tab-pane name="">
            <template #label><el-icon><Menu /></el-icon> 全部消息</template>
          </el-tab-pane>
          <el-tab-pane :name="3">
            <template #label><el-icon><ChatDotRound /></el-icon> 评论与回复</template>
          </el-tab-pane>
          <el-tab-pane :name="1">
            <template #label><el-icon><Pointer /></el-icon> 收到的赞</template>
          </el-tab-pane>
          <el-tab-pane :name="2">
            <template #label><el-icon><Star /></el-icon> 收藏通知</template>
          </el-tab-pane>
          <el-tab-pane :name="4">
            <template #label><el-icon><Warning /></el-icon> 系统通知</template>
          </el-tab-pane>
        </el-tabs>
      </div>

      <el-empty v-if="messages.length === 0" description="消息列表空空如也，快去社区逛逛吧！" />

      <div class="message-list" v-else v-loading="loading">
        <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-item"
            :class="[
              msg.isRead === 0 ? 'unread-item' : '',
              msg.type === 4 ? 'system-item' : ''
            ]"
            @click="goToDetail(msg)"
        >
          <div class="unread-dot" v-if="msg.isRead === 0"></div>

          <div v-if="msg.type === 4" class="icon-avatar system-avatar">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div v-else-if="msg.type === 1" class="icon-avatar like-avatar">
            <el-icon><Pointer /></el-icon>
          </div>
          <div v-else-if="msg.type === 2" class="icon-avatar fav-avatar">
            <el-icon><StarFilled /></el-icon>
          </div>
          <el-avatar v-else :size="48" :src="msg.senderAvatar" class="sender-avatar">
            {{ msg.senderNickname?.charAt(0) }}
          </el-avatar>

          <div class="message-content">
            <div class="message-top">
              <span class="sender-name" :class="getSenderColorClass(msg.type)">
                {{ msg.type === 4 ? '社区管家' : msg.senderNickname }}
              </span>

              <el-tag v-if="msg.type === 4" type="danger" effect="light" size="small" round class="official-tag">官方</el-tag>

              <span class="action-text" v-if="msg.type !== 4">
                {{ msg.type === 1 ? '赞了你的内容' : msg.type === 2 ? '收藏了你的游戏' : msg.type === 3 ? '回复了你：' : '' }}
              </span>

              <span class="time">{{ new Date(msg.createTime).toLocaleString() }}</span>
            </div>

            <div class="message-preview" v-if="msg.content" :class="getPreviewColorClass(msg.type)">
              <span class="quote-bar" :class="getQuoteBarClass(msg.type)"></span>
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="total > 0" class="pagination-box">
        <el-pagination
            background
            layout="total, prev, pager, next"
            :total="total"
            :page-size="queryParams.size"
            v-model:current-page="queryParams.page"
            @current-change="handlePageChange"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { BellFilled, Check, Menu, ChatDotRound, Pointer, Star, Warning, WarningFilled, StarFilled } from '@element-plus/icons-vue'
import { globalUnreadCount, setUnreadCount } from '@/store/messageStore.js'

const router = useRouter()
const messages = ref([])
const total = ref(0)
const loading = ref(false)

const queryParams = reactive({
  page: 1,
  size: 10,
  type: ''
})

onMounted(() => {
  fetchMessages()
})

const fetchMessages = async () => {
  loading.value = true
  try {
    let url = `/notification/page?page=${queryParams.page}&size=${queryParams.size}`
    if (queryParams.type !== '') {
      url += `&type=${queryParams.type}`
    }

    const res = await request.get(url)
    if (res.code === 200) {
      messages.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取消息失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchMessages()
}

const handlePageChange = (page) => {
  queryParams.page = page
  fetchMessages()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleMarkAllRead = async () => {
  try {
    const res = await request.post('/notification/readAll')
    if (res.code === 200) {
      ElMessage.success('已全部标记为已读')
      messages.value.forEach(m => m.isRead = 1)
      setUnreadCount(0)
    }
  } catch (error) {}
}

const goToDetail = async (msg) => {
  if (msg.type === 4) {
    if (msg.isRead === 0) {
      try {
        await request.post(`/notification/read?id=${msg.id}`)
        msg.isRead = 1
        setUnreadCount(Math.max(0, globalUnreadCount.value - 1))
      } catch(e) {}
    }
    return
  }

  if (msg.referenceType === 'post' && msg.referenceId) {
    router.push(`/forum/detail/${msg.referenceId}`)
  } else if (msg.referenceType === 'game' && msg.referenceId) {
    router.push(`/game/detail/${msg.referenceId}`)
  }
}

// ================= 辅助函数：根据类型返回对应的色彩 Class =================
const getSenderColorClass = (type) => {
  switch(type) {
    case 4: return 'color-system';
    case 1: return 'color-like';
    case 2: return 'color-fav';
    default: return 'color-default';
  }
}

const getPreviewColorClass = (type) => {
  switch(type) {
    case 4: return 'bg-system';
    case 1: return 'bg-like';
    case 2: return 'bg-fav';
    default: return 'bg-default';
  }
}

const getQuoteBarClass = (type) => {
  switch(type) {
    case 4: return 'bar-system';
    case 1: return 'bar-like';
    case 2: return 'bar-fav';
    default: return 'bar-default';
  }
}
</script>

<style scoped>
.messages-container {
  display: flex;
  justify-content: center;
  padding: 20px 20px 40px;
}
.message-card {
  width: 100%;
  max-width: 900px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* ================= 1. 顶部操作栏 ================= */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid #f0f2f5;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-icon {
  font-size: 24px;
  color: #409eff;
}
.title {
  font-size: 20px;
  font-weight: 800;
  color: #2c3e50;
}
.mark-read-btn { font-weight: bold; }

/* ================= 2. 胶囊分类栏 ================= */
.msg-filter-bar {
  padding: 10px 30px 0;
}
:deep(.custom-tabs .el-tabs__nav-wrap::after) {
  height: 1px; /* 弱化底线 */
  background-color: #f0f2f5;
}
:deep(.custom-tabs .el-tabs__item) {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  height: 50px;
  line-height: 50px;
}
:deep(.custom-tabs .el-tabs__item.is-active) {
  color: #409eff;
}
:deep(.custom-tabs .el-icon) {
  margin-right: 4px;
  vertical-align: -2px;
}

/* ================= 3. 消息列表区 ================= */
.message-list {
  display: flex;
  flex-direction: column;
}
.message-item {
  display: flex;
  align-items: flex-start;
  padding: 25px 30px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}
.message-item:hover {
  background-color: #f8fafc;
}

/* ⭐️ 未读状态的高级展现：光晕红点与极浅蓝底 */
.unread-item {
  background-color: #f4f8ff;
}
.unread-dot {
  position: absolute;
  left: 12px;
  top: 40px;
  width: 8px;
  height: 8px;
  background-color: #f56c6c;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(245, 108, 108, 0.15);
}

.system-item { cursor: default; }

/* 左侧图标/头像区 */
.sender-avatar {
  margin-left: 5px;
  margin-right: 20px;
  border: 2px solid #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.icon-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  margin-left: 5px;
  margin-right: 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
/* 各种类型的专属底色 */
.system-avatar { background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%); }
.like-avatar { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
.fav-avatar { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }

.message-content { flex: 1; overflow: hidden; }
.message-top {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

/* 发件人名字的专属文字颜色 */
.sender-name { font-weight: 800; font-size: 15px; margin-right: 8px; }
.color-system { color: #e74c3c; }
.color-like { color: #d35400; }
.color-fav { color: #e84393; }
.color-default { color: #2c3e50; }

.official-tag { margin-right: 10px; border: none; font-weight: bold; }
.action-text { color: #64748b; font-size: 14px; margin-right: 15px; }
.time { color: #94a3b8; font-size: 13px; margin-left: auto; }

/* ⭐️ 高级引用块：根据类型变色的背景和竖条 */
.message-preview {
  position: relative;
  font-size: 14px;
  padding: 12px 16px 12px 20px;
  border-radius: 0 8px 8px 0;
  line-height: 1.6;
  color: #475569;
  display: inline-block;
  max-width: 100%;
  word-wrap: break-word;
}
.quote-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
}

/* 各种类型的专属背景与竖条颜色 */
.bg-system { background-color: #fff5f5; color: #c0392b; font-weight: 500;}
.bar-system { background-color: #ff7e5f; }

.bg-like { background-color: #fff8eb; }
.bar-like { background-color: #f6d365; }

.bg-fav { background-color: #fff0f5; }
.bar-fav { background-color: #ff9a9e; }

.bg-default { background-color: #f8fafc; }
.bar-default { background-color: #409eff; }


.pagination-box {
  margin: 30px 0 40px;
  display: flex;
  justify-content: center;
}
</style>