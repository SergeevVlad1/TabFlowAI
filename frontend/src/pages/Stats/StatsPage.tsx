import React from 'react';
import { useTrackingStore } from '../../features/tracking/store/trackingStore';
import { useTabStore } from '../../features/tabs/store/tabStore';
import styles from './StatsPage.module.scss';
import { Activity, ShieldCheck, Clock, Zap } from 'lucide-react';

export const StatsPage: React.FC = () => {
  const { sessions, getDailyDuration } = useTrackingStore();
  const { blockedDomains } = useTabStore();

  const focusTime = getDailyDuration('focus');
  const breakTime = getDailyDuration('break');

  return (
    <div className={styles.statsPage}>
      <div className={styles.card}>
        <h2><Activity size={20} style={{verticalAlign: 'text-bottom', marginRight: 8}} /> Statistics</h2>
        
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}><Clock size={14} /> Focus Time</span>
            <span className={styles.statValue}>{Math.round(focusTime)}m</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}><Zap size={14} /> Sessions</span>
            <span className={styles.statValue}>{sessions.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Break Time</span>
            <span className={styles.statValue}>{Math.round(breakTime)}m</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3><ShieldCheck size={18} style={{verticalAlign: 'text-bottom', marginRight: 8}} /> Productivity Rules</h3>
        <p className={styles.statLabel}>Blocked Domains ({blockedDomains.length})</p>
        <ul className={styles.list}>
          {blockedDomains.map(d => <li key={d}>{d}</li>)}
          {blockedDomains.length === 0 && <li style={{borderStyle: 'dashed', background: 'transparent'}}>No domains blocked yet</li>}
        </ul>
      </div>
    </div>
  );
};
