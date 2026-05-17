<template>
  <div class="overview-container">
    <div class="page-header">
      <el-icon class="header-icon"><DataAnalysis /></el-icon>
      <h2 class="header-title">平台核心数据大屏</h2>
    </div>

    <el-row :gutter="24" class="data-cards">
      <el-col :span="8">
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-title">全站注册用户</div>
            <div class="stat-value">{{ stats.totalUsers }} <span class="unit">人</span></div>
          </div>
          <div class="stat-icon-wrapper user-icon-bg">
            <el-icon><User /></el-icon>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-title">平台游戏总数</div>
            <div class="stat-value">{{ stats.totalGames }} <span class="unit">款</span></div>
          </div>
          <div class="stat-icon-wrapper game-icon-bg">
            <el-icon><Monitor /></el-icon>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-title">社区互动发帖</div>
            <div class="stat-value">{{ stats.totalPosts }} <span class="unit">帖</span></div>
          </div>
          <div class="stat-icon-wrapper post-icon-bg">
            <el-icon><ChatSquare /></el-icon>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="charts-area">
      <el-col :span="12">
        <div class="chart-card">
          <h3 class="chart-title">用户角色画像</h3>
          <div ref="roleChartRef" class="echart-box"></div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="chart-card">
          <h3 class="chart-title">游戏生态审核监控</h3>
          <div ref="gameChartRef" class="echart-box"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
// ⭐️ 引入高级图标
import { DataAnalysis, User, Monitor, ChatSquare } from '@element-plus/icons-vue'
import { getDashboardStatsAPI } from '../api/stat.js'
import { ElMessage } from 'element-plus'

const stats = ref({
  totalUsers: 0,
  totalGames: 0,
  totalPosts: 0
})

const roleChartRef = ref(null)
const gameChartRef = ref(null)

onMounted(async () => {
  await fetchStats()
})

const fetchStats = async () => {
  try {
    const res = await getDashboardStatsAPI()
    if (res.code === 200) {
      stats.value = res.data
      renderCharts(res.data.roleDist, res.data.gameStatusDist)
    }
  } catch (error) {
    ElMessage.error('获取大屏数据失败，请检查网络')
  }
}

// ⭐️ 深度定制化 ECharts 渲染
const renderCharts = (roleData, gameData) => {
  // 1. 用户角色高配版圆环图
  const roleChart = echarts.init(roleChartRef.value)
  const roleNameMap = { 0: '普通玩家', 1: '游戏开发者', 2: '超级管理员' }
  const pieData = roleData.map(item => ({
    name: roleNameMap[item.role] || '未知',
    value: item.count
  }))

  roleChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}人 ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#f0f2f5',
      textStyle: { color: '#2c3e50' }
    },
    legend: {
      bottom: '5%',
      icon: 'circle',
      textStyle: { color: '#5c6b77', fontWeight: 500 }
    },
    // 为不同角色配置专属清新色彩
    color: ['#409eff', '#10b981', '#f56c6c'],
    series: [
      {
        name: '角色占比',
        type: 'pie',
        radius: ['45%', '75%'], // 调整圆环比例更现代
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 4 // 加宽白色描边，切割感更强
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: '22', fontWeight: 'bold', color: '#2c3e50' }
        },
        data: pieData
      }
    ]
  })

  // 2. 游戏审核状态高配版柱状图
  const gameChart = echarts.init(gameChartRef.value)
  const statusNameMap = { 0: '待审核', 1: '已上架', 2: '被驳回' }
  const xAxisData = gameData.map(item => statusNameMap[item.status] || '未知')
  const yAxisData = gameData.map(item => item.count)

  gameChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#f0f2f5',
    },
    grid: { left: '5%', right: '5%', bottom: '10%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: { show: false }, // 隐藏 X 轴黑线
      axisTick: { show: false }, // 隐藏刻度
      axisLabel: { color: '#5c6b77', fontWeight: 500, margin: 15 }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: {
        lineStyle: { type: 'dashed', color: '#f0f2f5' } // Y 轴背景线改为高大上的浅色虚线
      },
      axisLabel: { color: '#8a9bb1' }
    },
    series: [
      {
        data: yAxisData,
        type: 'bar',
        barWidth: '35%',
        itemStyle: {
          // 优化后的渐变蓝紫光效
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#7367f0' },
            { offset: 1, color: '#409eff' }
          ]),
          borderRadius: [8, 8, 0, 0] // 柱子顶部圆角
        }
      }
    ]
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    roleChart.resize()
    gameChart.resize()
  })
}
</script>

<style scoped>
.overview-container {
  padding: 10px 10px 40px;
}

/* ================= 头部标题 ================= */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
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

/* ================= 现代 SaaS 数据卡片 ================= */
.data-cards {
  margin-bottom: 24px;
}
.stat-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stat-title {
  font-size: 15px;
  color: #64748b;
  font-weight: 600;
}
.stat-value {
  font-size: 38px;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
}
.unit {
  font-size: 16px;
  font-weight: bold;
  color: #94a3b8;
  margin-left: 2px;
}

/* 渐变图标容器 */
.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  color: white;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
.user-icon-bg { background: linear-gradient(135deg, #409eff 0%, #7367f0 100%); box-shadow: 0 8px 20px rgba(64,158,255,0.25); }
.game-icon-bg { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); box-shadow: 0 8px 20px rgba(16,185,129,0.25); }
.post-icon-bg { background: linear-gradient(135deg, #f472b6 0%, #fb7185 100%); box-shadow: 0 8px 20px rgba(244,114,182,0.25); }

/* ================= 图表区域 ================= */
.charts-area {
  margin-top: 10px;
}
.chart-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 25px 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  transition: box-shadow 0.3s ease;
}
.chart-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}
.chart-title {
  margin: 0 0 20px 0;
  font-size: 17px;
  font-weight: 800;
  color: #2c3e50;
}
.echart-box {
  width: 100%;
  height: 320px;
}
</style>