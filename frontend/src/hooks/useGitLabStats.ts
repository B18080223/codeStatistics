import { ref, reactive } from 'vue'
import { getCommitStats, getConfigStatus } from '@/services/gitlabService'
import { getDefaultDateRange } from '@/const/gitlabStats'
import type { CommitStats, DateRangeParams } from '@/types/gitlab'

export const useGitLabStats = () => {
  const statsData = ref<CommitStats | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')
  const canRetry = ref(false)
  const lastUpdated = ref('')
  const isConfigured = ref(false)
  const dateRange = reactive<DateRangeParams>(getDefaultDateRange())

  /** 页面加载时检查后端配置状态，已配置则直接拉取数据 */
  const checkConfig = async () => {
    try {
      const res = await getConfigStatus()
      if (res.success) {
        isConfigured.value = true
        await fetchStats()
      }
    } catch {
      // 后端未启动或接口不存在，忽略，停留在配置页
    }
  }

  const fetchStats = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const data = await getCommitStats({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      statsData.value = data
      lastUpdated.value = new Date().toISOString()
      canRetry.value = false
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 401) {
        errorMessage.value = 'GitLab 认证失败，请检查配置'
        canRetry.value = false
      } else if (!navigator.onLine || error?.code === 'ERR_NETWORK') {
        errorMessage.value = '网络连接失败，请检查网络后重试'
        canRetry.value = true
      } else {
        errorMessage.value = '获取数据失败，请稍后重试'
        canRetry.value = true
      }
    } finally {
      isLoading.value = false
    }
  }

  const refreshData = async () => {
    await fetchStats()
  }

  const handleConfigSuccess = async () => {
    isConfigured.value = true
    await fetchStats()
  }

  const handleDateRangeChange = async (range: DateRangeParams) => {
    dateRange.startDate = range.startDate
    dateRange.endDate = range.endDate
    await fetchStats()
  }

  return {
    statsData,
    isLoading,
    errorMessage,
    canRetry,
    lastUpdated,
    isConfigured,
    dateRange,
    checkConfig,
    fetchStats,
    refreshData,
    handleConfigSuccess,
    handleDateRangeChange
  }
}
