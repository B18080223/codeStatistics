import type { CommitRecord } from '../types/commit'

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
