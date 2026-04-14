/**
 * FilterPanel - 筛选面板组件
 *
 * 提供日期范围选择、项目筛选、作者筛选功能
 * 日期使用本地状态暂存，点击「查询」按钮后才触发父组件的数据请求
 * 项目和作者下拉则实时触发筛选
 */
import { useState } from 'react'
import { Card, DatePicker, Select, Button, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

interface FilterPanelProps {
  /** 可选的项目列表（用于下拉选项） */
  projects: string[]
  /** 可选的作者列表（用于下拉选项） */
  authors: string[]
  /** 当前开始日期 */
  startDate: string
  /** 当前结束日期 */
  endDate: string
  /** 当前选中的项目（空字符串表示全部） */
  selectedProject: string
  /** 当前选中的作者（空字符串表示全部） */
  selectedAuthor: string
  /** 日期范围变更回调（点击查询按钮时触发） */
  onDateRangeChange: (startDate: string, endDate: string) => void
  /** 项目筛选变更回调 */
  onProjectChange: (project: string) => void
  /** 作者筛选变更回调 */
  onAuthorChange: (author: string) => void
}

const FilterPanel = ({
  projects,
  authors,
  startDate,
  endDate,
  selectedProject,
  selectedAuthor,
  onDateRangeChange,
  onProjectChange,
  onAuthorChange
}: FilterPanelProps) => {
  // 日期使用本地状态暂存，避免每次选日期都触发请求
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)

  /** 点击查询按钮，将本地日期提交给父组件 */
  const handleQuery = () => {
    onDateRangeChange(localStartDate, localEndDate)
  }

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap size="middle">
        {/* 开始日期选择器 */}
        <Space>
          <span style={{ fontSize: 13, color: '#555' }}>开始日期</span>
          <DatePicker
            value={dayjs(localStartDate)}
            onChange={(date) => {
              if (date) setLocalStartDate(date.format('YYYY-MM-DD'))
            }}
            allowClear={false}
          />
        </Space>

        {/* 结束日期选择器 */}
        <Space>
          <span style={{ fontSize: 13, color: '#555' }}>结束日期</span>
          <DatePicker
            value={dayjs(localEndDate)}
            onChange={(date) => {
              if (date) setLocalEndDate(date.format('YYYY-MM-DD'))
            }}
            allowClear={false}
          />
        </Space>

        {/* 项目筛选下拉（实时生效） */}
        <Select
          value={selectedProject || undefined}
          placeholder="全部项目"
          allowClear
          onChange={(val) => onProjectChange(val ?? '')}
          style={{ minWidth: 240 }}
          options={projects.map(p => ({ label: p, value: p }))}
        />

        {/* 作者筛选下拉（实时生效） */}
        <Select
          value={selectedAuthor || undefined}
          placeholder="全部作者"
          allowClear
          onChange={(val) => onAuthorChange(val ?? '')}
          style={{ minWidth: 140 }}
          options={authors.map(a => ({ label: a, value: a }))}
        />
         {/* 查询按钮：提交日期范围 */}
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleQuery}
        >
          查询
        </Button>
      </Space>
    </Card>
  )
}

export default FilterPanel
