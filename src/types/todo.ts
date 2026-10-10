export type Category = 'work' | 'home';

export type Timeframe = 'inbox' | 'today' | 'tomorrow';

export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  category: Category;
  status: TaskStatus;
  timeframe: Timeframe;
  createdAt: number;
  userId?: string;
  completedAt?: number;
}

export type CategoryFilter = 'all' | 'work' | 'home';

export type ConnectionStatus =
  | 'connecting'
  | 'not_configured'
  | 'error'
  | 'connected';
