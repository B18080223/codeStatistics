import { Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { CommitRecord } from '../types/commit'
import type { SortField, SortOrder } from '../hooks/useCommitData'
import DetailPanel from './DetailPanel'

const { Text } = Typography

interface CommitTableProps {
  data: CommitRecord[]
  sortField: SortField
  sortOrder: SortOrder
  expandedId: string | null
  onSort: (field: SortField) => void
  onRowClick: (id: string) => void
}

const formatDate = (iso: string): string => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const CommitTable = ({
  data,
  sortField,
  sortOrder,
  expandedId,
  onSort,
  onRowClick
}: CommitTableProps) => {
  const columns: ColumnsType<CommitRecord> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '作者',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 120
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 160,
      render: (name: string) => <Tag>{name}</Tag>
    },
    {
      title: '提交时间',
      dataIndex: 'committedDate',
      key: 'committedDate',
      width: 160,
      sorter: true,
      sortOrder: sortField === 'committedDate'
        ? (sortOrder === 'asc' ? 'ascend' : 'descend')
        : undefined,
      render: (val: string) => formatDate(val)
    },
    {
      title: '新增',
      dataIndex: 'additions',
      key: 'additions',
      width: 90,
      sorter: true,
      sortOrder: sortField === 'additions'
        ? (sortOrder === 'asc' ? 'ascend' : 'descend')
        : undefined,
      render: (val: number) => <Text type="success">+{val}</Text>
    },
    {
      title: '删除',
      dataIndex: 'deletions',
      key: 'deletions',
      width: 90,
      sorter: true,
      sortOrder: sortField === 'deletions'
        ? (sortOrder === 'asc' ? 'ascend' : 'descend')
        : undefined,
      render: (val: number) => <Text type="danger">-{val}</Text>
    }
  ]

  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    if (sorter?.columnKey) {
      onSort(sorter.columnKey as SortField)
    }
  }

  return (
    <Table<CommitRecord>
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      size="middle"
      onChange={handleTableChange}
      expandable={{
        expandedRowKeys: expandedId ? [expandedId] : [],
        expandedRowRender: (record) => <DetailPanel commit={record} />,
        expandRowByClick: true,
        onExpand: (_expanded, record) => {
          onRowClick(record.id)
        }
      }}
      locale={{ emptyText: '暂无数据' }}
    />
  )
}

export default CommitTable
