import { get, post } from './base'
import type {
  GitLabConfig,
  ConfigResponse,
  CommitRecord,
  CommitStats,
  DateRangeParams
} from '@/types/gitlab'

/** 保存并验证 GitLab 配置 */
export const saveGitLabConfig = (config: GitLabConfig) => {
  return post<ConfigResponse>('/api/gitlab/config', config)
}

/** 获取提交记录列表 */
export const getCommitList = (params: DateRangeParams) => {
  return get<CommitRecord[]>('/api/gitlab/commits', params)
}

/** 获取统计汇总数据 */
export const getCommitStats = (params: DateRangeParams) => {
  return get<CommitStats>('/api/gitlab/stats', params)
}
