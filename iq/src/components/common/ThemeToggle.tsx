import { Button } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useThemeStore } from '../../store/themeStore';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <Button
            type="text"
            icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
            onClick={toggleTheme}
            style={{ fontSize: '18px', width: 40, height: 40 }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        />
    );
};
