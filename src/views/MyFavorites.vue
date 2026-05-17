<template>
  <div class="favorites-container">

    <div class="page-header-nav">
      <div class="header-left">
        <el-icon class="header-icon"><StarFilled /></el-icon>
        <div class="header-text">
          <h2 class="title">我的收藏中心</h2>
          <p class="subtitle">在这里管理你心仪的游戏与论坛里的绝世好贴。</p>
        </div>
      </div>
    </div>

    <div class="main-canvas">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs" :class="activeTab === 'games' ? 'theme-green' : 'theme-blue'">

        <el-tab-pane name="games">
          <template #label><el-icon><Monitor /></el-icon> 游戏收藏</template>

          <div v-loading="loadingGames" class="tab-content-area">
            <div v-if="favoriteGames.length === 0" class="empty-box">
              <el-empty description="你还没有收藏任何游戏哦，快去大厅逛逛吧！" />
              <el-button type="primary" round class="shimmer-btn theme-green-btn" @click="router.push('/home')">发现游戏</el-button>
            </div>

            <el-row :gutter="24" v-else class="game-grid">
              <el-col :span="6" v-for="game in favoriteGames" :key="game.id" class="game-col">
                <div class="game-card" @click="router.push(`/game/detail/${game.id}`)">
                  <el-image :src="game.coverImage" class="game-cover" fit="cover" lazy />
                  <div class="game-glass-overlay">
                    <span class="game-name" :title="game.gameName">{{ game.gameName }}</span>
                    <el-rate v-model="game.averageRating" disabled size="small" text-color="#ff9900" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane name="posts">
          <template #label><el-icon><Document /></el-icon> 帖子收藏</template>

          <div v-loading="loadingPosts" class="tab-content-area">
            <div v-if="favoritePosts.length === 0" class="empty-box">
              <el-empty description="你的帖子收藏夹空空如也，快去论坛划水吧！" />
              <el-button type="primary" round class="shimmer-btn theme-blue-btn" @click="router.push('/forum')">去逛论坛</el-button>
            </div>

            <div class="post-list" v-else>
              <div v-for="post in favoritePosts" :key="post.id" class="post-card" @click="router.push(`/forum/detail/${post.id}`)">
                <div class="post-header">
                  <h3 class="post-title">{{ post.title }}</h3>
                  <el-button type="danger" link class="hover-action-btn" @click.stop="handleRemovePostFavorite(post.id)">
                    <el-icon><Delete /></el-icon> 移出收藏夹
                  </el-button>
                </div>

                <p class="post-content">{{ post.content ? post.content.replace(/<[^>]+>/g, '') : '【图片/多媒体内容】' }}</p>

                <div class="post-footer">
                  <div class="author-info">
                    <el-avatar :size="32" :src="post.avatar" class="author-avatar">{{ post.nickname?.charAt(0) || '匿' }}</el-avatar>
                    <div class="author-meta">
                      <span class="author-name">{{ post.nickname || '匿名玩家' }}</span>
                      <span class="post-time">{{ new Date(post.createTime).toLocaleDateString() }}</span>
                    </div>
                  </div>

                  <div class="stats-group">
                    <span class="stat-item"><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                    <span class="stat-item"><el-icon><Pointer /></el-icon> {{ post.likeCount || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// ⭐️ 引入全部需要的高级图标
import { StarFilled, Monitor, Document, Delete, View, Pointer } from '@element-plus/icons-vue'

import { getFavoriteListAPI } from '../api/favorite.js'
import { getMyPostFavoritesAPI, togglePostFavoriteAPI } from '../api/postFavorite.js'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user'))

const activeTab = ref('games')
const favoriteGames = ref([])
const loadingGames = ref(false)
const favoritePosts = ref([])
const loadingPosts = ref(false)

onMounted(() => {
  if (user) {
    fetchFavoriteGames(user.id)
  }
})

const handleTabChange = (tabName) => {
  if (tabName === 'games' && favoriteGames.value.length === 0) {
    fetchFavoriteGames(user.id)
  } else if (tabName === 'posts' && favoritePosts.value.length === 0) {
    fetchFavoritePosts()
  }
}

const fetchFavoriteGames = async (userId) => {
  loadingGames.value = true
  try {
    const res = await getFavoriteListAPI(userId)
    if (res.code === 200) {
      favoriteGames.value = res.data || []
    }
  } catch (err) {
    ElMessage.error("获取游戏收藏列表失败")
  } finally {
    loadingGames.value = false
  }
}

const fetchFavoritePosts = async () => {
  loadingPosts.value = true
  try {
    const res = await getMyPostFavoritesAPI()
    if (res.code === 200) {
      favoritePosts.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('获取帖子收藏列表失败')
  } finally {
    loadingPosts.value = false
  }
}

const handleRemovePostFavorite = (postId) => {
  ElMessageBox.confirm('确定要将这篇帖子移出收藏夹吗？', '取消收藏', {
    confirmButtonText: '确定移出', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    const res = await togglePostFavoriteAPI(postId)
    if (res.code === 200) {
      ElMessage.success('已移出收藏夹')
      fetchFavoritePosts()
    }
  }).catch(() => {})
}
</script>

<style scoped>
.favorites-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px 40px;
}

/* ================= 1. 顶部标题栏 ================= */
.page-header-nav {
  width: 100%;
  max-width: 1100px;
  margin-bottom: 25px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.header-icon {
  font-size: 32px;
  color: #f56c6c; /* 红心颜色 */
}
.title {
  margin: 0 0 6px 0;
  font-size: 24px;
  font-weight: 900;
  color: #2c3e50;
}
.subtitle {
  margin: 0;
  color: #8a9bb1;
  font-size: 14px;
}

/* ================= 2. 纯白主画布与多色彩 Tabs ================= */
.main-canvas {
  width: 100%;
  max-width: 1100px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 15px 35px 40px;
}
.tab-content-area {
  min-height: 400px;
  margin-top: 15px;
}
.empty-box {
  text-align: center;
  padding: 80px 0;
}

:deep(.custom-tabs .el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #f0f2f5;
}
:deep(.custom-tabs .el-tabs__item) {
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  height: 56px;
  line-height: 56px;
  transition: all 0.3s;
}
:deep(.custom-tabs .el-icon) {
  margin-right: 6px;
  font-size: 18px;
  vertical-align: -2px;
}

/* 动态色彩绑定：游戏绿 / 帖子蓝 */
:deep(.theme-green .el-tabs__item.is-active) { color: #10b981; }
:deep(.theme-green .el-tabs__active-bar) { background-color: #10b981; }
.theme-green-btn { background: linear-gradient(90deg, #10b981 0%, #34d399 100%); border: none; padding: 0 30px;}

:deep(.theme-blue .el-tabs__item.is-active) { color: #409eff; }
:deep(.theme-blue .el-tabs__active-bar) { background-color: #409eff; }
.theme-blue-btn { background: linear-gradient(90deg, #409eff 0%, #7367f0 100%); border: none; padding: 0 30px;}


/* ================= 3. 游戏悬浮卡片 ================= */
.game-grid { margin-top: 10px; }
.game-col { margin-bottom: 24px; }
.game-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  height: 240px;
}
.game-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}
.game-cover {
  width: 100%;
  height: 100%;
  display: block;
}
/* 底部悬浮磨砂玻璃遮罩 */
.game-glass-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(20, 20, 25, 0.95), rgba(20, 20, 25, 0.6) 60%, transparent);
  padding: 40px 15px 15px;
  display: flex;
  flex-direction: column;
}
.game-name {
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


/* ================= 4. 帖子极简卡片 ================= */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.post-card {
  background: #ffffff;
  border: 1px solid #f0f2f5;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
}
.post-card:hover {
  border-color: #e4e7ed;
  box-shadow: 0 8px 24px rgba(0,0,0,0.04);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.post-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1.4;
  flex: 1;
  padding-right: 20px;
}

/* 悬浮渐现的危险按钮 */
.hover-action-btn {
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s;
}
.post-card:hover .hover-action-btn { opacity: 1; }

.post-content {
  color: #5c6b77;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 18px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #f0f2f5;
  padding-top: 16px;
}
.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.author-avatar { border: 2px solid #f4f6fc; }
.author-meta { display: flex; flex-direction: column; }
.author-name { font-weight: bold; font-size: 14px; color: #2c3e50; }
.post-time { font-size: 12px; color: #a0aec0; margin-top: 2px;}

.stats-group {
  display: flex;
  gap: 20px;
  color: #a0aec0;
  font-size: 13px;
  font-weight: 600;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 流光按钮复用 */
.shimmer-btn { position: relative; overflow: hidden; }
.shimmer-btn::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
  background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }
</style>