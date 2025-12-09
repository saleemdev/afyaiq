import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/layout.css';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  return (
    <Layout className="main-layout">
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileDrawerVisible={mobileDrawerVisible}
        setMobileDrawerVisible={setMobileDrawerVisible}
      />
      <Layout
        className={`main-layout-content ${collapsed ? 'collapsed' : 'expanded'}`}
      >
        <Header
          collapsed={collapsed}
          onMenuClick={() => setMobileDrawerVisible(true)}
        />
        <Content className="main-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
