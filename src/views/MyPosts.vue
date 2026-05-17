<template>
  <div class="manage-container">
    <div class="page-header">
      <el-icon class="header-icon"><DocumentCopy /></el-icon>
      <h2 class="header-title">我的发帖管理</h2>
    </div>

    <div class="toolbar-card">
      <div class="search-group">
        <el-input
            v-model="searchKeyword"
            placeholder="输入帖子标题或内容关键词搜索..."
            clearable
            @clear="fetchMyPosts"
            @keyup.enter="fetchMyPosts"
            class="custom-search"
            prefix-icon="Search"
        />
        <el-button type="primary" round class="shimmer-btn search-btn" @click="fetchMyPosts">搜 索</el-button>
      </div>
    </div>

    <div class="table-card">
      <el-table
          :data="postList"
          style="width: 100%"
          v-loading="loading"
          class="modern-table"
          :header-cell-style="{ background: '#f8fafc', color: '#64748b', fontWeight: 'bold', borderBottom: 'none' }"
      >
        <el-table-column prop="title" label="帖子标题" width="240">
          <template #default="scope">
            <span class="post-title" :title="scope.row.title">{{ scope.row.title }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="content" label="内容摘要" min-width="300">
          <template #default="scope">
            <div class="desc-text" :title="scope.row.content ? scope.row.content.replace(/<[^>]+>/g, '') : ''">
              {{ scope.row.content ? scope.row.content.replace(/<[^>]+>/g, '') : '' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="互动数据" width="160" align="center">
          <template #default="scope">
            <div class="stats-group">
              <span class="stat-item" title="浏览量"><el-icon><View /></el-icon> {{ scope.row.viewCount || 0 }}</span>
              <span class="stat-item" title="点赞数"><el-icon><Pointer /></el-icon> {{ scope.row.likeCount || 0 }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="180" align="center">
          <template #default="scope">
            <span class="time-text">
              <el-icon style="vertical-align: -2px; margin-right: 2px;"><Clock /></el-icon>
              {{ new Date(scope.row.createTime).toLocaleString() }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="right" fixed="right">
          <template #default="scope">
            <div class="action-cell">
              <el-button
                  type="primary"
                  plain
                  round
                  size="small"
                  class="action-btn"
                  @click="router.push(`/forum/detail/${scope.row.id}`)"
              >
                <el-icon style="margin-right: 4px;"><Position /></el-icon> 查看
              </el-button>

              <el-button
                  type="danger"
                  plain
                  round
                  size="small"
                  class="action-btn"
                  @click="handleDelete(scope.row.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-box">
            <el-empty description="你还没有发布过帖子，快去论坛水一贴吧！" />
            <el-button type="primary" round class="shimmer-btn" style="margin-top: 15px;" @click="router.push('/forum')">
              去发帖
            </el-button>
          </div>
        </template>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// ⭐️ 引入高级图标
import { DocumentCopy, Search, View, Pointer, Clock, Position, Delete } from '@element-plus/icons-vue'
import { getMyPostsAPI, deleteMyPostAPI } from '../api/post.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user'))
const postList = ref([])
const loading = ref(false)

const searchKeyword = ref('')

onMounted(() => {
  if (user && user.id) {
    fetchMyPosts()
  }
})

const fetchMyPosts = async () => {
  loading.value = true
  try {
    const res = await getMyPostsAPI(searchKeyword.value)
    if (res.code === 200) {
      postList.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取发帖记录失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = (postId) => {
  ElMessageBox.confirm(
      '确认要永久删除这篇帖子吗？<br><strong style="color: #f56c6c;">删除后不可恢复哦！</strong>',
      '危险操作提示',
      {
        confirmButtonText: '狠心删除',
        cancelButtonText: '手滑了',
        type: 'warning',
        dangerouslyUseHTMLString: true // 开启 HTML 支持
      }
  ).then(async () => {
    try {
      const res = await deleteMyPostAPI(postId)
      if (res.code === 200) {
        ElMessage.success('删除成功！')
        fetchMyPosts()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('网络请求异常')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.manage-container {
  padding: 10px 10px 40px;
}

/* ================= 头部标题 ================= */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
}
.header-icon {
  font-size: 26px;
  color: #409eff;
}
.header-title {
  font-size: 22px;
  font-weight: 900;
  color: #2c3e50;
  margin: 0;
}

/* ================= 控制台卡片 ================= */
.toolbar-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 25px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}
.search-group {
  display: flex;
  gap: 15px;
  align-items: center;
}
:deep(.custom-search .el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  width: 320px;
}
.search-btn { padding: 0 25px; font-weight: bold; }

/* ================= 表格卡片区域 ================= */
.table-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}

/* 改造 Element 表格默认样式 */
:deep(.modern-table) {
  border-radius: 12px;
  overflow: hidden;
}
:deep(.modern-table .el-table__row td) {
  padding: 18px 0;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.3s;
}
:deep(.modern-table::before) { display: none; }
:deep(.modern-table .el-table__inner-wrapper::before) { display: none; }

.post-title {
  font-weight: 800;
  font-size: 15px;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 内容摘要剥离 HTML 限制两行 */
.desc-text {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 精致数据展示 */
.stats-group {
  display: flex;
  justify-content: center;
  gap: 15px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-text {
  font-size: 13px;
  color: #94a3b8;
}

/* 操作按钮 */
.action-cell {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.action-btn { font-weight: bold; }

/* 空状态 */
.empty-box {
  padding: 50px 0;
}

/* 流光按钮 */
.shimmer-btn { position: relative; overflow: hidden; border: none; background: linear-gradient(90deg, #409eff 0%, #7367f0 100%); }
.shimmer-btn::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
  background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }
</style>