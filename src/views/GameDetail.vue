<template>
  <div class="detail-container">
    <el-skeleton :rows="10" animated v-if="!gameInfo" />

    <div v-else class="game-detail-wrapper">
      <div class="page-header-nav">
        <el-page-header @back="goBack" title="返回大厅">
          <template #content>
            <span class="header-title">游戏详情</span>
          </template>
        </el-page-header>
      </div>

      <div class="game-hero-card">
        <el-row :gutter="40">
          <el-col :span="8">
            <div class="cover-wrapper">
              <el-image :src="gameInfo.coverImage" class="detail-image" fit="cover" :preview-src-list="[gameInfo.coverImage]" />
            </div>
          </el-col>

          <el-col :span="16" class="hero-right-info">
            <div class="hero-top">
              <h1 class="game-title">{{ gameInfo.gameName }}</h1>
              <div class="top-actions">
                <el-button v-if="user" :type="isFavorite ? 'warning' : 'default'" :plain="!isFavorite" round class="action-btn" @click="handleToggleFavorite">
                  <el-icon style="margin-right: 4px;"><StarFilled v-if="isFavorite"/><Star v-else/></el-icon>
                  {{ isFavorite ? '已收藏' : '加入收藏' }}
                </el-button>
                <el-button v-if="user" type="info" link class="action-btn" @click="handleReport('game', route.params.id)">
                  <el-icon style="margin-right: 4px;"><Warning /></el-icon> 举报
                </el-button>
              </div>
            </div>

            <div class="rating-display">
              <div class="score-number">{{ gameInfo.averageRating ? gameInfo.averageRating.toFixed(1) : '0.0' }}</div>
              <div class="score-stars">
                <div class="score-label">玩家综合评分</div>
                <el-rate v-model="gameInfo.averageRating" disabled text-color="#ff9900" />
              </div>
            </div>

            <div class="meta-info-list">
              <div class="meta-item">
                <span class="meta-label">发布时间</span>
                <span class="meta-value">{{ new Date(gameInfo.createTime).toLocaleDateString() }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">游戏简介</span>
                <span class="meta-value desc-text">{{ gameInfo.description }}</span>
              </div>
            </div>

            <div class="download-section">
              <el-button type="primary" round class="shimmer-btn download-btn" tag="a" :href="gameInfo.downloadLink" target="_blank">
                <el-icon style="margin-right: 8px;"><Download /></el-icon> 前往下载页面
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="section-divider">
        <span class="divider-text">玩家评论区 ({{ comments.length }})</span>
      </div>

      <div v-if="user && activeReplyId === null" class="comment-input-box">
        <div class="input-header">
          <span class="input-title">发表你的游玩评价</span>
          <el-rate v-model="newComment.rating" show-text :texts="['极差', '失望', '一般', '不错', '神作']" />
        </div>
        <el-input
            v-model="newComment.content"
            type="textarea"
            :rows="3"
            placeholder="分享一下你的游戏体验吧..."
            class="custom-textarea"
        />
        <div class="input-footer">
          <el-button type="primary" round class="shimmer-btn submit-btn" @click="submitComment">发表评价</el-button>
        </div>
      </div>

      <div v-if="user && activeReplyId !== null" class="cancel-reply-box">
        <el-button type="info" plain round @click="resetReplyTarget" class="cancel-btn">
          取消局部回复，回到针对游戏本体发表评价
        </el-button>
      </div>

      <div v-if="!user" class="login-tip">
        <el-alert title="想要分享你的游戏心得吗？请先登录后再发表评论哦！" type="info" center show-icon :closable="false" class="custom-alert">
          <template #default><el-button type="primary" link @click="router.push('/login')">去登录</el-button></template>
        </el-alert>
      </div>

      <div class="comment-list">
        <el-empty v-if="comments.length === 0" description="暂无评价，快来抢沙发吧！" />

        <div v-for="(item, index) in comments" :key="item.id" class="comment-card">
          <el-avatar :src="item.avatar" :size="48" class="user-avatar">{{ item.nickname?.charAt(0) }}</el-avatar>
          <div class="comment-main">
            <div class="comment-header">
              <span class="comment-user">{{ item.nickname }}</span>
              <el-rate v-model="item.rating" disabled size="small" />
            </div>
            <p class="comment-content">{{ item.content }}</p>

            <div class="comment-footer">
              <span class="comment-time">{{ new Date(item.createTime).toLocaleString() }}</span>

              <div class="action-buttons" v-if="item.content !== '🚫 该评论已被作者删除'">
                <el-button v-if="user && user.id === item.userId" link type="danger" size="small" @click="handleDelete(item.id)" class="hover-btn">
                  <el-icon><Delete /></el-icon> <span>删除</span>
                </el-button>
                <el-button link type="info" size="small" @click="handleReport('comment', item.id)" class="hover-btn">
                  <el-icon><Warning /></el-icon> <span>举报</span>
                </el-button>
                <el-button link :type="item.isLiked ? 'primary' : 'info'" size="small" @click="handleToggleLike(item)" class="action-icon-btn">
                  <el-icon><Pointer /></el-icon> <span>{{ item.likeCount > 0 ? item.likeCount : '点赞' }}</span>
                </el-button>
                <el-button link type="info" size="small" @click="handleReply(item.id, item.id, item.nickname)" class="action-icon-btn">
                  <el-icon><ChatLineRound /></el-icon> <span>回复</span>
                </el-button>
              </div>
            </div>

            <div v-if="activeReplyId === item.id" class="inline-reply-box">
              <el-input v-model="newComment.content" type="textarea" :rows="2" :placeholder="`回复 @${currentReply.replyToNickname}：`" class="custom-textarea" />
              <div class="inline-reply-actions">
                <el-button size="small" round @click="resetReplyTarget">取消</el-button>
                <el-button type="primary" size="small" round @click="submitComment">发送</el-button>
              </div>
            </div>

            <div v-if="item.children && item.children.length > 0" class="sub-comments-wrapper">
              <div v-for="subItem in item.children.slice(0, item.visibleCount)" :key="subItem.id" class="sub-comment-item">
                <div class="sub-comment-content">
                  <el-avatar :size="24" :src="subItem.avatar" class="sub-avatar">{{ subItem.nickname?.charAt(0) }}</el-avatar>
                  <span class="sub-nickname">{{ subItem.nickname }}</span>
                  <span v-if="subItem.replyToNickname" class="reply-target"> 回复 <span class="highlight-name">@{{ subItem.replyToNickname }}</span>：</span>
                  <span v-else class="reply-target">：</span>
                  <span class="sub-text">{{ subItem.content }}</span>
                </div>

                <div class="sub-comment-footer">
                  <span class="comment-time">{{ new Date(subItem.createTime).toLocaleString() }}</span>
                  <div class="action-buttons" v-if="subItem.content !== '🚫 该评论已被作者删除'">
                    <el-button v-if="user && user.id === subItem.userId" link type="danger" size="small" @click="handleDelete(subItem.id)" class="hover-btn">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                    <el-button link type="info" size="small" @click="handleReport('comment', subItem.id)" class="hover-btn">
                      <el-icon><Warning /></el-icon>
                    </el-button>
                    <el-button link :type="subItem.isLiked ? 'primary' : 'info'" size="small" @click="handleToggleLike(subItem)" class="action-icon-btn">
                      <el-icon><Pointer /></el-icon> {{ subItem.likeCount > 0 ? subItem.likeCount : '' }}
                    </el-button>
                    <el-button link type="info" size="small" @click="handleReply(item.id, subItem.id, subItem.nickname)" class="action-icon-btn">
                      <el-icon><ChatLineRound /></el-icon>
                    </el-button>
                  </div>
                </div>

                <div v-if="activeReplyId === subItem.id" class="inline-reply-box">
                  <el-input v-model="newComment.content" type="textarea" :rows="2" :placeholder="`回复 @${currentReply.replyToNickname}：`" class="custom-textarea" />
                  <div class="inline-reply-actions">
                    <el-button size="small" round @click="resetReplyTarget">取消</el-button>
                    <el-button type="primary" size="small" round @click="submitComment">发送</el-button>
                  </div>
                </div>
              </div>

              <div v-if="item.children.length > item.visibleCount" class="expand-more-box">
                <el-button link type="primary" @click="handleExpandReplies(item)" class="expand-btn">
                  <span v-if="item.visibleCount === 2">展开剩余 {{ item.children.length - 2 }} 条回复 ▾</span>
                  <span v-else>展开更多回复 ▾</span>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="reportDialogVisible" title="填写举报信息" width="400px" center class="custom-dialog">
      <div style="margin-bottom: 15px; color: #606266;">请选择您要举报的原因：</div>
      <el-radio-group v-model="reportForm.reason" class="report-radio-group">
        <el-radio label="广告引流、垃圾营销" size="large">广告引流、垃圾营销</el-radio>
        <el-radio label="色情低俗、血腥暴力" size="large">色情低俗、血腥暴力</el-radio>
        <el-radio label="恶意辱骂、人身攻击" size="large">恶意辱骂、人身攻击</el-radio>
        <el-radio label="抄袭侵权、盗版游戏" size="large">抄袭侵权、盗版游戏</el-radio>
        <el-radio label="其他违规内容" size="large">其他违规内容</el-radio>
      </el-radio-group>
      <div style="margin-top: 20px;">
        <el-input v-model="reportForm.details" type="textarea" :rows="3" maxlength="100" show-word-limit placeholder="请详细描述违规情况以供核实（选填，最多100字）" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reportDialogVisible = false" round>取消</el-button>
          <el-button type="danger" @click="submitReport" round>确认举报</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// ⭐️ 引入所有高级替换 Icon
import { Star, StarFilled, Warning, Delete, Pointer, ChatLineRound, Download } from '@element-plus/icons-vue'
import { getGameDetailAPI } from '../api/game.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCommentsByGameAPI, addCommentAPI } from '../api/comment.js'
import { checkFavoriteAPI, toggleFavoriteAPI } from '../api/favorite.js'
import { checkCommentLikeAPI, toggleCommentLikeAPI } from '../api/commentLike.js'
import { deleteMyCommentAPI } from '../api/comment.js'
import { submitReportAPI } from '../api/report.js'

const route = useRoute()
const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user')))
const gameInfo = ref(null)
const comments = ref([])
const isFavorite = ref(false)

const newComment = reactive({
  rating: 5,
  content: ''
})

const activeReplyId = ref(null)
const currentReply = reactive({
  rootId: null,
  replyToNickname: null
})

const reportDialogVisible = ref(false)
const reportForm = reactive({
  targetType: '',
  targetId: null,
  reason: '',
  details: ''
})

const fetchGameDetail = async (id) => {
  try {
    const res = await getGameDetailAPI(id)
    if (res.code === 200) gameInfo.value = res.data
    else { ElMessage.error(res.msg); router.push('/home') }
  } catch (error) { ElMessage.error('网络错误') }
}

const initCommentsLikeStatus = async (commentList) => {
  if (!user.value) return

  for (let comment of commentList) {
    if (comment.likeCount === undefined) comment.likeCount = 0

    try {
      const res = await checkCommentLikeAPI(comment.id)
      if (res.code === 200) {
        comment.isLiked = res.data
      }
    } catch (e) {}

    if (comment.children && comment.children.length > 0) {
      await initCommentsLikeStatus(comment.children)
    }
  }
}

const fetchComments = async (gameId, expandedRootId = null) => {
  const stateMap = {}
  comments.value.forEach(item => {
    stateMap[item.id] = item.visibleCount
  })

  const res = await getCommentsByGameAPI(gameId)
  if (res.code === 200) {
    res.data.forEach(item => {
      if (expandedRootId === item.id) {
        item.visibleCount = item.children ? item.children.length : 2
      } else {
        item.visibleCount = stateMap[item.id] || 2
      }
    })
    comments.value = res.data
    await initCommentsLikeStatus(comments.value)
  }
}

const handleExpandReplies = (item) => {
  item.visibleCount += 5
}

onMounted(async () => {
  window.scrollTo(0, 0)
  const gameId = route.params.id
  await fetchGameDetail(gameId)
  await fetchComments(gameId)
  if (user.value && user.value.id) await checkFavoriteStatus(user.value.id, gameId)
})

const handleReply = (rootId, commentId, nickname) => {
  if (!user.value) { ElMessage.warning('请先登录哦！'); return }
  if (activeReplyId.value === commentId) {
    resetReplyTarget()
  } else {
    activeReplyId.value = commentId
    currentReply.rootId = rootId
    currentReply.replyToNickname = nickname
    newComment.content = ''
  }
}

const resetReplyTarget = () => {
  activeReplyId.value = null
  currentReply.rootId = null
  currentReply.replyToNickname = null
  newComment.content = ''
}

const handleToggleLike = async (comment) => {
  if (!user.value) {
    ElMessage.warning('请先登录后才能点赞哦！')
    return
  }
  try {
    const res = await toggleCommentLikeAPI(comment.id)
    if (res.code === 200) {
      comment.isLiked = res.data
      if (comment.isLiked) {
        comment.likeCount = (comment.likeCount || 0) + 1
      } else {
        comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1)
      }
    }
  } catch (error) {
    ElMessage.error('网络异常，点赞失败')
  }
}

