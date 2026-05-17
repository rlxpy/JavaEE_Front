<template>
  <el-container class="home-wrapper">
    <el-main class="main-content">

      <div v-if="showHeroCarousel && heroGames.length > 0" class="hero-section">
        <el-carousel
            trigger="click"
            height="400px"
            class="hero-carousel"
            :autoplay="true"
            :interval="4500"
            :pause-on-hover="true"
            arrow="hover"
        >
          <el-carousel-item v-for="game in heroGames" :key="game.id">
            <div class="hero-slide" :style="{ backgroundImage: `url(${game.coverImage})` }" @click="goToDetail(game.id)">
              <div class="hero-overlay">
                <h1 class="hero-title">{{ game.gameName }}</h1>
                <p class="hero-desc">{{ game.description }}</p>
                <el-button type="primary" round class="shimmer-btn hero-btn">即刻探索</el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <div class="filter-bar" :class="{ 'standalone-mode': !showHeroCarousel || heroGames.length === 0 }">
        <div class="category-pills">
          <span class="pill" :class="{ active: activeCategoryId === 0 }" @click="selectCategory(0)">全部游戏</span>
          <span
              class="pill"
              v-for="cat in categories"
              :key="cat.id"
              :class="{ active: activeCategoryId === cat.id }"
              @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </span>
        </div>

        <div class="search-sort-actions">
          <el-input
              v-model="searchKeyword"
              placeholder="搜索你想玩的游戏..."
              clearable
              @keyup.enter="handleSearch"
              class="custom-search"
              prefix-icon="Search"
          />
          <el-select v-model="sortBy" class="custom-select" @change="handleSearch" :teleported="false">
            <el-option label="最新上架" value="latest" />
            <el-option label="评分热度" value="hot" />
          </el-select>
        </div>
      </div>

      <el-row :gutter="24" class="game-grid">
        <el-col :span="6" v-for="game in gameList" :key="game.id" style="margin-bottom: 24px;">
          <div class="game-card" @click="goToDetail(game.id)">
            <el-image :src="game.coverImage" class="game-image" fit="cover" lazy />
            <div class="game-info-basic">
              <h3 class="game-name" :title="game.gameName">{{ game.gameName }}</h3>
              <el-rate v-model="game.averageRating" disabled text-color="#ff9900" size="small" />
            </div>

            <div class="game-overlay-glass">
              <h3 class="glass-title">{{ game.gameName }}</h3>
              <p class="glass-desc">{{ game.description }}</p>
              <div class="glass-bottom">
                <el-button type="primary" round class="shimmer-btn detail-btn">查看详情</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-empty v-if="gameList.length === 0" description="这里空空如也，换个词搜搜看吧" />

      <div v-if="total > 0" class="pagination-wrapper">
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getGamesByPageAPI, getCategoryListAPI } from '../api/game.js'
import request from '../utils/request.js'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue' // 引入搜索图标

const router = useRouter()

const gameList = ref([])
const categories = ref([])

const searchKeyword = ref('')
const activeCategoryId = ref(0)
const sortBy = ref('hot') // 大厅默认按热度排序更有大作感

const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

// ⭐️ 提取前 3 名游戏作为轮播大图 (只有在第一页且没搜索时才展示轮播)
const showHeroCarousel = computed(() => currentPage.value === 1 && searchKeyword.value === '')
const heroGames = computed(() => gameList.value.slice(0, 3))

onMounted(async () => {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) {
    router.push('/login')
    return
  }

  await fetchCategories()
  await fetchGames()
})

const fetchCategories = async () => {
  try {
    // 直接调用封装好的接口！
    const res = await getCategoryListAPI()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取分类失败', error)
  }
}

