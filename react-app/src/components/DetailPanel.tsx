/**
 * DetailPanel - 提交详情展开面板
 *
 * 在表格行展开时显示，使用 Ant Design Descriptions 组件
 * 展示提交的详细信息：Short ID、作者邮箱、代码变更统计、完整 commit message
 */
import { Descriptions, Tag, Typography } from 'antd'
import type { CommitRecord } from '../types/commit'

const { Text, Paragraph } = Typography

interface DetailPanelProps {
  /** 当前展开行对应的提交记录 */
  commit: CommitRecord
}

const DetailPanel = ({ commit }: DetailPanelProps) => {
  return (
    <Descriptions
      column={2}
      size="small"
      bordered
      style={{ backgroundColor: '#fafafa' }}
    >
      {/* 提交短 ID，等宽字体展示 */}
      <Descriptions.Item label="Short ID">
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {commit.shortId}
        </Tag>
      </Descriptions.Item>

      {/* 作者邮箱 */}
      <Descriptions.Item label="作者邮箱">
        <Text type="secondary">{commit.authorEmail}</Text>
      </Descriptions.Item>

      {/* 代码变更统计：新增（绿色）和删除（红色） */}
      <Descriptions.Item label="代码变更">
        <Text type="success" strong>+{commit.additions}</Text>
        <span style={{ margin: '0 8px', color: '#d9d9d9' }}>|</span>
        <Text type="danger" strong>-{commit.deletions}</Text>
      </Descriptions.Item>

      {/* 所属项目 */}
      <Descriptions.Item label="项目">
        {commit.projectName}
      </Descriptions.Item>

      {/* 完整 commit message，span=2 占满整行，支持滚动 */}
      <Descriptions.Item label="Commit Message" span={2}>
        <Paragraph
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',    // 保留换行符
            wordBreak: 'break-word',   // 长单词自动换行
            maxHeight: 200,            // 最大高度，超出可滚动
            overflow: 'auto'
          }}
        >
          {commit.message}
        </Paragraph>
      </Descriptions.Item>
    </Descriptions>
  )
}

export default DetailPanel