const checkFavoriteStatus = async (userId, gameId) => {
  try {
    const res = await checkFavoriteAPI(userId, gameId)
    if (res.code === 200) isFavorite.value = res.data
  } catch (error) {}
}

const handleToggleFavorite = async () => {
  if (!user.value) return
  try {
    const res = await toggleFavoriteAPI(user.value.id, route.params.id)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      isFavorite.value = res.data
    }
  } catch (error) { ElMessage.error('网络错误') }
}

const goBack = () => router.back()

const submitComment = async () => {
  if (!user.value) { ElMessage.error('请先登录后再评论哦！'); return }
  if (!newComment.content.trim()) { ElMessage.warning('内容不能为空！'); return }

  const postData = {
    userId: user.value.id,
    gameId: route.params.id,
    content: newComment.content,
    rating: currentReply.rootId ? 0 : newComment.rating,
    parentId: currentReply.rootId,
    replyToNickname: currentReply.replyToNickname
  }

  try {
    const res = await addCommentAPI(postData)
    if (res.code === 200) {
      ElMessage.success('发送成功！')
      const targetRootId = currentReply.rootId
      resetReplyTarget()
      await fetchComments(route.params.id, targetRootId)
    } else {
      ElMessage.error(res.msg || '发表失败')
    }
  } catch (err) { ElMessage.error('网络异常，发表失败') }
}

