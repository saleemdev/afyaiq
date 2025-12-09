import { CheckCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: number;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  isVerified,
  size = 16
}) => {
  if (!isVerified) return null;

  return (
    <Tooltip title="Verified Admin">
      <CheckCircleFilled
        style={{
          color: '#2563eb',
          fontSize: size,
          marginLeft: 4
        }}
      />
    </Tooltip>
  );
};
