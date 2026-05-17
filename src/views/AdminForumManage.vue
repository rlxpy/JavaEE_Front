<template>
  <div class="manage-container">
    <div class="page-header">
      <el-icon class="header-icon"><ChatDotSquare /></el-icon>
      <h2 class="header-title">论坛与评论治理中心</h2>
    </div>

    <div class="toolbar-card">
      <div class="search-group">
        <el-input
            v-model="searchKeyword"
            placeholder="全站检索：输入违规评论关键词..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            class="custom-search"
            prefix-icon="Search"
        />
        <el-button type="primary" round class="shimmer-btn search-btn" @click="handleSearch">检索全站评论</el-button>
      </div>
    </div>

    <div class="table-card">
      <el-table
          :data="commentList"
          style="width: 100%"
          v-loading="loading"
          class="modern-table"
          :header-cell-style="{ background: '#f8fafc', color: '#64748b', fontWeight: 'bold', borderBottom: 'none' }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column label="发布人" width="200">
          <template #default="scope">
            <div class="user-cell">
              <el-avatar :size="36" :src="scope.row.avatar" class="user-avatar">
                {{ scope.row.nickname?.charAt(0) || '匿' }}
              </el-avatar>
              <span class="user-nickname">{{ scope.row.nickname || '匿名用户' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="content" label="评论 / 回复内容" min-width="350">
          <template #default="scope">
            <div class="content-preview" :title="scope.row.content">
              {{ scope.row.content }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="180" align="center">
          <template #default="scope">
            <span class="time-text">
              <el-icon style="vertical-align: -2px; margin-right: 2px;"><Clock /></el-icon>
              {{ scope.row.createTime ? new Date(scope.row.createTime).toLocaleString() : '未知' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="治理操作" width="150" align="right" fixed="right">
          <template #default="scope">
            <el-button
                type="danger"
                plain
                round
                size="small"
                class="action-btn force-delete-btn"
                @click="handleForceDelete(scope.row.id)"
            >
              <el-icon style="margin-right: 4px;"><Delete /></el-icon> 强制清除
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-box">
            <el-empty description="平台环境良好，暂无违规评论" />
          </div>
        </template>
      </el-table>

      <div class="pagination-box" v-if="total > 0">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            class="modern-pagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// ⭐️ 引入高级矢量图标
import { ChatDotSquare, Search, Delete, Clock } from '@element-plus/icons-vue'
import { getAllCommentsForAdminAPI, deleteCommentByAdminAPI } from '../api/comment.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const commentList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(() => {
  fetchComments()
})

const fetchComments = async () => {
  loading.value = true
  try {
    const res = await getAllCommentsForAdminAPI(currentPage.value, pageSize.value, searchKeyword.value)
    if (res.code === 200) {
      commentList.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchComments()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  handleSearch()
}
const handlePageChange = (page) => {
  currentPage.value = page
  fetchComments()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 👑 执行强制删评 (升级版高亮弹窗)
const handleForceDelete = (id) => {
  ElMessageBox.confirm(
      `确认要强制清除这条违规评论吗？<br><strong style="color: #f56c6c;">此操作不可逆！</strong>`,
      '平台内容治理警告',
      {
        confirmButtonText: '确定清除',
        cancelButtonText: '取消',
        type: 'error',
        dangerouslyUseHTMLString: true // 允许 HTML，让红色高亮生效
      }
  ).then(async () => {
    try {
      const res = await deleteCommentByAdminAPI(id)
      if (res.code === 200) {
        ElMessage.success('已成功清除违规内容！')
        fetchComments()
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
  width: 380px;
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

/* 用户名片 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-avatar {
  border: 2px solid #f4f6fc;
}
.user-nickname {
  font-weight: 800;
  font-size: 14px;
  color: #2c3e50;
}

/* ⭐️ 高级引用内容块 */
.content-preview {
  background-color: #f8fafc;
  color: #475569;
  font-size: 14px;
  padding: 10px 15px;
  border-radius: 8px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制只显示两行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 3px solid #cbd5e1; /* 左侧引用条 */
}

/* 时间文本 */
.time-text {
  font-size: 13px;
  color: #94a3b8;
}

/* 操作按钮防干扰 */
.action-btn { font-weight: bold; }
.force-delete-btn {
  opacity: 0.8;
  transition: all 0.3s;
}
:deep(.modern-table .el-table__row:hover) .force-delete-btn {
  opacity: 1;
}

/* 空状态 */
.empty-box {
  padding: 40px 0;
}

/* 分页器 */
.pagination-box {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}

/* 流光按钮 */
.shimmer-btn { position: relative; overflow: hidden; border: none; background: linear-gradient(90deg, #409eff 0%, #7367f0 100%); }
.shimmer-btn::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
  background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }
</style>