const handleDelete = async (commentId) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除这条评论吗？删除后不可恢复哦。',
        '删除确认',
        { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await deleteMyCommentAPI(commentId)
    if (res.code === 200) {
      ElMessage.success('评论已删除')
      await fetchComments(route.params.id)
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('网络异常，删除失败')
  }
}

const handleReport = (type, id) => {
  if (!user.value) { ElMessage.warning('请先登录后再进行举报哦！'); return }
  reportForm.targetType = type
  reportForm.targetId = id
  reportForm.reason = ''
  reportForm.details = ''
  reportDialogVisible.value = true
}

const submitReport = async () => {
  if (!reportForm.reason) {
    ElMessage.warning('请选择一个举报原因！')
    return
  }
  const finalReason = reportForm.details.trim()
      ? `【${reportForm.reason}】 ${reportForm.details.trim()}`
      : `【${reportForm.reason}】`

  const postData = {
    targetType: reportForm.targetType,
    targetId: reportForm.targetId,
    reason: finalReason
  }

  try {
    const res = await submitReportAPI(postData)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      reportDialogVisible.value = false
    } else {
      ElMessage.error(res.msg || '举报失败')
    }
  } catch (error) {
    ElMessage.error('网络异常，举报失败')
  }
}
</script>

<style scoped>
/* ================= 骨架与全局容器 ================= */
.detail-container {
  padding: 40px 20px;
  background-color: #f4f7f9;
  min-height: calc(100vh - 64px);
}
.game-detail-wrapper {
  max-width: 1100px;
  margin: 0 auto;
}
.page-header-nav {
  margin-bottom: 25px;
}
.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

