import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/Routes';
import LogsPage from './pages/Logs';
import InstancesPage from './pages/Instances';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import './styles/common.css';

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    // Apply theme to body for CSS variables
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 6,
        },
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="instances" element={<InstancesPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
