<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted, shallowRef } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  MarkLineComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { DailyCommitData } from '@/types/gitlab'

echarts.use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  MarkLineComponent,
  CanvasRenderer
])

const props = defineProps<{
  data: DailyCommitData[]
  loading?: boolean
  startDate?: string
  endDate?: string
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)

const fillDateRange = (
  data: DailyCommitData[],
  start?: string,
  end?: string
): DailyCommitData[] => {
  if (!start || !end) return data

  const countMap = new Map(data.map(d => [d.date, d.count]))
  const result: DailyCommitData[] = []
  const current = new Date(start + 'T00:00:00')
  const last = new Date(end + 'T00:00:00')

  while (current <= last) {
    const dateStr = current.toISOString().slice(0, 10)
    result.push({ date: dateStr, count: countMap.get(dateStr) ?? 0 })
    current.setDate(current.getDate() + 1)
  }
  return result
}

const buildChartOption = (
  rawData: DailyCommitData[]
): echarts.EChartsCoreOption => {
  const data = fillDateRange(rawData, props.startDate, props.endDate)
  const dates = data.map(item => item.date)
  const counts = data.map(item => item.count)

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: { color: '#303133', fontSize: 13 },
      formatter: (params: any) => {
        const item = params[0]
        return `<div style="font-weight:600;margin-bottom:4px">${item.axisValue}</div>`
          + `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${item.color};margin-right:6px"></span>`
          + `提交次数：<b>${item.value}</b>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: data.length > 30 ? '18%' : '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        fontSize: 12,
        color: '#909399',
        rotate: data.length > 15 ? 30 : 0
      },
      axisLine: { lineStyle: { color: '#e4e7ed' } }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { fontSize: 12, color: '#909399' },
      splitLine: { lineStyle: { color: '#e4e7ed', type: 'dashed' } }
    },
    dataZoom: data.length > 30
      ? [
          { type: 'inside', start: 0, end: 100 },
          {
            type: 'slider',
            start: 0,
            end: 100,
            height: 20,
            bottom: 4,
            borderColor: '#e4e7ed',
            fillerColor: 'rgba(64, 158, 255, 0.15)',
            handleStyle: { color: '#409eff' }
          }
        ]
      : [],
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: data.length > 60 ? 4 : 6,
        showSymbol: data.length <= 60,
        itemStyle: { color: '#409eff' },
        lineStyle: { width: 2, color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.02)' }
          ])
        },
        emphasis: {
          itemStyle: { borderWidth: 2, borderColor: '#fff' }
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#e6a23c', type: 'dashed', width: 1 },
          label: { formatter: '日均 {c}', fontSize: 11, color: '#e6a23c' },
          data: [{ type: 'average', name: '平均值' }]
        },
        data: counts
      }
    ]
  }
}

/** 确保 chartRef 在 DOM 中后再初始化 / 更新 */
const ensureChart = async () => {
  await nextTick()
  if (!chartRef.value) return
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartRef.value)
    window.addEventListener('resize', handleResize)
  }
  chartInstance.value.setOption(buildChartOption(props.data), true)
}

const handleResize = () => {
  chartInstance.value?.resize()
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance.value?.dispose()
  chartInstance.value = null
})

// loading 变 true 时 DOM 被移除，必须销毁旧实例；变 false 时重新初始化
watch(() => props.loading, (val) => {
  if (val) {
    chartInstance.value?.dispose()
    chartInstance.value = null
  } else {
    ensureChart()
  }
})

// 数据变化时更新图表
watch(() => props.data, () => {
  if (!props.loading) ensureChart()
}, { deep: true })
</script>

<template>
  <el-card shadow="hover">
    <template #header>
      <span class="chart-title">提交趋势</span>
    </template>
    <el-skeleton v-if="loading" :rows="8" animated />
    <template v-else>
      <div v-if="data.length === 0 && !startDate" class="chart-empty">
        <el-empty description="暂无提交数据" :image-size="80" />
      </div>
      <div v-else ref="chartRef" class="chart-canvas" />
    </template>
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

.chart-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 360px;
}

@media (max-width: 767px) {
  .chart-canvas,
  .chart-empty {
    height: 260px;
  }
}
</style>
