/**
 * CommitTable - 提交记录表格组件
 *
 * 基于 Ant Design Table 实现，支持：
 * - 列排序（提交时间、新增行数、删除行数）
 * - 行展开（点击行展开 DetailPanel 查看详情）
 * - 排序状态由父组件控制（受控模式）
 */
import { Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { CommitRecord } from '../types/commit'
import type { SortField, SortOrder } from '../hooks/useCommitData'
import DetailPanel from './DetailPanel'

const { Text } = Typography

interface CommitTableProps {
  /** 当前页的提交记录数据 */
  data: CommitRecord[]
  /** 当前排序字段 */
  sortField: SortField
  /** 排序方向 */
  sortOrder: SortOrder
  /** 当前展开行的 ID，null 表示无展开 */
  expandedId: string | null
  /** 排序变更回调 */
  onSort: (field: SortField) => void
  /** 行点击回调（用于展开/收起） */
  onRowClick: (id: string) => void
}

/** 将 ISO 日期字符串格式化为 YYYY-MM-DD HH:mm */
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
  // 表格列定义
  const columns: ColumnsType<CommitRecord> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true  // 超长文本省略显示
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
      render: (name: string) => <Tag>{name}</Tag>  // 用标签样式展示项目名
    },
    {
      title: '提交时间',
      dataIndex: 'committedDate',
      key: 'committedDate',
      width: 160,
      sorter: true,  // 启用排序
      // 受控排序状态：根据父组件传入的 sortField/sortOrder 决定排序图标
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
      render: (val: number) => <Text type="success">+{val}</Text>  // 绿色显示新增行数
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
      render: (val: number) => <Text type="danger">-{val}</Text>  // 红色显示删除行数
    }
  ]

  /** 处理表格排序变更事件，将排序字段回传给父组件 */
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
      pagination={false}  // 分页由外部 Pagination 组件控制
      size="middle"
      onChange={handleTableChange}
      expandable={{
        // 受控展开：由父组件的 expandedId 决定哪一行展开
        expandedRowKeys: expandedId ? [expandedId] : [],
        // 展开行渲染 DetailPanel 组件
        expandedRowRender: (record) => <DetailPanel commit={record} />,
        // 点击行任意位置即可展开（不仅限于展开图标）
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
