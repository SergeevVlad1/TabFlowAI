import React, { useState, useEffect } from "react";
import styles from "./TasksPage.module.scss";
import clsx from "clsx";
import { Play, Pause, Trash2, CheckCircle, Circle, Clock } from "lucide-react";
import { useTaskStore } from "../../features/tasks/store/taskStore";

export const TasksPage: React.FC = () => {
  const {
    tasks,
    loading,
    error,
    activeTaskId,
    addTask,
    toggleTask,
    deleteTask,
    startTask,
    pauseTask,
    tickTask,
    fetchTasks,
  } = useTaskStore();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    "medium",
  );
  const [estimatedTime, setEstimatedTime] = useState<string>("25");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    let interval: any;
    if (activeTaskId) {
      interval = setInterval(() => {
        tickTask(activeTaskId, 1000);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTaskId, tickTask]);

  const formatToHHMMSS = (minutesStr: string) => {
    const totalMinutes = parseInt(minutesStr) || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
  };

  const handleAdd = () => {
    if (!title.trim()) return;

    addTask({
      title: title,
      priority,
      time: formatToHHMMSS(estimatedTime),
    });

    setTitle("");
    setEstimatedTime("25");
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    console.log(error);
  }

  return (
    <div className={styles.taskList}>
      <div className={styles.inputCard}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <div className={styles.row}>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            style={{ flex: 1 }}
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <input
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="Min"
            style={{ width: "80px" }}
            min="1"
          />
          <button onClick={handleAdd}>Add</button>
        </div>
      </div>
      <div>
        {Array.isArray(tasks) &&
          tasks.map((task) => (
            <div
              key={task.id}
              className={clsx(
                styles.taskItem,
                styles[task.priority],
                {
                  [styles.completed]: task.completed,
                  [styles.running]: task.isRunning,
                },
              )}
            >
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.min(
                    (task.timeSpent /
                      (task.estimatedTime * 60 * 1000)) *
                    100,
                    100,
                  )}%`,
                }}
              />
              <div className={styles.header}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    cursor: "pointer",
                  }}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? (
                    <CheckCircle
                      size={18}
                      color="var(--success-color)"
                    />
                  ) : (
                    <Circle size={18} color="#ccc" />
                  )}
                  <span className={styles.title}>
                    {task.title}
                  </span>
                </div>

                <div className={styles.actions}>
                  {!task.completed &&
                    (task.isRunning ? (
                      <button
                        className={styles.pause}
                        onClick={() =>
                          pauseTask(task.id)
                        }
                        title="Pause Timer"
                      >
                        <Pause size={18} />
                      </button>
                    ) : (
                      <button
                        className={styles.play}
                        onClick={() =>
                          startTask(task.id)
                        }
                        title="Start Timer"
                      >
                        <Play size={18} />
                      </button>
                    ))}
                  <button
                    className={styles.delete}
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className={styles.meta}>
                <span
                  className={clsx(styles.timer, {
                    [styles.active]: task.isRunning,
                  })}
                >
                  <Clock size={12} />
                  {formatTime(task.timeSpent)} /{" "}
                  {task.estimatedTime}m
                </span>
                <span>{task.priority?.toUpperCase()}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
