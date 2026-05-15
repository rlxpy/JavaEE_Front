<template>
    <el-container>

      <el-main class="main-content">
        <div style="margin-bottom: 30px; display: flex; justify-content: center;">
          <el-input
              v-model="searchKeyword"
              placeholder="搜索你想玩的游戏名称或关键字..."
              clearable
              @click="handleSearch"
              style="width: 50%; max-width: 600px;"
              size="large"
              prefix-icon="Search"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        <el-row :gutter="20">
          <el-col :span="6" v-for="game in gameList" :key="game.id" style="margin-bottom: 20px;">
            <el-card :body-style="{ padding: '0px' }" class="game-card" shadow="hover">
              <el-image :src="game.coverImage" class="game-image" fit="cover" />

              <div class="game-info">
                <h3 class="game-name">{{ game.gameName }}</h3>
                <p class="game-desc">{{ game.description }}</p>

                <div class="game-bottom">
                  <el-rate
                      v-model="game.averageRating"
                      disabled
                      show-score
                      text-color="#ff9900"
                      score-template="{value}"
                  />
                  <el-button type="primary" size="small" plain @click="goToDetail(game.id)">查看详情</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div style="margin-top: 40px; display: flex; justify-content: center;">
          <el-pagination
              background
              layout="total, prev, pager, next"
              :total="total"
              :page-size="pageSize"
              v-model:current-page="currentPage"
              @current-change="handlePageChange"
          />
        </div>
      </el-main>

    </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getGamesByPageAPI } from '../api/game.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userInfo = ref(null)

// ⭐️ 新增：定义一个响应式数组，用来存放从后端拿到的游戏列表
const gameList = ref([])

const searchKeyword = ref('') // ⭐️ 新增：绑定搜索框的关键字

// ⭐️ 新增：分页相关的响应式变量
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12) // 每页展示12条

// 页面加载时执行
onMounted(async () => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser)
  } else {
    router.push('/login')
    return
  }
  await fetchGames()
})

// ⭐️ 核心改造：获取游戏列表的具体函数
const fetchGames = async () => {
  try {
    // 调用分页接口，传入页码、每页大小、搜索关键字
    const res = await getGamesByPageAPI(currentPage.value, pageSize.value, searchKeyword.value)
    if (res.code === 200) {
      // ⚠️ 注意：因为后端套了 PageInfo，所以真实数组在 res.data.list 里！
      gameList.value = res.data.list
      total.value = res.data.total // 同步总条数
    } else {
      ElMessage.error(res.msg || '获取游戏列表失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常，无法连接到后端')
  }
}

// ⭐️ 新增：翻页时的回调函数
const handlePageChange = (page) => {
  currentPage.value = page
  fetchGames()
}

// ⭐️ 新增：触发搜索时的特别处理（防 Bug）
const handleSearch = () => {
  currentPage.value = 1 // 每次发起全新搜索，必须把页码重置回第1页！
  fetchGames()
}

// 辅助函数
const getRoleTagType = (role) => {
  if (role === 1) return 'warning'
  if (role === 2) return 'danger'
  return 'success'
}

const getRoleName = (role) => {
  if (role === 1) return '开发者'
  if (role === 2) return '超级管理员'
  return '普通玩家'
}

const goToDetail = (id) => {
  // 跳转到刚刚配置好的动态路由，带上被点击的游戏 id
  router.push(`/game/detail/${id}`)
}
</script>

<style scoped>
/* 头部样式保持不变 */
.common-layout { height: 100vh; background-color: #f5f7fa; }
.header { display: flex; align-items: center; background-color: #ffffff; border-bottom: 1px solid #e6e6e6; padding: 0 20px; }
.logo h2 { margin: 0; color: #409eff; min-width: 200px; }
.nav-menu { flex: 1; border-bottom: none; }
.user-profile { display: flex; align-items: center; gap: 15px; min-width: 250px; justify-content: flex-end; }
.greeting { font-size: 14px; color: #606266; }

/* ⭐️ 新增：游戏卡片相关样式 */
.main-content {
  padding: 40px;
}

.game-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}
.game-card:hover {
  transform: translateY(-5px); /* 鼠标悬浮时卡片微微上浮 */
}

.game-image {
  width: 100%;
  height: 180px; /* 固定图片高度，保持整齐 */
  display: block;
}

.game-info {
  padding: 14px;
}

.game-name {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
  /* 如果标题太长，变成省略号 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  height: 40px; /* 固定高度 */
  /* 如果描述太长，最多显示两行并省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 15px;
}

.game-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>