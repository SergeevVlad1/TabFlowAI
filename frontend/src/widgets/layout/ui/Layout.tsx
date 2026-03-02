import React, { useEffect } from 'react';
import styles from './Layout.module.scss';
import clsx from 'clsx';
import { useThemeStore } from '../../../features/theme/store/themeStore';
import { Moon, Sun, LayoutDashboard, CheckSquare, BarChart3, Settings, Sparkles } from 'lucide-react';
import { AiChat } from '../../ai-chat';
import { useNavigate } from 'react-router-dom';
import { PathEnum } from '../../../app/routers/routers.types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'tasks' | 'stats';
  onTabChange: (tab: 'dashboard' | 'tasks' | 'stats') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleChangeNavigate = (tab: 'dashboard' | 'tasks' | 'stats', path: PathEnum) => {
    navigate(path)
    onTabChange(tab)
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Sparkles size={20} className={styles.logoIcon} />
          </div>
          <span className={styles.brandName}>TabAi</span>
        </div>

        <nav className={styles.nav}>
          <button
            className={clsx(styles.navItem, { [styles.active]: activeTab === 'dashboard' })}
            onClick={() => handleChangeNavigate('dashboard', PathEnum.DASHBOARD)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button
            className={clsx(styles.navItem, { [styles.active]: activeTab === 'tasks' })}
            onClick={() => handleChangeNavigate('tasks', PathEnum.TASKS)}
          >
            <CheckSquare size={18} />
            <span>Tasks</span>
          </button>
          <button
            className={clsx(styles.navItem, { [styles.active]: activeTab === 'stats' })}
            onClick={() => handleChangeNavigate('stats', PathEnum.STATS)}
          >
            <BarChart3 size={18} />
            <span>Stats</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.iconButton} onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className={styles.iconButton}>
            <Settings size={18} />
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          <div className={styles.content}>
            {children}
          </div>
        </div>

        <div className={styles.chatSection}>
          <AiChat />
        </div>
      </main>
    </div>
  );
};
