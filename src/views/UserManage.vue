<template>
  <div class="manage-container">
    <div class="page-header">
      <el-icon class="header-icon"><UserFilled /></el-icon>
      <h2 class="header-title">全站用户管理中心</h2>
    </div>

    <div class="toolbar-card">
      <div class="search-group">
        <el-input
            v-model="queryParams.keyword"
            placeholder="搜索账号或玩家昵称..."
            clearable
            prefix-icon="Search"
            class="custom-search"
            @keyup.enter="handleSearch"
        />

        <el-select
            v-model="queryParams.role"
            placeholder="所有身份"
            clearable
            class="custom-select"
            @change="handleSearch"
        >
          <el-option label="普通玩家" :value="0" />
          <el-option label="游戏开发者" :value="1" />
          <el-option label="超级管理员" :value="2" />
        </el-select>
      </div>

      <div class="action-group">
        <el-button type="primary" round class="shimmer-btn search-btn" @click="handleSearch">查 询</el-button>
        <el-button round class="reset-btn" @click="resetSearch">重 置</el-button>
      </div>
    </div>

    <div class="table-card">
      <el-table
          :data="userList"
          style="width: 100%"
          v-loading="loading"
          class="modern-table"
          :header-cell-style="{ background: '#f8fafc', color: '#64748b', fontWeight: 'bold', borderBottom: 'none' }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column label="用户" min-width="250">
          <template #default="scope">
            <div class="user-cell">
              <el-avatar :size="46" :src="scope.row.avatar" class="user-avatar">
                {{ scope.row.nickname?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <span class="user-nickname">{{ scope.row.nickname }}</span>
                <span class="user-account">{{ scope.row.username }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="当前身份" width="160" align="center">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)" effect="light" round class="role-tag">
              {{ getRoleName(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="账号状态" width="140" align="center">
          <template #default="scope">
            <div class="status-indicator">
              <span class="status-dot" :class="scope.row.status === 1 ? 'dot-danger' : 'dot-success'"></span>
              <span class="status-text" :class="scope.row.status === 1 ? 'text-danger' : 'text-success'">
                {{ scope.row.status === 1 ? '已封禁' : '正常活跃' }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="管理操作" width="300" align="right">
          <template #default="scope">
            <div class="action-cell">
              <el-select
                  v-model="scope.row.role"
                  size="small"
                  class="action-select"
                  @change="(newRole) => handleRoleChange(scope.row.id, newRole)"
                  :disabled="scope.row.role === 2"
                  placeholder="修改身份"
              >
                <el-option label="普通玩家" :value="0" />
                <el-option label="游戏开发者" :value="1" />
                <el-option label="超级管理员" :value="2" />
              </el-select>

              <el-button
                  v-if="scope.row.role !== 2"
                  :type="scope.row.status === 1 ? 'success' : 'danger'"
                  size="small"
                  plain
                  round
                  class="action-btn"
                  @click="handleBanToggle(scope.row)"
              >
                <el-icon style="margin-right: 4px;">
                  <RefreshLeft v-if="scope.row.status === 1" />
                  <Lock v-else />
                </el-icon>
                {{ scope.row.status === 1 ? '解除封禁' : '封禁账号' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-box">
        <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.size"
            :page-sizes="[10, 20, 50]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="modern-pagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
// ⭐️ 引入高级图标
import { UserFilled, Search, RefreshLeft, Lock } from '@element-plus/icons-vue'
import { getUsersByPageAPI, updateUserInfoAPI } from '../api/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request.js'

const userList = ref([])
const total = ref(0)
const loading = ref(false)

const queryParams = reactive({
  page: 1,
  size: 10,
  keyword: '',
  role: null
})

onMounted(() => {
  fetchUsers()
})

const fetchUsers = async () => {
  try {
    loading.value = true
    const res = await getUsersByPageAPI(queryParams)
    if (res.code === 200) {
      const pageInfo = res.data
      userList.value = pageInfo.list
      total.value = pageInfo.total
    } else {
      ElMessage.error(res.msg || '获取用户失败')
    }
  } catch (error) {
    ElMessage.error('网络错误')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchUsers()
}

const resetSearch = () => {
  queryParams.keyword = ''
  queryParams.role = null
  queryParams.page = 1
  fetchUsers()
}

const handleSizeChange = (newSize) => {
  queryParams.size = newSize
  queryParams.page = 1
  fetchUsers()
}

const handleCurrentChange = (newPage) => {
  queryParams.page = newPage
  fetchUsers()
}

const handleRoleChange = async (userId, newRole) => {
  try {
    const postData = { id: userId, role: newRole }
    const res = await updateUserInfoAPI(postData)
    if (res.code === 200) {
      ElMessage.success('用户权限修改成功！')
    } else {
      ElMessage.error(res.msg || '权限修改失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常')
  }
}

const getRoleTagType = (role) => {
  if (role === 1) return 'warning'
  if (role === 2) return 'danger'
  return 'info' // 玩家角色用低调灰
}

const getRoleName = (role) => {
  if (role === 1) return '游戏开发者'
  if (role === 2) return '超级管理员'
  return '普通玩家'
}

const handleBanToggle = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '封禁' : '解除封禁'

  try {
    await ElMessageBox.confirm(
        `确定要 ${actionText} 玩家【${row.nickname}】吗？`,
        '超级管理员权限确认',
        { confirmButtonText: '确定执行', cancelButtonText: '取消', type: 'warning' }
    )

    const res = await request.post(`/user/admin/ban?id=${row.id}&status=${newStatus}`)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      row.status = newStatus
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('网络异常，请重试')
  }
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  flex-wrap: wrap;
  gap: 15px;
}
.search-group {
  display: flex;
  gap: 15px;
  align-items: center;
}
:deep(.custom-search .el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  width: 280px;
}
:deep(.custom-select .el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  width: 160px;
}
.action-group {
  display: flex;
  gap: 12px;
}
.search-btn { padding: 0 25px; font-weight: bold; }
.reset-btn { font-weight: bold; color: #5c6b77; }

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
  padding: 16px 0; /* 增加行高呼吸感 */
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.3s;
}
:deep(.modern-table::before) { display: none; /* 去掉表格最底下的黑线 */ }
:deep(.modern-table .el-table__inner-wrapper::before) { display: none; }

/* 用户信息双行展示 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 15px;
}
.user-avatar {
  border: 2px solid #f4f6fc;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.user-nickname {
  font-weight: 800;
  font-size: 15px;
  color: #2c3e50;
}
.user-account {
  font-size: 13px;
  color: #8a9bb1;
  margin-top: 2px;
}

.role-tag {
  font-weight: bold;
  padding: 0 12px;
}

/* 高级圆点状态指示器 */
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
.dot-success { background-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
.dot-danger { background-color: #f56c6c; box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.15); }
.status-text { font-weight: bold; font-size: 13px; }
.text-success { color: #10b981; }
.text-danger { color: #f56c6c; }

/* 操作按钮防干扰 */
.action-cell {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}
:deep(.action-select .el-input__wrapper) {
  border-radius: 12px;
  background-color: #f8fafc;
  box-shadow: none !important;
  border: 1px solid transparent;
  transition: all 0.3s;
}
:deep(.action-select .el-input__wrapper:focus-within),
:deep(.action-select .el-input__wrapper:hover) {
  background-color: #ffffff;
  border: 1px solid #409eff;
}
.action-btn { font-weight: bold; }

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