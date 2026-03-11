<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  DATE_SHORTCUT_LIST,
  DEFAULT_DATE_RANGE_DAYS,
  getDateRange
} from '@/const/gitlabStats'
import type { ShortcutValue } from '@/const/gitlabStats'
import type { DateRangeParams } from '@/types/gitlab'

interface DateRangeSelectorProps {
  startDate: string
  endDate: string
}

const props = defineProps<DateRangeSelectorProps>()

const emit = defineEmits<{
  change: [range: DateRangeParams]
}>()

const localStartDate = ref(props.startDate)
const localEndDate = ref(props.endDate)
const activeShortcut = ref<ShortcutValue | null>(DEFAULT_DATE_RANGE_DAYS)
const errorMessage = ref('')

watch(() => props.startDate, (val) => {
  localStartDate.value = val
})

watch(() => props.endDate, (val) => {
  localEndDate.value = val
})

const validate = (start: string, end: string): boolean => {
  if (end < start) {
    errorMessage.value = '结束日期不能早于开始日期'
    return false
  }
  errorMessage.value = ''
  return true
}

const handleShortcutClick = (shortcut: ShortcutValue) => {
  activeShortcut.value = shortcut
  const range = getDateRange(shortcut)
  localStartDate.value = range.startDate
  localEndDate.value = range.endDate
  errorMessage.value = ''
  emit('change', range)
}

const handleDateChange = () => {
  activeShortcut.value = null
  if (!validate(localStartDate.value, localEndDate.value)) return
  emit('change', {
    startDate: localStartDate.value,
    endDate: localEndDate.value
  })
}
</script>

<template>
  <div class="date-range-selector">
    <div class="date-range-selector__shortcuts">
      <button
        v-for="item in DATE_SHORTCUT_LIST"
        :key="String(item.value)"
        type="button"
        class="date-range-selector__shortcut-btn"
        :class="{
          'date-range-selector__shortcut-btn--active':
            activeShortcut === item.value
        }"
        @click="handleShortcutClick(item.value)"
      >
        {{ item.label }}
      </button>
    </div>

    <div class="date-range-selector__inputs">
      <div class="date-range-selector__field">
        <label class="date-range-selector__label" for="startDate">
          开始日期
        </label>
        <input
          id="startDate"
          v-model="localStartDate"
          type="date"
          class="date-range-selector__input"
          @change="handleDateChange"
        />
      </div>

      <span class="date-range-selector__separator">至</span>

      <div class="date-range-selector__field">
        <label class="date-range-selector__label" for="endDate">
          结束日期
        </label>
        <input
          id="endDate"
          v-model="localEndDate"
          type="date"
          class="date-range-selector__input"
          @change="handleDateChange"
        />
      </div>
    </div>

    <span v-if="errorMessage" class="date-range-selector__error">
      {{ errorMessage }}
    </span>
  </div>
</template>

<style scoped>
.date-range-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-range-selector__shortcuts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.date-range-selector__shortcut-btn {
  padding: 6px 14px;
  font-size: 13px;
  color: #606266;
  background: #f4f4f5;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.date-range-selector__shortcut-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.date-range-selector__shortcut-btn--active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.date-range-selector__shortcut-btn--active:hover {
  color: #fff;
  background: #66b1ff;
  border-color: #66b1ff;
}

.date-range-selector__inputs {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.date-range-selector__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-range-selector__label {
  font-size: 13px;
  color: #606266;
}

.date-range-selector__input {
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}

.date-range-selector__input:focus {
  border-color: #409eff;
}

.date-range-selector__separator {
  padding-bottom: 6px;
  font-size: 14px;
  color: #909399;
}

.date-range-selector__error {
  font-size: 12px;
  color: #f56c6c;
}

@media (max-width: 767px) {
  .date-range-selector__inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .date-range-selector__separator {
    display: none;
  }

  .date-range-selector__input {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
