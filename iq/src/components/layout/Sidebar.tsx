import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Drawer, Button } from 'antd';
import {
  DashboardOutlined,
  ApiOutlined,
  FileTextOutlined,
  SafetyOutlined,
  BookOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mobileDrawerVisible: boolean;
  setMobileDrawerVisible: (visible: boolean) => void;
}

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'instances',
    icon: <CloudServerOutlined />,
    label: 'Instances',
  },
  {
    key: 'routes',
    icon: <ApiOutlined />,
    label: 'Routes',
  },
  {
    key: 'logs',
    icon: <FileTextOutlined />,
    label: 'Logs',
  },
  {
    key: 'security',
    icon: <SafetyOutlined />,
    label: 'Security',
  },
  {
    key: 'documentation',
    icon: <BookOutlined />,
    label: 'Documentation',
  },
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: 'Profile',
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onCollapse,
  mobileDrawerVisible,
  setMobileDrawerVisible,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract current key from pathname (remove leading slash)
  const currentKey = location.pathname.slice(1) || 'dashboard';
  const [selectedKey, setSelectedKey] = useState(currentKey);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSelectedKey(e.key);
    navigate(`/${e.key}`);
    // Close mobile drawer on menu item click
    setMobileDrawerVisible(false);
  };

  // Desktop Sidebar (hidden on mobile)
  const desktopSidebar = (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={80}
      width={240}
      trigger={null}
      className="desktop-sidebar"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <h2>{collapsed ? 'AQ' : 'AfyaIQ'}</h2>
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu"
      />

      {/* Collapse Toggle (Desktop) */}
      <div className="sidebar-toggle">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{ color: '#fff' }}
        />
      </div>
    </Sider>
  );

  // Mobile Drawer
  const mobileDrawer = (
    <Drawer
      placement="left"
      onClose={() => setMobileDrawerVisible(false)}
      open={mobileDrawerVisible}
      width={240}
      className="mobile-drawer"
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <h2>AfyaIQ</h2>
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu"
      />
    </Drawer>
  );

  return (
    <>
      {desktopSidebar}
      {mobileDrawer}
    </>
  );
};

export default Sidebar;
