<script setup lang="ts">
defineProps<{
  totalCommits: number
  totalChanges: number
  avgDailyCommits: number
  projectCount: number
  loading?: boolean
}>()

const cards = [
  { key: 'totalCommits', label: '总提交次数', icon: '📝' },
  { key: 'totalChanges', label: '代码修改量', icon: '💻' },
  { key: 'avgDailyCommits', label: '平均每日提交', icon: '📊' },
  { key: 'projectCount', label: '项目数量', icon: '📁' }
] as const
</script>

<template>
  <el-row :gutter="16">
    <el-col
      v-for="card in cards"
      :key="card.key"
      :xs="24"
      :sm="12"
      :lg="6"
    >
      <el-card shadow="hover" class="stats-card">
        <div class="stats-card__body">
          <span class="stats-card__icon">{{ card.icon }}</span>
          <div class="stats-card__content">
            <span class="stats-card__label">{{ card.label }}</span>
            <el-skeleton v-if="loading" :rows="0" animated>
              <template #template>
                <el-skeleton-item variant="text" style="width: 60px; height: 28px" />
              </template>
            </el-skeleton>
            <span v-else class="stats-card__value">
              {{
                card.key === 'avgDailyCommits'
                  ? avgDailyCommits.toFixed(1)
                  : $props[card.key]
              }}
            </span>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.stats-card {
  margin-bottom: 0;
}

.stats-card__body {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-card__icon {
  font-size: 28px;
  line-height: 1;
}

.stats-card__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats-card__label {
  font-size: 13px;
  color: #909399;
}

.stats-card__value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

@media (max-width: 767px) {
  .stats-card {
    margin-bottom: 12px;
  }
}
</style>
