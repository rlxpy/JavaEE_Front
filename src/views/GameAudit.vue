<template>
  <div class="audit-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">🛡️ 游戏上架审核中心</span>
        </div>
      </template>

      <el-table :data="gameList" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="游戏封面" width="120" align="center">
          <template #default="scope">
            <el-image
                :src="scope.row.coverImage"
                style="width: 80px; height: 50px; border-radius: 4px;"
                fit="cover"
                :preview-src-list="[scope.row.coverImage]"
            />
          </template>
        </el-table-column>

        <el-table-column prop="gameName" label="游戏名称" width="200" />
        <el-table-column prop="description" label="游戏简介" show-overflow-tooltip />

        <el-table-column label="提交时间" width="180" align="center">
          <template #default="scope">
            {{ new Date(scope.row.createTime).toLocaleString() }}
          </template>
        </el-table-column>

        <el-table-column label="审核操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="success" size="small" @click="handleAudit(scope.row.id, 1)">✅ 通过</el-button>
            <el-button type="danger" size="small" @click="handleAudit(scope.row.id, 2)">❌ 驳回</el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="太棒了，目前没有需要审核的游戏！" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAuditGameListAPI, processGameAuditAPI } from '../api/game.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const gameList = ref([])
const loading = ref(false)

onMounted(() => {
  fetchPendingGames()
})

// 拉取所有 status = 0 的游戏（待审核）
const fetchPendingGames = async () => {
  loading.value = true
  try {
    const res = await getAuditGameListAPI(0)
    if (res.data.code === 200) {
      gameList.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('获取待审核列表失败')
  } finally {
    loading.value = false
  }
}

// ⭐️ 处理审核逻辑（带二次确认保护）
const handleAudit = (gameId, newStatus) => {
  const actionName = newStatus === 1 ? '通过并上架' : '驳回并打回'

  ElMessageBox.confirm(
      `确认要 【${actionName}】 这款游戏吗？`,
      '审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: newStatus === 1 ? 'success' : 'warning',
      }
  ).then(async () => {
    try {
      const res = await processGameAuditAPI(gameId, newStatus)
      if (res.data.code === 200) {
        ElMessage.success(res.data.msg)
        fetchPendingGames() // 刷新表格，刚处理完的游戏会瞬间消失！
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
.audit-container {
  padding: 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
</style>