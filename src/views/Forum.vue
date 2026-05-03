<template>
  <div class="forum-container">
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <h2>💬 玩家交流社区</h2>

        <el-input
            v-model="searchKeyword"
            placeholder="搜索你感兴趣的帖子标题或内容..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 40%;"
            size="large"
            prefix-icon="Search"
        >
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>

        <div>
          <el-button type="primary" plain @click="router.push('/home')">返回大厅</el-button>
          <el-button type="primary" @click="openPostDialog">✍️ 我要发帖</el-button>
        </div>
      </div>
    </el-card>

    <div class="post-list" v-loading="loading">
      <el-empty v-if="postList.length === 0" description="暂无帖子，快来抢下全站第一帖吧！" />

      <el-card v-for="post in postList" :key="post.id" class="post-card" shadow="hover" @click="router.push(`/forum/detail/${post.id}`)"
               style="cursor: pointer;">
        <div class="post-header">
          <div class="user-info">
            <el-avatar :size="40" :src="post.avatar">
              {{ post.nickname?.charAt(0) || '匿' }}
            </el-avatar>
            <span class="nickname">{{ post.nickname || '匿名玩家' }}</span>
          </div>
          <div class="meta-data">
            <span style="margin-right: 15px; color: #909399;">👁️ {{ post.viewCount || 0 }}</span>
            <span style="margin-right: 15px; color: #909399;">👍 {{ post.likeCount || 0 }}</span>
            <span class="time">{{ new Date(post.createTime).toLocaleString() }}</span>
          </div>
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-content">{{ post.content }}</p>
      </el-card>
    </div>

    <div class="pagination-box">
      <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="showDialog" title="🚀 发布新帖子" width="50%">
      <el-form :model="postForm" label-width="80px">
        <el-form-item label="帖子标题" required>
          <el-input v-model="postForm.title" placeholder="起一个吸引人的标题吧..." />
        </el-form-item>
        <el-form-item label="关联游戏">
          <el-select
              v-model="postForm.gameId"
              placeholder="支持直接打字搜索游戏名称哦..."
              clearable
              filterable
              style="width: 100%;"
          >
            <el-option label="📢 综合讨论 (不关联游戏)" :value="null" />
            <el-option v-for="game in gameList" :key="game.id" :label="game.gameName" :value="game.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="帖子内容" required>
          <el-input
              v-model="postForm.content"
              type="textarea"
              :rows="6"
              placeholder="分享你的通关攻略、游戏吐槽或者是寻找开黑搭子..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">取 消</el-button>
          <el-button type="primary" @click="submitPost">立刻发布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPostsByPageAPI, addPostAPI } from '../api/post.js'
import { ElMessage } from 'element-plus'
import { getGameListAPI } from '../api/game.js'

const router = useRouter()
// 从 localStorage 获取当前登录用户
const user = JSON.parse(localStorage.getItem('user'))

const loading = ref(false)
const postList = ref([]) // 帖子列表
const total = ref(0)     // 总条数
const currentPage = ref(1) // 当前页码
const pageSize = ref(10)   // 每页显示几条

const showDialog = ref(false) // 控制弹窗显示
const postForm = reactive({
  title: '',
  content: '',
  gameId: null // ⭐️ 新增 gameId 字段
})

const gameList = ref([]) // ⭐️ 新增：用于存放游戏下拉列表

const searchKeyword = ref('') // ⭐️ 新增：绑定搜索框的关键字

// ⭐️ 新增：专门处理搜索的函数（每次搜索必须跳回第一页）
const handleSearch = () => {
  currentPage.value = 1
  fetchPosts()
}

// 页面加载时自动获取第一页的帖子
onMounted(() => {
  fetchPosts()
  fetchGames() // ⭐️ 页面加载时，拉取游戏列表
})

// 修改获取数据的函数，把 searchKeyword 传给后端
const fetchPosts = async () => {
  loading.value = true
  try {
    // ⭐️ 加上 searchKeyword.value
    const res = await getPostsByPageAPI(currentPage.value, pageSize.value, searchKeyword.value)
    if (res.data.code === 200) {
      postList.value = res.data.data.list
      total.value = res.data.data.total
    }
  } catch (error) {
    ElMessage.error('获取帖子失败，请检查网络')
  } finally {
    loading.value = false
  }
}

// ⭐️ 新增：获取游戏列表给下拉框用
const fetchGames = async () => {
  try {
    const res = await getGameListAPI() // 假设你的 game.js 里这个方法叫这个
    if (res.data.code === 200) {
      gameList.value = res.data.data
    }
  } catch (error) {
    console.error("拉取游戏列表失败")
  }
}

// 翻页操作
const handlePageChange = (page) => {
  currentPage.value = page
  fetchPosts()
}

// 打开弹窗前做校验
const openPostDialog = () => {
  if (!user) {
    ElMessage.warning('想要发帖互动？请先登录哦！')
    return
  }
  showDialog.value = true
}

// 提交帖子
const submitPost = async () => {
  if (!postForm.title || !postForm.content) {
    ElMessage.warning('标题和内容都不能为空哦！')
    return
  }

  // ⭐️ 组装数据时带上 gameId
  const postData = {
    userId: user.id,
    title: postForm.title,
    content: postForm.content,
    gameId: postForm.gameId // 传给后端
  }
  try {
    const res = await addPostAPI(postData)
    // ... 成功后的清空逻辑里，加一句 postForm.gameId = null
    if (res.data.code === 200) {
      ElMessage.success('发帖成功！')
      showDialog.value = false
      postForm.title = ''
      postForm.content = ''
      postForm.gameId = null // ⭐️ 清空下拉框
      currentPage.value = 1
      fetchPosts()
    } else {
      ElMessage.error(res.data.msg || '发帖失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常')
  }
}
</script>

<style scoped>
.forum-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.header-card {
  margin-bottom: 20px;
  border-radius: 10px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content h2 {
  margin: 0;
  color: #303133;
}
.post-list {
  min-height: 300px;
}
.post-card {
  margin-bottom: 15px;
  border-radius: 8px;
}
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
  margin-bottom: 10px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.nickname {
  font-weight: bold;
  color: #409eff;
}
.time {
  font-size: 13px;
  color: #909399;
}
.post-title {
  margin: 10px 0;
  font-size: 18px;
  color: #303133;
}
.post-content {
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap; /* 允许换行显示 */
}
.pagination-box {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>