<template>
  <div class="overview-container">
    <div class="header-title">📊 平台核心数据看板</div>

    <el-row :gutter="20" class="data-cards">
      <el-col :span="8">
        <el-card shadow="hover" class="data-card users-card">
          <div class="card-title">👥 全站注册用户数</div>
          <div class="card-value">{{ stats.totalUsers }} <span class="unit">人</span></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="data-card games-card">
          <div class="card-title">🎮 平台游戏总数</div>
          <div class="card-value">{{ stats.totalGames }} <span class="unit">款</span></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="data-card posts-card">
          <div class="card-title">💬 论坛发帖总数</div>
          <div class="card-value">{{ stats.totalPosts }} <span class="unit">帖</span></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-area">
      <el-col :span="12">
        <el-card shadow="hover">
          <div ref="roleChartRef" class="echart-box"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <div ref="gameChartRef" class="echart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts' // ⭐️ 引入 ECharts
import { getDashboardStatsAPI } from '../api/stat.js'
import { ElMessage } from 'element-plus'

// 数据存储
const stats = ref({
  totalUsers: 0,
  totalGames: 0,
  totalPosts: 0
})

// DOM 引用，用于挂载 ECharts
const roleChartRef = ref(null)
const gameChartRef = ref(null)

onMounted(async () => {
  await fetchStats()
})

const fetchStats = async () => {
  try {
    const res = await getDashboardStatsAPI()
    if (res.data.code === 200) {
      stats.value = res.data.data
      // 数据拿到后，立刻渲染图表！
      renderCharts(res.data.data.roleDist, res.data.data.gameStatusDist)
    }
  } catch (error) {
    ElMessage.error('获取大屏数据失败，请检查网络')
  }
}

// ⭐️ 渲染 ECharts 图表的核心方法
const renderCharts = (roleData, gameData) => {
  // 1. 渲染用户角色饼图
  const roleChart = echarts.init(roleChartRef.value)
  const roleNameMap = { 0: '普通玩家', 1: '游戏开发者', 2: '超级管理员' }
  const pieData = roleData.map(item => ({
    name: roleNameMap[item.role] || '未知',
    value: item.count
  }))

  roleChart.setOption({
    title: { text: '全站用户角色画像', left: 'center', top: '10' },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}人 ({d}%)' },
    legend: { bottom: '10' },
    series: [
      {
        name: '角色占比',
        type: 'pie',
        radius: ['40%', '70%'], // 做成高大上的圆环图
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: '20', fontWeight: 'bold' }
        },
        data: pieData
      }
    ]
  })

  // 2. 渲染游戏审核状态柱状图
  const gameChart = echarts.init(gameChartRef.value)
  const statusNameMap = { 0: '待审核', 1: '已上架', 2: '被驳回' }
  const xAxisData = gameData.map(item => statusNameMap[item.status] || '未知')
  const yAxisData = gameData.map(item => item.count)

  gameChart.setOption({
    title: { text: '平台游戏生态监控', left: 'center', top: '10' },
    tooltip: { trigger: 'axis' },
    grid: { left: '10%', right: '10%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: xAxisData },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        data: yAxisData,
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          // 加上酷炫的渐变色
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 1, color: '#188df0' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  })

  // 监听窗口大小变化，让图表自动响应式缩放
  window.addEventListener('resize', () => {
    roleChart.resize()
    gameChart.resize()
  })
}
</script>

<style scoped>
.overview-container {
  padding: 10px;
}
.header-title {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 25px;
}
.data-cards {
  margin-bottom: 20px;
}
.data-card {
  border-radius: 10px;
  color: #fff;
  border: none;
}
/* 卡片酷炫背景色 */
.users-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.games-card { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.posts-card { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); color: #333; }

.card-title {
  font-size: 16px;
  margin-bottom: 10px;
  opacity: 0.9;
}
.card-value {
  font-size: 32px;
  font-weight: bold;
}
.unit {
  font-size: 14px;
  font-weight: normal;
  opacity: 0.8;
}
.echart-box {
  width: 100%;
  height: 350px; /* 必须给图表指定高度，否则不显示！ */
}
</style>