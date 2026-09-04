
// Fix: Use named imports from date-fns for better compatibility across environments
// Fix: Use addDays with negative values as subDays might be missing in some environments
import { format, eachDayOfInterval, addDays } from 'date-fns';
import { Task, TaskActivity, Reward, ActivityStatus } from '../types';

export const getDateKey = (date: Date = new Date()) => format(date, 'yyyy-MM-dd');

export const parseTaskStartDate = (task: Task): Date => {
  if (task.startDate) {
    if (typeof task.startDate === 'string') {
      const s = (task.startDate as string).split('T')[0];
      const d = new Date(`${s}T00:00:00`);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(task.startDate);
    if (!isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
  if (task.createdAt) {
    const d = new Date(task.createdAt);
    if (!isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const isTaskScheduledOnDate = (task: Task, date: Date, activities: TaskActivity[] = []): boolean => {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const taskStart = parseTaskStartDate(task);

  const taskActivities = activities
    .filter(a => a.taskId === task.id)
    .sort((a, b) => b.completedAt - a.completedAt);

  // If check date is before task start date, check if an activity was completed on that date
  if (taskStart > checkDate) {
    const hasActivity = taskActivities.some(a => a.dateKey === getDateKey(checkDate));
    if (!hasActivity) return false;
  }

  if (task.frequency && task.frequency > 0) {
    // Find the most recent completion BEFORE 'date' to project the next scheduled day.
    const lastActivityBeforeDate = taskActivities.find(a => {
      const aDate = new Date(a.dateKey.includes('T') ? a.dateKey : `${a.dateKey}T00:00:00`);
      return aDate < checkDate;
    });
    const referenceDate = lastActivityBeforeDate 
      ? new Date(lastActivityBeforeDate.dateKey.includes('T') ? lastActivityBeforeDate.dateKey : `${lastActivityBeforeDate.dateKey}T00:00:00`)
      : taskStart;
    
    referenceDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((checkDate.getTime() - referenceDate.getTime()) / (1000 * 3600 * 24));
    
    return diffDays >= 0 && diffDays % task.frequency === 0;
  }
  const targetDays = (task.days && task.days.length > 0) ? task.days : [0, 1, 2, 3, 4, 5, 6];
  return Boolean(targetDays.includes(date.getDay()));
};

export const getPointsForType = (type: string) => {
  switch (type) {
    case 'REQUIRED': return 10;
    case 'OPTIONAL': return 5;
    case 'BONUS': return 15;
    default: return 0;
  }
};

export const calculateXP = (points: number) => {
  const level = Math.floor(points / 500) + 1;
  const xp = points % 500;
  return { level, xp, nextLevelXp: 500 };
};

export const getDayName = (dayIndex: number, language: 'EN' | 'NL' = 'EN') => {
  const days = {
    EN: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    NL: ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
  };
  return days[language][dayIndex];
};

// Fix: Manual implementation of startOfDay to resolve missing export error
const startOfDayManual = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getWeekDays = (baseDate: Date = new Date()) => {
  // Fix: Use startOfDayManual and addDays with negative value
  const start = startOfDayManual(addDays(baseDate, -(baseDate.getDay() === 0 ? 6 : baseDate.getDay() - 1))); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return eachDayOfInterval({ start, end });
};

/**
 * Calculates the total potential XP generated in a single week across all active tasks.
 */
export const calculateWeeklyTasksXp = (tasks: Task[]): number => {
  const activeTasks = tasks.filter(t => !t.archived);
  return activeTasks.reduce((sum, task) => {
    let timesPerWeek = 7;
    if (task.frequency && task.frequency > 0) {
      timesPerWeek = 7 / task.frequency;
    } else if (task.days && task.days.length > 0) {
      timesPerWeek = task.days.length;
    }
    const points = task.points || getPointsForType(task.type);
    return sum + Math.round(timesPerWeek * points);
  }, 0);
};

export interface RewardProgressInfo {
  weeklyXp: number;
  durationWeeks: number;
  targetXp: number;
  currentXp: number;
  remainingXp: number;
  progress: number;
  isReady: boolean;
  startDateKey: string;
}

/**
 * Calculates XP earned from completed activities on or after a given start date.
 * If startDateMillis is 0 or null, counts all completed activities.
 */
export const calculateEarnedXpSince = (
  startDateMillis: number | null | undefined,
  tasks: Task[] = [],
  activities: TaskActivity[] = [],
  fallbackTotalPoints: number = 0
): number => {
  const completedActivities = activities.filter(
    a => !a.status || a.status === ActivityStatus.COMPLETED
  );

  if (!startDateMillis || startDateMillis <= 0) {
    if (completedActivities.length > 0) {
      return completedActivities.reduce((sum, a) => {
        const task = tasks.find(t => t.id === a.taskId);
        return sum + (task?.points || 10);
      }, 0);
    }
    return fallbackTotalPoints;
  }

  const startDayKey = getDateKey(new Date(startDateMillis));
  const earned = completedActivities
    .filter(a => a.dateKey >= startDayKey)
    .reduce((sum, a) => {
      const task = tasks.find(t => t.id === a.taskId);
      return sum + (task?.points || 10);
    }, 0);

  return earned;
};

/**
 * Calculates current progress towards a 13-week XP reward goal.
 */
export const calculateRewardProgress = (
  reward: Reward,
  tasks: Task[] = [],
  activities: TaskActivity[] = [],
  totalPoints: number = 0
): RewardProgressInfo => {
  const weeklyXp = reward.weeklyXp || calculateWeeklyTasksXp(tasks);
  const durationWeeks = reward.durationWeeks || 13;
  // If targetXp is set, use it; otherwise calculate weeklyXp * durationWeeks (minimum 100)
  const targetXp = reward.targetXp && reward.targetXp > 0
    ? reward.targetXp
    : Math.max(100, Math.round((weeklyXp > 0 ? weeklyXp : 100) * durationWeeks));

  const startDateKey = reward.startDate ? getDateKey(new Date(reward.startDate)) : '';
  const currentXp = calculateEarnedXpSince(reward.startDate, tasks, activities, totalPoints);

  const progress = targetXp > 0 ? Math.min(100, Math.round((currentXp / targetXp) * 100)) : 0;
  const remainingXp = Math.max(0, targetXp - currentXp);
  const isReady = currentXp >= targetXp;

  return {
    weeklyXp,
    durationWeeks,
    targetXp,
    currentXp,
    remainingXp,
    progress,
    isReady,
    startDateKey
  };
};
