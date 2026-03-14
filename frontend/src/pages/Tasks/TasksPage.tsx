import React, { useState, useEffect, memo, useCallback } from "react";
import styles from "./TasksPage.module.scss";
import { Target, Play } from "lucide-react";
import { Tasks } from "../../features/tasks/tasks";
import { useTasksQuery, useCreateTaskMutation } from "../../features/tasks/tasks.hooks";
import { Popup } from "../../features/tabs/popup/popup";
import { type Task, useTaskStore } from "../../features/tasks/store/taskStore";

// Extracted Input Section to prevent Task List from re-rendering on every keystroke
const TaskInputSection = memo(({ onAdd }: { onAdd: (data: { title: string; priority: "high" | "medium" | "low"; estimatedTime: number }) => void }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [estimatedTime, setEstimatedTime] = useState<string>("25");

  const handleAddSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title,
      priority,
      estimatedTime: parseInt(estimatedTime) || 25,
    });
    setTitle("");
    setEstimatedTime("25");
  };

  return (
    <section className={styles.inputSection}>
      <div className={styles.inputGlass}>
        <div className={styles.mainInputRow}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            onKeyDown={(e) => e.key === "Enter" && handleAddSubmit()}
            className={styles.titleInput}
          />
          <button
            className={styles.addBtn}
            onClick={handleAddSubmit}
            disabled={!title.trim()}
          >
            <Play size={18} fill="currentColor" />
          </button>
        </div>

        <div className={styles.inputMetaRow}>
          <div className={styles.metaGroup}>
            <label>Priority</label>
            <select
              className={styles.select}
              value={priority}
              onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className={styles.metaGroup}>
            <label>Estimate (min)</label>
            <input
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              min="1"
              className={styles.timeInput}
            />
          </div>
        </div>
      </div>
    </section>
  );
});

TaskInputSection.displayName = "TaskInputSection";

const TasksSummary = memo(({ tasks }: { tasks: Task[] }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const activeTaskId = useTaskStore((state) => state.activeTaskId);

  // We need a local tick to force re-render for live time updates
  const [, _setTick] = useState(0);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTaskId) {
      interval = setInterval(() => {
        _setTick(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTaskId]);

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <span>Daily Progress</span>
          <span className={styles.percentage}>{completionPercentage}%</span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
});

TasksSummary.displayName = "TasksSummary";

export const TasksPage: React.FC = () => {
  const { data: tasks } = useTasksQuery();
  const { mutate: addTask } = useCreateTaskMutation();

  const handleAddTask = useCallback((data: { title: string; priority: "high" | "medium" | "low"; estimatedTime: number }) => {
    addTask(data);
  }, [addTask]);

  return (
    <div className={styles.tasksPage}>
      <TasksSummary tasks={tasks || []} />

      <header className={styles.header}>
        <h1>Tasks</h1>
        <p>Organize your day and stay focused</p>
      </header>

      <section className={styles.focusSection}>
        <div className={styles.focusCard}>
          <div className={styles.focusInfo}>
            <Target size={24} />
            <div>
              <h3>Ready to focus?</h3>
              <p>Organize tabs to block distractions</p>
            </div>
          </div>
          <div className={styles.focusAction}>
            <Popup />
          </div>
        </div>
      </section>

      <TaskInputSection onAdd={handleAddTask} />

      <div className={styles.listSection}>
        <Tasks tasks={tasks || []} />
      </div>
    </div>
  );
};
