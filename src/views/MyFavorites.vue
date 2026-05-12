<template>
  <div class="favorites-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">❤️ 我的游戏收藏夹</span>
        </div>
      </template>

      <div v-if="favoriteList.length === 0" class="empty-box">
        <el-empty description="你还没有收藏任何游戏哦，快去大厅逛逛吧！" />
        <el-button type="primary" @click="router.push('/home')">去发现游戏</el-button>
      </div>

      <el-row :gutter="20" v-else>
        <el-col :span="6" v-for="game in favoriteList" :key="game.id" style="margin-bottom: 20px;">
          <el-card shadow="hover" class="game-card" @click="router.push(`/game/detail/${game.id}`)">
            <img :src="game.coverImage" class="game-cover" />
            <div style="padding: 14px;">
              <span class="game-name">{{ game.gameName }}</span>
              <div class="bottom-info">
                <el-rate v-model="game.averageRating" disabled size="small" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFavoriteListAPI } from '../api/favorite.js'

const router = useRouter()
const favoriteList = ref([])

onMounted(() => {
  const storedUser = JSON.parse(localStorage.getItem('user'))
  if (storedUser) {
    fetchFavoriteGames(storedUser.id)
  }
})

const fetchFavoriteGames = async (userId) => {
  try {
    const res = await getFavoriteListAPI(userId)
    if (res.code === 200) {
      favoriteList.value = res.data
    }
  } catch (err) {
    console.error("获取收藏列表失败")
  }
}
</script>

<style scoped>
.favorites-container {
  padding: 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
.game-card {
  cursor: pointer;
  transition: transform 0.2s;
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
.empty-box {
  text-align: center;
  padding: 40px 0;
}
</style>