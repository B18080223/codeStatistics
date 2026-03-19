<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { resetConfigCache } from '@/router'

const router = useRouter()

const modules = [
  {
    title: '代码统计',
    description: '查看 GitLab 提交统计概览，包括每日提交趋势和项目分布',
    icon: '📊',
    path: '/stats'
  },
  {
    title: '提交详情',
    description: '浏览提交记录明细，支持搜索、排序、筛选和详情查看',
    icon: '📋',
    path: '/commits'
  }
]

const navigateTo = (path: string) => {
  router.push(path)
}

const goBackToConfig = () => {
  resetConfigCache()
  router.push('/?reconfig=1')
}
</script>

<template>
  <div class="module-select">
    <div class="module-select__nav">
      <el-button text @click="goBackToConfig">
        <el-icon><ArrowLeft /></el-icon>
        重新配置连接
      </el-button>
    </div>
    <h1 class="page-title">选择功能模块</h1>
    <el-row :gutter="24" justify="center">
      <el-col
        v-for="item in modules"
        :key="item.path"
        :xs="24"
        :sm="12"
        :md="10"
        :lg="8"
      >
        <el-card
          class="module-card"
          shadow="hover"
          @click="navigateTo(item.path)"
        >
          <h2 class="module-title">{{ item.title }}</h2>
          <p class="module-description">{{ item.description }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.module-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  min-height: 80vh;
}

.module-select__nav {
  width: 100%;
  max-width: 800px;
  margin-bottom: 12px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 40px;
}

.module-card {
  cursor: pointer;
  text-align: center;
  padding: 20px;
  transition: transform 0.2s ease;
  height: 100%;
}

.module-card:hover {
  transform: translateY(-4px);
}

.module-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.module-description {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
  margin: 0;
}
</style>
