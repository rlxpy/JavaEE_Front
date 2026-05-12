<template>
  <div class="admin-forum-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">🛡️ 论坛与评论治理中心 (上帝视角)</span>
        </div>
      </template>

      <div style="margin-bottom: 20px; display: flex; gap: 15px;">
        <el-input
            v-model="searchKeyword"
            placeholder="全站检索：输入违规评论关键词..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 350px;"
            prefix-icon="Search"
        />
        <el-button type="primary" @click="handleSearch">检索全站评论</el-button>
      </div>

      <el-table :data="commentList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column label="发布人" width="150">
          <template #default="scope">
            <div style="display: flex; align-items: center; gap: 10px;">
              <el-avatar :size="30" :src="scope.row.avatar">{{ scope.row.nickname?.charAt(0) || '匿' }}</el-avatar>
              <span>{{ scope.row.nickname || '匿名用户' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="content" label="评论/回复内容" show-overflow-tooltip />

        <el-table-column label="发布时间" width="180" align="center">
          <template #default="scope">
            {{ scope.row.createTime ? new Date(scope.row.createTime).toLocaleString() : '未知' }}
          </template>
        </el-table-column>

        <el-table-column label="治理操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button type="danger" plain size="small" @click="handleForceDelete(scope.row.id)">⚠️ 强制删除</el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="平台环境良好，暂无评论" />
        </template>
      </el-table>

      <div style="margin-top: 20px; display: flex; justify-content: center;">
        <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :total="total"
            :page-sizes="[10, 20, 50]"
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
}

// 👑 执行强制删评
const handleForceDelete = (id) => {
  ElMessageBox.confirm(
      '确认要强制清除这条违规评论吗？此操作不可逆！',
      '⚠️ 平台治理警告',
      {
        confirmButtonText: '确定清除',
        cancelButtonText: '取消',
        type: 'error',
      }
  ).then(async () => {
    try {
      const res = await deleteCommentByAdminAPI(id)
      if (res.code === 200) {
        ElMessage.success('已成功清除违规评论！')
        fetchComments() // 刷新表格
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
.admin-forum-container {
  padding: 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
</style>