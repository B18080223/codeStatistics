<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LabelLayout } from 'echarts/features'
import type { ProjectCommitData } from '@/types/gitlab'

echarts.use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  LabelLayout,
  CanvasRenderer
])

interface ProjectTableRow extends ProjectCommitData {
  percentage: string
}

const props = defineProps<{
  data: ProjectCommitData[]
  loading?: boolean
}>()

const viewMode = ref<'chart' | 'table'>('chart')
const hoveredRowIndex = ref<number | null>(null)
const isMobile = ref(window.innerWidth < 768)

const totalCommits = computed(() =>
  props.data.reduce((sum, item) => sum + item.commitCount, 0)
)

const sortedData = computed(() =>
  [...props.data].sort((a, b) => b.commitCount - a.commitCount)
)

const tableData = computed<ProjectTableRow[]>(() =>
  sortedData.value.map(item => ({
    ...item,
    percentage: totalCommits.value > 0
      ? ((item.commitCount / totalCommits.value) * 100).toFixed(1)
      : '0.0'
  }))
)

const chartData = computed<ProjectCommitData[]>(() => {
  const sorted = sortedData.value
  if (sorted.length <= 10) return sorted
  const top9 = sorted.slice(0, 9)
  const otherCount = sorted
    .slice(9)
    .reduce((sum, item) => sum + item.commitCount, 0)
  return [
    ...top9,
    { projectId: -1, projectName: '其他', commitCount: otherCount }
  ]
})

const chartRef = ref<HTMLDivElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)

const buildChartOption = (): echarts.EChartsCoreOption => {
  const seriesData = chartData.value.map(item => ({
    name: item.projectName,
    value: item.commitCount
  }))

  return {
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: (params: any) => {
        return `${params.name}<br/>提交次数：<b>${params.value}</b>（${params.percent}%）`
      }
    },
    legend: isMobile.value
      ? {
          orient: 'horizontal' as const,
          bottom: '0%',
          left: 'center',
          type: 'scroll' as const,
          textStyle: { fontSize: 12, color: '#606266' }
        }
      : {
          orient: 'vertical' as const,
          right: '5%',
          top: 'center',
          type: 'scroll' as const,
          textStyle: {
            fontSize: 12,
            color: '#606266',
            width: 120,
            overflow: 'truncate' as const,
            ellipsis: '...'
          }
        },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: isMobile.value ? ['50%', '45%'] : ['30%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 6
        },
        data: seriesData
      }
    ]
  }
}

const initChart = () => {
  if (chartInstance.value || !chartRef.value) return
  chartInstance.value = echarts.init(chartRef.value)
  chartInstance.value.setOption(buildChartOption(), true)
}

const updateChart = () => {
  if (!chartInstance.value) return
  chartInstance.value.setOption(buildChartOption(), true)
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  chartInstance.value?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance.value?.dispose()
  chartInstance.value = null
})

watch(chartRef, (el) => {
  if (el) {
    initChart()
  } else {
    chartInstance.value?.dispose()
    chartInstance.value = null
  }
})

watch(() => props.data, updateChart, { deep: true })
watch(isMobile, () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
    updateChart()
  }
})
</script>

<template>
  <div class="project-distribution">
    <div class="project-distribution__header">
      <h3 class="project-distribution__title">项目分布</h3>
      <div v-if="!loading && data.length > 0" class="project-distribution__toggle">
        <button
          :class="[
            'project-distribution__toggle-btn',
            { 'project-distribution__toggle-btn--active': viewMode === 'chart' }
          ]"
          @click="viewMode = 'chart'"
        >
          图表
        </button>
        <button
          :class="[
            'project-distribution__toggle-btn',
            { 'project-distribution__toggle-btn--active': viewMode === 'table' }
          ]"
          @click="viewMode = 'table'"
        >
          表格
        </button>
      </div>
    </div>
    <!-- 加载骨架屏 -->
    <template v-if="loading">
      <div class="project-distribution__skeleton-chart">
        <div class="project-distribution__skeleton-circle" />
      </div>
      <div class="project-distribution__skeleton-table">
        <div
          v-for="n in 3"
          :key="n"
          class="project-distribution__skeleton-row"
        >
          <div class="project-distribution__skeleton-cell project-distribution__skeleton-cell--name" />
          <div class="project-distribution__skeleton-cell project-distribution__skeleton-cell--count" />
          <div class="project-distribution__skeleton-cell project-distribution__skeleton-cell--percent" />
        </div>
      </div>
    </template>
    <!-- 空数据状态 -->
    <div v-else-if="data.length === 0" class="project-distribution__empty">
      暂无项目数据
    </div>
    <!-- 正常内容 -->
    <template v-else>
      <div
        v-show="viewMode === 'chart'"
        ref="chartRef"
        class="project-distribution__chart"
      />
      <table v-show="viewMode === 'table'" class="project-distribution__table">
        <thead>
          <tr>
            <th class="project-distribution__table-name">项目名称</th>
            <th class="project-distribution__table-count">提交次数</th>
            <th class="project-distribution__table-percent">提交占比</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in tableData"
            :key="row.projectId"
            :class="{ 'project-distribution__table-row--hover': hoveredRowIndex === index }"
            @mouseenter="hoveredRowIndex = index"
            @mouseleave="hoveredRowIndex = null"
          >
            <td class="project-distribution__table-name">{{ row.projectName }}</td>
            <td class="project-distribution__table-count">{{ row.commitCount }}</td>
            <td class="project-distribution__table-percent">{{ row.percentage }}%</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.project-distribution {
  padding: 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.project-distribution__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 16px;
}

.project-distribution__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.project-distribution__toggle {
  display: flex;
  gap: 0;
}

.project-distribution__toggle-btn {
  padding: 4px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  transition: all 0.2s;
}

.project-distribution__toggle-btn:first-child {
  border-radius: 4px 0 0 4px;
}

.project-distribution__toggle-btn:last-child {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.project-distribution__toggle-btn:hover {
  color: #409eff;
}

.project-distribution__toggle-btn--active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.project-distribution__toggle-btn--active + .project-distribution__toggle-btn {
  border-left: 1px solid #dcdfe6;
}

.project-distribution__toggle-btn--active:hover {
  color: #fff;
}

.project-distribution__chart {
  width: 100%;
  height: 360px;
}

.project-distribution__table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.project-distribution__table thead tr {
  background: #fafafa;
}

.project-distribution__table th {
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.project-distribution__table td {
  padding: 10px 12px;
  font-size: 13px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}

.project-distribution__table-name {
  text-align: left;
}

.project-distribution__table-count {
  text-align: right;
}

.project-distribution__table-percent {
  text-align: right;
}

.project-distribution__table-row--hover {
  background: #f5f7fa;
}

/* 空数据状态 */
.project-distribution__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  font-size: 14px;
  color: #909399;
}

/* 骨架屏动画 */
@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.project-distribution__skeleton-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.project-distribution__skeleton-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.project-distribution__skeleton-table {
  margin-top: 12px;
}

.project-distribution__skeleton-row {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
}

.project-distribution__skeleton-cell {
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.project-distribution__skeleton-cell--name {
  flex: 3;
}

.project-distribution__skeleton-cell--count {
  flex: 1;
}

.project-distribution__skeleton-cell--percent {
  flex: 1;
}

@media (max-width: 767px) {
  .project-distribution {
    padding: 16px;
  }

  .project-distribution__chart {
    height: 260px;
  }

  .project-distribution__table-percent {
    display: none;
  }

  .project-distribution__skeleton-circle {
    width: 160px;
    height: 160px;
  }
}
</style>
