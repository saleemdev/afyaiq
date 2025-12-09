import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useLogsStore, type LogEntry } from '../store/logsStore';
import '../styles/logs.css';

const { Title, Text } = Typography;
const { Search } = Input;

const Logs: React.FC = () => {
  const logs = useLogsStore((state) => state.logs);
  const stats = useLogsStore((state) => state.stats);
  const fetchLogs = useLogsStore((state) => state.fetchLogs);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRouteType, setFilterRouteType] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.route_path
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesMethod = filterMethod === 'all' || log.method === filterMethod;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'success' && log.status_code >= 200 && log.status_code < 300) ||
      (filterStatus === 'error' && (log.status_code >= 400 || log.status_code === 0));

    const matchesRouteType =
      filterRouteType === 'all' || log.route_type === filterRouteType;

    return matchesSearch && matchesMethod && matchesStatus && matchesRouteType;
  });

  const getMethodTag = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'blue',
      POST: 'green',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple',
    };
    return <Tag color={colors[method] || 'default'}>{method}</Tag>;
  };

  const getStatusTag = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Tag color="success">{statusCode}</Tag>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Tag color="warning">{statusCode}</Tag>;
    } else if (statusCode >= 500) {
      return <Tag color="error">{statusCode}</Tag>;
    }
    return <Tag color="default">{statusCode || 'N/A'}</Tag>;
  };

  const getRouteTypeIcon = (type: string) => {
    if (type === 'ai_model') {
      return <RobotOutlined style={{ color: '#8b5cf6' }} />;
    }
    return null;
  };

  const columns: ColumnsType<LogEntry> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => (
        <Text type="secondary">{dayjs(timestamp).format('MMM DD, HH:mm:ss')}</Text>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 80,
      render: (method: string) => getMethodTag(method),
    },
    {
      title: 'Route Path',
      dataIndex: 'route_path',
      key: 'route_path',
      width: 250,
      render: (path: string, record: LogEntry) => (
        <Space size="small">
          {getRouteTypeIcon(record.route_type)}
          <Text strong>{path}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status_code',
      key: 'status_code',
      width: 90,
      align: 'center',
      render: (statusCode: number) => getStatusTag(statusCode),
    },
    {
      title: 'Response Time',
      dataIndex: 'response_time',
      key: 'response_time',
      width: 130,
      align: 'right',
      render: (time: number) => {
        const color = time > 1000 ? '#ef4444' : time > 500 ? '#f59e0b' : '#10b981';
        return <Text style={{ color }}>{time.toFixed(0)}ms</Text>;
      },
    },
    {
      title: 'AI Tokens',
      dataIndex: 'tokens_used',
      key: 'tokens_used',
      width: 110,
      align: 'right',
      render: (tokens: number | undefined, record: LogEntry) => {
        if (record.route_type !== 'ai_model') return <Text type="secondary">-</Text>;
        return <Text type="secondary">{tokens?.toLocaleString() || 0}</Text>;
      },
    },
    {
      title: 'AI Model',
      dataIndex: 'model',
      key: 'model',
      width: 150,
      render: (model: string | undefined, record: LogEntry) => {
        if (record.route_type !== 'ai_model') return <Text type="secondary">-</Text>;
        return <Text type="secondary">{model || 'Unknown'}</Text>;
      },
    },
  ];

  return (
    <div className="logs-container">
      {/* Page Header */}
      <div className="logs-header">
        <Title level={2}>Request Logs</Title>
        <Text type="secondary">
          Real-time monitoring of API requests, responses, and AI model usage
        </Text>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Requests (24h)"
              value={stats.totalRequests}
              prefix={<ThunderboltOutlined style={{ color: '#2563eb' }} />}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Success Rate"
              value={(100 - stats.errorRate).toFixed(1)}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Avg Response Time"
              value={stats.avgResponseTime}
              suffix="ms"
              prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="AI Tokens (24h)"
              value={stats.tokensUsed}
              prefix={<RobotOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="logs-filters-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Search
              placeholder="Search route path..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Method"
              value={filterMethod}
              onChange={setFilterMethod}
            >
              <Select.Option value="all">All Methods</Select.Option>
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
              <Select.Option value="PATCH">PATCH</Select.Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="success">Success (2xx)</Select.Option>
              <Select.Option value="error">Error (4xx/5xx)</Select.Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Type"
              value={filterRouteType}
              onChange={setFilterRouteType}
            >
              <Select.Option value="all">All Types</Select.Option>
              <Select.Option value="standard">Standard API</Select.Option>
              <Select.Option value="ai_model">AI Model</Select.Option>
              <Select.Option value="static">Static Content</Select.Option>
            </Select>
          </Col>
          <Col xs={12} md={6} style={{ textAlign: 'right' }}>
            <Space>
              <Badge status="processing" text="Auto-refresh: 10s" />
              <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Logs Table */}
      <Card className="logs-table-card">
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} logs`,
            pageSizeOptions: ['20', '50', '100', '200'],
          }}
          scroll={{ x: 1100 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Logs;
