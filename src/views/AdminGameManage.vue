<template>
  <div class="manage-container">
    <div class="page-header">
      <el-icon class="header-icon"><Platform /></el-icon>
      <h2 class="header-title">全站游戏治理中心</h2>
    </div>

    <div class="toolbar-card">
      <div class="search-group">
        <el-input
            v-model="searchKeyword"
            placeholder="全站检索：输入游戏名称或简介关键词..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            class="custom-search"
            prefix-icon="Search"
        />
        <el-button type="primary" round class="shimmer-btn search-btn" @click="handleSearch">全站检索</el-button>
      </div>
    </div>

    <div class="table-card">
      <el-table
          :data="gameList"
          style="width: 100%"
          v-loading="loading"
          class="modern-table"
          :header-cell-style="{ background: '#f8fafc', color: '#64748b', fontWeight: 'bold', borderBottom: 'none' }"
      >

        <el-table-column label="游戏信息" min-width="260">
          <template #default="scope">
            <div class="game-cell">
              <el-image
                  :src="scope.row.coverImage"
                  class="game-cover"
                  fit="cover"
                  :preview-src-list="[scope.row.coverImage]"
                  preview-teleported
              />
              <div class="game-info">
                <span class="game-name" :title="scope.row.gameName">{{ scope.row.gameName }}</span>
                <span class="game-id">系统 ID: {{ scope.row.id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="游戏简介" min-width="300">
          <template #default="scope">
            <div class="desc-text" :title="scope.row.description">
              {{ scope.row.description }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="当前状态" width="140" align="center">
          <template #default="scope">
            <div class="status-indicator">
              <span class="status-dot" :class="getStatusDotClass(scope.row.status)"></span>
              <span class="status-text" :class="getStatusTextClass(scope.row.status)">
                {{ getStatusName(scope.row.status) }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="治理操作" width="160" align="right">
          <template #default="scope">
            <el-button
                type="danger"
                plain
                round
                size="small"
                class="action-btn force-delete-btn"
                @click="handleForceDelete(scope.row)"
            >
              <el-icon style="margin-right: 4px;"><Delete /></el-icon> 强制下架
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-box">
            <el-empty description="平台暂无任何游戏数据" />
          </div>
        </template>
      </el-table>

      <div class="pagination-box" v-if="total > 0">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20]"
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
// ⭐️ 引入高级图标
import { Platform, Search, Delete } from '@element-plus/icons-vue'
import { getAllGamesForAdminAPI, deleteGameByAdminAPI } from '../api/game.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const gameList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(() => {
  fetchAdminGames()
})

const fetchAdminGames = async () => {
  loading.value = true
  try {
    const res = await getAllGamesForAdminAPI(currentPage.value, pageSize.value, searchKeyword.value)
    if (res.code === 200) {
      gameList.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取全站游戏失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchAdminGames()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  handleSearch()
}
const handlePageChange = (page) => {
  currentPage.value = page
  fetchAdminGames()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleForceDelete = (row) => {
  ElMessageBox.confirm(
      `确认要强制下架并彻底删除游戏【${row.gameName}】吗？此操作不可逆！`,
      '平台治理警告',
      {
        confirmButtonText: '确定下架',
        cancelButtonText: '取消',
        type: 'error',
      }
  ).then(async () => {
    try {
      const res = await deleteGameByAdminAPI(row.id)
      if (res.code === 200) {
        ElMessage.success('已成功对该游戏执行降维打击！')
        fetchAdminGames()
      } else {
        ElMessage.error(res.msg || '下架失败')
      }
    } catch (error) {
      ElMessage.error('网络请求异常')
    }
  }).catch(() => {})
}

// ⭐️ 辅助函数：状态解析与颜色映射
const getStatusName = (status) => {
  if (status === 0) return '待审核'
  if (status === 1) return '已上架'
  if (status === 2) return '被驳回'
  return '未知状态'
}
const getStatusDotClass = (status) => {
  if (status === 0) return 'dot-warning'
  if (status === 1) return 'dot-success'
  if (status === 2) return 'dot-danger'
}
const getStatusTextClass = (status) => {
  if (status === 0) return 'text-warning'
  if (status === 1) return 'text-success'
  if (status === 2) return 'text-danger'
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
  width: 350px;
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
  padding: 18px 0; /* 增加行高，提升呼吸感 */
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.3s;
}
:deep(.modern-table::before) { display: none; }
:deep(.modern-table .el-table__inner-wrapper::before) { display: none; }

/* ⭐️ 游戏合体名片展示 */
.game-cell {
  display: flex;
  align-items: center;
  gap: 15px;
}
.game-cover {
  width: 70px;
  height: 48px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #f4f6fc;
}
.game-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}
.game-name {
  font-weight: 800;
  font-size: 15px;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}
.game-id {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 4px;
}

/* 游戏简介溢出处理 */
.desc-text {
  color: #5c6b77;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ⭐️ 高级圆点状态指示器 */
.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot-warning { background-color: #e6a23c; box-shadow: 0 0 0 3px rgba(230, 162, 60, 0.15); }
.dot-success { background-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
.dot-danger { background-color: #f56c6c; box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.15); }

.status-text { font-weight: bold; font-size: 13px; }
.text-warning { color: #e6a23c; }
.text-success { color: #10b981; }
.text-danger { color: #f56c6c; }

/* 操作按钮 */
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