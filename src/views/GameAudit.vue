<template>
  <div class="manage-container">
    <div class="page-header">
      <el-icon class="header-icon"><DocumentChecked /></el-icon>
      <h2 class="header-title">游戏上架审核中心</h2>
    </div>

    <div class="table-card">
      <el-table
          :data="gameList"
          style="width: 100%"
          v-loading="loading"
          class="modern-table"
          :header-cell-style="{ background: '#f8fafc', color: '#64748b', fontWeight: 'bold', borderBottom: 'none' }"
      >

        <el-table-column label="申请游戏信息" min-width="300">
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
                <span class="submit-time">
                  <el-icon style="vertical-align: -2px; margin-right: 2px;"><Clock /></el-icon>
                  提交于：{{ new Date(scope.row.createTime).toLocaleString() }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="游戏简介" min-width="350">
          <template #default="scope">
            <div class="desc-text" :title="scope.row.description">
              {{ scope.row.description }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="审核决断" width="220" align="right">
          <template #default="scope">
            <div class="action-cell">
              <el-button
                  type="success"
                  round
                  plain
                  class="action-btn"
                  @click="handleAudit(scope.row.id, 1)"
              >
                <el-icon style="margin-right: 4px;"><Check /></el-icon> 通过
              </el-button>

              <el-button
                  type="danger"
                  round
                  plain
                  class="action-btn"
                  @click="handleAudit(scope.row.id, 2)"
              >
                <el-icon style="margin-right: 4px;"><Close /></el-icon> 驳回
              </el-button>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-box">
            <el-empty description="太棒了，所有游戏都已审核完毕，目前列表空空如也！" />
          </div>
        </template>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// ⭐️ 引入高级矢量图标
import { DocumentChecked, Clock, Check, Close } from '@element-plus/icons-vue'
import { getAuditGameListAPI, processGameAuditAPI } from '../api/game.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const gameList = ref([])
const loading = ref(false)

onMounted(() => {
  fetchPendingGames()
})

const fetchPendingGames = async () => {
  loading.value = true
  try {
    const res = await getAuditGameListAPI(0)
    if (res.code === 200) {
      gameList.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取待审核列表失败')
  } finally {
    loading.value = false
  }
}

const handleAudit = (gameId, newStatus) => {
  const actionName = newStatus === 1 ? '通过并上架' : '驳回并打回'
  const actionColor = newStatus === 1 ? '#10b981' : '#f56c6c'

  ElMessageBox.confirm(
      `确认要 <strong style="color: ${actionColor};">${actionName}</strong> 这款游戏吗？`,
      '审核最终确认',
      {
        confirmButtonText: '确定执行',
        cancelButtonText: '再看看',
        type: newStatus === 1 ? 'success' : 'warning',
        dangerouslyUseHTMLString: true // 允许在弹窗中使用 HTML，让加粗高亮生效
      }
  ).then(async () => {
    try {
      const res = await processGameAuditAPI(gameId, newStatus)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        fetchPendingGames()
      } else {
        ElMessage.error('操作失败')
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
  color: #10b981; /* 审核中心用象征通过的青绿色 */
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

/* 改造 Element 表格默认样式 */
:deep(.modern-table) {
  border-radius: 12px;
  overflow: hidden;
}
:deep(.modern-table .el-table__row td) {
  padding: 20px 0; /* 审核界面的行高可以稍微大一点点 */
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.3s;
}
:deep(.modern-table::before) { display: none; }
:deep(.modern-table .el-table__inner-wrapper::before) { display: none; }

/* ⭐️ 审核专用合体名片 */
.game-cell {
  display: flex;
  align-items: center;
  gap: 15px;
}
.game-cover {
  width: 80px;
  height: 52px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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
  max-width: 180px;
}
.submit-time {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 4px;
}

/* 游戏简介溢出处理 */
.desc-text {
  color: #5c6b77;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 操作按钮 */
.action-cell {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.action-btn {
  font-weight: bold;
  padding: 8px 18px;
}

/* 空状态 */
.empty-box {
  padding: 50px 0;
}
</style>