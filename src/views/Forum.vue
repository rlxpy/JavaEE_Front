<template>
  <div class="forum-page-root">
    <el-container class="forum-container">

      <el-aside width="240px" class="left-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">探索频道</span>
          <el-button type="primary" round plain size="small" class="add-focus-btn" @click="openSubscribeDialog">
            <el-icon><Plus /></el-icon> 关注游戏
          </el-button>
        </div>

        <el-menu :default-active="activeGameNav" @select="handleGameSelect" class="game-menu" :router="false">
          <el-menu-item index="all_games" class="menu-item-custom">
            <el-icon><Monitor /></el-icon>
            <span>全站综合大厅</span>
          </el-menu-item>
          <el-menu-item index="follow_feed" class="menu-item-custom">
            <el-icon><Collection /></el-icon>
            <span>我的关注流</span>
          </el-menu-item>

          <div class="menu-divider">我的游戏频道</div>

          <el-menu-item v-for="game in mySubscribedGames" :key="game.id" :index="String(game.id)" class="menu-item-custom">
            <span class="game-truncate">{{ game.gameName }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="right-main">
        <div class="control-panel">
          <div class="panel-top">
            <div class="search-sort-group">
              <el-input
                  v-model="searchKeyword"
                  placeholder="搜索感兴趣的帖子或内容..."
                  clearable
                  @clear="handleSearch"
                  @keyup.enter="handleSearch"
                  class="custom-search"
                  prefix-icon="Search"
              />
              <el-radio-group v-model="sortBy" @change="handleSearch" class="custom-radio">
                <el-radio-button value="time">最新发布</el-radio-button>
                <el-radio-button value="hot">热门精选</el-radio-button>
              </el-radio-group>
            </div>

            <el-button type="primary" round class="shimmer-btn publish-btn" @click="openPostDialog">
              <el-icon style="margin-right: 6px;"><EditPen /></el-icon> 发布新帖
            </el-button>
          </div>

          <div class="panel-bottom">
            <div class="category-pills">
              <span class="pill" :class="{ active: activeCategoryId === 'all' }" @click="selectCategory('all')">全部分区</span>
              <span
                  class="pill"
                  v-for="cat in categoryList"
                  :key="cat.id"
                  :class="{ active: activeCategoryId === cat.id }"
                  @click="selectCategory(cat.id)"
              >
                {{ cat.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="post-list" v-loading="loading">
          <el-empty v-if="postList.length === 0" description="暂无帖子，或者您还没有关注任何游戏哦！" />

          <div
              v-for="post in postList"
              :key="post.id"
              class="post-card"
              @click="router.push(`/forum/detail/${post.id}`)"
          >
            <div class="post-header">
              <div class="user-info">
                <el-avatar :size="42" :src="post.avatar" class="user-avatar">{{ post.nickname?.charAt(0) || '匿' }}</el-avatar>
                <div class="user-meta">
                  <span class="nickname">{{ post.nickname || '匿名玩家' }}</span>
                  <span class="time">{{ new Date(post.createTime).toLocaleString() }}</span>
                </div>
              </div>
              <div class="header-right">
                <el-tag v-if="post.hotScore > 0" type="danger" effect="light" round class="hot-tag">
                  <el-icon><TrendCharts /></el-icon> {{ post.hotScore.toFixed(1) }}
                </el-tag>
              </div>
            </div>

            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-content">{{ post.content ? post.content.replace(/<[^>]+>/g, '') : '' }}</p>

            <div class="post-footer">
              <div class="game-tag-box">
                <el-tag v-if="getGameName(post.gameId)" type="info" effect="plain" round class="game-tag">
                  {{ getGameName(post.gameId) }}
                </el-tag>
              </div>

              <div class="stats-group">
                <span class="stat-item"><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                <span class="stat-item"><el-icon><Pointer /></el-icon> {{ post.likeCount || 0 }}</span>
                <span class="stat-item"><el-icon><ChatLineRound /></el-icon> {{ post.commentCount || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination-box" v-if="total > 0">
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

    <el-dialog v-model="showDialog" title="发布新帖子" width="55%" class="custom-dialog">
      <el-form :model="postForm" label-width="80px" label-position="top">
        <el-form-item label="帖子标题" required>
          <el-input v-model="postForm.title" placeholder="起一个吸引人的标题吧..." size="large" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属分区" required>
              <el-select v-model="postForm.categoryId" placeholder="请选择帖子类型" size="large" style="width: 100%;">
                <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联游戏">
              <el-select v-model="postForm.gameId" placeholder="支持打字搜索游戏..." clearable filterable size="large" style="width: 100%;">
                <el-option label="综合讨论 (全站)" :value="''" />
                <el-option v-for="game in gameList" :key="game.id" :label="game.gameName" :value="game.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="正文内容" required>
          <div class="editor-wrapper">
            <Toolbar style="border-bottom: 1px solid #edf2f7" :editor="editorRef" :defaultConfig="{}" :mode="mode" />
            <Editor style="height: 350px; overflow-y: hidden;" v-model="postForm.content" :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button round @click="showDialog = false">取消</el-button>
        <el-button type="primary" round class="shimmer-btn" @click="submitPost" style="padding: 0 30px;">立刻发布</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showSubscribeDialog" title="管理我的游戏频道" width="500px" class="custom-dialog">
      <div style="margin-bottom: 20px;">
        <el-input v-model="gameSearchKeyword" placeholder="输入游戏名称快速检索..." :prefix-icon="Search" clearable size="large" class="custom-search" />
      </div>
      <div v-if="gameList.length === 0" v-loading="true" style="height: 100px;"></div>
      <el-scrollbar height="350px" v-else>
        <div class="subscribe-list" v-if="filteredGameList.length > 0">
          <div class="subscribe-item" v-for="game in filteredGameList" :key="game.id">
            <span class="game-name" :title="game.gameName">{{ game.gameName }}</span>
            <el-button :type="isSubscribed(game.id) ? 'info' : 'primary'" :plain="!isSubscribed(game.id)" size="small" round @click="handleToggleSubscribe(game.id)">
              {{ isSubscribed(game.id) ? '已关注' : '+ 关注' }}
            </el-button>
          </div>
        </div>
        <el-empty v-else description="没有找到该游戏，请检查拼写" :image-size="80" />
        <div v-if="!gameSearchKeyword && gameList.length > 10" class="scroll-tip">
          仅展示部分热门游戏，请使用上方搜索框查找更多...
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { shallowRef, onBeforeUnmount } from 'vue'
import request from '../utils/request'
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
// ⭐️ 引入高级图标
import { Monitor, Collection, Plus, Search, View, Pointer, ChatLineRound, EditPen, TrendCharts } from '@element-plus/icons-vue'
import { getPostsByPageAPI, addPostAPI } from '../api/post.js'
import { getGameListAPI } from '../api/game.js'
import { getCategoryListAPI } from '../api/category.js'
import { ElMessage } from 'element-plus'
import { getMySubscribedGamesAPI, toggleSubscribeGameAPI } from '../api/subscribe.js'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user'))

const loading = ref(false)
const postList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const searchKeyword = ref('')
const activeGameNav = ref('all_games')
const activeCategoryId = ref('all')

const gameList = ref([])
const categoryList = ref([])
const mySubscribedGames = ref([])
const showSubscribeDialog = ref(false)
const gameSearchKeyword = ref('')
const sortBy = ref('time')
const showDialog = ref(false)
const postForm = reactive({ title: '', content: '', gameId: null, categoryId: null })

let needRestoreScroll = 0

onMounted(async () => {
  await fetchCategories()
  await fetchGames()
  await fetchMySubscribedGames()

  const savedState = sessionStorage.getItem('forumState')
  if (savedState) {
    const state = JSON.parse(savedState)
    activeGameNav.value = state.nav || 'all_games'
    activeCategoryId.value = state.cat || 'all'
    currentPage.value = state.page || 1
    sortBy.value = state.sort || 'time'
    needRestoreScroll = state.scrollTop || 0
    sessionStorage.removeItem('forumState')
  } else {
    if (user && mySubscribedGames.value.length > 0) {
      activeGameNav.value = 'follow_feed'
    } else {
      activeGameNav.value = 'all_games'
    }
  }
  fetchPosts()
})

watch([activeGameNav, activeCategoryId, currentPage], () => {
  sessionStorage.setItem('forumState', JSON.stringify({
    nav: activeGameNav.value,
    cat: activeCategoryId.value,
    page: currentPage.value,
    sort: sortBy.value,
  }))
})

const filteredGameList = computed(() => {
  if (!gameSearchKeyword.value) return gameList.value.slice(0, 10)
  return gameList.value.filter(game => game.gameName.toLowerCase().includes(gameSearchKeyword.value.toLowerCase()))
})

const fetchMySubscribedGames = async () => {
  if (!user) return
  try {
    const res = await getMySubscribedGamesAPI()
    if (res.code === 200) mySubscribedGames.value = res.data || []
  } catch (error) {}
}

const isSubscribed = (gameId) => mySubscribedGames.value.some(g => g.id === gameId)

const openSubscribeDialog = () => {
  if (!user) return ElMessage.warning('请先登录才能打造专属频道哦！')
  showSubscribeDialog.value = true
}

const handleToggleSubscribe = async (gameId) => {
  try {
    const res = await toggleSubscribeGameAPI(gameId)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      await fetchMySubscribedGames()
    }
  } catch (error) { ElMessage.error('操作失败') }
}

const fetchCategories = async () => {
  try {
    const res = await getCategoryListAPI()
    if (res.code === 200) categoryList.value = res.data
  } catch (e) { }
}

const fetchGames = async () => {
  try {
    const res = await getGameListAPI()
    if (res.code === 200) gameList.value = res.data
  } catch (e) { }
}

const fetchPosts = async () => {
  loading.value = true
  try {
    let catId = activeCategoryId.value === 'all' ? '' : activeCategoryId.value
    let gId = ''
    let isFeed = false

    if (activeGameNav.value === 'follow_feed') isFeed = true
    else if (activeGameNav.value !== 'all_games') gId = activeGameNav.value

    const res = await getPostsByPageAPI(currentPage.value, pageSize.value, searchKeyword.value, catId, gId, isFeed, sortBy.value)
    if (res.code === 200) {
      postList.value = res.data.list
      total.value = res.data.total
      if (needRestoreScroll > 0) {
        await nextTick()
        window.scrollTo({ top: needRestoreScroll, behavior: 'instant' })
        needRestoreScroll = 0
      }
    }
  } catch (error) { ElMessage.error('获取帖子失败') } finally { loading.value = false }
}

const handleGameSelect = (index) => { activeGameNav.value = index; currentPage.value = 1; fetchPosts() }

// 替换原来的 el-tabs 点击事件
const selectCategory = (id) => {
  activeCategoryId.value = id
  currentPage.value = 1
  fetchPosts()
}

const handleSearch = () => { currentPage.value = 1; fetchPosts() }
const handlePageChange = (page) => { currentPage.value = page; fetchPosts(); window.scrollTo({top: 0, behavior: 'smooth'}) }

const openPostDialog = () => {
  if (!user) return ElMessage.warning('请先登录哦！')
  showDialog.value = true
}

const submitPost = async () => {
  if (!postForm.title || !postForm.content || !postForm.categoryId) return ElMessage.warning('标题、内容和分区必填！')
  const postData = { ...postForm, userId: user.id }
  try {
    const res = await addPostAPI(postData)
    if (res.code === 200) {
      ElMessage.success('发帖成功！')
      showDialog.value = false
      postForm.title = ''; postForm.content = ''; postForm.gameId = null; postForm.categoryId = null;
      currentPage.value = 1; fetchPosts()
    } else { ElMessage.error(res.msg) }
  } catch (error) {}
}

onBeforeRouteLeave((to, from) => {
  const currentScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
  sessionStorage.setItem('forumState', JSON.stringify({
    nav: activeGameNav.value, cat: activeCategoryId.value, page: currentPage.value, sort: sortBy.value, scrollTop: currentScroll
  }))
})

const getGameName = (gameId) => {
  if (!gameId) return null
  const game = gameList.value.find(g => g.id === gameId)
  return game ? game.gameName : null
}

const editorRef = shallowRef()
const mode = 'default'
const editorConfig = {
  placeholder: '分享你的异世界见闻，支持直接粘贴图片或点击上传...',
  MENU_CONF: {
    uploadImage: {
      async customUpload(file, insertFn) {
        const formData = new FormData()
        formData.append('file', file)
        try {
          const res = await request.post('/file/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
          if (res.code === 200) insertFn(res.data)
          else ElMessage.error(res.msg || '上传图片失败')
        } catch (e) { ElMessage.error('上传异常') }
      }
    }
  }
}
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
const handleCreated = (editor) => { editorRef.value = editor }
</script>

<style scoped>
.forum-page-root {
  padding: 30px 20px;
  background-color: transparent;
}
.forum-container {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
}

/* ================= 1. 左侧高级侧边栏 ================= */
.left-sidebar {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
  padding: 20px 10px;
  height: fit-content;
  position: sticky;
  top: 84px; /* 跟随滚动悬浮 */
}
.sidebar-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 15px 15px; margin-bottom: 10px;
}
.sidebar-title { font-weight: 800; font-size: 16px; color: #2c3e50; }
.add-focus-btn { font-weight: bold; }

.game-menu { border-right: none; background: transparent; }
.menu-item-custom {
  border-radius: 10px;
  margin: 4px 10px;
  height: 44px; line-height: 44px;
  color: #5c6b77;
  font-weight: 500;
  transition: all 0.3s;
}
.menu-item-custom:hover {
  background-color: #f4f6fc;
  color: #409eff;
}
.game-menu .el-menu-item.is-active {
  background-color: #f4f6fc;
  color: #409eff;
  font-weight: bold;
}
.menu-divider { padding: 20px 15px 8px; font-size: 12px; color: #a0aec0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
.game-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }

/* ================= 2. 顶部控制中心 ================= */
.right-main { padding: 0; flex: 1; overflow: hidden; display: flex; flex-direction: column; gap: 20px; }

.control-panel {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
}
.panel-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}
.search-sort-group { display: flex; gap: 15px; align-items: center; flex: 1; }
.custom-radio {
  display: inline-flex;
  flex-wrap: nowrap;
  flex-shrink: 0;
  white-space: nowrap;
}

:deep(.custom-radio .el-radio-button__inner) {
  border: none !important;
  background: #f4f6fc;
  color: #5c6b77;
  box-shadow: none !important;
  font-weight: 600;
}
:deep(.custom-radio .el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 20px 0 0 20px;
}
:deep(.custom-radio .el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 20px 20px 0;
}
:deep(.custom-radio .el-radio-button.is-active .el-radio-button__inner) {
  background: #409eff;
  color: white;
}

.publish-btn { font-size: 15px; padding: 0 25px; height: 40px; }

.category-pills { display: flex; gap: 12px; flex-wrap: wrap; }
.pill {
  padding: 8px 18px; border-radius: 20px; background-color: #f4f6fc; color: #5c6b77;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;
}
.pill:hover { color: #409eff; background-color: #eef2ff; }
.pill.active { background-color: #409eff; color: white; box-shadow: 0 4px 12px rgba(64,158,255,0.3); }

/* ================= 3. 帖子流列表 ================= */
.post-list { min-height: 300px; display: flex; flex-direction: column; gap: 16px; }
.post-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.02);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}
.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  border-color: #f0f2f5;
}

.post-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.user-info { display: flex; align-items: center; gap: 12px; }
.user-avatar { border: 2px solid #f4f6fc; }
.user-meta { display: flex; flex-direction: column; }
.nickname { font-weight: bold; color: #2c3e50; font-size: 15px; }
.time { font-size: 12px; color: #a0aec0; margin-top: 2px; }
.hot-tag { font-weight: bold; border: none; background: #fff0f0; }

.post-title { margin: 0 0 10px 0; font-size: 18px; color: #2c3e50; font-weight: 800; }
.post-content { color: #5c6b77; line-height: 1.6; font-size: 14px; margin: 0 0 16px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.post-footer { display: flex; justify-content: space-between; align-items: center; }
.game-tag { font-weight: 600; border: none; background: #f4f6fc; color: #5c6b77; }
.stats-group { display: flex; gap: 20px; color: #a0aec0; font-size: 14px; font-weight: 500; }
.stat-item { display: flex; align-items: center; gap: 4px; transition: color 0.3s; }
.post-card:hover .stat-item { color: #5c6b77; } /* 鼠标悬浮卡片时，数据颜色变深一点 */

.pagination-box { margin-top: 20px; display: flex; justify-content: center; }

/* ================= 其他复用特效 ================= */
.shimmer-btn { position: relative; overflow: hidden; border: none; background: linear-gradient(90deg, #409eff 0%, #7367f0 100%); }
.shimmer-btn::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
  background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }

/* 弹窗及内部表单微调 */
.editor-wrapper { border: 1px solid #edf2f7; border-radius: 12px; overflow: hidden; transition: border 0.3s; }
.editor-wrapper:hover { border-color: #c0c4cc; }
.subscribe-list { display: flex; flex-direction: column; gap: 10px; padding-right: 10px; }
.subscribe-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 12px; transition: background 0.3s; }
.subscribe-item:hover { background: #f1f5f9; }
.scroll-tip { text-align: center; color: #a0aec0; margin-top: 15px; font-size: 13px; }
</style>