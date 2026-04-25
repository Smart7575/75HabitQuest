
// Fix: Use named imports from date-fns for better compatibility across environments
// Fix: Use addDays with negative values as subDays might be missing in some environments
import { format, eachDayOfInterval, addDays } from 'date-fns';

export const getDateKey = (date: Date = new Date()) => format(date, 'yyyy-MM-dd');

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
