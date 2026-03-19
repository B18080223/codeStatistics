import { useState, useMemo, useCallback } from 'react'
import type { CommitRecord } from '../types/commit'
import { fetchCommits } from '../services/api'

export type SortField = 'committedDate' | 'additions' | 'deletions'
export type SortOrder = 'asc' | 'desc'

export function useCommitData() {
  const [allData, setAllData] = useState<CommitRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchKeyword, setSearchKeywordState] = useState('')
  const [selectedProject, setSelectedProjectState] = useState('')
  const [selectedAuthor, setSelectedAuthorState] = useState('')
  const [sortField, setSortField] = useState<SortField>('committedDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(20)

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

  const sortedData = useMemo(() => {
    const sorted = [...filteredData]
    sorted.sort((a, b) => {
      let cmp = 0
      if (sortField === 'committedDate') {
        cmp = a.committedDate.localeCompare(b.committedDate)
      } else {
        cmp = a[sortField] - b[sortField]
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [filteredData, sortField, sortOrder])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / pageSize) || 1
  }, [filteredData.length, pageSize])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const uniqueProjects = useMemo(() => {
    return [...new Set(allData.map(item => item.projectName))].sort()
  }, [allData])

  const uniqueAuthors = useMemo(() => {
    return [...new Set(allData.map(item => item.authorName))].sort()
  }, [allData])

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

  const toggleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }, [sortField])

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1)
  }, [])

  return {
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
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    uniqueProjects,
    uniqueAuthors,
    loadData,
    setSearchKeyword,
    setSelectedProject,
    setSelectedAuthor,
    toggleSort,
    setCurrentPage,
    setPageSize
  }
}
