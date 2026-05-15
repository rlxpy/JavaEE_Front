<template>
  <div class="my-posts-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">📝 我的发帖管理</span>
        </div>
      </template>

      <div style="margin-bottom: 20px; display: flex; gap: 15px;">
        <el-input
            v-model="searchKeyword"
            placeholder="输入帖子标题或内容关键词搜索..."
            clearable
            @clear="fetchMyPosts"
            @keyup.enter="fetchMyPosts"
            style="width: 300px;"
            prefix-icon="Search"
        />
        <el-button type="primary" @click="fetchMyPosts">搜索</el-button>
      </div>

      <el-table :data="postList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="帖子标题" width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="内容摘要" show-overflow-tooltip />

        <el-table-column label="互动数据" width="120" align="center">
          <template #default="scope">
            👁️ {{ scope.row.viewCount || 0 }} <br>
            👍 {{ scope.row.likeCount || 0 }}
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="180" align="center">
          <template #default="scope">
            {{ new Date(scope.row.createTime).toLocaleString() }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="router.push(`/forum/detail/${scope.row.id}`)">查看</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="你还没有发布过帖子，快去论坛水一贴吧！" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyPostsAPI, deleteMyPostAPI } from '../api/post.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user'))
const postList = ref([])
const loading = ref(false)

const searchKeyword = ref('') // ⭐️ 新增：绑定搜索框的变量

onMounted(() => {
  if (user && user.id) {
    fetchMyPosts()
  }
})

// 拉取我的帖子列表
const fetchMyPosts = async () => {
  loading.value = true
  try {
    // ⭐️ 把 searchKeyword 传给 API
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

// ⭐️ 删除帖子的二次确认与逻辑
const handleDelete = (postId) => {
  ElMessageBox.confirm(
      '确认要永久删除这篇帖子吗？删除后不可恢复哦！',
      '危险操作提示',
      {
        confirmButtonText: '狠心删除',
        cancelButtonText: '手滑了',
        type: 'warning',
      }
  ).then(async () => {
    try {
      const res = await deleteMyPostAPI(postId)
      if (res.code === 200) {
        ElMessage.success('删除成功！')
        fetchMyPosts() // 刷新列表
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('网络请求异常')
    }
  }).catch(() => {
    // 点击取消什么也不做
  })
}
</script>

<style scoped>
.my-posts-container {
  padding: 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
</style>