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
      formatter: (params: any) =>
        `${params.name}<br/>提交次数：<b>${params.value}</b>（${params.percent}%）`
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
        label: { show: false },
        emphasis: { scale: true, scaleSize: 6 },
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
  <el-card shadow="hover">
    <template #header>
      <div class="distribution-header">
        <span class="distribution-header__title">项目分布</span>
        <el-button-group
          v-if="!loading && data.length > 0"
          size="small"
        >
          <el-button
            :type="viewMode === 'chart' ? 'primary' : 'default'"
            @click="viewMode = 'chart'"
          >
            图表
          </el-button>
          <el-button
            :type="viewMode === 'table' ? 'primary' : 'default'"
            @click="viewMode = 'table'"
          >
            表格
          </el-button>
        </el-button-group>
      </div>
    </template>

    <!-- 加载状态 -->
    <template v-if="loading">
      <el-skeleton :rows="8" animated />
    </template>

    <!-- 空数据 -->
    <el-empty v-else-if="data.length === 0" description="暂无项目数据" />

    <!-- 正常内容 -->
    <template v-else>
      <div
        v-show="viewMode === 'chart'"
        ref="chartRef"
        class="distribution-chart"
      />
      <el-table
        v-show="viewMode === 'table'"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="projectName" label="项目名称" />
        <el-table-column
          prop="commitCount"
          label="提交次数"
          align="right"
          width="120"
        />
        <el-table-column
          label="提交占比"
          align="right"
          width="120"
        >
          <template #default="{ row }">
            {{ row.percentage }}%
          </template>
        </el-table-column>
      </el-table>
    </template>
  </el-card>
</template>

<style scoped>
.distribution-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.distribution-header__title {
  font-size: 16px;
  font-weight: 600;
}

.distribution-chart {
  width: 100%;
  height: 360px;
}

@media (max-width: 767px) {
  .distribution-chart {
    height: 260px;
  }
}
</style>
