<template>
  <div class="manage-container">
    <div class="page-header">
      <el-icon class="header-icon"><Warning /></el-icon>
      <h2 class="header-title">举报处理中心</h2>
    </div>

    <div class="toolbar-card">
      <div class="filter-group">
        <span class="filter-label">案卷状态筛选：</span>
        <el-radio-group v-model="queryParams.status" @change="handleFilterChange" class="custom-radio">
          <el-radio-button :label="null">全部案卷</el-radio-button>
          <el-radio-button :label="0">待处理</el-radio-button>
          <el-radio-button :label="1">已清理</el-radio-button>
          <el-radio-button :label="2">已驳回</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="table-card">
      <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          class="modern-table"
          :header-cell-style="{ background: '#f8fafc', color: '#64748b', fontWeight: 'bold', borderBottom: 'none' }"
      >
        <el-table-column prop="id" label="案卷号" width="90" align="center">
          <template #default="scope">
            <span class="id-text"># {{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="目标类型" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.targetType === 'post'" type="primary" effect="light" round class="type-tag">帖子</el-tag>
            <el-tag v-else-if="scope.row.targetType === 'comment'" type="warning" effect="light" round class="type-tag">评论</el-tag>
            <el-tag v-else-if="scope.row.targetType === 'game'" type="success" effect="light" round class="type-tag">游戏</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="案发现场 (被举报内容预览)" min-width="280">
          <template #default="scope">
            <div class="preview-box" :title="scope.row.targetPreview">
              {{ scope.row.targetPreview }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="举报原因及描述" min-width="220">
          <template #default="scope">
            <div class="reason-text" :title="scope.row.reason">
              <el-icon class="reason-icon"><WarningFilled /></el-icon>
              <span>{{ scope.row.reason }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="举报人" width="130" align="center">
          <template #default="scope">
            <span class="reporter-text">{{ scope.row.reporterNickname || '匿名' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="举报时间" width="160" align="center">
          <template #default="scope">
            <span class="time-text">{{ new Date(scope.row.createTime).toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column label="案件状态" width="120" align="center">
          <template #default="scope">
            <div class="status-indicator">
              <span class="status-dot" :class="getStatusDotClass(scope.row.status)"></span>
              <span class="status-text" :class="getStatusTextClass(scope.row.status)">
                {{ getStatusName(scope.row.status) }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="审判操作" width="220" align="right" fixed="right">
          <template #default="scope">
            <div v-if="scope.row.status === 0" class="action-cell">
              <el-button type="danger" size="small" plain round class="action-btn" @click="handleProcess(scope.row, 1)">
                <el-icon style="margin-right: 4px;"><Remove /></el-icon> 封杀并警告
              </el-button>
              <el-button type="info" size="small" plain round class="action-btn" @click="handleProcess(scope.row, 2)">
                <el-icon style="margin-right: 4px;"><Close /></el-icon> 驳回
              </el-button>
            </div>
            <div v-else class="resolved-cell">
              <el-icon style="margin-right: 4px;"><Finished /></el-icon> 已结案
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-box">
            <el-empty description="太棒了，目前没有收到任何举报案卷！" />
          </div>
        </template>
      </el-table>

      <div class="pagination-box" v-if="total > 0">
        <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.size"
            :page-sizes="[10, 20, 50]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="fetchData"
            @current-change="fetchData"
            class="modern-pagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
// ⭐️ 引入全部需要的高级矢量图标
import { Warning, WarningFilled, Remove, Close, Finished } from '@element-plus/icons-vue'
import { getAdminReportListAPI, processReportAPI } from '../api/report.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  size: 10,
  status: 0 // 默认打开页面只看“待处理”的举报
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAdminReportListAPI(queryParams)
    if (res.code === 200) {
      tableData.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '获取列表失败')
    }
  } catch (error) {
    ElMessage.error('网络异常')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  queryParams.page = 1
  fetchData()
}

// 👑 核心：执行审判 (带智能话术提取与自定义输入)
const handleProcess = async (row, action) => {
  try {
    let customMessage = ''

    if (action === 1) {
      let violationType = '严重违规'
      const match = row.reason.match(/【(.*?)】/)
      if (match && match[1]) {
        violationType = match[1]
      }

      const targetName = row.targetType === 'post' ? '帖子' : (row.targetType === 'comment' ? '评论' : '游戏')
      const defaultMsg = `【系统违规处理通知】\n您发布的${targetName}因涉嫌“${violationType}”，已被社区管家强制清除。\n请严格遵守平台规范，共同维护良好的交流环境！`

      const { value } = await ElMessageBox.prompt(
          '系统将删除该内容并发送以下警告信（您可以直接修改内容）：',
          '平台内容安全审判',
          {
            confirmButtonText: '确定执行制裁',
            cancelButtonText: '取消',
            inputValue: defaultMsg,
            inputType: 'textarea',
            inputPlaceholder: '请输入发给用户的系统警告内容...',
            type: 'warning',
            customClass: 'process-prompt-dialog' // 给弹窗加个类名备用
          }
      )
      customMessage = value

    } else {
      await ElMessageBox.confirm('确定要驳回这条举报记录吗？（被举报内容将不受影响）', '驳回确认', {
        confirmButtonText: '确定驳回',
        cancelButtonText: '取消',
        type: 'info'
      })
    }

    const res = await processReportAPI(row.id, action, customMessage)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      fetchData()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('网络异常，操作失败')
  }
}

// 辅助函数：状态圆点解析
const getStatusName = (status) => {
  if (status === 0) return '待处理'
  if (status === 1) return '已清理'
  if (status === 2) return '已驳回'
  return '未知'
}
const getStatusDotClass = (status) => {
  if (status === 0) return 'dot-danger'   // 待处理需要红点警示
  if (status === 1) return 'dot-success'  // 已清理是绿点
  if (status === 2) return 'dot-info'     // 驳回是灰点
}
const getStatusTextClass = (status) => {
  if (status === 0) return 'text-danger'
  if (status === 1) return 'text-success'
  if (status === 2) return 'text-info'
}

onMounted(() => {
  fetchData()
})
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
  color: #e74c3c; /* 举报中心用威严的红色 */
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
.filter-group {
  display: flex;
  align-items: center;
}
.filter-label {
  font-size: 14px;
  font-weight: bold;
  color: #5c6b77;
  margin-right: 15px;
}

/* 高级胶囊选择器 */
:deep(.custom-radio) {
  display: inline-flex;
  flex-wrap: nowrap;
}
:deep(.custom-radio .el-radio-button__inner) {
  border: none !important;
  background: #f4f6fc;
  color: #5c6b77;
  box-shadow: none !important;
  font-weight: 600;
  padding: 10px 20px;
}
:deep(.custom-radio .el-radio-button:first-child .el-radio-button__inner) { border-radius: 20px 0 0 20px; }
:deep(.custom-radio .el-radio-button:last-child .el-radio-button__inner) { border-radius: 0 20px 20px 0; }
:deep(.custom-radio .el-radio-button.is-active .el-radio-button__inner) { background: #409eff; color: white; }

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
  padding: 18px 0;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.3s;
}
:deep(.modern-table::before) { display: none; }
:deep(.modern-table .el-table__inner-wrapper::before) { display: none; }

.id-text {
  font-weight: bold;
  color: #8a9bb1;
  font-size: 13px;
}
.type-tag {
  font-weight: bold;
  padding: 0 12px;
}

/* ⭐️ 案发现场预览框 */
.preview-box {
  background-color: #f8fafc;
  color: #475569;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 6px;
  line-height: 1.5;
  border-left: 3px solid #cbd5e1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ⭐️ 举报原因警示文本 */
.reason-text {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #e74c3c;
  font-weight: bold;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.reason-icon {
  margin-top: 2px;
  font-size: 15px;
}

.reporter-text {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}
.time-text {
  font-size: 13px;
  color: #94a3b8;
}

/* ⭐️ 高级圆点状态指示器 */
.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-danger { background-color: #f56c6c; box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.15); }
.dot-success { background-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
.dot-info { background-color: #909399; box-shadow: 0 0 0 3px rgba(144, 147, 153, 0.15); }

.status-text { font-weight: bold; font-size: 13px; }
.text-danger { color: #f56c6c; }
.text-success { color: #10b981; }
.text-info { color: #909399; }

/* 操作区域 */
.action-cell {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.action-btn { font-weight: bold; }
.resolved-cell {
  color: #94a3b8;
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 15px;
}

/* 空状态 */
.empty-box {
  padding: 50px 0;
}

/* 分页器 */
.pagination-box {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}

/* 自定义弹窗内的文本域微调 (全局穿透) */
:global(.process-prompt-dialog .el-textarea__inner) {
  border-radius: 8px;
  background-color: #f8fafc;
}
</style>