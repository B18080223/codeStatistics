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
  additions: number
  deletions: number
}
