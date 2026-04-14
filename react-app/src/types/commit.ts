/**
 * 提交记录类型定义
 *
 * 对应后端 /api/gitlab/commits 接口返回的单条提交数据结构
 */
export interface CommitRecord {
  /** 提交的完整 ID（SHA 哈希） */
  id: string
  /** 提交的短 ID（通常为前 8 位） */
  shortId: string
  /** 提交标题（commit message 的第一行） */
  title: string
  /** 完整的 commit message */
  message: string
  /** 提交作者姓名 */
  authorName: string
  /** 提交作者邮箱 */
  authorEmail: string
  /** 提交时间（ISO 8601 格式字符串） */
  committedDate: string
  /** 所属项目 ID */
  projectId: number
  /** 所属项目名称 */
  projectName: string
  /** 新增行数 */
  additions: number
  /** 删除行数 */
  deletions: number
}
