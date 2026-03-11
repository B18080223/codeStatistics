<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { DailyCommitData } from '@/types/gitlab'

echarts.use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  CanvasRenderer
])

const props = defineProps<{
  data: DailyCommitData[]
  loading?: boolean
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)

const buildChartOption = (data: DailyCommitData[]): echarts.EChartsCoreOption => {
  const dates = data.map(item => item.date)
  const counts = data.map(item => item.count)

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const item = params[0]
        return `${item.axisValue}<br/>提交次数：<b>${item.value}</b>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        fontSize: 12,
        color: '#909399'
      },
      axisLine: {
        lineStyle: { color: '#e4e7ed' }
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        fontSize: 12,
        color: '#909399'
      },
      splitLine: {
        lineStyle: { color: '#e4e7ed', type: 'dashed' }
      }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#409eff' },
        lineStyle: { width: 2, color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.02)' }
          ])
        },
        data: counts
      }
    ]
  }
}

const updateChart = () => {
  if (!chartInstance.value) return
  chartInstance.value.setOption(buildChartOption(props.data))
}

const handleResize = () => {
  chartInstance.value?.resize()
}

onMounted(() => {
  if (!chartRef.value) return
  chartInstance.value = echarts.init(chartRef.value)
  updateChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance.value?.dispose()
  chartInstance.value = null
})

watch(() => props.data, updateChart, { deep: true })
</script>

<template>
  <div class="commit-line-chart">
    <h3 class="commit-line-chart__title">提交趋势</h3>
    <template v-if="loading">
      <div class="commit-line-chart__skeleton" />
    </template>
    <template v-else>
      <div ref="chartRef" class="commit-line-chart__canvas" />
    </template>
  </div>
</template>

<style scoped>
.commit-line-chart {
  padding: 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.commit-line-chart__title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.commit-line-chart__canvas {
  width: 100%;
  height: 360px;
}

.commit-line-chart__skeleton {
  width: 100%;
  height: 360px;
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

@media (max-width: 767px) {
  .commit-line-chart {
    padding: 16px;
  }

  .commit-line-chart__canvas,
  .commit-line-chart__skeleton {
    height: 260px;
  }
}
</style>
