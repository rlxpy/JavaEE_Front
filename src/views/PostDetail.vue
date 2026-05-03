<template>
  <div class="post-detail-container">
    <el-page-header @back="router.back()" title="返回交流论坛" style="margin-bottom: 20px;">
      <template #content>
        <span class="text-large font-600 mr-3"> 帖子详情 </span>
      </template>
    </el-page-header>

    <el-skeleton :rows="10" animated v-if="!post" />

    <div v-else>
      <el-card class="post-main-card" shadow="never">
        <div class="author-info">
          <el-avatar :size="50" :src="post.avatar">
            {{ post.nickname?.charAt(0) || '匿' }}
          </el-avatar>
          <div class="meta-info">
            <span class="nickname">{{ post.nickname || '匿名玩家' }} 楼主</span>
            <span class="time">发布于：{{ new Date(post.createTime).toLocaleString() }}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <h1 class="post-title" style="margin-bottom: 0;">{{ post.title }}</h1>

          <el-button
              v-if="user"
              :type="isLiked ? 'primary' : 'default'"
              :plain="!isLiked"
              :icon="isLiked ? 'Pointer' : 'Pointer'"
              size="large"
              round
              @click="handleToggleLike"
          >
            {{ isLiked ? '👍 已赞 (' + post.likeCount + ')' : '👍 点赞 (' + post.likeCount + ')' }}
          </el-button>
        </div>
        <div style="color: #909399; font-size: 14px; margin-bottom: 15px;">
          👁️ 浏览量：{{ post.viewCount }}
        </div>
        <p class="post-content">{{ post.content }}</p>
      </el-card>

      <el-card class="comments-card" shadow="never" style="margin-top: 20px;">
        <template #header>
          <div class="card-header">
            <span>全部回复 ({{ comments.length }})</span>
          </div>
        </template>

        <div v-if="user" class="reply-box">
          <el-input
              v-model="replyContent"
              type="textarea"
              :rows="3"
              placeholder="友善交流，畅所欲言..."
          />
          <div class="reply-action">
            <el-button type="primary" @click="submitReply" style="margin-top: 15px;">发表回复</el-button>
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
            <el-avatar :src="item.avatar" :size="40">{{ item.nickname?.charAt(0) }}</el-avatar>
            <div class="comment-main">
              <div class="comment-header">
                <span class="comment-user">{{ item.nickname }}</span>
                <span class="floor-num">{{ index + 1 }} 楼</span>
              </div>
              <p class="comment-content">{{ item.content }}</p>
              <span class="comment-time">{{ new Date(item.createTime).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostDetailAPI, checkPostLikeAPI, togglePostLikeAPI } from '../api/post.js'
import { getCommentsByPostAPI, addCommentAPI } from '../api/comment.js'
import { ElMessage } from 'element-plus'


const route = useRoute()
const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user')))

const post = ref(null)
const comments = ref([])
const replyContent = ref('') // 回复框的内容

const isLiked = ref(false)

// 拉取帖子正文
const fetchPostDetail = async (postId) => {
  try {
    const res = await getPostDetailAPI(postId)
    if (res.data.code === 200) {
      post.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('获取帖子失败')
  }
}

// 在 fetchPostDetail(postId) 之后加上检查点赞状态：
onMounted(async () => {
  const postId = route.params.id
  await fetchPostDetail(postId)
  await fetchComments(postId)

  if (user.value && user.value.id) {
    const res = await checkPostLikeAPI(user.value.id, postId)
    if (res.data.code === 200) {
      isLiked.value = res.data.data
    }
  }
})

// 切换点赞逻辑
const handleToggleLike = async () => {
  if (!user.value) return
  try {
    const res = await togglePostLikeAPI(user.value.id, route.params.id)
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      isLiked.value = res.data.data
      // 同步更新页面上的点赞数，无需刷新
      post.value.likeCount += (res.data.data ? 1 : -1)
    }
  } catch (error) {
    ElMessage.error('网络错误')
  }
}

// 拉取所有回复
const fetchComments = async (postId) => {
  const res = await getCommentsByPostAPI(postId)
  if (res.data.code === 200) {
    comments.value = res.data.data
  }
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空哦')
    return
  }

  const postData = {
    userId: user.value.id,
    postId: route.params.id,
    content: replyContent.value,
    rating: 0 // ⭐️ 防坑：改成 0 而不是 null，防止后端类型报错
  }

  try {
    const res = await addCommentAPI(postData)
    if (res.data.code === 200) {
      ElMessage.success('回复成功！')
      replyContent.value = '' // 清空输入框
      await fetchComments(route.params.id) // 刷新列表，看到自己的回复
    } else {
      // ⭐️ 补上遗漏的 else 分支，把后端的报错大声说出来！
      ElMessage.error(res.data.msg || '回复失败')
    }
  } catch (err) {
    ElMessage.error('网络或服务器异常')
  }
}
</script>

<style scoped>
.post-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.post-main-card {
  border-radius: 8px;
}
.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f2f5;
}
.meta-info {
  margin-left: 15px;
  display: flex;
  flex-direction: column;
}
.nickname {
  font-weight: bold;
  font-size: 16px;
  color: #409eff;
}
.time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
.post-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 15px;
}
.post-content {
  font-size: 16px;
  color: #606266;
  line-height: 1.8;
  white-space: pre-wrap; /* 保留楼主的回车换行 */
}

/* 评论区样式 */
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}
.comment-user {
  font-weight: bold;
  color: #303133;
}
.floor-num {
  font-size: 12px;
  color: #909399;
}
.comment-content {
  margin: 5px 0 10px 0;
  color: #606266;
  line-height: 1.6;
}
.comment-time {
  font-size: 12px;
  color: #c0c4cc;
}
.reply-action {
  text-align: right;
}
</style>