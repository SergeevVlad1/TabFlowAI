import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist } from 'zustand/middleware';
import { Task } from './types';

interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'timeSpent' | 'isRunning'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  startTask: (id: string) => void;
  pauseTask: (id: string) => void;
  tickTask: (id: string, ms: number) => void;
  getTasksByPriority: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: uuidv4(),
              createdAt: Date.now(),
              completed: false,
              timeSpent: 0,
              isRunning: false,
            },
          ],
        })),
      toggleTask: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          const newCompleted = !task?.completed;
          const isNowActive = state.activeTaskId === id;
          
          return {
            activeTaskId: (isNowActive && newCompleted) ? null : state.activeTaskId,
            tasks: state.tasks.map((t) =>
              t.id === id 
                ? { 
                    ...t, 
                    completed: newCompleted,
                    isRunning: newCompleted ? false : t.isRunning
                  } 
                : t
            ),
          };
        }),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      startTask: (id) =>
        set((state) => ({
          activeTaskId: id,
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, isRunning: true } : { ...t, isRunning: false }
          ),
        })),
      pauseTask: (id) =>
        set((state) => ({
          activeTaskId: null,
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, isRunning: false } : t
          ),
        })),
      tickTask: (id, ms) =>
        set((state) => {
          const tasks = state.tasks.map((t) => {
            if (t.id === id) {
              const newTimeSpent = t.timeSpent + ms;
              const limitMs = t.estimatedTime * 60 * 1000;
              if (newTimeSpent >= limitMs) {
                return { ...t, timeSpent: limitMs, isRunning: false };
              }
              return { ...t, timeSpent: newTimeSpent };
            }
            return t;
          });
          const updatedTask = tasks.find(t => t.id === id);
          const activeTaskId = (updatedTask && !updatedTask.isRunning) ? null : state.activeTaskId;
          return { tasks, activeTaskId };
        }),
      getTasksByPriority: () => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return [...get().tasks].sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
      },
    }),
    {
      name: 'task-storage',
    }
  )
);
