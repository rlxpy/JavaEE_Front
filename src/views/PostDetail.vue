<template>
  <div class="post-detail-page-root">
    <div class="post-detail-container">

      <div class="page-header-nav">
        <el-page-header @back="router.back()" title="返回社区">
          <template #content>
            <span class="header-title">帖子详情</span>
          </template>
        </el-page-header>
      </div>

      <el-skeleton :rows="10" animated v-if="!post" />

      <div v-else>
        <div class="post-hero-card">
          <div class="author-info">
            <el-avatar :size="56" :src="post.avatar" class="author-avatar">
              {{ post.nickname?.charAt(0) || '匿' }}
            </el-avatar>
            <div class="meta-info">
              <div class="name-row">
                <span class="nickname">{{ post.nickname || '匿名玩家' }}</span>
                <el-tag size="small" effect="light" round class="author-tag">楼主</el-tag>
              </div>
              <span class="time">发布于 {{ new Date(post.createTime).toLocaleString() }}</span>
            </div>
            <div class="view-badge">
              <el-icon><View /></el-icon>
              <span>{{ post.viewCount || 0 }} 浏览</span>
            </div>
          </div>

          <div class="post-title-row">
            <div class="title-left">
              <h1 class="post-title">{{ post.title }}</h1>
              <div v-if="post.gameName" class="game-tag-box">
                <el-tag type="primary" effect="plain" round class="game-link-tag" @click="router.push(`/game/detail/${post.gameId}`)">
                  <el-icon style="margin-right: 4px;"><Monitor /></el-icon> {{ post.gameName }}
                </el-tag>
              </div>
            </div>

            <div class="action-buttons-top">
              <el-button v-if="user" :type="isFavorited ? 'warning' : 'default'" :plain="!isFavorited" round class="action-btn" @click="handleToggleFavorite">
                <el-icon style="margin-right: 4px;"><StarFilled v-if="isFavorited"/><Star v-else/></el-icon>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
              <el-button v-if="user" :type="isLiked ? 'primary' : 'default'" :plain="!isLiked" round class="action-btn" @click="handleToggleLike">
                <el-icon style="margin-right: 4px;"><Pointer /></el-icon>
                {{ isLiked ? '已赞' : '点赞' }} {{ post.likeCount > 0 ? `(${post.likeCount})` : '' }}
              </el-button>
              <el-button v-if="user" type="info" link class="action-btn" @click="handleReport('post', route.params.id)">
                <el-icon style="margin-right: 4px;"><Warning /></el-icon> 举报
              </el-button>
            </div>
          </div>

          <div class="post-content-wrapper">
            <div class="post-content" v-html="post.content"></div>
          </div>
        </div>

        <div class="section-divider">
          <span class="divider-text">全部回复 ({{ comments.length }})</span>
        </div>

        <div v-if="user && activeReplyId === null" class="comment-input-box">
          <div class="input-header">
            <span class="input-title">参与讨论</span>
          </div>
          <el-input
              v-model="replyContent"
              type="textarea"
              :rows="4"
              placeholder="发表一条友善的评论..."
              class="custom-textarea"
          />
          <div class="upload-area" style="margin-top: 15px;">
            <el-upload
                action="http://localhost:8080/file/upload"
                list-type="picture-card"
                :headers="uploadHeaders"
                v-model:file-list="fileList"
                :on-success="handleUploadSuccess"
                :on-exceed="handleExceed"
                :before-upload="beforeUpload"
                :limit="9"
                multiple
                class="modern-upload"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
          <div class="input-footer">
            <el-button type="primary" round class="shimmer-btn submit-btn" @click="submitReply">发布回复</el-button>
          </div>
        </div>

        <div v-if="user && activeReplyId !== null" class="cancel-reply-box">
          <el-button type="info" plain round @click="resetReplyTarget" class="cancel-btn">
            取消局部回复，回到针对帖子发表评论
          </el-button>
        </div>

        <div v-if="!user" class="login-tip">
          <el-alert title="想要参与讨论？请先登录哦！" type="info" center show-icon :closable="false" class="custom-alert">
            <template #default><el-button type="primary" link @click="router.push('/login')">去登录</el-button></template>
          </el-alert>
        </div>

        <div class="comment-list">
          <el-empty v-if="comments.length === 0" description="还没人回复，快来抢沙发！" />

          <div v-for="(item, index) in comments" :key="item.id" class="comment-card">
            <el-avatar :src="item.avatar" :size="48" class="user-avatar">{{ item.nickname?.charAt(0) }}</el-avatar>

            <div class="comment-main">
              <div class="comment-header">
                <span class="comment-user">{{ item.nickname }}</span>
                <span class="floor-num"># {{ index + 1 }}</span>
              </div>
              <p class="comment-text">{{ item.content }}</p>

              <div v-if="item.imageUrls" class="image-grid">
                <el-image
                    v-for="(imgUrl, imgIndex) in item.imageUrls.split(',')"
                    :key="imgIndex" :src="imgUrl" :preview-src-list="item.imageUrls.split(',')"
                    :initial-index="imgIndex" fit="cover" class="grid-image" lazy preview-teleported
                />
              </div>

              <div class="comment-footer">
                <span class="comment-time">{{ new Date(item.createTime).toLocaleString() }}</span>

                <div class="action-buttons" v-if="item.content !== '🚫 该评论已被作者删除'">
                  <el-button v-if="user && user.id === item.userId" link type="danger" size="small" @click="handleDelete(item.id)" class="hover-btn">
                    <el-icon><Delete /></el-icon> <span>删除</span>
                  </el-button>
                  <el-button link type="info" size="small" @click="handleReport('comment', item.id)" class="hover-btn">
                    <el-icon><Warning /></el-icon> <span>举报</span>
                  </el-button>
                  <el-button link :type="item.isLiked ? 'primary' : 'info'" size="small" @click="handleToggleCommentLike(item)" class="action-icon-btn">
                    <el-icon><Pointer /></el-icon> <span>{{ item.likeCount > 0 ? item.likeCount : '点赞' }}</span>
                  </el-button>
                  <el-button link type="info" size="small" @click="handleReply(item.id, item.id, item.nickname)" class="action-icon-btn">
                    <el-icon><ChatLineRound /></el-icon> <span>回复</span>
                  </el-button>
                </div>
              </div>

              <div v-if="activeReplyId === item.id" class="inline-reply-box">
                <el-input v-model="replyContent" type="textarea" :rows="2" :placeholder="`回复 @${currentReply.replyToNickname}：`" class="custom-textarea" />
                <div class="inline-reply-actions">
                  <el-button size="small" round @click="resetReplyTarget">取消</el-button>
                  <el-button type="primary" size="small" round @click="submitReply">发送</el-button>
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
                      <el-button link :type="subItem.isLiked ? 'primary' : 'info'" size="small" @click="handleToggleCommentLike(subItem)" class="action-icon-btn">
                        <el-icon><Pointer /></el-icon> {{ subItem.likeCount > 0 ? subItem.likeCount : '' }}
                      </el-button>
                      <el-button link type="info" size="small" @click="handleReply(item.id, subItem.id, subItem.nickname)" class="action-icon-btn">
                        <el-icon><ChatLineRound /></el-icon>
                      </el-button>
                    </div>
                  </div>

                  <div v-if="activeReplyId === subItem.id" class="inline-reply-box">
                    <el-input v-model="replyContent" type="textarea" :rows="2" :placeholder="`回复 @${currentReply.replyToNickname}：`" class="custom-textarea" />
                    <div class="inline-reply-actions">
                      <el-button size="small" round @click="resetReplyTarget">取消</el-button>
                      <el-button type="primary" size="small" round @click="submitReply">发送</el-button>
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
    </div>

    <el-dialog v-model="reportDialogVisible" title="填写举报信息" width="400px" center class="custom-dialog">
      <div style="margin-bottom: 15px; color: #606266;">请选择您要举报的原因：</div>
      <el-radio-group v-model="reportForm.reason" class="report-radio-group">
        <el-radio label="广告引流、垃圾营销" size="large">广告引流、垃圾营销</el-radio>
        <el-radio label="色情低俗、血腥暴力" size="large">色情低俗、血腥暴力</el-radio>
        <el-radio label="恶意辱骂、人身攻击" size="large">恶意辱骂、人身攻击</el-radio>
        <el-radio label="抄袭侵权、盗版搬运" size="large">抄袭侵权、盗版搬运</el-radio>
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// ⭐️ 引入全部专业 Icon
import { Star, StarFilled, Warning, Pointer, View, Delete, ChatLineRound, Plus, Monitor } from '@element-plus/icons-vue'
import { getPostDetailAPI, checkPostLikeAPI, togglePostLikeAPI } from '../api/post.js'
import { getCommentsByPostAPI, addCommentAPI } from '../api/comment.js'
import { checkPostFavoriteAPI, togglePostFavoriteAPI } from '../api/postFavorite.js'
import { deleteMyCommentAPI } from '../api/comment.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { checkCommentLikeAPI, toggleCommentLikeAPI } from '../api/commentLike.js'
import { submitReportAPI } from '../api/report.js'

