/**
 * Pagination - 分页控件组件
 *
 * 封装 Ant Design Pagination，支持页码跳转和每页条数切换
 * 父组件传入 totalPages 和 pageSize，本组件换算为 Ant Design 需要的 total
 */
import { Pagination as AntPagination } from 'antd'

interface PaginationProps {
  /** 当前页码 */
  currentPage: number
  /** 总页数 */
  totalPages: number
  /** 每页条数 */
  pageSize: number
  /** 页码变更回调 */
  onPageChange: (page: number) => void
  /** 每页条数变更回调 */
  onPageSizeChange: (size: number) => void
}

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationProps) => {
  // Ant Design Pagination 需要 total（总条数），由 totalPages * pageSize 换算
  const total = totalPages * pageSize

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
      <AntPagination
        current={currentPage}
        total={total}
        pageSize={pageSize}
        showSizeChanger          // 显示每页条数切换器
        showQuickJumper          // 显示快速跳转输入框
        pageSizeOptions={['10', '20', '50']}
        showTotal={(t) => `共 ${t} 条`}
        onChange={(page, size) => {
          // 如果每页条数变了，先通知父组件更新 pageSize
          if (size !== pageSize) {
            onPageSizeChange(size)
          }
          onPageChange(page)
        }}
      />
    </div>
  )
}

export default Pagination
