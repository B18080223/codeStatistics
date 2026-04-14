import { useState, useMemo, useCallback } from 'react'
import type { CommitRecord } from '../types/commit'
import { fetchCommits } from '../services/api'

/** 支持排序的字段类型 */
export type SortField = 'committedDate' | 'additions' | 'deletions'
/** 排序方向 */
export type SortOrder = 'asc' | 'desc'

/**
 * 提交数据管理 Hook
 *
 * 封装了提交记录的完整数据流：请求 → 过滤 → 排序 → 分页
 * 同时提供筛选条件的状态管理和操作方法
 */
export function useCommitData() {
  // ---- 原始数据与请求状态 ----
  const [allData, setAllData] = useState<CommitRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ---- 筛选条件 ----
  const [searchKeyword, setSearchKeywordState] = useState('')
  const [selectedProject, setSelectedProjectState] = useState('')
  const [selectedAuthor, setSelectedAuthorState] = useState('')

  // ---- 排序状态 ----
  const [sortField, setSortField] = useState<SortField>('committedDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // ---- 分页状态 ----
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(20)

  /**
   * 从后端加载提交数据
   * 请求完成后重置页码到第 1 页
   */
  const loadData = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchCommits(startDate, endDate)
      setAllData(data)
      setCurrentPage(1)
    } catch (e: any) {
      setError(e?.message || '数据加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  /** 按项目、作者、关键词过滤后的数据（关键词匹配标题和作者名） */
  const filteredData = useMemo(() => {
    let result = allData

    if (selectedProject) {
      result = result.filter(item => item.projectName === selectedProject)
    }

    if (selectedAuthor) {
      result = result.filter(item => item.authorName === selectedAuthor)
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(item =>
        item.title.toLowerCase().includes(keyword)
        || item.authorName.toLowerCase().includes(keyword)
      )
    }

    return result
  }, [allData, selectedProject, selectedAuthor, searchKeyword])

  /** 过滤后再按指定字段排序的数据 */
  const sortedData = useMemo(() => {
    const sorted = [...filteredData]
    sorted.sort((a, b) => {
      let cmp = 0
      if (sortField === 'committedDate') {
        // 日期字段用字符串比较（ISO 格式天然支持字典序排序）
        cmp = a.committedDate.localeCompare(b.committedDate)
      } else {
        // 数值字段直接相减
        cmp = a[sortField] - b[sortField]
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [filteredData, sortField, sortOrder])

  /** 总页数，至少为 1 */
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / pageSize) || 1
  }, [filteredData.length, pageSize])

  /** 当前页的数据切片 */
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  /** 从原始数据中提取的去重项目列表（按字母排序） */
  const uniqueProjects = useMemo(() => {
    return [...new Set(allData.map(item => item.projectName))].sort()
  }, [allData])

  /** 从原始数据中提取的去重作者列表（按字母排序） */
  const uniqueAuthors = useMemo(() => {
    return [...new Set(allData.map(item => item.authorName))].sort()
  }, [allData])

  // ---- 操作方法（修改筛选条件时自动重置页码到第 1 页） ----

  const setSearchKeyword = useCallback((keyword: string) => {
    setSearchKeywordState(keyword)
    setCurrentPage(1)
  }, [])

  const setSelectedProject = useCallback((project: string) => {
    setSelectedProjectState(project)
    setCurrentPage(1)
  }, [])

  const setSelectedAuthor = useCallback((author: string) => {
    setSelectedAuthorState(author)
    setCurrentPage(1)
  }, [])

  /**
   * 切换排序：点击同一字段切换升降序，点击不同字段默认降序
   */
  const toggleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }, [sortField])

  /** 修改每页条数时重置页码 */
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1)
  }, [])

  return {
    // 状态
    allData,
    loading,
    error,
    searchKeyword,
    selectedProject,
    selectedAuthor,
    sortField,
    sortOrder,
    currentPage,
    pageSize,
    // 派生数据
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    uniqueProjects,
    uniqueAuthors,
    // 操作方法
    loadData,
    setSearchKeyword,
    setSelectedProject,
    setSelectedAuthor,
    toggleSort,
    setCurrentPage,
    setPageSize
  }
}
