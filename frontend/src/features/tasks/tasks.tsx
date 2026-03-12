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

const TaskItem = memo(({
    task,
    onToggle,
    onDelete,
    onUpdate
}: {
    task: Task;
    onToggle: (id: string, completed: boolean) => void;
    onDelete: (id: string, isRunning: boolean) => void;
    onUpdate: (id: string, spentTime: number) => void;
}) => {
    const activeTaskId = useTaskStore((state) => state.activeTaskId);
    const startTime = useTaskStore((state) => state.startTime);
    const baseTime = useTaskStore((state) => state.baseTime);
    const startTask = useTaskStore((state) => state.startTask);
    const pauseTask = useTaskStore((state) => state.pauseTask);

    const isRunning = activeTaskId === task.id;
    const [, _setLocalTick] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isRunning) {
            interval = setInterval(() => {
                _setLocalTick((t) => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const spentSoFar = isRunning && startTime
        ? (baseTime || 0) + (Date.now() - startTime)
        : task.timeSpent;

    const limitMs = task.estimatedTime * 60 * 1000;
    const progress = Math.min((spentSoFar / limitMs) * 100 || 0, 100);

    const handlePause = () => {
        const exactSpent = task.timeSpent + (Date.now() - (startTime || 0));
        pauseTask();
        onUpdate(task.id, exactSpent);
    };

    const handleToggle = () => {
        onToggle(task.id, !task.completed);
        handlePause();
    }

    return (
        <div
            className={clsx(styles.taskItem, {
                [styles.completed]: task.completed,
                [styles.running]: isRunning,
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
                        {task.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                    </button>
                    <span className={styles.title}>{task.title}</span>
                </div>

                <div className={styles.actions}>
                    {!task.completed && (
                        <button
                            onClick={() =>
                                isRunning ? handlePause() : startTask(task.id, task.timeSpent)
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
                    <Timer
                        spentSoFar={spentSoFar}
                        estimatedTime={task.estimatedTime}
                    />
                </div>
                <div className={clsx(styles.priority, styles[task.priority])}>
                    {task.priority}
                </div>
            </div>
        </div>
    );
});

TaskItem.displayName = "TaskItem";

export const Tasks = memo(({ tasks }: { tasks: Task[] }) => {
    const { isLoading, error } = useTasksQuery();
    const { mutate: deleteTask } = useDeleteTaskMutation();
    const { mutate: toggleTask } = useToggleTaskMutation();
    const { mutate: updateTaskData } = useUpdateTaskMutation();

    const handleToggle = React.useCallback((id: string, completed: boolean) => {
        toggleTask({ id, completed });
    }, [toggleTask]);

    const handleDelete = React.useCallback((id: string) => {
        deleteTask(id);
    }, [deleteTask]);

    const handleUpdate = React.useCallback((id: string, timeSpent: number) => {
        updateTaskData({ id, taskData: { timeSpent } });
    }, [updateTaskData]);

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
