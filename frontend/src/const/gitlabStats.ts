/** 日期快捷选项类型 */
export type ShortcutValue = number | 'year'

/** 日期快捷选项 */
export interface DateShortcut {
  value: ShortcutValue
  label: string
}

/** 日期快捷选项列表 */
export const DATE_SHORTCUT_LIST: DateShortcut[] = [
  { value: 7, label: '最近 7 天' },
  { value: 30, label: '最近 30 天' },
  { value: 90, label: '最近 90 天' },
  { value: 'year', label: '今年' }
]

/** 默认日期范围天数 */
export const DEFAULT_DATE_RANGE_DAYS = 30

/**
 * 格式化日期为 YYYY-MM-DD 字符串
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 根据快捷选项值计算日期范围
 * @param shortcut 快捷选项值（天数或 'year'）
 * @returns 包含 startDate 和 endDate 的日期范围对象
 */
export const getDateRange = (
  shortcut: ShortcutValue
): { startDate: string, endDate: string } => {
  const today = new Date()
  const endDate = formatDate(today)

  if (shortcut === 'year') {
    const startDate = `${today.getFullYear()}-01-01`
    return { startDate, endDate }
  }

  const start = new Date(today)
  start.setDate(start.getDate() - shortcut + 1)
  const startDate = formatDate(start)
  return { startDate, endDate }
}

/**
 * 获取默认日期范围（最近 30 天）
 */
export const getDefaultDateRange = (): {
  startDate: string
  endDate: string
} => {
  return getDateRange(DEFAULT_DATE_RANGE_DAYS)
}
