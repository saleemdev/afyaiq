import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Badge,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Alert,
  Statistic,
  Table,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useInstanceStore } from '../store/instanceStore';
import { EnvironmentSwitcher } from '../components/common/EnvironmentSwitcher';
import type { APISIXInstance, EnvironmentType } from '../types/apisix';
import '../styles/instances.css';

const { Title, Text, Paragraph } = Typography;

const Instances: React.FC = () => {
  const instances = useInstanceStore((state) => state.instances);
  const selectedInstance = useInstanceStore((state) => state.selectedInstance);
  const currentEnvironment = useInstanceStore((state) => state.currentEnvironment);
  const loading = useInstanceStore((state) => state.loading);
  const error = useInstanceStore((state) => state.error);
  const fetchInstances = useInstanceStore((state) => state.fetchInstances);
  const createInstance = useInstanceStore((state) => state.createInstance);
  const updateInstance = useInstanceStore((state) => state.updateInstance);
  const deleteInstance = useInstanceStore((state) => state.deleteInstance);
  const selectInstance = useInstanceStore((state) => state.selectInstance);
  const checkInstanceHealth = useInstanceStore((state) => state.checkInstanceHealth);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingInstance, setEditingInstance] = useState<APISIXInstance | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  // Filter instances by current environment
  const filteredInstances = instances.filter(
    (inst) => inst.environment === currentEnvironment
  );

  // Calculate stats for current environment
  const stats = {
    total: filteredInstances.length,
    active: filteredInstances.filter((i) => i.status === 'active').length,
    inactive: filteredInstances.filter((i) => i.status === 'inactive').length,
    error: filteredInstances.filter((i) => i.status === 'error').length,
    totalRoutes: filteredInstances.reduce(
      (sum, i) => sum + (i.health_status?.routes_count || 0),
      0
    ),
    avgResponseTime:
      filteredInstances.reduce(
        (sum, i) => sum + (i.health_status?.response_time || 0),
        0
      ) / (filteredInstances.length || 1),
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { status: any; text: string; icon: any }> = {
      active: {
        status: 'success',
        text: 'Active',
        icon: <CheckCircleOutlined />,
      },
      inactive: {
        status: 'default',
        text: 'Inactive',
        icon: <CloseCircleOutlined />,
      },
      error: {
        status: 'error',
        text: 'Error',
        icon: <WarningOutlined />,
      },
    };
    const cfg = config[status] || config.inactive;
    return (
      <Badge
        status={cfg.status}
        text={
          <Space size="small">
            {cfg.icon}
            {cfg.text}
          </Space>
        }
      />
    );
  };

  const getEnvironmentTag = (env: EnvironmentType) => {
    const colors: Record<EnvironmentType, string> = {
      development: 'green',
      uat: 'orange',
      production: 'red',
    };
    const labels: Record<EnvironmentType, string> = {
      development: 'Dev',
      uat: 'UAT',
      production: 'Prod',
    };
    return (
      <Badge
        color={colors[env]}
        text={labels[env]}
        style={{ fontWeight: 500 }}
      />
    );
  };

  const handleCreate = () => {
    setEditingInstance(null);
    form.resetFields();
    form.setFieldsValue({ environment: currentEnvironment });
    setModalVisible(true);
  };

  const handleEdit = (instance: APISIXInstance) => {
    setEditingInstance(instance);
    form.setFieldsValue(instance);
    setModalVisible(true);
  };

  const handleDelete = async (instance: APISIXInstance) => {
    Modal.confirm({
      title: 'Delete APISIX Instance',
      content: (
        <div>
          <Paragraph>
            Are you sure you want to delete <strong>{instance.name}</strong>?
          </Paragraph>
          <Alert
            message="Warning"
            description="This action cannot be undone. All routes and configurations on this instance will be lost."
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
          />
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        await deleteInstance(instance.id);
        message.success('Instance deleted successfully');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingInstance) {
        await updateInstance(editingInstance.id, values);
        message.success('Instance updated successfully');
      } else {
        await createInstance(values);
        message.success('Instance created successfully');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error('Failed to save instance');
    }
  };

  const handleHealthCheck = async (instance: APISIXInstance) => {
    message.loading({ content: `Checking health of ${instance.name}...`, key: 'health' });
    await checkInstanceHealth(instance.id);
    message.success({ content: 'Health check completed', key: 'health' });
  };

  const columns: ColumnsType<APISIXInstance> = [
    {
      title: 'Instance Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
      render: (name: string, record: APISIXInstance) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ fontSize: '14px' }}>
            {name}
          </Text>
          {getEnvironmentTag(record.environment)}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Gateway URL',
      dataIndex: 'gateway_url',
      key: 'gateway_url',
      width: 250,
      ellipsis: true,
      render: (url: string) => (
        <Tooltip title={url}>
          <Text code copyable>
            {url}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Routes',
      dataIndex: ['health_status', 'routes_count'],
      key: 'routes',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <Text strong style={{ color: '#2563eb' }}>
          {count || 0}
        </Text>
      ),
    },
    {
      title: 'Plugins',
      dataIndex: ['health_status', 'plugins_count'],
      key: 'plugins',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <Text strong style={{ color: '#8b5cf6' }}>
          {count || 0}
        </Text>
      ),
    },
    {
      title: 'Response Time',
      dataIndex: ['health_status', 'response_time'],
      key: 'response_time',
      width: 130,
      align: 'right',
      render: (time: number) => {
        if (!time) return <Text type="secondary">-</Text>;
        const color = time > 100 ? '#ef4444' : time > 50 ? '#f59e0b' : '#10b981';
        return <Text style={{ color }}>{time}ms</Text>;
      },
    },
    {
      title: 'Last Health Check',
      dataIndex: ['health_status', 'last_check'],
      key: 'last_check',
      width: 150,
      render: (time: string) => {
        if (!time) return <Text type="secondary">Never</Text>;
        const date = new Date(time);
        return (
          <Tooltip title={date.toLocaleString()}>
            <Text type="secondary">{date.toLocaleTimeString()}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_: any, record: APISIXInstance) => (
        <Space size="small">
          <Tooltip title="Health Check">
            <Button
              type="text"
              icon={<SyncOutlined />}
              size="small"
              onClick={() => handleHealthCheck(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="instances-container">
      {/* Page Header */}
      <div className="instances-header">
        <div className="header-content">
          <div>
            <Title level={2}>APISIX Instances</Title>
            <Text type="secondary">
              Manage your APISIX gateway instances across environments
            </Text>
          </div>
          <Space size="middle">
            <EnvironmentSwitcher />
            <Button icon={<ReloadOutlined />} onClick={fetchInstances} loading={loading}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              New Instance
            </Button>
          </Space>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          closable
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Instances"
              value={stats.total}
              prefix={<ApiOutlined style={{ color: '#2563eb' }} />}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Instances"
              value={stats.active}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Routes"
              value={stats.totalRoutes}
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

      {/* Instances Table */}
      <Card className="instances-table-card">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredInstances}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} instances`,
            }}
            scroll={{ x: 1200 }}
            size="middle"
            onRow={(record) => ({
              onClick: () => selectInstance(record.id),
              className: selectedInstance?.id === record.id ? 'row-selected' : '',
            })}
          />
        </Spin>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingInstance ? 'Edit APISIX Instance' : 'Create APISIX Instance'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={700}
        okText={editingInstance ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Instance Name"
                rules={[{ required: true, message: 'Please enter instance name' }]}
              >
                <Input placeholder="e.g., Production API Gateway" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="environment"
                label="Environment"
                rules={[{ required: true, message: 'Please select environment' }]}
              >
                <Select>
                  <Select.Option value="development">Development</Select.Option>
                  <Select.Option value="uat">UAT</Select.Option>
                  <Select.Option value="production">Production</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="admin_api_url"
            label="Admin API URL"
            rules={[
              { required: true, message: 'Please enter Admin API URL' },
              { type: 'url', message: 'Please enter a valid URL' },
            ]}
            extra="APISIX Admin API endpoint (e.g., https://gateway.example.com:9180/apisix/admin)"
          >
            <Input placeholder="https://gateway.example.com:9180/apisix/admin" />
          </Form.Item>

          <Form.Item
            name="admin_api_key"
            label="Admin API Key"
            rules={[{ required: true, message: 'Please enter Admin API Key' }]}
            extra="X-API-KEY header value for authentication"
          >
            <Input.Password placeholder="Enter Admin API Key" />
          </Form.Item>

          <Form.Item
            name="gateway_url"
            label="Gateway URL"
            rules={[
              { required: true, message: 'Please enter Gateway URL' },
              { type: 'url', message: 'Please enter a valid URL' },
            ]}
            extra="Public-facing gateway endpoint (e.g., https://api.example.com)"
          >
            <Input placeholder="https://api.example.com" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Instances;
