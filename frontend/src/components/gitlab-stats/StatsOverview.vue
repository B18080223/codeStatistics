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
  <div class="stats-overview">
    <div
      v-for="card in cards"
      :key="card.key"
      class="stats-overview__card"
    >
      <span class="stats-overview__icon">{{ card.icon }}</span>
      <div class="stats-overview__content">
        <span class="stats-overview__label">{{ card.label }}</span>
        <template v-if="loading">
          <span class="stats-overview__skeleton" />
        </template>
        <template v-else>
          <span class="stats-overview__value">
            {{
              card.key === 'avgDailyCommits'
                ? avgDailyCommits.toFixed(1)
                : $props[card.key]
            }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stats-overview__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.stats-overview__card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stats-overview__icon {
  font-size: 28px;
  line-height: 1;
}

.stats-overview__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats-overview__label {
  font-size: 13px;
  color: #909399;
}

.stats-overview__value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stats-overview__skeleton {
  display: inline-block;
  width: 60px;
  height: 28px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1024px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
}
</style>
