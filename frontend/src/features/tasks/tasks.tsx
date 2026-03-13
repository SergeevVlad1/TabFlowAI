import React, { useState, useEffect, memo } from "react";
import { type Task, useTaskStore } from "./store/taskStore";
import styles from "../../pages/Tasks/TasksPage.module.scss";
import clsx from "clsx";
import { Play, Pause, Trash2, CheckCircle, Circle, Clock } from "lucide-react";
import {
    useTasksQuery,
    useDeleteTaskMutation,
    useToggleTaskMutation,
    useUpdateTaskMutation,
} from "./tasks.hooks";
import { Timer } from "../timer/timer";

// ─── TaskItem ─────────────────────────────────────────────────────────────────

const TaskItem = memo(({
    task,
    onToggle,
    onDelete,
    onUpdate,
}: {
    task: Task;
    onToggle: (id: string, completed: boolean) => void;
    onDelete: (id: string, isRunning: boolean) => void;
    onUpdate: (id: string, spentTime: number) => void;
}) => {
    const activeTaskId = useTaskStore((s) => s.activeTaskId);
    const startTime    = useTaskStore((s) => s.startTime);
    const baseTime     = useTaskStore((s) => s.baseTime);
    const startTask    = useTaskStore((s) => s.startTask);
    const pauseTask    = useTaskStore((s) => s.pauseTask);

    const isRunning = activeTaskId === task.id;

    // UI-tick: re-renders every second so the displayed time stays live.
    // Actual elapsed time is always Date.now()-startTime (no drift).
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!isRunning) return;
        const id = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, [isRunning]);

    // Compute elapsed ms:
    //  • Running  → live calculation from stored startTime (works after reopen)
    //  • Paused   → use the value that was last synced to the DB
    const spentSoFar: number =
        isRunning && startTime != null
            ? (baseTime ?? 0) + (Date.now() - startTime)
            : task.timeSpent;

    const limitMs  = task.estimatedTime * 60 * 1000;
    const progress = Math.min((spentSoFar / limitMs) * 100 || 0, 100);

    // Capture startTime in a local variable BEFORE calling pauseTask()
    // so we don't lose it when the store resets.
    const handlePause = () => {
        const capturedStart = startTime;
        const exactSpent =
            capturedStart != null
                ? (baseTime ?? 0) + (Date.now() - capturedStart)
                : task.timeSpent;

        pauseTask();
        // Only one server request — on pause, not every tick
        onUpdate(task.id, exactSpent);
    };

    const handleToggle = () => {
        if (isRunning) handlePause();
        onToggle(task.id, !task.completed);
    };

    return (
        <div
            className={clsx(styles.taskItem, {
                [styles.completed]: task.completed,
                [styles.running]:   isRunning,
            })}
        >
            <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
            />

            <div className={styles.taskHeader}>
                <div className={styles.taskTitleWrap}>
                    <button
                        className={clsx(styles.checkBtn, {
                            [styles.completedIcon]: task.completed,
                        })}
                        onClick={handleToggle}
                    >
                        {task.completed
                            ? <CheckCircle size={18} />
                            : <Circle size={18} />}
                    </button>
                    <span className={styles.title}>{task.title}</span>
                </div>

                <div className={styles.actions}>
                    {!task.completed && (
                        <button
                            onClick={() =>
                                isRunning
                                    ? handlePause()
                                    : startTask(task.id, task.timeSpent)
                            }
                        >
                            {isRunning ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                    )}
                    <button
                        className={styles.delete}
                        onClick={() => onDelete(task.id, isRunning)}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className={styles.meta}>
                <div className={clsx(styles.timer, { [styles.active]: isRunning })}>
                    <Clock size={12} />
                    <Timer spentSoFar={spentSoFar} estimatedTime={task.estimatedTime} />
                </div>
                <div className={clsx(styles.priority, styles[task.priority])}>
                    {task.priority}
                </div>
            </div>
        </div>
    );
});

TaskItem.displayName = "TaskItem";

// ─── Tasks list ───────────────────────────────────────────────────────────────

export const Tasks = memo(({ tasks }: { tasks: Task[] }) => {
    const { isLoading, error } = useTasksQuery();
    const { mutate: deleteTask }     = useDeleteTaskMutation();
    const { mutate: toggleTask }     = useToggleTaskMutation();
    const { mutate: updateTaskData } = useUpdateTaskMutation();

    // No hydrateTimer here — it is done in main.tsx before the first render.

    const handleToggle = React.useCallback(
        (id: string, completed: boolean) => toggleTask({ id, completed }),
        [toggleTask],
    );

    const handleDelete = React.useCallback(
        (id: string) => deleteTask(id),
        [deleteTask],
    );

    const handleUpdate = React.useCallback(
        (id: string, timeSpent: number) =>
            updateTaskData({ id, taskData: { timeSpent } }),
        [updateTaskData],
    );

    if (isLoading) return <div className={styles.loading}>Loading tasks...</div>;
    if (error) return null;

    return (
        <div className={styles.tasksContainer}>
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                />
            ))}
        </div>
    );
});

Tasks.displayName = "Tasks";
