import { useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  ApiOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useRouteStore } from '../store/routeStore';
import { useLogsStore } from '../store/logsStore';
import '../styles/dashboard.css';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const routes = useRouteStore((state) => state.routes);
  const fetchRoutes = useRouteStore((state) => state.fetchRoutes);
  const stats = useLogsStore((state) => state.stats);
  const fetchLogs = useLogsStore((state) => state.fetchLogs);

  useEffect(() => {
    fetchRoutes();
    fetchLogs();
  }, [fetchRoutes, fetchLogs]);

  // Calculate route type counts
  const routesByType = {
    total: routes.length,
    standard: routes.filter((r) => r.route_type === 'standard').length,
    ai_model: routes.filter((r) => r.route_type === 'ai_model').length,
    static: routes.filter((r) => r.route_type === 'static').length,
  };

  return (
    <div className="dashboard-container">
      {/* Page Title */}
      <Title level={2} className="dashboard-title">
        Dashboard
      </Title>

      {/* Stats Grid - Mobile First */}
      <Row gutter={[16, 16]}>
        {/* Total Routes */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Routes"
              value={routesByType.total}
              prefix={<ApiOutlined style={{ color: '#2563eb' }} />}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>

        {/* Total Requests (24h) */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Requests (24h)"
              value={stats.totalRequests}
              prefix={<ThunderboltOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>

        {/* Avg Response Time */}
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

        {/* AI Tokens Used */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="AI Tokens Used"
              value={stats.tokensUsed}
              prefix={<RobotOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Route Breakdown */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Routes by Type" className="stat-card routes-card">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="⚡ Standard"
                  value={routesByType.standard}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="🤖 AI Model"
                  value={routesByType.ai_model}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="📁 Static"
                  value={routesByType.static}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="System Health" className="stat-card health-card">
            <Statistic
              title="Error Rate"
              value={stats.errorRate}
              suffix="%"
              valueStyle={{
                color: stats.errorRate > 5 ? '#ef4444' : '#10b981',
                fontSize: 24,
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
