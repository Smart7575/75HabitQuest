
export enum TaskType {
  REQUIRED = 'REQUIRED',
  OPTIONAL = 'OPTIONAL',
  BONUS = 'BONUS'
}

export enum TaskCategory {
  WORK = 'Work',
  HEALTH = 'Health',
  PERSONAL = 'Personal',
  HOUSEHOLD = 'Household',
  OTHER = 'Other'
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  type: TaskType;
  categoryId: string; // References dynamic Category id
  categoryName?: string; // Cache for display
  days: number[]; // 0 = Sun, 1 = Mon ...
  frequency?: number; // Interval in days (e.g. 2 for every other day)
  startDate?: number; // Starting point for frequency sequence
  points: number;
  createdAt: number;
  archived: boolean;
}

export type Language = 'EN' | 'NL';

export enum ActivityStatus {
  COMPLETED = 'COMPLETED',
  COMPLETED_BY_OTHER = 'COMPLETED_BY_OTHER'
}

export interface TaskActivity {
  id: string;
  taskId: string;
  completedAt: number; // timestamp
  dateKey: string; // YYYY-MM-DD
  status?: ActivityStatus;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  durationDays: number;
  startDate: number;
  active: boolean;
  imageUrl?: string;
  achievedAt?: number;
}

export interface UserStats {
  streak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  xp: number;
  nextLevelXp: number;
}
