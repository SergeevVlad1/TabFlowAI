import React, { useEffect } from 'react';
import styles from './Dashboard.module.scss';
import { useAiStore } from '../../features/ai/store/aiStore';
import { useTaskStore } from '../../features/tasks/store/taskStore';
import { useTrackingStore } from '../../features/tracking/store/trackingStore';
import { aiAgent } from '../../features/ai/services/AiAgent';
import { Sparkles, Play, Flame, CheckCircle2, Clock } from 'lucide-react';
import clsx from 'clsx';
import { Popup } from '../../features/tabs/popup/popup';

export const Dashboard: React.FC = () => {
  const { insights } = useAiStore();
  const { tasks } = useTaskStore();
  const { currentSession, getDailyDuration } = useTrackingStore();

  useEffect(() => {
    aiAgent.analyze();
  }, []);

  const pendingTasks = tasks.filter(t => !t.completed).length;
  const highPriTasks = tasks.filter(t => !t.completed && t.priority === 'high').length;

  const handleFocusNow = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      await chrome.tabs.query({});
    }
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Welcome back!</h1>
          <p>Ready to crush your goals today?</p>
        </div>
        <button className={styles.focusButton} onClick={handleFocusNow}>
          <Play size={20} fill="currentColor" />
          <span>Focus Now</span>
        </button>
      </header>

      <Popup />

      <div className={styles.grid}>
        <section className={styles.section}>
          <h2><Sparkles size={16} /> AI Insights</h2>
          <div className={styles.insightList}>
            {insights.length === 0 ? (
              <p className={styles.emptyText}>No new insights. You are doing great!</p>
            ) : (
              insights.slice(0, 3).map(insight => (
                <div key={insight.id} className={clsx(styles.insightCard, styles[insight.type])}>
                  <p>{insight.message}</p>
                  {insight.action && (
                    <button onClick={insight.action}>{insight.actionLabel || 'Apply'}</button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2><Flame size={16} /> Focus Mode</h2>
          {currentSession ? (
            <div className={styles.activeSession}>
              <div className={styles.timer}>
                {Math.floor((Date.now() - currentSession.startTime) / 60000)}m
              </div>
              <p>Current: {currentSession.type}</p>
            </div>
          ) : (
            <div className={styles.startSession}>
              <button className={styles.sessionToggle} onClick={() => useTrackingStore.getState().startSession('focus')}>
                Start Pomodoro
              </button>
            </div>
          )}
        </section>
      </div>

      <section className={styles.section}>
        <h2><CheckCircle2 size={16} /> Daily Overview</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.value}>{pendingTasks}</span>
            <span className={styles.label}>Pending</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.value} style={{ color: 'var(--danger-color)' }}>{highPriTasks}</span>
            <span className={styles.label}>Priority</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.value}>
              <Clock size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {Math.round(getDailyDuration('focus'))}m
            </span>
            <span className={styles.label}>Focused</span>
          </div>
        </div>
      </section>
    </div>
  );
};
