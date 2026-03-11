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

const buildChartOption = (data: ProjectCommitData[]): echarts.EChartsCoreOption => {
  const seriesData = data.map(item => ({
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
  <div class="project-pie-chart">
    <h3 class="project-pie-chart__title">项目分布</h3>
    <template v-if="loading">
      <div class="project-pie-chart__skeleton" />
    </template>
    <template v-else>
      <div ref="chartRef" class="project-pie-chart__canvas" />
    </template>
  </div>
</template>

<style scoped>
.project-pie-chart {
  padding: 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.project-pie-chart__title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.project-pie-chart__canvas {
  width: 100%;
  height: 360px;
}

.project-pie-chart__skeleton {
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
  .project-pie-chart {
    padding: 16px;
  }

  .project-pie-chart__canvas,
  .project-pie-chart__skeleton {
    height: 260px;
  }
}
</style>
