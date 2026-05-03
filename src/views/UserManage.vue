<template>
  <div class="manage-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">👑 全站用户管理中心 (豪华版)</span>
        </div>
      </template>

      <div class="toolbar">
        <el-input
            v-model="queryParams.keyword"
            placeholder="搜索账号或昵称"
            clearable
            prefix-icon="Search"
            style="width: 250px"
            @keyup.enter="handleSearch"
        />

        <el-select
            v-model="queryParams.role"
            placeholder="所有身份"
            clearable
            style="width: 150px; margin-left: 15px"
            @change="handleSearch"
        >
          <el-option label="普通玩家" :value="0" />
          <el-option label="游戏开发者" :value="1" />
          <el-option label="超级管理员" :value="2" />
        </el-select>

        <el-button type="primary" style="margin-left: 15px" @click="handleSearch">查 询</el-button>
        <el-button @click="resetSearch">重 置</el-button>
      </div>

      <el-table :data="userList" stripe border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="用户ID" width="80" align="center" />

        <el-table-column label="头像" width="100" align="center">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar">
              {{ scope.row.nickname?.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>

        <el-table-column prop="username" label="登录账号" width="150" />
        <el-table-column prop="nickname" label="玩家昵称" />

        <el-table-column label="当前身份" width="150" align="center">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)" effect="dark">
              {{ getRoleName(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作 (修改权限)" width="200" align="center">
          <template #default="scope">
            <el-select
                v-model="scope.row.role"
                size="small"
                @change="(newRole) => handleRoleChange(scope.row.id, newRole)"
                :disabled="scope.row.role === 2"
                placeholder="修改身份"
            >
              <el-option label="普通玩家" :value="0" />
              <el-option label="游戏开发者" :value="1" />
              <el-option label="超级管理员" :value="2" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-box">
        <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.size"
            :page-sizes="[5, 10, 20, 50]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUsersByPageAPI, updateUserInfoAPI } from '../api/user.js'
import { ElMessage } from 'element-plus'

const userList = ref([]) // 存放当前页的数据
const total = ref(0)     // 存放总条数
const loading = ref(false)

// ⭐️ 核心参数：传给后端的所有搜索/分页条件都在这里
const queryParams = reactive({
  page: 1,       // 当前第几页
  size: 10,      // 每页多少条
  keyword: '',   // 搜索关键词
  role: null     // 筛选的角色
})

// 页面一加载就去请求第一页数据
onMounted(() => {
  fetchUsers()
})

// 拉取数据的核心方法
const fetchUsers = async () => {
  try {
    loading.value = true
    const res = await getUsersByPageAPI(queryParams)
    if (res.data.code === 200) {
      // ⭐️ 注意这里的拆解：PageInfo 对象在 res.data.data 里
      const pageInfo = res.data.data
      userList.value = pageInfo.list  // 取出当前页的数组
      total.value = pageInfo.total    // 取出总条数
    } else {
      ElMessage.error(res.data.msg || '获取用户失败')
    }
  } catch (error) {
    ElMessage.error('网络错误')
  } finally {
    loading.value = false
  }
}

// 点击搜索按钮
const handleSearch = () => {
  queryParams.page = 1 // 每次搜索都强行回到第一页
  fetchUsers()
}

// 点击重置按钮
const resetSearch = () => {
  queryParams.keyword = ''
  queryParams.role = null
  queryParams.page = 1
  fetchUsers()
}

// 每页显示多少条 (size) 改变时触发
const handleSizeChange = (newSize) => {
  queryParams.size = newSize
  queryParams.page = 1 // 只要改变了每页条数，最好也回到第一页
  fetchUsers()
}

// 用户点击了页码 (比如点了第 3 页)
const handleCurrentChange = (newPage) => {
  queryParams.page = newPage
  fetchUsers()
}

// 触发权限修改 (保持原样)
const handleRoleChange = async (userId, newRole) => {
  try {
    const postData = { id: userId, role: newRole }
    const res = await updateUserInfoAPI(postData)
    if (res.data.code === 200) {
      ElMessage.success('用户权限修改成功！')
    } else {
      ElMessage.error(res.data.msg || '权限修改失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常')
  }
}

// 辅助函数
const getRoleTagType = (role) => {
  if (role === 1) return 'warning'
  if (role === 2) return 'danger'
  return 'success'
}

const getRoleName = (role) => {
  if (role === 1) return '开发者'
  if (role === 2) return '超级管理员'
  return '普通玩家'
}
</script>

<style scoped>
.manage-container {
  padding: 20px;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
}
.toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
.pagination-box {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end; /* 分页器靠右对齐 */
}
</style>