<template>
  <div class="my-games-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">📦 我的游戏库 (作品管理)</span>
        </div>
      </template>

      <el-table :data="gameList" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="封面" width="100" align="center">
          <template #default="scope">
            <el-image
                :src="scope.row.coverImage"
                style="width: 60px; height: 40px; border-radius: 4px;"
                fit="cover"
            />
          </template>
        </el-table-column>

        <el-table-column prop="gameName" label="游戏名称" width="200" />
        <el-table-column prop="description" label="游戏简介" show-overflow-tooltip />

        <el-table-column label="审核状态" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已上架</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="danger">被驳回</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="180" align="center">
          <template #default="scope">
            {{ new Date(scope.row.createTime).toLocaleString() }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link v-if="scope.row.status === 1" @click="router.push(`/game/detail/${scope.row.id}`)">查看</el-button>
            <el-button type="primary" link @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="你还没有发布过游戏，快去发布你的第一款大作吧！" />
        </template>
      </el-table>
    </el-card>
    <el-dialog v-model="editDialogVisible" title="📝 修改游戏信息" width="50%">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="游戏名称">
          <el-input v-model="editForm.gameName" />
        </el-form-item>
        <el-form-item label="游戏简介">
          <el-input v-model="editForm.description" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="封面预览">
          <el-image :src="editForm.coverImage" style="width: 200px; height: 120px; border-radius: 8px;" fit="cover" />
          <div style="font-size: 12px; color: #909399; margin-top: 5px;">提示：如需更换封面，请先删除本条记录后重新发布（或后续集成上传组件）</div>
        </el-form-item>
      </el-form>
      <template #footer>
    <span class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitUpdate">保 存 修改</el-button>
    </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted , reactive} from 'vue'
import { useRouter } from 'vue-router'
import { getDeveloperGamesAPI, deleteGameAPI , updateGameAPI} from '../api/game.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user'))
const gameList = ref([])
const loading = ref(false)
// ⭐️ 新增：编辑相关变量
const editDialogVisible = ref(false)
const editForm = reactive({
  id: null,
  gameName: '',
  description: '',
  coverImage: '',
  developerId: user.id
})

onMounted(() => {
  // 只有开发者或管理员才能加载数据
  if (user && user.id && user.role >= 1) {
    fetchMyGames()
  }
})

// 拉取我的游戏列表
const fetchMyGames = async () => {
  loading.value = true
  try {
    const res = await getDeveloperGamesAPI(user.id)
    if (res.data.code === 200) {
      gameList.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('获取游戏列表失败')
  } finally {
    loading.value = false
  }
}

// 删除游戏
const handleDelete = (gameId) => {
  ElMessageBox.confirm(
      '确认要永久删除这款游戏吗？删除后玩家将无法再看到它！',
      '危险操作提示',
      {
        confirmButtonText: '狠心删除',
        cancelButtonText: '手滑了',
        type: 'warning',
      }
  ).then(async () => {
    try {
      const res = await deleteGameAPI(gameId, user.id)
      if (res.data.code === 200) {
        ElMessage.success('删除成功！')
        fetchMyGames() // 刷新列表
      } else {
        ElMessage.error(res.data.msg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('网络请求异常')
    }
  }).catch(() => {})
}

// ⭐️ 打开弹窗并实现“数据回显”
const openEditDialog = (row) => {
  editForm.id = row.id
  editForm.gameName = row.gameName
  editForm.description = row.description
  editForm.coverImage = row.coverImage
  editDialogVisible.value = true
}

// ⭐️ 提交修改逻辑
const submitUpdate = async () => {
  if (!editForm.gameName || !editForm.description) {
    ElMessage.warning('游戏名称和简介不能为空哦')
    return
  }

  try {
    const res = await updateGameAPI(editForm)
    if (res.data.code === 200) {
      ElMessage.success('保存成功！')
      editDialogVisible.value = false
      fetchMyGames() // 刷新列表，看到最新的修改
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常')
  }
}
</script>

<style scoped>
.my-games-container {
  padding: 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
</style>