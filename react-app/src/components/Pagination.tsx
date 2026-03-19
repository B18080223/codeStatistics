import { Pagination as AntPagination } from 'antd'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationProps) => {
  const total = totalPages * pageSize

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
      <AntPagination
        current={currentPage}
        total={total}
        pageSize={pageSize}
        showSizeChanger
        showQuickJumper
        pageSizeOptions={['10', '20', '50']}
        showTotal={(t) => `共 ${t} 条`}
        onChange={(page, size) => {
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
