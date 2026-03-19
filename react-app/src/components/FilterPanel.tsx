import { useState } from 'react'
import { Card, DatePicker, Select, Button, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

interface FilterPanelProps {
  projects: string[]
  authors: string[]
  startDate: string
  endDate: string
  selectedProject: string
  selectedAuthor: string
  onDateRangeChange: (startDate: string, endDate: string) => void
  onProjectChange: (project: string) => void
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
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)

  const handleQuery = () => {
    onDateRangeChange(localStartDate, localEndDate)
  }

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap size="middle">
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

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleQuery}
        >
          查询
        </Button>

        <Select
          value={selectedProject || undefined}
          placeholder="全部项目"
          allowClear
          onChange={(val) => onProjectChange(val ?? '')}
          style={{ minWidth: 160 }}
          options={projects.map(p => ({ label: p, value: p }))}
        />

        <Select
          value={selectedAuthor || undefined}
          placeholder="全部作者"
          allowClear
          onChange={(val) => onAuthorChange(val ?? '')}
          style={{ minWidth: 140 }}
          options={authors.map(a => ({ label: a, value: a }))}
        />
      </Space>
    </Card>
  )
}

export default FilterPanel
