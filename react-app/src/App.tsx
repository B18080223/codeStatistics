import { useState, useEffect, useCallback } from 'react'
import { ConfigProvider, App as AntApp, Typography, Alert, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useCommitData } from './hooks/useCommitData'
import FilterPanel from './components/FilterPanel'
import SearchBar from './components/SearchBar'
import CommitTable from './components/CommitTable'
import Pagination from './components/Pagination'

const { Title } = Typography

const getDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  const format = (d: Date) => d.toISOString().slice(0, 10)
  return { startDate: format(start), endDate: format(end) }
}

const App = () => {
  const defaultRange = getDefaultDateRange()
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const {
    loading,
    error,
    searchKeyword,
    selectedProject,
    selectedAuthor,
    sortField,
    sortOrder,
    currentPage,
    pageSize,
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
  } = useCommitData()

  useEffect(() => {
    loadData(startDate, endDate)
  }, [])

  const handleDateRangeChange = useCallback((newStart: string, newEnd: string) => {
    setStartDate(newStart)
    setEndDate(newEnd)
    setExpandedId(null)
    loadData(newStart, newEnd)
  }, [loadData])

  const handleRowClick = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  return (
    <ConfigProvider locale={zhCN}>
      <AntApp>
        <div style={{ padding: '24px' }}>
          <Title level={3} style={{ marginTop: 0, marginBottom: '20px' }}>
            提交记录明细浏览器
          </Title>

          <FilterPanel
            projects={uniqueProjects}
            authors={uniqueAuthors}
            startDate={startDate}
            endDate={endDate}
            selectedProject={selectedProject}
            selectedAuthor={selectedAuthor}
            onDateRangeChange={handleDateRangeChange}
            onProjectChange={setSelectedProject}
            onAuthorChange={setSelectedAuthor}
          />

          <SearchBar value={searchKeyword} onChange={setSearchKeyword} />

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 12 }}
            />
          )}

          <Spin spinning={loading}>
            <CommitTable
              data={paginatedData}
              sortField={sortField}
              sortOrder={sortOrder}
              expandedId={expandedId}
              onSort={toggleSort}
              onRowClick={handleRowClick}
            />
          </Spin>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
