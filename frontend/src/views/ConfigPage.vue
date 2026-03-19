<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import ConfigForm from '@/components/gitlab-stats/ConfigForm.vue'
import { getConfigStatus } from '@/services/gitlabService'
import { resetConfigCache } from '@/router'

const router = useRouter()
const route = useRoute()
const isChecking = ref(true)

onMounted(async () => {
  // 带 reconfig 参数说明用户主动要求重新配置，跳过自动跳转
  if (route.query.reconfig) {
    isChecking.value = false
    return
  }

  try {
    const res = await getConfigStatus()
    if (res.success) {
      router.replace('/modules')
      return
    }
  } catch {
    // 未配置或后端未启动，留在配置页
  } finally {
    isChecking.value = false
  }
})

const onConfigSuccess = () => {
  resetConfigCache()
  router.push('/modules')
}
</script>

<template>
  <div class="config-page">
    <div v-if="isChecking" class="config-page__loading">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <span>检查配置状态...</span>
    </div>
    <ConfigForm v-else @success="onConfigSuccess" />
  </div>
</template>

<style scoped>
.config-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 24px;
}

.config-page__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.loading-icon {
  font-size: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
