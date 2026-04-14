/**
 * App.tsx - 根组件
 *
 * 职责：
 * 1. 提供 Ant Design 全局配置（中文语言包、AntApp 上下文）
 * 2. 管理页面级 UI 状态（日期范围、展开行）
 * 3. 通过 useCommitData Hook 获取数据和操作方法
 * 4. 将状态和回调通过 props 分发给各子组件
 */
import { useState, useEffect, useCallback } from 'react'
import { ConfigProvider, App as AntApp, Typography, Alert, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useCommitData } from './hooks/useCommitData'
import FilterPanel from './components/FilterPanel'
import SearchBar from './components/SearchBar'
import CommitTable from './components/CommitTable'
import Pagination from './components/Pagination'

const { Title } = Typography

/** 计算默认日期范围：今天往前推 30 天 */
const getDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  const format = (d: Date) => d.toISOString().slice(0, 10)
  return { startDate: format(start), endDate: format(end) }
}

const App = () => {
  // ---- 页面级 UI 状态 ----
  const defaultRange = getDefaultDateRange()
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  /** 当前展开的表格行 ID，null 表示无展开 */
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // ---- 从自定义 Hook 获取数据状态和操作方法 ----
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

  // 组件挂载时，用默认日期范围加载一次数据
  useEffect(() => {
    loadData(startDate, endDate)
  }, [])

  /** 日期范围变更：更新日期、收起展开行、重新请求数据 */
  const handleDateRangeChange = useCallback((newStart: string, newEnd: string) => {
    setStartDate(newStart)
    setEndDate(newEnd)
    setExpandedId(null)
    loadData(newStart, newEnd)
  }, [loadData])

  /** 表格行点击：切换展开/收起（点同一行收起，点不同行展开） */
  const handleRowClick = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  return (
    // ConfigProvider：注入 Ant Design 中文语言包，影响所有子组件的文案
    <ConfigProvider locale={zhCN}>
      {/* AntApp：提供 Ant Design 全局上下文（message、notification 等静态方法） */}
      <AntApp>
        <div style={{ padding: '24px' }}>
          <Title level={3} style={{ marginTop: 0, marginBottom: '20px' }}>
            提交记录明细浏览器
          </Title>

          {/* 筛选面板：日期范围 + 项目下拉 + 作者下拉 */}
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

          {/* 关键词搜索栏 */}
          <SearchBar value={searchKeyword} onChange={setSearchKeyword} />

          {/* 错误提示：仅在有错误时渲染 */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 12 }}
            />
          )}

          {/* Spin 包裹表格，loading 时显示加载动画 */}
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

          {/* 分页控件 */}
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
