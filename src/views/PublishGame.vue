<template>
  <div class="publish-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">🚀 开发者控制台 - 发布新游戏</span>
        </div>
      </template>

      <el-form :model="gameForm" label-width="100px" style="max-width: 600px">

        <el-form-item label="游戏名称" required>
          <el-input v-model="gameForm.gameName" placeholder="请输入游戏名称" />
        </el-form-item>

        <el-form-item label="游戏分类" required>
          <el-select v-model="gameForm.categoryId" placeholder="请选择游戏分类">
            <el-option label="角色扮演 (RPG)" :value="1" />
            <el-option label="动作射击 (ACT)" :value="2" />
            <el-option label="休闲模拟 (SIM)" :value="3" />
            <el-option label="策略战棋 (SLG)" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="游戏简介" required>
          <el-input v-model="gameForm.description" type="textarea" :rows="4" placeholder="向玩家们介绍一下你的游戏特色吧..." />
        </el-form-item>

        <el-form-item label="封面图片" required>
          <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/file/upload"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
          >
            <img v-if="gameForm.coverImage" :src="gameForm.coverImage" class="uploaded-image" />
            <div v-else class="avatar-uploader-icon">+</div>
          </el-upload>
          <div class="el-upload__tip" style="margin-left: 10px;">
            点击加号上传。支持 jpg/png 文件，不超过 5MB
          </div>
        </el-form-item>

        <el-form-item label="下载链接" required>
          <el-input v-model="gameForm.downloadLink" placeholder="请输入游戏网盘地址或下载链接" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitGame" style="width: 100%;">确认发布游戏</el-button>
        </el-form-item>

      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addGameAPI } from '../api/game.js'

const router = useRouter()

// 获取当前登录用户（也就是游戏开发者）的信息
const user = JSON.parse(localStorage.getItem('user')) || {}

// 表单数据绑定
const gameForm = reactive({
  developerId: user.id, // 自动填入当前开发者的 ID
  categoryId: null,
  gameName: '',
  description: '',
  coverImage: '',       // 上传成功后，这里会填入后端的 http://localhost:8080/uploads/xxx.png
  downloadLink: ''
})

// 📸 图片上传成功的回调函数
const handleUploadSuccess = (res) => {
  // res 就是后端 FileController 返回的 JSON 结果
  if (res.code === 200) {
    gameForm.coverImage = res.data // 把后端返回的网络访问 URL 存进表单！
    ElMessage.success('封面上传成功！')
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}

// 📸 上传前的校验（限制只能传图片，限制文件大小）
const beforeUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('上传封面只能是 JPG/PNG/WEBP 格式!')
  }
  if (!isLt5M) {
    ElMessage.error('上传封面大小不能超过 5MB!')
  }
  return isImage && isLt5M
}

// 🚀 提交整个游戏发布表单
const submitGame = async () => {
  // 简单校验
  if (!gameForm.gameName || !gameForm.description || !gameForm.coverImage || !gameForm.categoryId) {
    ElMessage.warning('请将带红星的必要信息填写完整！(记得上传封面)')
    return
  }

  try {
    const res = await addGameAPI(gameForm)
    if (res.data.code === 200) {
      ElMessage.success('游戏发布成功！')
      // 发布成功后，带着成就感直接跳回游戏大厅看自己的作品！
      router.push('/home')
    } else {
      ElMessage.error(res.data.msg || '发布失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后再试')
  }
}
</script>

<style scoped>
.publish-container {
  padding: 20px;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
}

/* ⭐️ 仿大厂的文件上传框样式 */
.avatar-uploader-icon {
  font-size: 40px;
  color: #8c939d;
  width: 250px;
  height: 140px;
  text-align: center;
  line-height: 140px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  background-color: #fafafa;
  transition: border-color 0.3s;
}

.avatar-uploader-icon:hover {
  border-color: #409eff;
  color: #409eff;
}

.uploaded-image {
  width: 250px;
  height: 140px;
  display: block;
  object-fit: cover; /* 保证图片不变形 */
  border-radius: 8px;
}
</style>