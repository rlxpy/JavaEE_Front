<template>
  <div class="publish-container">
    <div class="page-header">
      <el-icon class="header-icon"><Promotion /></el-icon>
      <h2 class="header-title">发布你的第一款大作</h2>
    </div>

    <div class="publish-card">
      <el-form :model="gameForm" label-position="top" class="modern-form">

        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="游戏名称" required>
              <el-input
                  v-model="gameForm.gameName"
                  placeholder="给你的大作起个响亮的名字"
                  class="anime-input"
                  size="large"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="游戏分类" required>
              <el-select
                  v-model="gameForm.categoryId"
                  placeholder="请选择最符合的游戏类型"
                  class="anime-input custom-select"
                  size="large"
                  style="width: 100%"
              >
                <el-option
                    v-for="cat in categoryList"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="游戏简介" required>
          <el-input
              v-model="gameForm.description"
              type="textarea"
              :rows="5"
              placeholder="向玩家们介绍一下你的游戏特色和核心玩法吧..."
              class="custom-textarea"
          />
        </el-form-item>

        <el-form-item label="游戏封面图片" required>
          <el-upload
              class="modern-uploader"
              action="http://localhost:8080/file/upload"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
          >
            <el-image v-if="gameForm.coverImage" :src="gameForm.coverImage" class="uploaded-image" fit="cover" />
            <div v-else class="uploader-placeholder">
              <el-icon class="uploader-icon"><Picture /></el-icon>
              <div class="uploader-text">点击上传精美封面</div>
              <div class="uploader-tip">支持 JPG / PNG / WEBP，建议比例 16:9，单张不超过 5MB</div>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="获取方式 / 下载链接" required>
          <el-input
              v-model="gameForm.downloadLink"
              placeholder="请输入游戏网盘地址、官网或 Steam 商店链接"
              class="anime-input"
              size="large"
          >
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="action-row">
          <el-button type="primary" round class="shimmer-btn submit-btn" @click="submitGame">
            <el-icon style="margin-right: 8px; font-size: 20px;"><UploadFilled /></el-icon> 确认发布至全站
          </el-button>
        </div>

      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// ⭐️ 引入高级矢量图标
import { Promotion, Picture, Link, UploadFilled } from '@element-plus/icons-vue'
// ⭐️ 引入动态分类 API
import { addGameAPI, getCategoryListAPI } from '../api/game.js'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user')) || {}

const gameForm = reactive({
  developerId: user.id,
  categoryId: null,
  gameName: '',
  description: '',
  coverImage: '',
  downloadLink: ''
})

// 存储从后端拉取的分区列表
const categoryList = ref([])

const uploadHeaders = ref({
  token: localStorage.getItem('token') || ''
})

// ⭐️ 页面加载时拉取分类
onMounted(async () => {
  try {
    const res = await getCategoryListAPI()
    if (res.code === 200) {
      categoryList.value = res.data
    } else {
      ElMessage.error(res.msg || '获取分类失败')
    }
  } catch (error) {
    ElMessage.error('网络异常，获取分类失败')
  }
})

const handleUploadSuccess = (res) => {
  if (res.code === 200) {
    gameForm.coverImage = res.data
    ElMessage.success('封面上传成功！')
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}

const beforeUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) ElMessage.error('上传封面只能是 JPG/PNG/WEBP 格式!')
  if (!isLt5M) ElMessage.error('上传封面大小不能超过 5MB!')
  return isImage && isLt5M
}

const submitGame = async () => {
  if (!gameForm.gameName || !gameForm.description || !gameForm.coverImage || !gameForm.categoryId || !gameForm.downloadLink) {
    ElMessage.warning('请将必要信息填写完整！(记得上传封面)')
    return
  }

  try {
    const res = await addGameAPI(gameForm)
    if (res.code === 200) {
      ElMessage.success('发布成功！即将跳转至游戏大厅...')
      // 可以跳转大厅，也可以跳转 /dashboard/my-games 看个人喜好
      router.push('/home')
    } else {
      ElMessage.error(res.msg || '发布失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后再试')
  }
}
</script>

<style scoped>
.publish-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px 60px;
}

/* ================= 1. 头部标题区 ================= */
.page-header {
  width: 100%;
  max-width: 850px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
}
.header-icon {
  font-size: 32px;
  color: #7367f0; /* 开发者专属的极客紫 */
}
.header-title {
  font-size: 26px;
  font-weight: 900;
  color: #2c3e50;
  margin: 0;
}

/* ================= 2. 核心创作画板 ================= */
.publish-card {
  width: 100%;
  max-width: 850px;
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
}

:deep(.el-form-item__label) {
  font-weight: 800;
  color: #2c3e50;
  padding-bottom: 8px;
  font-size: 15px;
}

/* 现代光晕输入框 */
:deep(.anime-input .el-input__wrapper),
:deep(.anime-input.custom-select .el-input__wrapper) {
  border-radius: 12px !important;
  background-color: #f4f6fc !important;
  box-shadow: none !important;
  border: 1px solid transparent;
  padding: 8px 15px;
  transition: all 0.3s;
}
:deep(.anime-input .el-input__wrapper:focus-within),
:deep(.anime-input .el-input__wrapper:hover),
:deep(.anime-input.custom-select .el-input__wrapper:focus-within),
:deep(.anime-input.custom-select .el-input__wrapper:hover) {
  background-color: #ffffff !important;
  border: 1px solid #7367f0;
  box-shadow: 0 0 0 4px rgba(115, 103, 240, 0.15) !important;
}

:deep(.custom-textarea .el-textarea__inner) {
  border-radius: 12px;
  background-color: #f4f6fc;
  border: 1px solid transparent;
  padding: 15px;
  font-size: 15px;
  transition: all 0.3s;
  resize: none;
}
:deep(.custom-textarea .el-textarea__inner:focus),
:deep(.custom-textarea .el-textarea__inner:hover) {
  background-color: #ffffff;
  border-color: #7367f0;
  box-shadow: 0 0 0 4px rgba(115, 103, 240, 0.15);
}

/* ================= 3. 巨幅高级上传组件 ================= */
:deep(.modern-uploader .el-upload) {
  width: 100%;
}
.uploader-placeholder {
  width: 100%;
  height: 240px; /* 增加高度，显得更大气 */
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;
}
.uploader-placeholder:hover {
  border-color: #7367f0;
  background-color: #f4f6fc;
}
.uploader-icon {
  font-size: 48px;
  color: #94a3b8;
  margin-bottom: 15px;
  transition: color 0.3s;
}
.uploader-placeholder:hover .uploader-icon {
  color: #7367f0;
}
.uploader-text {
  font-size: 16px;
  font-weight: bold;
  color: #475569;
  margin-bottom: 8px;
}
.uploader-tip {
  font-size: 13px;
  color: #94a3b8;
}
.uploaded-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  display: block;
}

/* ================= 4. 操作与提交 ================= */
.action-row {
  margin-top: 40px;
}
.submit-btn {
  width: 100%;
  height: 56px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 28px;
}

/* 开发者专属紫蓝渐变流光特效 */
.shimmer-btn { position: relative; overflow: hidden; border: none; background: linear-gradient(90deg, #7367f0 0%, #409eff 100%); }
.shimmer-btn::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
  background: rgba(255,255,255,0.4); transform: rotate(30deg); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.shimmer-btn:hover::after { left: 120%; }
</style>