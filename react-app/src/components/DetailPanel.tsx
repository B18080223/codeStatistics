import { Descriptions, Tag, Typography } from 'antd'
import type { CommitRecord } from '../types/commit'

const { Text, Paragraph } = Typography

interface DetailPanelProps {
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
      <Descriptions.Item label="Short ID">
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {commit.shortId}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="作者邮箱">
        <Text type="secondary">{commit.authorEmail}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="代码变更">
        <Text type="success" strong>+{commit.additions}</Text>
        <span style={{ margin: '0 8px', color: '#d9d9d9' }}>|</span>
        <Text type="danger" strong>-{commit.deletions}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="项目">
        {commit.projectName}
      </Descriptions.Item>
      <Descriptions.Item label="Commit Message" span={2}>
        <Paragraph
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 200,
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
