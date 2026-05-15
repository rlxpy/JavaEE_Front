<template>
  <div class="forum-page-root">
    <el-container class="forum-container">
      <el-aside width="220px" class="left-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">🎮 游戏板块</span>
          <el-button type="primary" link icon="Plus" @click="openSubscribeDialog">
            添加关注
          </el-button>
        </div>

        <el-menu :default-active="activeGameNav" @select="handleGameSelect" class="game-menu">
          <el-menu-item index="all_games">
            <el-icon><Menu /></el-icon>
            <span>全站综合大厅</span>
          </el-menu-item>
          <el-menu-item index="follow_feed">
            <el-icon><Star /></el-icon>
            <span>我的关注流</span>
          </el-menu-item>

          <div class="menu-divider">已关注游戏</div>

          <el-menu-item v-for="game in mySubscribedGames" :key="game.id" :index="String(game.id)">
            <span>{{ game.gameName }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="right-main">
        <el-card shadow="never" class="header-card">
          <div class="header-content" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索感兴趣的标题或内容..."
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

            <el-radio-group v-model="sortBy" @change="handleSearch" size="large">
              <el-radio-button value="time">🕒 最新发布</el-radio-button>
              <el-radio-button value="hot">🔥 热门精选</el-radio-button>
            </el-radio-group>

            <div>
              <el-button type="primary" @click="openPostDialog">✍️ 我要发帖</el-button>
            </div>
          </div>

          <el-tabs v-model="activeCategoryId" @tab-change="handleCategoryChange" class="category-tabs">
            <el-tab-pane label="全部分区" name="all"></el-tab-pane>
            <el-tab-pane v-for="cat in categoryList" :key="cat.id" :label="cat.name" :name="cat.id"></el-tab-pane>
          </el-tabs>
        </el-card>

        <div class="post-list" v-loading="loading">
          <el-empty v-if="postList.length === 0" description="暂无帖子，或者您还没有关注任何游戏哦！" />

          <el-card v-for="post in postList" :key="post.id" class="post-card" shadow="hover" @click="router.push(`/forum/detail/${post.id}`)" style="cursor: pointer;">
            <div class="post-header">
              <div class="user-info">
                <el-avatar :size="40" :src="post.avatar">{{ post.nickname?.charAt(0) || '匿' }}</el-avatar>
                <span class="nickname">{{ post.nickname || '匿名玩家' }}</span>
                <el-tag type="danger" effect="dark" size="small" round style="margin-left: 10px;">
                  🔥 热度 {{ post.hotScore ? post.hotScore.toFixed(1) : '0.0' }}
                </el-tag>
              </div>
              <div class="meta-data">
                <span class="time">{{ new Date(post.createTime).toLocaleString() }}</span>
              </div>
            </div>

            <h3 class="post-title">{{ post.title }}</h3>

            <p class="post-content">{{ post.content ? post.content.replace(/<[^>]+>/g, '') : '' }}</p>

            <div class="post-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 12px; border-top: 1px solid #f4f4f5;">
              <div class="game-tag-box">
                <el-tag v-if="getGameName(post.gameId)" type="info" size="small" effect="plain" round>
                  🎮 {{ getGameName(post.gameId) }}
                </el-tag>
              </div>

              <div class="stats" style="color: #909399; font-size: 13px; display: flex; gap: 15px;">
                <span>👁️ {{ post.viewCount || 0 }}</span>
                <span>👍 {{ post.likeCount || 0 }}</span>
                <span>💬 {{ post.commentCount || 0 }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <div class="pagination-box">
          <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="currentPage" @current-change="handlePageChange" />
        </div>
      </el-main>
    </el-container>

    <el-dialog v-model="showDialog" title="🚀 发布新帖子" width="50%">
      <el-form :model="postForm" label-width="80px">
        <el-form-item label="帖子标题" required>
          <el-input v-model="postForm.title" placeholder="起一个吸引人的标题吧..." />
        </el-form-item>
        <el-form-item label="所属分区" required>
          <el-select v-model="postForm.categoryId" placeholder="请选择帖子类型">
            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联游戏">
          <el-select v-model="postForm.gameId" placeholder="支持打字搜索游戏..." clearable filterable style="width: 100%;">
            <el-option label="📢 综合讨论 (全站)" :value="''" />
            <el-option v-for="game in gameList" :key="game.id" :label="game.gameName" :value="game.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="帖子内容" required>
          <el-form-item label="正文内容" required>
            <div style="border: 1px solid #ccc; width: 100%; border-radius: 8px; overflow: hidden; z-index: 100;">
              <Toolbar
                  style="border-bottom: 1px solid #ccc"
                  :editor="editorRef"
                  :defaultConfig="{}"
                  :mode="mode"
              />
              <Editor
                  style="height: 300px; overflow-y: hidden;"
                  v-model="postForm.content"
                  :defaultConfig="editorConfig"
                  :mode="mode"
                  @onCreated="handleCreated"
              />
            </div>
          </el-form-item>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitPost">立刻发布</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showSubscribeDialog" title="🎮 管理我的游戏频道" width="600px">
      <div style="margin-bottom: 20px;">
        <el-input v-model="gameSearchKeyword" placeholder="输入游戏名称快速检索..." :prefix-icon="Search" clearable size="large" />
      </div>
      <div v-if="gameList.length === 0" v-loading="true" style="height: 100px;"></div>
      <el-scrollbar height="350px" v-else>
        <el-row :gutter="20" v-if="filteredGameList.length > 0">
          <el-col :span="12" v-for="game in filteredGameList" :key="game.id" style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #ebeef5; border-radius: 8px;">
              <span style="font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;" :title="game.gameName">
                {{ game.gameName }}
              </span>
              <el-button :type="isSubscribed(game.id) ? 'info' : 'primary'" :plain="!isSubscribed(game.id)" size="small" round @click="handleToggleSubscribe(game.id)">
                {{ isSubscribed(game.id) ? '已关注' : '+ 关注' }}
              </el-button>
            </div>
          </el-col>
        </el-row>
        <el-empty v-else description="没有找到该游戏，请检查拼写哦~" :image-size="80" />
        <div v-if="!gameSearchKeyword && gameList.length > 10" style="text-align: center; color: #909399; margin-top: 10px; font-size: 13px;">
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
import { Menu, Star, Plus, Pointer, HotWater, Search } from '@element-plus/icons-vue'
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
const handleCategoryChange = () => { currentPage.value = 1; fetchPosts() }
const handleSearch = () => { currentPage.value = 1; fetchPosts() }
const handlePageChange = (page) => { currentPage.value = page; fetchPosts() }

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

// 富文本编辑器实例
const editorRef = shallowRef()
const mode = 'default'
// 编辑器配置：接管上传图片
const editorConfig = {
  placeholder: '分享你的异世界见闻，支持直接粘贴图片或点击上传...',
  MENU_CONF: {
    uploadImage: {
      // ⭐️ 核心魔法：使用自定义上传，对接你的 FileController
      async customUpload(file, insertFn) {
        const formData = new FormData()
        formData.append('file', file)
        try {
          // 发送到你的后端接口
          const res = await request.post('/file/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          if (res.code === 200) {
            insertFn(res.data) // 成功后，将图片 URL 插入到富文本编辑器中！
          } else {
            ElMessage.error(res.msg || '上传图片失败')
          }
        } catch (e) {
          ElMessage.error('上传异常')
        }
      }
    }
  }
}
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
const handleCreated = (editor) => {
  editorRef.value = editor
}
</script>

<style scoped>
/* 增加一个基础内边距，确保在 MainLayout 里面不会顶着边缘 */
.forum-page-root {
  padding: 20px;
}
.forum-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
}
.left-sidebar {
  background-color: #fff;
  border-radius: 10px;
  border: 1px solid #ebeef5;
  padding: 10px 0;
  height: fit-content;
}
.sidebar-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 20px; border-bottom: 1px solid #ebeef5; margin-bottom: 10px;
}
.sidebar-title { font-weight: bold; font-size: 16px; color: #303133; }
.game-menu { border-right: none; }
.menu-divider { padding: 15px 20px 5px; font-size: 12px; color: #909399; }
.right-main { padding: 0; flex: 1; overflow: hidden; }
.header-card { margin-bottom: 20px; border-radius: 10px; }
.header-content { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.post-list { min-height: 300px; }
.post-card { margin-bottom: 15px; border-radius: 8px; }
.post-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ebeef5; padding-bottom: 10px; margin-bottom: 10px; }
.user-info { display: flex; align-items: center; gap: 10px; }
.nickname { font-weight: bold; color: #409eff; }
.time { font-size: 13px; color: #909399; }
.post-title { margin: 10px 0; font-size: 18px; color: #303133; }
.post-content { color: #606266; line-height: 1.6; white-space: pre-wrap; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
.pagination-box { margin-top: 20px; display: flex; justify-content: center; }
</style>