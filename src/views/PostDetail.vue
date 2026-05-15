<template>
  <div class="post-detail-page-root">
    <div class="post-detail-container">

      <el-page-header @back="router.back()" title="返回" style="margin-bottom: 25px;">
        <template #content>
          <span class="header-title"> 帖子详情 </span>
        </template>
      </el-page-header>

      <el-skeleton :rows="10" animated v-if="!post" />

      <div v-else>
        <el-card class="post-main-card anime-card" shadow="never">
          <div class="author-info">
            <el-avatar :size="50" :src="post.avatar" class="anime-avatar">
              {{ post.nickname?.charAt(0) || '匿' }}
            </el-avatar>
            <div class="meta-info">
              <span class="nickname">{{ post.nickname || '匿名玩家' }} <el-tag size="small" effect="plain" round>楼主</el-tag></span>
              <span class="time">发布于：{{ new Date(post.createTime).toLocaleString() }}</span>
            </div>
          </div>

          <div class="post-title-row">
            <div class="title-left">
              <h1 class="post-title">{{ post.title }}</h1>
              <div v-if="post.gameName" class="game-tag-box">
                <el-tag
                    type="success"
                    effect="light"
                    class="game-link-tag"
                    @click="router.push(`/game/detail/${post.gameId}`)"
                >
                  🎮 所属游戏：{{ post.gameName }}
                </el-tag>
              </div>
            </div>

            <div class="action-buttons">
              <el-button
                  v-if="user"
                  :type="isFavorited ? 'warning' : 'default'"
                  :plain="!isFavorited"
                  :icon="isFavorited ? 'StarFilled' : 'Star'"
                  size="large"
                  round
                  @click="handleToggleFavorite"
              >
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>

              <el-button
                  v-if="user && isLiked"
                  type="primary"
                  icon="Pointer"
                  size="large"
                  round
                  @click="handleToggleLike"
              >
                👍 已赞 ({{ post.likeCount }})
              </el-button>

              <el-button
                  v-if="user && !isLiked"
                  type="default"
                  plain
                  icon="Pointer"
                  size="large"
                  round
                  @click="handleToggleLike"
              >
                👍 点赞 ({{ post.likeCount }})
              </el-button>
            </div>
          </div>

          <div class="view-count">
            👁️ 浏览量：{{ post.viewCount }}
          </div>

          <div class="post-content-wrapper">
            <div class="post-content" v-html="post.content"></div>
          </div>
        </el-card>

        <el-card class="comments-card anime-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="comment-total">全部回复 ({{ comments.length }})</span>
            </div>
          </template>

          <div v-if="user" class="reply-box">
            <el-input
                v-model="replyContent"
                type="textarea"
                :rows="4"
                placeholder="友善交流，畅所欲言..."
                class="anime-input"
            />
            <div class="reply-action">
              <el-button type="primary" class="shimmer-btn" size="large" @click="submitReply">发表回复</el-button>
            </div>
          </div>
          <div v-else class="login-tip">
            <el-alert title="想要参与讨论？请先登录哦！" type="info" center show-icon :closable="false">
              <template #default>
                <el-button type="primary" link @click="router.push('/login')">去登录</el-button>
              </template>
            </el-alert>
          </div>

          <el-divider />

          <el-empty v-if="comments.length === 0" description="还没人回复，快来抢沙发！" />

          <div class="comment-list">
            <div v-for="(item, index) in comments" :key="item.id" class="comment-item">
              <el-avatar :src="item.avatar" :size="45" class="anime-avatar">{{ item.nickname?.charAt(0) }}</el-avatar>
              <div class="comment-main">
                <div class="comment-header">
                  <span class="comment-user">{{ item.nickname }}</span>
                  <span class="floor-num">{{ index + 1 }} 楼</span>
                </div>
                <p class="comment-text">{{ item.content }}</p>
                <span class="comment-time">{{ new Date(item.createTime).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostDetailAPI, checkPostLikeAPI, togglePostLikeAPI } from '../api/post.js'
import { getCommentsByPostAPI, addCommentAPI } from '../api/comment.js'
import { checkPostFavoriteAPI, togglePostFavoriteAPI } from '../api/postFavorite.js'
import { ElMessage } from 'element-plus'


const route = useRoute()
const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user')))

const post = ref(null)
const comments = ref([])
const replyContent = ref('')

const isFavorited = ref(false)
const isLiked = ref(false)

const fetchPostDetail = async (postId) => {
  try {
    const res = await getPostDetailAPI(postId)
    if (res.code === 200) {
      post.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取帖子失败')
  }
}

onMounted(async () => {
  const postId = route.params.id
  await fetchPostDetail(postId)
  await fetchComments(postId)

  if (user.value && user.value.id) {
    const res = await checkPostLikeAPI(postId)
    if (res.code === 200) {
      isLiked.value = res.data
    }
    const favRes = await checkPostFavoriteAPI(postId)
    if (favRes.code === 200) isFavorited.value = favRes.data
  }
})

const handleToggleLike = async () => {
  if (!user.value) return
  try {
    const res = await togglePostLikeAPI(route.params.id)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      isLiked.value = res.data
      post.value.likeCount += (res.data ? 1 : -1)
    }
  } catch (error) {
    ElMessage.error('网络错误')
  }
}

const fetchComments = async (postId) => {
  const res = await getCommentsByPostAPI(postId)
  if (res.code === 200) {
    comments.value = res.data
  }
}

const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空哦')
    return
  }
  const postData = {
    userId: user.value.id,
    postId: route.params.id,
    content: replyContent.value,
    rating: 0
  }
  try {
    const res = await addCommentAPI(postData)
    if (res.code === 200) {
      ElMessage.success('回复成功！')
      replyContent.value = ''
      await fetchComments(route.params.id)
    } else {
      ElMessage.error(res.msg || '回复失败')
    }
  } catch (err) {
    ElMessage.error('网络或服务器异常')
  }
}

