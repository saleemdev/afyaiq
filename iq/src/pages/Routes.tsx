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
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ApiOutlined,
  RobotOutlined,
  FileOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouteStore, type Route } from '../store/routeStore';
import '../styles/routes.css';

const { Title, Text } = Typography;
const { Search } = Input;

const Routes: React.FC = () => {
  const routes = useRouteStore((state) => state.routes);
  const fetchRoutes = useRouteStore((state) => state.fetchRoutes);
  const deleteRoute = useRouteStore((state) => state.deleteRoute);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Filter routes based on search and filters
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.route_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.created_by.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || route.route_type === filterType;
    const matchesStatus = filterStatus === 'all' || route.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: routes.length,
    active: routes.filter((r) => r.status === 'Published').length,
    avgResponseTime:
      routes.reduce((acc, r) => acc + r.avg_response_time, 0) / routes.length || 0,
    totalRequests: routes.reduce((acc, r) => acc + r.requests_24h, 0),
  };

  const getRouteTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_model':
        return <RobotOutlined style={{ color: '#8b5cf6' }} />;
      case 'static':
        return <FileOutlined style={{ color: '#f59e0b' }} />;
      default:
        return <ApiOutlined style={{ color: '#2563eb' }} />;
    }
  };

  const getRouteTypeTag = (type: string) => {
    const colors: Record<string, string> = {
      standard: 'blue',
      ai_model: 'purple',
      static: 'orange',
    };
    const labels: Record<string, string> = {
      standard: 'Standard API',
      ai_model: 'AI Model',
      static: 'Static Content',
    };
    return <Tag color={colors[type]}>{labels[type]}</Tag>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { status: any; text: string }> = {
      Published: { status: 'success', text: 'Published' },
      Approved: { status: 'processing', text: 'Approved' },
      Pending: { status: 'warning', text: 'Pending' },
      Draft: { status: 'default', text: 'Draft' },
    };
    const config = statusConfig[status] || statusConfig.Draft;
    return <Badge status={config.status} text={config.text} />;
  };

  const handleDelete = (id: string) => {
    // In production, show confirmation modal
    if (window.confirm('Are you sure you want to delete this route?')) {
      deleteRoute(id);
    }
  };

  const columns: ColumnsType<Route> = [
    {
      title: 'Route Path',
      dataIndex: 'route_path',
      key: 'route_path',
      width: 250,
      fixed: 'left',
      render: (path: string, record: Route) => (
        <Space>
          {getRouteTypeIcon(record.route_type)}
          <Text strong>{path}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'route_type',
      key: 'route_type',
      width: 150,
      render: (type: string) => getRouteTypeTag(type),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Created By',
      dataIndex: ['created_by', 'name'],
      key: 'created_by',
      width: 150,
      render: (name: string) => <Text>{name}</Text>,
    },
    {
      title: 'Requests (24h)',
      dataIndex: 'requests_24h',
      key: 'requests_24h',
      width: 130,
      align: 'right',
      render: (count: number) => (
        <Text type="secondary">{count.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Avg Response',
      dataIndex: 'avg_response_time',
      key: 'avg_response_time',
      width: 130,
      align: 'right',
      render: (time: number) => (
        <Text type="secondary">{time.toFixed(0)}ms</Text>
      ),
    },
    {
      title: 'AI Tokens',
      dataIndex: 'tokens_used_24h',
      key: 'tokens_used_24h',
      width: 120,
      align: 'right',
      render: (tokens: number | undefined, record: Route) => {
        if (record.route_type !== 'ai_model') return <Text type="secondary">-</Text>;
        return <Text type="secondary">{tokens?.toLocaleString() || 0}</Text>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_: any, record: Route) => (
        <Space size="small">
          <Tooltip title="Edit Route">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => console.log('Edit:', record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete Route">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="routes-container">
      {/* Page Header */}
      <div className="routes-header">
        <Title level={2}>API Routes</Title>
        <Text type="secondary">
          Manage and monitor your API gateway routes, AI models, and static content
        </Text>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Routes"
              value={stats.total}
              prefix={<ApiOutlined style={{ color: '#2563eb' }} />}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Routes"
              value={stats.active}
              prefix={<ThunderboltOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Requests (24h)"
              value={stats.totalRequests}
              prefix={<ThunderboltOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Avg Response Time"
              value={stats.avgResponseTime.toFixed(0)}
              suffix="ms"
              prefix={<ClockCircleOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="routes-filters-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Search routes or creator..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Type"
              value={filterType}
              onChange={setFilterType}
            >
              <Select.Option value="all">All Types</Select.Option>
              <Select.Option value="standard">Standard API</Select.Option>
              <Select.Option value="ai_model">AI Model</Select.Option>
              <Select.Option value="static">Static Content</Select.Option>
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
              <Select.Option value="Published">Published</Select.Option>
              <Select.Option value="Approved">Approved</Select.Option>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Draft">Draft</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchRoutes}>
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => console.log('Create new route')}
              >
                New Route
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Routes Table */}
      <Card className="routes-table-card">
        <Table
          columns={columns}
          dataSource={filteredRoutes}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} routes`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Routes;
