<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { saveGitLabConfig } from '@/services/gitlabService'
import type { GitLabConfig } from '@/types/gitlab'
import type { FormInstance, FormRules } from 'element-plus'

interface ConfigFormProps {
  initialConfig?: GitLabConfig
}

const props = defineProps<ConfigFormProps>()

const emit = defineEmits<{
  submit: [config: GitLabConfig]
  success: []
  error: [message: string]
}>()

const formRef = ref<FormInstance>()
const isSubmitting = ref(false)

const formData = reactive<GitLabConfig>({
  serverUrl: props.initialConfig?.serverUrl ?? '',
  username: props.initialConfig?.username ?? '',
  token: props.initialConfig?.token ?? ''
})

const rules = reactive<FormRules<GitLabConfig>>({
  serverUrl: [
    { required: true, message: '服务器地址不能为空', trigger: 'blur' },
    { pattern: /^https?:\/\//, message: '服务器地址格式无效', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' }
  ],
  token: [
    { required: true, message: '访问令牌不能为空', trigger: 'blur' }
  ]
})

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const config: GitLabConfig = {
    serverUrl: formData.serverUrl.trim(),
    username: formData.username.trim(),
    token: formData.token.trim()
  }

  emit('submit', config)
  isSubmitting.value = true

  try {
    const response = await saveGitLabConfig(config)
    if (response.success) {
      ElMessage.success(response.message || '配置保存成功')
      emit('success')
    } else {
      const msg = response.message || '配置验证失败'
      ElMessage.error(msg)
      emit('error', msg)
    }
  } catch (error: any) {
    const msg = error?.message ?? '保存配置失败，请稍后重试'
    ElMessage.error(msg)
    emit('error', msg)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <el-card class="config-form" shadow="hover">
    <template #header>
      <span class="config-form__title">GitLab 连接配置</span>
    </template>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="服务器地址" prop="serverUrl">
        <el-input
          v-model="formData.serverUrl"
          placeholder="https://gitlab.example.com"
        />
      </el-form-item>

      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入 GitLab 用户名"
        />
      </el-form-item>

      <el-form-item label="访问令牌" prop="token">
        <el-input
          v-model="formData.token"
          type="password"
          show-password
          placeholder="请输入 Personal Access Token"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="isSubmitting"
          style="width: 100%"
          @click="handleSubmit"
        >
          {{ isSubmitting ? '验证中...' : '保存配置' }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.config-form {
  max-width: 480px;
  width: 100%;
}

.config-form__title {
  font-size: 18px;
  font-weight: 600;
}

@media (max-width: 767px) {
  .config-form {
    max-width: 100%;
  }
}
</style>
