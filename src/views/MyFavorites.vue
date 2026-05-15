<template>
  <div class="favorites-container">
    <el-card shadow="never" class="header-card">
      <h2>❤️ 我的收藏中心</h2>
      <p class="subtitle">在这里管理你心仪的游戏与论坛里的绝世好贴。</p>
    </el-card>

    <el-card shadow="never" class="main-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">

        <el-tab-pane label="🎮 游戏收藏" name="games">
          <div v-loading="loadingGames" style="min-height: 200px;">
            <div v-if="favoriteGames.length === 0" class="empty-box">
              <el-empty description="你还没有收藏任何游戏哦，快去大厅逛逛吧！" />
              <el-button type="primary" @click="router.push('/home')">去发现游戏</el-button>
            </div>

            <el-row :gutter="20" v-else>
              <el-col :span="6" v-for="game in favoriteGames" :key="game.id" style="margin-bottom: 20px;">
                <el-card shadow="hover" class="game-card" @click="router.push(`/game/detail/${game.id}`)">
                  <img :src="game.coverImage" class="game-cover" />
                  <div style="padding: 14px;">
                    <span class="game-name" :title="game.gameName">{{ game.gameName }}</span>
                    <div class="bottom-info">
                      <el-rate v-model="game.averageRating" disabled size="small" />
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane label="📝 帖子收藏" name="posts">
          <div v-loading="loadingPosts" style="min-height: 200px;">
            <div v-if="favoritePosts.length === 0" class="empty-box">
              <el-empty description="你的帖子收藏夹空空如也，快去论坛划水吧！" />
              <el-button type="primary" @click="router.push('/forum')">去逛论坛</el-button>
            </div>

            <div class="post-list" v-else>
              <el-card v-for="post in favoritePosts" :key="post.id" class="post-card" shadow="hover">
                <div @click="router.push(`/forum/detail/${post.id}`)" style="cursor: pointer;">
                  <div class="post-header">
                    <span class="post-title">{{ post.title }}</span>
                    <el-tag type="warning" size="small" effect="light">已收藏</el-tag>
                  </div>
                  <p class="post-content">{{ post.content }}</p>
                </div>

                <div class="post-footer">
                  <div class="author-info">
                    <el-avatar :size="24" :src="post.avatar">{{ post.nickname?.charAt(0) || '匿' }}</el-avatar>
                    <span class="author-name">{{ post.nickname || '匿名玩家' }}</span>
                  </div>
                  <div>
                    <span class="meta-data">👁️ {{ post.viewCount }}</span>
                    <span class="meta-data">👍 {{ post.likeCount }}</span>
                    <el-button type="danger" link @click.stop="handleRemovePostFavorite(post.id)">
                      取消收藏
                    </el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

// ⭐️ 导入你原来的【游戏收藏】API
import { getFavoriteListAPI } from '../api/favorite.js'
// ⭐️ 导入我新写的【帖子收藏】API
import { getMyPostFavoritesAPI, togglePostFavoriteAPI } from '../api/postFavorite.js'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user'))

// 控制当前激活的 Tab页 (默认打开游戏收藏)
const activeTab = ref('games')

// 游戏收藏的专属状态
const favoriteGames = ref([])
const loadingGames = ref(false)

// 帖子收藏的专属状态
const favoritePosts = ref([])
const loadingPosts = ref(false)

// 页面加载时，只拉取默认的那个 Tab 的数据（性能优化）
onMounted(() => {
  if (user) {
    fetchFavoriteGames(user.id)
  }
})

// 点击 Tab 切换时触发，按需拉取数据
const handleTabChange = (tabName) => {
  if (tabName === 'games' && favoriteGames.value.length === 0) {
    fetchFavoriteGames(user.id)
  } else if (tabName === 'posts' && favoritePosts.value.length === 0) {
    fetchFavoritePosts()
  }
}

// ==========================================
// 🎮 游戏收藏相关逻辑
// ==========================================
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

// ==========================================
// 📝 帖子收藏相关逻辑
// ==========================================
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
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    const res = await togglePostFavoriteAPI(postId)
    if (res.code === 200) {
      ElMessage.success('已移出收藏夹')
      fetchFavoritePosts() // 刷新列表
    }
  }).catch(() => {})
}
</script>

<style scoped>
.favorites-container {
  max-width: 1200px;
  margin: 0 auto;
}
.header-card {
  margin-bottom: 20px;
  border-radius: 8px;
}
.subtitle {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}
.main-card {
  border-radius: 8px;
}
.empty-box {
  text-align: center;
  padding: 60px 0;
}

/* 游戏卡片样式 */
.game-card {
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 8px;
}
.game-card:hover {
  transform: translateY(-5px);
}
.game-cover {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}
.game-name {
  font-weight: bold;
  font-size: 14px;
  display: block;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 帖子卡片样式 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-top: 10px;
}
.post-card {
  border-radius: 8px;
  transition: all 0.3s;
}
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.post-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
.post-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
  /* 自动截断 */
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
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}
.author-info {
  display: flex;
  align-items: center;
}
.author-name {
  margin-left: 8px;
  font-size: 13px;
  color: #606266;
}
.meta-data {
  font-size: 13px;
  color: #909399;
  margin-right: 15px;
}

/* 美化 Tabs 样式 */
:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  height: 50px;
  line-height: 50px;
}
</style>