const route = useRoute()
const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user')))

const post = ref(null)
const comments = ref([])
const replyContent = ref('')

const isFavorited = ref(false)
const isLiked = ref(false)

const activeReplyId = ref(null)
const currentReply = reactive({
  rootId: null,
  replyToNickname: null
})

const fileList = ref([])
const uploadHeaders = ref({
  token: localStorage.getItem('token') || ''
})

const fetchPostDetail = async (postId) => {
  try {
    const res = await getPostDetailAPI(postId)
    if (res.code === 200) post.value = res.data
  } catch (error) { ElMessage.error('获取帖子失败') }
}

const reportDialogVisible = ref(false)
const reportForm = reactive({
  targetType: '',
  targetId: null,
  reason: '',
  details: ''
})

onMounted(async () => {
  window.scrollTo(0, 0)
  const postId = route.params.id
  await fetchPostDetail(postId)
  await fetchComments(postId)

  if (user.value && user.value.id) {
    const res = await checkPostLikeAPI(postId)
    if (res.code === 200) isLiked.value = res.data
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
  } catch (error) { ElMessage.error('网络错误') }
}

const fetchComments = async (postId, expandedRootId = null) => {
  const stateMap = {}
  comments.value.forEach(item => {
    stateMap[item.id] = item.visibleCount
  })

  const res = await getCommentsByPostAPI(postId)
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

const handleToggleCommentLike = async (comment) => {
  if (!user.value) {
    ElMessage.warning('想要给这条神评点赞？请先登录哦！')
    router.push('/login')
    return
  }
  try {
    const res = await toggleCommentLikeAPI(comment.id)
    if (res.code === 200) {
      comment.isLiked = res.data
      comment.likeCount = (comment.likeCount || 0) + (res.data ? 1 : -1)
      ElMessage.success(res.msg)
    }
  } catch (error) {}
}

const handleReply = (rootId, commentId, nickname) => {
  if (!user.value) {
    ElMessage.warning('请先登录才能参与互动哦！')
    return
  }
  if (activeReplyId.value === commentId) {
    resetReplyTarget()
  } else {
    activeReplyId.value = commentId
    currentReply.rootId = rootId
    currentReply.replyToNickname = nickname
    replyContent.value = ''
  }
}

const resetReplyTarget = () => {
  activeReplyId.value = null
  currentReply.rootId = null
  currentReply.replyToNickname = null
  replyContent.value = ''
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

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) ElMessage.error('只能上传图片文件！')
  if (!isLt5M) ElMessage.error('每张图片大小不能超过 5MB！')
  return isImage && isLt5M
}

const handleExceed = () => {
  ElMessage.warning('九宫格最多只能上传 9 张图片哦！')
}

const handleUploadSuccess = (res, file) => {
  if (res.code !== 200) {
    ElMessage.error(res.msg || '部分图片上传失败')
    fileList.value = fileList.value.filter(f => f.uid !== file.uid)
  }
}

const submitReply = async () => {
  if (!replyContent.value.trim() && fileList.value.length === 0) {
    ElMessage.warning('回复内容或图片不能都为空哦')
    return
  }

  const joinedImageUrls = fileList.value.map(file => {
    return file.response ? file.response.data : file.url
  }).join(',')

  const postData = {
    userId: user.value.id,
    postId: route.params.id,
    content: replyContent.value,
    rating: 0,
    imageUrls: joinedImageUrls,
    parentId: currentReply.rootId,
    replyToNickname: currentReply.replyToNickname
  }

  try {
    const res = await addCommentAPI(postData)
    if (res.code === 200) {
      ElMessage.success('回复成功！')
      const targetRootId = currentReply.rootId
      resetReplyTarget()
      fileList.value = []
      await fetchComments(route.params.id, targetRootId)
    } else {
      ElMessage.error(res.msg || '回复失败')
    }
  } catch (err) { ElMessage.error('网络异常') }
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

const initCommentsLikeStatus = async (commentsList) => {
  if (!user.value) return
  for (let item of commentsList) {
    try {
      const res = await checkCommentLikeAPI(item.id)
      if (res.code === 200) item.isLiked = res.data
    } catch (e) {}

    if (item.children && item.children.length > 0) {
      for (let sub of item.children) {
        try {
          const subRes = await checkCommentLikeAPI(sub.id)
          if (subRes.code === 200) sub.isLiked = subRes.data
        } catch (e) {}
      }
    }
  }
}
</script>

<style scoped>
/* ================= 骨架与全局容器 ================= */
.post-detail-page-root {
  padding: 40px 20px;
  background-color: #f4f7f9;
  min-height: calc(100vh - 64px);
}
.post-detail-container {
  max-width: 1000px; /* 帖子适合窄一点，阅读体验更好 */
  margin: 0 auto;
}
.page-header-nav { margin-bottom: 25px; }
.header-title { font-size: 18px; font-weight: bold; color: #2c3e50; }

/* ================= 1. 沉浸式主视图 ================= */
.post-hero-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.02);
  margin-bottom: 40px;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}
.author-avatar {
  border: 2px solid #f4f6fc;
  margin-right: 15px;
}
.meta-info {
  display: flex;
  flex-direction: column;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nickname {
  font-weight: 800;
  font-size: 16px;
  color: #2c3e50;
}
.author-tag {
  font-weight: bold;
}
.time {
  font-size: 13px;
  color: #8a9bb1;
  margin-top: 4px;
}
.view-badge {
  position: absolute;
  right: 0;
  top: 0;
  color: #8a9bb1;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  padding: 6px 12px;
  border-radius: 20px;
}

.post-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #f0f2f5;
}
.title-left { flex: 1; padding-right: 20px; }
.post-title {
  margin: 0 0 15px 0;
  font-size: 32px;
  font-weight: 900;
  color: #2c3e50;
  line-height: 1.3;
}
.game-link-tag {
  cursor: pointer;
  font-weight: bold;
  border: none;
  background-color: #eef2ff;
  transition: all 0.3s;
}
.game-link-tag:hover {
  background-color: #e0e7ff;
  transform: translateY(-1px);
}
.action-buttons-top {
  display: flex;
  gap: 12px;
  align-items: center;
}
.action-btn { font-weight: bold; }

.post-content-wrapper {
  margin-top: 30px;
}
.post-content {
  font-size: 16px;
  color: #334155;
  line-height: 1.8;
  word-wrap: break-word;
}
/* 优化富文本中图片的显示圆角 */
:deep(.post-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 15px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* ================= 2. 交互区与输入箱 ================= */
.section-divider {
  display: flex; align-items: center; margin: 40px 0 30px;
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
.input-header { margin-bottom: 15px; }
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

/* 上传组件圆润化 */
:deep(.modern-upload .el-upload--picture-card) {
  --el-upload-picture-card-size: 80px;
  border-radius: 12px;
  background-color: #f8fafc;
}
:deep(.modern-upload .el-upload-list--picture-card .el-upload-list__item) {
  width: 80px; height: 80px; border-radius: 12px;
}

.input-footer { text-align: right; margin-top: 15px; }
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
.user-avatar { border: 2px solid #f4f6fc; margin-right: 20px; }
.comment-main { flex: 1; overflow: hidden; }
.comment-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
}
.comment-user { font-weight: 800; font-size: 15px; color: #2c3e50; }
.floor-num { font-size: 13px; color: #8a9bb1; font-weight: bold; background: #f4f6fc; padding: 2px 10px; border-radius: 12px; }
.comment-text { margin: 10px 0; color: #475569; line-height: 1.6; font-size: 15px; }

.image-grid { display: grid; grid-template-columns: repeat(auto-fill, 100px); gap: 8px; margin-top: 12px; }
.grid-image { width: 100px; height: 100px; border-radius: 12px; cursor: pointer; border: 1px solid #f0f2f5; transition: transform 0.3s; }
.grid-image:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(0,0,0,0.1);}

.comment-footer {
  display: flex; justify-content: space-between; align-items: center; margin-top: 15px;
}
.comment-time { font-size: 12px; color: #94a3b8; }

/* 操作按钮悬浮渐现 */
.action-buttons { display: flex; gap: 15px; align-items: center; }
.action-icon-btn, .hover-btn { font-weight: 600; font-size: 13px; color: #64748b; }
.action-icon-btn .el-icon, .hover-btn .el-icon { font-size: 16px; margin-right: 4px; }
.hover-btn { opacity: 0; transition: opacity 0.3s; }
.comment-card:hover .hover-btn, .sub-comment-item:hover .hover-btn { opacity: 1; }

/* ================= 楼中楼 ================= */
.sub-comments-wrapper {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 15px 20px;
  margin-top: 15px;
}
.sub-comment-item { padding: 12px 0; border-bottom: 1px dashed #e2e8f0; }
.sub-comment-item:last-child { border-bottom: none; padding-bottom: 0; }
.sub-comment-content { display: flex; align-items: center; flex-wrap: wrap; line-height: 1.6; margin-bottom: 6px; }
.sub-avatar { margin-right: 8px; }
.sub-nickname { font-weight: bold; color: #334155; font-size: 13px; margin-right: 5px; }
.reply-target { color: #64748b; font-size: 13px; margin-right: 5px; }
.highlight-name { color: #409eff; font-weight: bold; }
.sub-text { font-size: 14px; color: #475569; word-break: break-all; }
.sub-comment-footer { display: flex; align-items: center; justify-content: space-between; padding-left: 32px; }

/* 局部回复框 */
.inline-reply-box { margin-top: 15px; }
.inline-reply-actions { text-align: right; margin-top: 10px; }
.expand-more-box { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
.expand-btn { font-weight: bold; font-size: 13px; }

/* 流光按钮特效 */
.shimmer-btn { position: relative; overflow: hidden; border: none; background: linear-gradient(90deg, #409eff 0%, #7367f0 100%); }
.shimmer-btn::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
  background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }

/* 举报弹窗单选框 */
.report-radio-group { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.custom-dialog { border-radius: 16px; }
</style>