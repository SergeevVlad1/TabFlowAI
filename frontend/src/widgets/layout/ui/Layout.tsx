import React, { useEffect } from 'react';
import styles from './Layout.module.scss';
import clsx from 'clsx';
import { useThemeStore } from '../../../features/theme/store/themeStore';
import { Moon, Sun, LayoutDashboard, CheckSquare, BarChart3, Settings } from 'lucide-react';
import { AiChat } from '../../ai-chat';
import { useNavigate } from 'react-router-dom';
import { PathEnum } from '../../../app/routers/routers.types';
import { Logo } from '../../../shared/ui/Logo/Logo';

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
      <header className={styles.header}>
        <div className={styles.topRow}>
          <div className={styles.brand}>
            <Logo size={32} />
            <span className={styles.brandName}>TabFlow</span>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.iconButton} onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className={styles.iconButton} title="Settings">
              <Settings size={18} />
            </button>
          </div>
        </div>

        <nav className={styles.nav}>
          <button
            className={clsx(styles.navItem, { [styles.active]: activeTab === 'dashboard' })}
            onClick={() => handleChangeNavigate('dashboard', PathEnum.DASHBOARD)}
          >
            <LayoutDashboard size={21} />
            {/* <span>Dash</span> */}
          </button>
          <button
            className={clsx(styles.navItem, { [styles.active]: activeTab === 'tasks' })}
            onClick={() => handleChangeNavigate('tasks', PathEnum.TASKS)}
          >
            <CheckSquare size={21} />
            {/* <span>Tasks</span> */}
          </button>
          <button
            className={clsx(styles.navItem, { [styles.active]: activeTab === 'stats' })}
            onClick={() => handleChangeNavigate('stats', PathEnum.STATS)}
          >
            <BarChart3 size={21} />
            {/* <span>Stats</span> */}
          </button>
        </nav>
      </header>

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
