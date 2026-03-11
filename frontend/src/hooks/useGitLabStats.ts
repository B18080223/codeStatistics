import { ref, reactive } from 'vue'
import { getCommitStats } from '@/services/gitlabService'
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
      // 保留之前的数据
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
    fetchStats,
    refreshData,
    handleConfigSuccess,
    handleDateRangeChange
  }
}