const handleToggleFavorite = async () => {
  if (!user.value) return
  try {
    const res = await togglePostFavoriteAPI(route.params.id)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      isFavorited.value = res.data
    }
  } catch (error) {
    ElMessage.error('网络错误')
  }
}
</script>

<style scoped>
/* ⭐️ 核心：页面根部，确保不穿底 */
.post-detail-page-root {
  padding: 30px 20px;
  min-height: calc(100vh - 60px);
}

/* ⭐️ 修复宽度：放宽到 1100px，并确保 width 为 100% */
.post-detail-container {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

.header-title {
  font-weight: bold;
  font-size: 18px;
}

/* ⭐️ 卡片统一样式 */
.anime-card {
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  margin-bottom: 25px;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f2f6;
}

.anime-avatar {
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.meta-info {
  margin-left: 15px;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-weight: 800;
  font-size: 17px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.time {
  font-size: 12px;
  color: #95a5a6;
  margin-top: 6px;
}

/* 标题行布局 */
.post-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 20px;
}

.title-left {
  flex: 1;
}

.post-title {
  font-size: 28px;
  font-weight: 900;
  color: #2c3e50;
  margin: 0 0 15px 0;
  line-height: 1.3;
}

.game-link-tag {
  cursor: pointer;
  font-weight: bold;
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.3s;
}
.game-link-tag:hover {
  transform: scale(1.05);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.view-count {
  color: #95a5a6;
  font-size: 14px;
  margin-bottom: 20px;
}

.post-content-wrapper {
  background: #fcfcfd;
  padding: 20px;
  border-radius: 15px;
}

.post-content {
  font-size: 17px;
  color: #34495e;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 评论区 */
.comment-total {
  font-weight: 800;
  font-size: 18px;
  color: #2c3e50;
}

.reply-box {
  margin-bottom: 20px;
}

.reply-action {
  text-align: right;
  margin-top: 15px;
}

.shimmer-btn {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 12px 30px;
  font-weight: bold;
}

:deep(.anime-input .el-textarea__inner) {
  border-radius: 15px;
  background-color: #f8faff;
  border: 1px solid #edf2f7;
  padding: 15px;
}

/* 评论项 */
.comment-item {
  display: flex;
  padding: 25px 0;
  border-bottom: 1px solid #f1f2f6;
}

.comment-main {
  margin-left: 15px;
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-user {
  font-weight: bold;
  color: #2c3e50;
}

.floor-num {
  font-size: 12px;
  color: #bdc3c7;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.comment-text {
  margin: 10px 0;
  color: #576574;
  line-height: 1.6;
  font-size: 15px;
}

.comment-time {
  font-size: 12px;
  color: #bdc3c7;
}
/* 确保富文本里的图片自适应宽度，不会超出边框 */
:deep(.post-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
}
</style>