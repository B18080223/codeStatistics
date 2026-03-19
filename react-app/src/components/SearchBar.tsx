import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface SearchBarProps {
  value: string
  onChange: (keyword: string) => void
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div style={{ marginBottom: 12 }}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索标题或作者..."
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        allowClear
        style={{ width: 280 }}
      />
    </div>
  )
}

export default SearchBar