const fetchGames = async () => {
  try {
    const res = await getGamesByPageAPI(
        currentPage.value,
        pageSize.value,
        searchKeyword.value,
        activeCategoryId.value,
        sortBy.value
    )
    if (res.code === 200) {
      gameList.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '获取游戏列表失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常')
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchGames()
  window.scrollTo({ top: 0, behavior: 'smooth' }) // 翻页平滑回到顶部
}

const handleSearch = () => {
  currentPage.value = 1
  fetchGames()
}

// 点击胶囊分类
const selectCategory = (id) => {
  activeCategoryId.value = id
  handleSearch()
}

const goToDetail = (id) => {
  router.push(`/game/detail/${id}`)
}
</script>

<style scoped>
/* 整个容器背景设为透明，继承 Layout 的极浅灰蓝 */
.home-wrapper {
  background-color: transparent;
}
.main-content {
  padding: 0 40px 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* ================= 1. 巨幅头图轮播区 ================= */
.hero-section {
  margin-top: 20px;
  margin-bottom: 40px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}
.hero-slide {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
  transition: transform 0.5s;
}
.hero-slide:hover {
  transform: scale(1.02);
}
.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  /* 左侧加深渐变，让白字极其清晰 */
  background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 60px;
  color: white;
}
.hero-title {
  font-size: 40px;
  font-weight: 900;
  margin: 0 0 15px 0;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
.hero-desc {
  font-size: 16px;
  line-height: 1.6;
  max-width: 50%;
  margin: 0 0 30px 0;
  color: #e4e7ed;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hero-btn {
  width: 140px;
  height: 44px;
  font-size: 16px;
}

/* ================= 2. 聚合控制台 ================= */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
  /* ⭐️ 新增：让间距的变化带上极其丝滑的物理阻尼动画 */
  transition: margin-top 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* ⭐️ 新增：当轮播图消失时，自动撑开的 40px 黄金呼吸间距 */
.filter-bar.standalone-mode {
  margin-top: 40px;
}
.category-pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.pill {
  padding: 8px 20px;
  border-radius: 20px;
  background-color: #fff;
  color: #606266;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.pill:hover {
  color: #409eff;
  box-shadow: 0 4px 12px rgba(64,158,255,0.15);
}
.pill.active {
  background-color: #409eff;
  color: white;
  box-shadow: 0 4px 12px rgba(64,158,255,0.3);
}

.search-sort-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}
:deep(.custom-search .el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  width: 260px;
}
:deep(.custom-select .el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  width: 130px;
}

/* ================= 3. 悬浮拟态卡片 ================= */
.game-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  height: 280px; /* 固定高度 */
  display: flex;
  flex-direction: column;
}
.game-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

/* 默认状态下的图文 */
.game-image {
  width: 100%;
  height: 180px;
  flex-shrink: 0;
}
.game-info-basic {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}
.game-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ⭐️ 高能预警：悬浮时升起的磨砂玻璃遮罩 */
.game-overlay-glass {
  position: absolute;
  bottom: 0; left: 0; width: 100%; height: 100%;
  background: rgba(20, 20, 25, 0.75); /* 深色遮罩 */
  backdrop-filter: blur(8px); /* 亚克力模糊 */
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  padding: 25px 20px;
  box-sizing: border-box;
  color: white;
  opacity: 0; /* 默认隐藏 */
  transform: translateY(20px); /* 默认往下沉一点 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
/* 鼠标碰到外层卡片时，触发遮罩升起 */
.game-card:hover .game-overlay-glass {
  opacity: 1;
  transform: translateY(0);
}

.glass-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}
.glass-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #dcdfe6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4; /* 最多显示4行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.glass-bottom {
  margin-top: 15px;
  text-align: center;
}
.detail-btn {
  width: 100%;
  background: linear-gradient(90deg, #409eff 0%, #7367f0 100%);
  border: none;
}

/* ================= 其他 ================= */
.pagination-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

/* 找回极速扫过的白光剑刃特效 */
.shimmer-btn { position: relative; overflow: hidden; }
.shimmer-btn::after {
  content: '';
  position: absolute;
  top: -50%; left: -60%;
  width: 20%; height: 200%;
  background: rgba(255,255,255,0.4);
  transform: rotate(30deg);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }
</style>