<template>
  <div class="admin-game-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">🎮 全站游戏治理 (上帝视角)</span>
        </div>
      </template>

      <div style="margin-bottom: 20px; display: flex; gap: 15px;">
        <el-input
            v-model="searchKeyword"
            placeholder="全站检索：输入游戏名称或简介关键词..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 350px;"
            prefix-icon="Search"
        />
        <el-button type="primary" @click="handleSearch">全站检索</el-button>
      </div>

      <el-table :data="gameList" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="封面" width="100" align="center">
          <template #default="scope">
            <el-image
                :src="scope.row.coverImage"
                style="width: 60px; height: 40px; border-radius: 4px;"
                fit="cover"
                :preview-src-list="[scope.row.coverImage]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="gameName" label="游戏名称" width="180" />
        <el-table-column prop="description" label="游戏简介" show-overflow-tooltip />

        <el-table-column label="当前状态" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已上架</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="danger">被驳回</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="治理操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button type="danger" plain size="small" @click="handleForceDelete(scope.row)">⚠️ 强制下架</el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="平台暂无任何游戏数据" />
        </template>
      </el-table>

      <div style="margin-top: 20px; display: flex; justify-content: center;">
        <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :total="total"
            :page-sizes="[5, 10, 20]"
            :page-size="pageSize"
            v-model:current-page="currentPage"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

// 拉取全站游戏列表
const fetchAdminGames = async () => {
  loading.value = true
  try {
    const res = await getAllGamesForAdminAPI(currentPage.value, pageSize.value, searchKeyword.value)
    if (res.data.code === 200) {
      gameList.value = res.data.data.list
      total.value = res.data.data.total
    }
  } catch (error) {
    ElMessage.error('获取全站游戏失败')
  } finally {
    loading.value = false
  }
}

// 触发搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchAdminGames()
}

// 分页发生变化
const handleSizeChange = (size) => {
  pageSize.value = size
  handleSearch()
}
const handlePageChange = (page) => {
  currentPage.value = page
  fetchAdminGames()
}

// 👑 执行强制下架
const handleForceDelete = (row) => {
  ElMessageBox.confirm(
      `确认要强制下架并彻底删除游戏【${row.gameName}】吗？此操作不可逆！`,
      '⚠️ 平台治理警告',
      {
        confirmButtonText: '确定下架',
        cancelButtonText: '取消',
        type: 'error',
      }
  ).then(async () => {
    try {
      const res = await deleteGameByAdminAPI(row.id)
      if (res.data.code === 200) {
        ElMessage.success('已成功对该游戏执行降维打击！')
        fetchAdminGames() // 刷新表格
      } else {
        ElMessage.error(res.data.msg || '下架失败')
      }
    } catch (error) {
      ElMessage.error('网络请求异常')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.admin-game-container {
  padding: 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
</style>