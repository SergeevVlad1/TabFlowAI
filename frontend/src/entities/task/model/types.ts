export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: number; // timestamp
  completed: boolean;
  createdAt: number;
  estimatedTime: number; // in minutes
  timeSpent: number; // in milliseconds
  isRunning: boolean;
}
