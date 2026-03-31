/**
 * SearchBar - 关键词搜索栏组件
 *
 * 受控输入框，按标题或作者名进行模糊搜索
 * 搜索逻辑在 useCommitData Hook 中实现，本组件只负责 UI
 */
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface SearchBarProps {
  /** 当前搜索关键词 */
  value: string
  /** 关键词变更回调 */
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
