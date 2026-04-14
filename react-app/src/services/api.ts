import type { CommitRecord } from '../types/commit'

/**
 * 获取指定日期范围内的提交记录列表
 *
 * @param startDate - 开始日期，格式 YYYY-MM-DD
 * @param endDate - 结束日期，格式 YYYY-MM-DD
 * @returns 提交记录数组
 * @throws 请求失败时抛出包含状态码的错误
 */
export async function fetchCommits(
  startDate: string,
  endDate: string
): Promise<CommitRecord[]> {
  const url = `/api/gitlab/commits?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data
}
