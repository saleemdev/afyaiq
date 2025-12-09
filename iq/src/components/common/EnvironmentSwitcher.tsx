import { Segmented, Badge, Tooltip, Space } from 'antd';
import {
  ExperimentOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useInstanceStore } from '../../store/instanceStore';
import type { EnvironmentType } from '../../types/apisix';
import '../../styles/environment-switcher.css';

export const EnvironmentSwitcher: React.FC = () => {
  const currentEnvironment = useInstanceStore((state) => state.currentEnvironment);
  const switchEnvironment = useInstanceStore((state) => state.switchEnvironment);
  const instances = useInstanceStore((state) => state.instances);

  // Count instances per environment
  const envCounts = instances.reduce(
    (acc, inst) => {
      acc[inst.environment] = (acc[inst.environment] || 0) + 1;
      return acc;
    },
    {} as Record<EnvironmentType, number>
  );

  // Check if any instance has errors
  const hasErrors = (env: EnvironmentType) =>
    instances.some((inst) => inst.environment === env && inst.status === 'error');

  const environments = [
    {
      value: 'development',
      label: 'Development',
      icon: <CodeOutlined />,
      color: '#10b981',
      description: 'Local development environment',
    },
    {
      value: 'uat',
      label: 'UAT',
      icon: <ExperimentOutlined />,
      color: '#f59e0b',
      description: 'User Acceptance Testing',
    },
    {
      value: 'production',
      label: 'Production',
      icon: <ThunderboltOutlined />,
      color: '#ef4444',
      description: 'Live production environment',
    },
  ] as const;

  const options = environments.map((env) => ({
    value: env.value,
    label: (
      <Tooltip title={env.description} placement="bottom">
        <Space size="small" className="env-option">
          <span style={{ color: env.color }}>{env.icon}</span>
          <span className="env-label">{env.label}</span>
          {envCounts[env.value] > 0 && (
            <Badge
              count={envCounts[env.value]}
              style={{
                backgroundColor: env.color,
                fontSize: '11px',
                height: '18px',
                lineHeight: '18px',
                minWidth: '18px',
              }}
            />
          )}
          {hasErrors(env.value) && (
            <WarningOutlined style={{ color: '#ef4444', fontSize: '12px' }} />
          )}
        </Space>
      </Tooltip>
    ),
  }));

  return (
    <div className="environment-switcher">
      <Segmented
        value={currentEnvironment}
        onChange={(value) => switchEnvironment(value as EnvironmentType)}
        options={options}
        size="large"
        className="env-segmented"
      />
    </div>
  );
};
