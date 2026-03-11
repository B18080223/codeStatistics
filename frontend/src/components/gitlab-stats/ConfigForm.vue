<script setup lang="ts">
import { reactive, ref } from 'vue'
import { saveGitLabConfig } from '@/services/gitlabService'
import type { GitLabConfig } from '@/types/gitlab'

interface ConfigFormProps {
  initialConfig?: GitLabConfig
}

const props = defineProps<ConfigFormProps>()

const emit = defineEmits<{
  submit: [config: GitLabConfig]
  success: []
  error: [message: string]
}>()

const formData = reactive<GitLabConfig>({
  serverUrl: props.initialConfig?.serverUrl ?? '',
  username: props.initialConfig?.username ?? '',
  token: props.initialConfig?.token ?? ''
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const resultMessage = ref('')
const isSuccess = ref(false)

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.serverUrl?.trim()) {
    errors.value.serverUrl = '服务器地址不能为空'
  } else if (!/^https?:\/\//.test(formData.serverUrl)) {
    errors.value.serverUrl = '服务器地址格式无效'
  }

  if (!formData.username?.trim()) {
    errors.value.username = '用户名不能为空'
  }

  if (!formData.token?.trim()) {
    errors.value.token = '访问令牌不能为空'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const config: GitLabConfig = {
    serverUrl: formData.serverUrl.trim(),
    username: formData.username.trim(),
    token: formData.token.trim()
  }

  emit('submit', config)
  isSubmitting.value = true
  resultMessage.value = ''

  try {
    const response = await saveGitLabConfig(config)
    if (response.success) {
      isSuccess.value = true
      resultMessage.value = response.message || '配置保存成功'
      emit('success')
    } else {
      isSuccess.value = false
      resultMessage.value = response.message || '配置验证失败'
      emit('error', resultMessage.value)
    }
  } catch (error: any) {
    isSuccess.value = false
    resultMessage.value = error?.message ?? '保存配置失败，请稍后重试'
    emit('error', resultMessage.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="config-form" @submit.prevent="handleSubmit">
    <h3 class="config-form__title">GitLab 连接配置</h3>

    <div class="config-form__field">
      <label class="config-form__label" for="serverUrl">
        服务器地址
      </label>
      <input
        id="serverUrl"
        v-model="formData.serverUrl"
        type="text"
        class="config-form__input"
        :class="{ 'config-form__input--error': errors.serverUrl }"
        placeholder="https://gitlab.example.com"
      />
      <span v-if="errors.serverUrl" class="config-form__error">
        {{ errors.serverUrl }}
      </span>
    </div>

    <div class="config-form__field">
      <label class="config-form__label" for="username">
        用户名
      </label>
      <input
        id="username"
        v-model="formData.username"
        type="text"
        class="config-form__input"
        :class="{ 'config-form__input--error': errors.username }"
        placeholder="请输入 GitLab 用户名"
      />
      <span v-if="errors.username" class="config-form__error">
        {{ errors.username }}
      </span>
    </div>

    <div class="config-form__field">
      <label class="config-form__label" for="token">
        访问令牌
      </label>
      <input
        id="token"
        v-model="formData.token"
        type="password"
        class="config-form__input"
        :class="{ 'config-form__input--error': errors.token }"
        placeholder="请输入 Personal Access Token"
      />
      <span v-if="errors.token" class="config-form__error">
        {{ errors.token }}
      </span>
    </div>

    <button
      type="submit"
      class="config-form__submit"
      :disabled="isSubmitting"
    >
      {{ isSubmitting ? '验证中...' : '保存配置' }}
    </button>

    <div
      v-if="resultMessage"
      class="config-form__result"
      :class="{
        'config-form__result--success': isSuccess,
        'config-form__result--error': !isSuccess
      }"
    >
      {{ resultMessage }}
    </div>
  </form>
</template>

<style scoped>
.config-form {
  max-width: 480px;
  padding: 24px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.config-form__title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.config-form__field {
  margin-bottom: 16px;
}

.config-form__label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.config-form__input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.config-form__input:focus {
  border-color: #409eff;
}

.config-form__input--error {
  border-color: #f56c6c;
}

.config-form__error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #f56c6c;
}

.config-form__submit {
  width: 100%;
  padding: 10px 0;
  margin-top: 8px;
  font-size: 14px;
  color: #fff;
  background-color: #409eff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.config-form__submit:hover {
  background-color: #66b1ff;
}

.config-form__submit:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.config-form__result {
  margin-top: 12px;
  padding: 10px 12px;
  font-size: 13px;
  border-radius: 4px;
}

.config-form__result--success {
  color: #67c23a;
  background-color: #f0f9eb;
  border: 1px solid #c2e7b0;
}

.config-form__result--error {
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
}

@media (max-width: 767px) {
  .config-form {
    max-width: 100%;
    padding: 16px;
  }
}
</style>
