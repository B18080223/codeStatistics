<script setup lang="ts">
import ConfigForm from '@/components/gitlab-stats/ConfigForm.vue'
import DateRangeSelector from '@/components/gitlab-stats/DateRangeSelector.vue'
import StatsOverview from '@/components/gitlab-stats/StatsOverview.vue'
import CommitLineChart from '@/components/gitlab-stats/CommitLineChart.vue'
import ProjectPieChart from '@/components/gitlab-stats/ProjectPieChart.vue'
import { useGitLabStats } from '@/hooks/useGitLabStats'

const {
  statsData,
  isLoading,
  errorMessage,
  canRetry,
  lastUpdated,
  isConfigured,
  dateRange,
  refreshData,
  handleConfigSuccess,
  handleDateRangeChange
} = useGitLabStats()

const formatTime = (iso: string): string => {
  if (!iso) return ''
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
</script>

<template>
  <div class="gitlab-stats">
    <div v-if="!isConfigured" class="gitlab-stats__config-wrapper">
      <ConfigForm @success="handleConfigSuccess" />
    </div>

    <template v-if="isConfigured">
      <div class="gitlab-stats__header">
        <h2 class="gitlab-stats__title">GitLab 提交统计</h2>
        <div class="gitlab-stats__actions">
          <span v-if="lastUpdated" class="gitlab-stats__updated">
            最后更新：{{ formatTime(lastUpdated) }}
          </span>
          <button
            class="gitlab-stats__refresh-btn"
            :disabled="isLoading"
            @click="refreshData"
          >
            {{ isLoading ? '刷新中...' : '刷新数据' }}
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="gitlab-stats__error">
        <span class="gitlab-stats__error-text">{{ errorMessage }}</span>
        <button
          v-if="canRetry"
          class="gitlab-stats__retry-btn"
          @click="refreshData"
        >
          重试
        </button>
      </div>

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

      <div class="gitlab-stats__charts">
        <CommitLineChart
          :data="statsData?.dailyCommits ?? []"
          :loading="isLoading"
        />
        <ProjectPieChart
          :data="statsData?.projectCommits ?? []"
          :loading="isLoading"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.gitlab-stats {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gitlab-stats__config-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
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

.gitlab-stats__refresh-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #fff;
  background-color: #409eff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.gitlab-stats__refresh-btn:hover {
  background-color: #66b1ff;
}

.gitlab-stats__refresh-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.gitlab-stats__error {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
}

.gitlab-stats__error-text {
  flex: 1;
  font-size: 14px;
  color: #f56c6c;
}

.gitlab-stats__retry-btn {
  padding: 6px 14px;
  font-size: 13px;
  color: #f56c6c;
  background: #fff;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.gitlab-stats__retry-btn:hover {
  color: #fff;
  background-color: #f56c6c;
}

.gitlab-stats__charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Tablet: 768px - 1024px */
@media (max-width: 1024px) {
  .gitlab-stats {
    padding: 20px;
    gap: 16px;
  }

  .gitlab-stats__charts {
    grid-template-columns: 1fr;
  }
}

/* Mobile: < 768px */
@media (max-width: 767px) {
  .gitlab-stats {
    padding: 16px;
    gap: 14px;
  }

  .gitlab-stats__config-wrapper {
    min-height: 40vh;
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

  .gitlab-stats__error {
    flex-direction: column;
    align-items: flex-start;
  }

  .gitlab-stats__retry-btn {
    align-self: flex-end;
  }

  .gitlab-stats__charts {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
