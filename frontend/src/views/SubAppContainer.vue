<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Loading } from '@element-plus/icons-vue'

const router = useRouter()
const isLoading = ref(true)

let observer: MutationObserver | null = null
let timer: ReturnType<typeof setTimeout> | null = null

const goBack = () => {
  router.push('/modules')
}

onMounted(() => {
  const container = document.getElementById('subapp-container')
  if (container) {
    observer = new MutationObserver(() => {
      // qiankun 挂载后容器内会出现子元素（含 shadow DOM 场景）
      if (container.childElementCount > 0) {
        isLoading.value = false
      }
    })
    observer.observe(container, { childList: true, subtree: true })
  }
  // 兜底：最多 10 秒后关闭 loading
  timer = setTimeout(() => {
    isLoading.value = false
  }, 10000)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})
</script>

<template>
  <div class="sub-app-container">
    <div class="sub-app-header">
      <el-button text @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回模块选择
      </el-button>
    </div>
    <div v-if="isLoading" class="sub-app-loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span class="loading-text">子应用加载中...</span>
    </div>
    <div id="subapp-container"></div>
  </div>
</template>

<style scoped>
.sub-app-container {
  width: 100%;
  min-height: 80vh;
  padding: 16px 24px;
}

.sub-app-header {
  margin-bottom: 12px;
}

.sub-app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 0;
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

.loading-text {
  color: #909399;
}

#subapp-container {
  box-sizing: border-box;
  overflow: auto;
  width: 100%;
  min-height: 0;
}
</style>
