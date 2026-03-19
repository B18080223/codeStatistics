<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import DateRangeSelector from '@/components/gitlab-stats/DateRangeSelector.vue'
import StatsOverview from '@/components/gitlab-stats/StatsOverview.vue'
import CommitLineChart from '@/components/gitlab-stats/CommitLineChart.vue'
import ProjectDistribution from '@/components/gitlab-stats/ProjectDistribution.vue'
import { useGitLabStats } from '@/hooks/useGitLabStats'

const router = useRouter()

const {
  statsData,
  isLoading,
  errorMessage,
  canRetry,
  lastUpdated,
  dateRange,
  fetchStats,
  refreshData,
  handleDateRangeChange
} = useGitLabStats()

onMounted(() => {
  fetchStats()
})

const goBack = () => {
  router.push('/modules')
}

const formatTime = (iso: string): string => {
  if (!iso) return ''
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
</script>

<template>
  <div class="gitlab-stats">
    <div class="gitlab-stats__nav">
      <el-button text @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回模块选择
      </el-button>
    </div>
    <div class="gitlab-stats__header">
      <h2 class="gitlab-stats__title">GitLab 提交统计</h2>
      <div class="gitlab-stats__actions">
        <span v-if="lastUpdated" class="gitlab-stats__updated">
          最后更新：{{ formatTime(lastUpdated) }}
        </span>
        <el-button
          type="primary"
          :loading="isLoading"
          @click="refreshData"
        >
          {{ isLoading ? '刷新中...' : '刷新数据' }}
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      :closable="false"
    >
      <template v-if="canRetry" #default>
        <el-button
          type="danger"
          size="small"
          plain
          @click="refreshData"
        >
          重试
        </el-button>
      </template>
    </el-alert>

    <DateRangeSelector
      :start-date="dateRange.startDate"
      :end-date="dateRange.endDate"
      @change="handleDateRangeChange"
    />

    <StatsOverview
      :total-commits="statsData?.totalCommits ?? 0"
      :total-changes="statsData?.totalChanges ?? 0"
      :avg-daily-commits="statsData?.avgDailyCommits ?? 0"
      :project-count="statsData?.projectCount ?? 0"
      :loading="isLoading"
    />

    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <CommitLineChart
          :data="statsData?.dailyCommits ?? []"
          :loading="isLoading"
          :start-date="dateRange.startDate"
          :end-date="dateRange.endDate"
        />
      </el-col>
      <el-col :xs="24" :lg="12">
        <ProjectDistribution
          :data="statsData?.projectCommits ?? []"
          :loading="isLoading"
        />
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.gitlab-stats {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gitlab-stats__nav {
  margin-bottom: -8px;
}

.gitlab-stats__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.gitlab-stats__title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.gitlab-stats__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gitlab-stats__updated {
  font-size: 13px;
  color: #909399;
}

@media (max-width: 767px) {
  .gitlab-stats {
    padding: 16px;
    gap: 14px;
  }

  .gitlab-stats__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gitlab-stats__title {
    font-size: 18px;
  }

  .gitlab-stats__actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
