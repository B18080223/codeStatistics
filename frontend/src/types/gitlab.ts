/** GitLab 配置 */
export interface GitLabConfig {
  serverUrl: string
  username: string
  token: string
}

/** 配置响应 */
export interface ConfigResponse {
  success: boolean
  message: string
  userId?: number
  userName?: string
}

/** 日期范围参数 */
export interface DateRangeParams {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
}

/** 提交记录 */
export interface CommitRecord {
  id: string
  shortId: string
  title: string
  message: string
  authorName: string
  authorEmail: string
  committedDate: string
  projectId: number
  projectName: string
}

/** 统计汇总数据 */
export interface CommitStats {
  totalCommits: number
  activeDays: number
  avgDailyCommits: number
  projectCount: number
  dailyCommits: DailyCommitData[]
  projectCommits: ProjectCommitData[]
  lastUpdated: string
}

/** 每日提交数据 */
export interface DailyCommitData {
  date: string
  count: number
}

/** 项目提交数据 */
export interface ProjectCommitData {
  projectId: number
  projectName: string
  commitCount: number
}