/* ================= 1. 沉浸式主视图 (Hero Box) ================= */
.game-hero-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.02);
  margin-bottom: 40px;
}
.cover-wrapper {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
.detail-image {
  width: 100%;
  height: 380px;
  display: block;
  transition: transform 0.4s ease;
}
.cover-wrapper:hover .detail-image {
  transform: scale(1.03); /* 微缩放特效 */
}

.hero-right-info {
  display: flex;
  flex-direction: column;
}
.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
}
.game-title {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
  color: #2c3e50;
  line-height: 1.2;
}
.top-actions {
  display: flex;
  gap: 12px;
}
.action-btn { font-weight: bold; }

/* 评分大屏展示 */
.rating-display {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  background: #f8fafc;
  padding: 15px 25px;
  border-radius: 16px;
  width: fit-content;
}
.score-number {
  font-size: 42px;
  font-weight: 900;
  color: #ff9900;
  line-height: 1;
}
.score-stars {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.score-label {
  font-size: 13px;
  color: #8a9bb1;
  font-weight: bold;
}

/* 极简无边框信息 */
.meta-info-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 35px;
  flex: 1;
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.meta-label {
  font-size: 13px;
  color: #8a9bb1;
  font-weight: bold;
}
.meta-value {
  font-size: 15px;
  color: #2c3e50;
  font-weight: 500;
}
.desc-text {
  line-height: 1.6;
  color: #5c6b77;
}

.download-section {
  margin-top: auto;
}
.download-btn {
  font-size: 16px;
  padding: 0 35px;
  height: 48px;
}

/* ================= 2. 交互区与输入箱 ================= */
.section-divider {
  display: flex;
  align-items: center;
  margin: 40px 0 30px;
}
.section-divider::before, .section-divider::after {
  content: ''; flex: 1; height: 1px; background: #e4e7ed;
}
.divider-text {
  padding: 0 20px; font-size: 20px; font-weight: bold; color: #2c3e50;
}

.comment-input-box {
  background: #ffffff;
  padding: 25px 30px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
  margin-bottom: 40px;
}
.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.input-title { font-size: 16px; font-weight: bold; color: #2c3e50; }

:deep(.custom-textarea .el-textarea__inner) {
  background-color: #f4f6fc;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 15px;
  font-size: 15px;
  transition: all 0.3s;
}
:deep(.custom-textarea .el-textarea__inner:focus) {
  background-color: #ffffff;
  border-color: #a8edea;
  box-shadow: 0 0 0 4px rgba(168, 237, 234, 0.3);
}
.input-footer {
  text-align: right;
  margin-top: 15px;
}
.submit-btn { padding: 0 30px; }
.cancel-reply-box { margin-bottom: 30px; text-align: center; }
.cancel-btn { width: 100%; max-width: 400px; }
.custom-alert { border-radius: 12px; margin-bottom: 30px; }

/* ================= 3. 现代信息流卡片 ================= */
.comment-card {
  display: flex;
  background: #ffffff;
  padding: 25px 30px;
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
  transition: transform 0.3s ease;
}
.comment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.04);
}
.user-avatar {
  border: 2px solid #f4f6fc;
  margin-right: 20px;
}
.comment-main { flex: 1; overflow: hidden; }
.comment-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
}
.comment-user { font-weight: 800; font-size: 15px; color: #2c3e50; }
.comment-content {
  margin: 10px 0; color: #475569; line-height: 1.6; font-size: 15px;
}
.comment-footer {
  display: flex; justify-content: space-between; align-items: center; margin-top: 15px;
}
.comment-time { font-size: 12px; color: #94a3b8; }

/* ⭐️ 操作按钮图标化与悬浮渐现 */
.action-buttons {
  display: flex; gap: 15px; align-items: center;
}
.action-icon-btn, .hover-btn {
  font-weight: 600; font-size: 13px; color: #64748b;
}
.action-icon-btn .el-icon, .hover-btn .el-icon {
  font-size: 16px; margin-right: 4px;
}
/* 鼠标没悬浮在当前楼层时，隐藏举报和删除按钮以保持界面干净 */
.hover-btn { opacity: 0; transition: opacity 0.3s; }
.comment-card:hover .hover-btn, .sub-comment-item:hover .hover-btn { opacity: 1; }

/* ================= 楼中楼 ================= */
.sub-comments-wrapper {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 15px 20px;
  margin-top: 15px;
}
.sub-comment-item {
  padding: 12px 0;
  border-bottom: 1px dashed #e2e8f0;
}
.sub-comment-item:last-child { border-bottom: none; padding-bottom: 0; }
.sub-comment-content {
  display: flex; align-items: center; flex-wrap: wrap; line-height: 1.6; margin-bottom: 6px;
}
.sub-avatar { margin-right: 8px; }
.sub-nickname { font-weight: bold; color: #334155; font-size: 13px; margin-right: 5px; }
.reply-target { color: #64748b; font-size: 13px; margin-right: 5px; }
.highlight-name { color: #409eff; font-weight: bold; }
.sub-text { font-size: 14px; color: #475569; word-break: break-all; }
.sub-comment-footer {
  display: flex; align-items: center; justify-content: space-between; padding-left: 32px;
}

/* 局部回复框 */
.inline-reply-box {
  margin-top: 15px;
}
.inline-reply-actions {
  text-align: right; margin-top: 10px;
}
.expand-more-box {
  margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;
}
.expand-btn { font-weight: bold; font-size: 13px; }

/* 流光按钮特效 */
.shimmer-btn { position: relative; overflow: hidden; border: none; background: linear-gradient(90deg, #409eff 0%, #7367f0 100%); }
.shimmer-btn::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
  background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }
</style>