<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, shallowRef } from 'vue'
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

const props = defineProps<{
  data: ProjectCommitData[]
  loading?: boolean
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)

const buildChartOption = (
  data: ProjectCommitData[]
): echarts.EChartsCoreOption => {
  const seriesData = data.map(item => ({
    name: item.projectName,
    value: item.commitCount
  }))

  return {
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: (params: any) =>
        `${params.name}<br/>提交次数：<b>${params.value}</b>（${params.percent}%）`
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      type: 'scroll',
      textStyle: {
        fontSize: 12,
        color: '#606266',
        width: 120,
        overflow: 'truncate',
        ellipsis: '...'
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['30%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: { scale: true, scaleSize: 6 },
        data: seriesData
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
      <span class="chart-title">项目分布</span>
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
