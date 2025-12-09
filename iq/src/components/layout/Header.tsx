import { Layout, Button, Avatar, Dropdown, Breadcrumb, Space } from 'antd';
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  PlusOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { ThemeToggle } from '../common/ThemeToggle';
import type { MenuProps } from 'antd';
const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: logout,
    },
  ];

  const breadcrumbItems = [
    {
      title: (
        <>
          <HomeOutlined />
          <span style={{ marginLeft: 4 }}>Dashboard</span>
        </>
      ),
    },
  ];

  return (
    <AntHeader className="app-header">
      {/* Left Section: Mobile Menu + Breadcrumbs */}
      <div className="header-left">

        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenuClick}
          className="mobile-menu-button"
        />

        {/* Breadcrumbs (hidden on mobile) */}
        <Breadcrumb
          items={breadcrumbItems}
          className="header-breadcrumb"
        />
      </div>

      {/* Right Section: Actions + User */}
      <div className="header-right">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Primary Action Button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="new-route-button"
        >
          <span className="button-text">New Route</span>
        </Button>

        {/* User Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="user-dropdown">
            <Avatar
              size="default"
              src={user?.avatar}
              icon={!user?.avatar && <UserOutlined />}
              style={{ backgroundColor: '#2563eb' }}
            />
            <div className="user-info">
              <Space size={4}>
                <span className="user-name">
                  {user?.name || 'Guest'}
                </span>
                {user?.is_verified_admin && <VerifiedBadge isVerified={true} size={14} />}
              </Space>
              <span className="user-role">
                {user?.role === 'admin' ? 'Admin' : 'Developer'}
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
