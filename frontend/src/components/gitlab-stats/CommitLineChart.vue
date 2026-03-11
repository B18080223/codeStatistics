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

const buildChartOption = (
  data: DailyCommitData[]
): echarts.EChartsCoreOption => {
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
      axisLabel: { fontSize: 12, color: '#909399' },
      axisLine: { lineStyle: { color: '#e4e7ed' } }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { fontSize: 12, color: '#909399' },
      splitLine: { lineStyle: { color: '#e4e7ed', type: 'dashed' } }
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
  <el-card shadow="hover">
    <template #header>
      <span class="chart-title">提交趋势</span>
    </template>
    <el-skeleton v-if="loading" :rows="8" animated />
    <div v-else ref="chartRef" class="chart-canvas" />
  </el-card>
</template>

<style scoped>
.chart-title {
  font-size: 16px;
  font-weight: 600;
}

.chart-canvas {
  width: 100%;
  height: 360px;
}

@media (max-width: 767px) {
  .chart-canvas {
    height: 260px;
  }
}
</style>
