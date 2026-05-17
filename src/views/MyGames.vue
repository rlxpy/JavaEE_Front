<template>
  <div class="manage-container">
    <div class="page-header">
      <el-icon class="header-icon"><Box /></el-icon>
      <h2 class="header-title">我的游戏库</h2>
    </div>

    <div class="table-card">
      <el-table
          :data="gameList"
          style="width: 100%"
          v-loading="loading"
          class="modern-table"
          :header-cell-style="{ background: '#f8fafc', color: '#64748b', fontWeight: 'bold', borderBottom: 'none' }"
      >
        <el-table-column label="游戏作品" min-width="320">
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
                <span class="game-desc" :title="scope.row.description">{{ scope.row.description }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="审核状态" width="140" align="center">
          <template #default="scope">
            <div class="status-indicator">
              <span class="status-dot" :class="getStatusDotClass(scope.row.status)"></span>
              <span class="status-text" :class="getStatusTextClass(scope.row.status)">
                {{ getStatusName(scope.row.status) }}
              </span>
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

        <el-table-column label="作品管理" width="220" align="right" fixed="right">
          <template #default="scope">
            <div class="action-cell">
              <el-button
                  v-if="scope.row.status === 1"
                  type="primary"
                  plain
                  round
                  size="small"
                  class="action-btn"
                  @click="router.push(`/game/detail/${scope.row.id}`)"
              >
                <el-icon style="margin-right: 4px;"><View /></el-icon> 查看
              </el-button>

              <el-button
                  type="info"
                  plain
                  round
                  size="small"
                  class="action-btn"
                  @click="openEditDialog(scope.row)"
              >
                <el-icon><Edit /></el-icon>
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
            <el-empty description="你还没有发布过游戏，快去发布你的第一款大作吧！" />
            <el-button type="primary" round class="shimmer-btn" style="margin-top: 15px;" @click="router.push('/dashboard/publish')">
              发布新游戏
            </el-button>
          </div>
        </template>
      </el-table>
    </div>

    <el-dialog v-model="editDialogVisible" title="修改游戏信息" width="500px" class="custom-dialog">
      <el-form :model="editForm" label-width="80px" label-position="top">
        <el-form-item label="游戏名称">
          <el-input v-model="editForm.gameName" class="anime-input" size="large" />
        </el-form-item>
        <el-form-item label="游戏简介">
          <el-input v-model="editForm.description" type="textarea" :rows="4" class="custom-textarea" />
        </el-form-item>
        <el-form-item label="当前封面预览">
          <div class="preview-cover-box">
            <el-image :src="editForm.coverImage" class="preview-img" fit="cover" />
            <div class="cover-tip">如需更换封面，请先删除本条记录后重新发布。</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false" round>取 消</el-button>
          <el-button type="primary" class="shimmer-btn" round @click="submitUpdate" style="padding: 0 30px;">保存修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
// ⭐️ 引入高级图标
import { Box, Clock, View, Edit, Delete } from '@element-plus/icons-vue'
import { getDeveloperGamesAPI, deleteGameAPI, updateGameAPI } from '../api/game.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user'))
const gameList = ref([])
const loading = ref(false)

const editDialogVisible = ref(false)
const editForm = reactive({
  id: null,
  gameName: '',
  description: '',
  coverImage: '',
  developerId: user ? user.id : null
})

onMounted(() => {
  if (user && user.id && user.role >= 1) {
    fetchMyGames()
  }
})

const fetchMyGames = async () => {
  loading.value = true
  try {
    const res = await getDeveloperGamesAPI(user.id)
    if (res.code === 200) {
      gameList.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取游戏列表失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = (gameId) => {
  ElMessageBox.confirm(
      '确认要永久删除这款游戏吗？<br><strong style="color: #f56c6c;">删除后玩家将无法再看到它！</strong>',
      '危险操作提示',
      {
        confirmButtonText: '狠心删除',
        cancelButtonText: '手滑了',
        type: 'warning',
        dangerouslyUseHTMLString: true // 开启 HTML 支持
      }
  ).then(async () => {
    try {
      const res = await deleteGameAPI(gameId, user.id)
      if (res.code === 200) {
        ElMessage.success('删除成功！')
        fetchMyGames()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('网络请求异常')
    }
  }).catch(() => {})
}

const openEditDialog = (row) => {
  editForm.id = row.id
  editForm.gameName = row.gameName
  editForm.description = row.description
  editForm.coverImage = row.coverImage
  editDialogVisible.value = true
}

const submitUpdate = async () => {
  if (!editForm.gameName || !editForm.description) {
    ElMessage.warning('游戏名称和简介不能为空哦')
    return
  }
  try {
    const res = await updateGameAPI(editForm)
    if (res.code === 200) {
      ElMessage.success('保存成功！')
      editDialogVisible.value = false
      fetchMyGames()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常')
  }
}

// ⭐️ 状态辅助函数
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

/* ================= 表格卡片区域 ================= */
.table-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}

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

/* ⭐️ 游戏合体名片 */
.game-cell {
  display: flex;
  align-items: center;
  gap: 15px;
}
.game-cover {
  width: 90px;
  height: 60px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #f4f6fc;
}
.game-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  flex: 1;
}
.game-name {
  font-weight: 800;
  font-size: 16px;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
.game-desc {
  font-size: 13px;
  color: #8a9bb1;
  white-space: nowrap;
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
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-warning { background-color: #e6a23c; box-shadow: 0 0 0 3px rgba(230, 162, 60, 0.15); }
.dot-success { background-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
.dot-danger { background-color: #f56c6c; box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.15); }

.status-text { font-weight: bold; font-size: 13px; }
.text-warning { color: #e6a23c; }
.text-success { color: #10b981; }
.text-danger { color: #f56c6c; }

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

/* ================= 弹窗样式重构 ================= */
.custom-dialog { border-radius: 16px; }
:deep(.anime-input .el-input__wrapper) {
  border-radius: 12px; background-color: #f4f6fc; box-shadow: none !important; border: 1px solid transparent; transition: all 0.3s;
}
:deep(.anime-input .el-input__wrapper:focus-within) { background-color: #ffffff; border: 1px solid #409eff; box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2) !important; }

:deep(.custom-textarea .el-textarea__inner) {
  border-radius: 12px; background-color: #f4f6fc; border: 1px solid transparent; transition: all 0.3s; padding: 12px;
}
:deep(.custom-textarea .el-textarea__inner:focus) { background-color: #ffffff; border-color: #409eff; box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2); }

.preview-cover-box { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px dashed #cbd5e1; display: inline-block; }
.preview-img { width: 160px; height: 100px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.cover-tip { font-size: 12px; color: #94a3b8; margin-top: 8px; max-width: 200px; line-height: 1.5; }

/* 流光按钮 */
.shimmer-btn { position: relative; overflow: hidden; border: none; background: linear-gradient(90deg, #409eff 0%, #7367f0 100%); }
.shimmer-btn::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
  background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }
</style>