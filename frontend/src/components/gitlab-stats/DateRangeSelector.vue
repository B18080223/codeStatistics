<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
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

watch(() => props.startDate, (val) => {
  localStartDate.value = val
})

watch(() => props.endDate, (val) => {
  localEndDate.value = val
})

const handleShortcutClick = (shortcut: ShortcutValue) => {
  activeShortcut.value = shortcut
  const range = getDateRange(shortcut)
  localStartDate.value = range.startDate
  localEndDate.value = range.endDate
  emit('change', range)
}

const handleDateChange = () => {
  activeShortcut.value = null
  if (localEndDate.value < localStartDate.value) {
    ElMessage.warning('结束日期不能早于开始日期')
    return
  }
  emit('change', {
    startDate: localStartDate.value,
    endDate: localEndDate.value
  })
}
</script>

<template>
  <div class="date-range-selector">
    <div class="date-range-selector__shortcuts">
      <el-button
        v-for="item in DATE_SHORTCUT_LIST"
        :key="String(item.value)"
        :type="activeShortcut === item.value ? 'primary' : 'default'"
        size="small"
        @click="handleShortcutClick(item.value)"
      >
        {{ item.label }}
      </el-button>
    </div>

    <div class="date-range-selector__inputs">
      <el-date-picker
        v-model="localStartDate"
        type="date"
        placeholder="开始日期"
        value-format="YYYY-MM-DD"
        :clearable="false"
        @change="handleDateChange"
      />
      <span class="date-range-selector__separator">至</span>
      <el-date-picker
        v-model="localEndDate"
        type="date"
        placeholder="结束日期"
        value-format="YYYY-MM-DD"
        :clearable="false"
        @change="handleDateChange"
      />
    </div>
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

.date-range-selector__inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range-selector__separator {
  font-size: 14px;
  color: #909399;
}

@media (max-width: 767px) {
  .date-range-selector__inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .date-range-selector__separator {
    display: none;
  }
}
</style>
