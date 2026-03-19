import { createRouter, createWebHistory } from 'vue-router'
import { getConfigStatus } from '@/services/gitlabService'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Config',
      component: () => import('@/views/ConfigPage.vue')
    },
    {
      path: '/modules',
      name: 'ModuleSelect',
      component: () => import('@/views/ModuleSelect.vue'),
      meta: { requiresConfig: true }
    },
    {
      path: '/stats',
      name: 'GitLabStats',
      component: () => import('@/views/GitLabStats.vue'),
      meta: { requiresConfig: true }
    },
    {
      path: '/commits',
      name: 'SubAppContainer',
      component: () => import('@/views/SubAppContainer.vue'),
      meta: { requiresConfig: true }
    }
  ]
})

/** 缓存配置状态，避免每次路由跳转都请求后端 */
let configChecked = false
let configValid = false

router.beforeEach(async (to) => {
  if (!to.meta.requiresConfig) return true

  if (!configChecked) {
    try {
      const res = await getConfigStatus()
      configValid = res.success
    } catch {
      configValid = false
    }
    configChecked = true
  }

  if (!configValid) {
    return { name: 'Config' }
  }
  return true
})

/** 配置成功后重置缓存，让守卫重新检查 */
export const resetConfigCache = () => {
  configChecked = false
  configValid = false
}

export default router
