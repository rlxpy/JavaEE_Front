<template>
  <div class="detail-container">
    <el-skeleton :rows="10" animated v-if="!gameInfo" />

    <el-card v-else class="box-card" shadow="never">
      <template #header>
        <el-page-header @back="goBack" title="返回游戏大厅">
          <template #content>
            <span class="text-large font-600 mr-3"> 游戏详情 </span>
          </template>
        </el-page-header>
      </template>

      <el-row :gutter="40" class="game-content">
        <el-col :span="8">
          <el-image
              :src="gameInfo.coverImage"
              class="detail-image"
              fit="cover"
              :preview-src-list="[gameInfo.coverImage]"
          />
        </el-col>

        <el-col :span="16">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <h1 class="game-title">{{ gameInfo.gameName }}</h1>

            <el-button
                v-if="user"
                :type="isFavorite ? 'danger' : 'warning'"
                :plain="!isFavorite"
                :icon="isFavorite ? 'StarFilled' : 'Star'"
                size="large"
                round
                @click="handleToggleFavorite"
            >
              {{ isFavorite ? '❤️ 已收藏' : '⭐ 加入收藏' }}
            </el-button>
          </div>

          <div class="rating-box">
            <span class="rating-text">玩家评分：</span>
            <el-rate
                v-model="gameInfo.averageRating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
            />
          </div>

          <el-descriptions title="基本信息" :column="1" border class="info-table">
            <el-descriptions-item label="发布时间">
              {{ new Date(gameInfo.createTime).toLocaleDateString() }}
            </el-descriptions-item>
            <el-descriptions-item label="游戏简介">
              {{ gameInfo.description }}
            </el-descriptions-item>
            <el-descriptions-item label="获取方式">
              <el-button type="success" tag="a" :href="gameInfo.downloadLink" target="_blank">
                前往下载页面
              </el-button>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>

      <el-divider content-position="center">玩家评论区</el-divider>
      <div v-if="user" class="comment-input-box">
        <h4>发表你的评价</h4>
        <el-rate v-model="newComment.rating" show-text :texts="['极差', '失望', '一般', '不错', '神作']" />
        <el-input
            v-model="newComment.content"
            type="textarea"
            :rows="3"
            placeholder="分享一下你的游戏体验吧..."
            style="margin: 15px 0"
        />
        <el-button type="primary" @click="submitComment">发表评论</el-button>
      </div>

      <div v-else class="login-tip">
        <el-alert
            title="想要分享你的游戏心得吗？请先登录后再发表评论哦！"
            type="info"
            center
            show-icon
            :closable="false"
        >
          <template #default>
            <el-button type="primary" link @click="router.push('/login')">去登录</el-button>
          </template>
        </el-alert>
      </div>

      <div class="comment-list">
        <el-empty v-if="comments.length === 0" description="暂无评论，快来抢沙发吧！" />

        <div v-for="item in comments" :key="item.id" class="comment-item">
          <el-avatar :src="item.avatar" :size="40">{{ item.nickname?.charAt(0) }}</el-avatar>
          <div class="comment-main">
            <div class="comment-header">
              <span class="comment-user">{{ item.nickname }}</span>
              <el-rate v-model="item.rating" disabled size="small" />
              <span class="comment-time">{{ new Date(item.createTime).toLocaleString() }}</span>
            </div>
            <p class="comment-content">{{ item.content }}</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGameDetailAPI } from '../api/game.js'
import { ElMessage } from 'element-plus'
import { getCommentsByGameAPI, addCommentAPI } from '../api/comment.js' // 引入 API
import { checkFavoriteAPI, toggleFavoriteAPI } from '../api/favorite.js'

const route = useRoute()   // 用来获取当前网址信息（拿 id）
const router = useRouter() // 用来做页面跳转（返回）

const user = ref(JSON.parse(localStorage.getItem('user')))

const gameInfo = ref(null)

const comments = ref([]) // 存放评论列表

const isFavorite = ref(false) // 记录当前是否已收藏

const newComment = reactive({
  rating: 5,
  content: ''
})

const fetchGameDetail = async (id) => {
  try {
    const res = await getGameDetailAPI(id)
    if (res.code === 200) {
      gameInfo.value = res.data
    } else {
      ElMessage.error(res.msg || '获取详情失败')
      router.push('/home') // 查不到就踢回大厅
    }
  } catch (error) {
    ElMessage.error('网络错误')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

const fetchComments = async (gameId) => {
  const res = await getCommentsByGameAPI(gameId)
  if (res.code === 200) {
    comments.value = res.data
  }
}

// 提交评论的函数
const submitComment = async () => {
  // 1. 获取当前登录用户信息 [cite: 53, 54]
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user) {
    ElMessage.error('请先登录后再评论哦！')
    return
  }

  // 2. 构造传给后端的对象 [cite: 75]
  const postData = {
    userId: user.id,
    gameId: route.params.id,
    content: newComment.content,
    rating: newComment.rating
  }

  // 3. 调用接口
  try {
    const res = await addCommentAPI(postData)
    if (res.code === 200) {
      ElMessage.success('评论发表成功！')
      newComment.content = '' // 清空输入框
      await fetchComments(route.params.id) // 刷新列表，看到自己的新评论
    }
  } catch (err) {
    ElMessage.error('发表失败，请稍后再试')
  }
}

//收藏游戏功能
// ⭐️ 规范化生命周期钩子（确保只保留这一个 onMounted！）
onMounted(async () => {
  const gameId = route.params.id
  // 1. 先拉取游戏详情和评论
  await fetchGameDetail(gameId)
  await fetchComments(gameId)

  // 2. ⭐️ 修复失忆症：如果用户存在，去后台查询他的收藏状态
  if (user.value && user.value.id) {
    await checkFavoriteStatus(user.value.id, gameId)
  }
})

// ⭐️ 检查收藏状态的逻辑
const checkFavoriteStatus = async (userId, gameId) => {
  try {
    const res = await checkFavoriteAPI(userId, gameId)
    if (res.code === 200) {
      // 如果后端查到了记录返回 true，这里就会把按钮变成红色！
      isFavorite.value = res.data
    }
  } catch (error) {
    console.error("查询收藏状态失败", error)
  }
}

// ⭐️点击爱心切换收藏
const handleToggleFavorite = async () => {
  if (!user.value) return
  try {
    const res = await toggleFavoriteAPI(user.value.id, route.params.id)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      // 核心：把后端返回的最新状态（true 或 false）赋给 isFavorite
      isFavorite.value = res.data
    }
  } catch (error) {
    ElMessage.error('网络错误，操作失败')
  }
}
</script>

<style scoped>
.detail-container {
  padding: 40px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
.box-card {
  max-width: 1000px;
  margin: 0 auto;
  border-radius: 12px;
}
.game-content {
  margin-top: 20px;
}
.detail-image {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.game-title {
  margin-top: 0;
  font-size: 28px;
  color: #303133;
}
.rating-box {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.rating-text {
  font-weight: bold;
  color: #606266;
  margin-right: 10px;
}
.info-table {
  margin-top: 20px;
}
.comment-input-box {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.comment-item {
  display: flex;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-main {
  margin-left: 15px;
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.comment-user {
  font-weight: bold;
  color: #409eff;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}
</style>