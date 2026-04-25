import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, TaskActivity, Reward, TaskType, UserStats, Category, ActivityStatus, Language } from '../types';
import { getDateKey, getPointsForType, calculateXP } from '../utils/helpers';
import { addDays, startOfDay, isSameDay } from 'date-fns';
import { db } from '../utils/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from '../components/AuthProvider';

export const useStore = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    longestStreak: 0,
    totalPoints: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 500
  });

  const [language, setLanguage] = useState<Language>('NL');
  const [isLoaded, setIsLoaded] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!user) {
      setIsLoaded(false);
      return;
    }
    const userId = user.uid;

    const unsubStats = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        setStats(prev => ({ ...prev, ...docSnap.data() }));
      }
    });

    const unsubTasks = onSnapshot(collection(db, 'users', userId, 'tasks'), (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
    });

    const unsubActivities = onSnapshot(collection(db, 'users', userId, 'taskactivities'), (snapshot) => {
      setActivities(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskActivity)));
      setIsLoaded(true);
    });

    const unsubCategories = onSnapshot(collection(db, 'users', userId, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    });

    const unsubRewards = onSnapshot(collection(db, 'users', userId, 'rewards'), (snapshot) => {
      setRewards(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reward)));
    });

    return () => {
      unsubStats(); unsubTasks(); unsubActivities(); unsubCategories(); unsubRewards();
    };
  }, [user]);

  const calculateStreak = useCallback(() => {
    const requiredTasks = tasks.filter(t => t.type === TaskType.REQUIRED && !t.archived);
    if (requiredTasks.length === 0) return 0;

    // Helper to check if a task is scheduled on a specific date
    const checkIsTaskScheduled = (t: Task, date: Date) => {
      const taskStart = new Date(t.startDate || t.createdAt);
      taskStart.setHours(0, 0, 0, 0);
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      
      if (taskStart > d) return false;

      if (t.frequency && t.frequency > 0) {
        const dateKey = getDateKey(d);
        const taskActivities = activities
          .filter(a => a.taskId === t.id)
          .sort((a, b) => b.completedAt - a.completedAt);
        
        const lastActivityBefore = taskActivities.find(a => a.dateKey < dateKey);
        const ref = lastActivityBefore ? new Date(lastActivityBefore.dateKey) : taskStart;
        ref.setHours(0, 0, 0, 0);
        const diff = Math.round((d.getTime() - ref.getTime()) / (1000 * 3600 * 24));
        return diff >= 0 && diff % t.frequency === 0;
      }
      return t.days?.includes(d.getDay());
    };

    // Helper to get week range (Mon-Sun)
    const getWeekRange = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const diff = d.getDate() - (day === 0 ? 6 : day - 1); // Monday
      const monday = new Date(d.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return { monday, sunday };
    };

    // Find the earliest start date to avoid looking back forever
    const earliestTaskStart = requiredTasks.reduce((min, t) => {
      const start = t.startDate || t.createdAt;
      return start < min ? start : min;
    }, Date.now());

    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    const todayKey = getDateKey(new Date());
    
    // Safety: Max lookback 365 days or until earliest task
    const maxLookback = addDays(new Date(), -365);
    maxLookback.setHours(0, 0, 0, 0);

    while (checkDate >= maxLookback && checkDate.getTime() >= (earliestTaskStart - 86400000)) {
      const dateKey = getDateKey(checkDate);
      
      const tasksDueOnDay = requiredTasks.filter(t => checkIsTaskScheduled(t, checkDate));
      
      if (tasksDueOnDay.length === 0) { 
        checkDate = addDays(checkDate, -1); 
        continue; 
      }
      
      const { monday, sunday } = getWeekRange(checkDate);
      
      const allSatisfied = tasksDueOnDay.every(t => {
        // Weekly Quota check: How many times was it scheduled in this week UP TO checkDate?
        let scheduledCount = 0;
        let d = new Date(monday);
        while (d <= checkDate) {
          if (checkIsTaskScheduled(t, d)) scheduledCount++;
          d = addDays(d, 1);
        }
        
        // Count how many times it was completed in the whole week (Mon-Sun)
        const completedCount = activities.filter(a => {
          const aDate = new Date(a.dateKey);
          return a.taskId === t.id && aDate >= monday && aDate <= sunday;
        }).length;
        
        return completedCount >= scheduledCount;
      });
      
      if (allSatisfied) { 
        currentStreak++; 
        checkDate = addDays(checkDate, -1); 
      } 
      else { 
        // If it's today and not satisfied yet, don't break the streak, just skip to yesterday
        if (dateKey === todayKey) { 
          checkDate = addDays(checkDate, -1); 
          continue; 
        } 
        break; 
      }
    }
    return currentStreak;
  }, [activities, tasks]);

  useEffect(() => {
    if (!user || !isLoaded) return;
    
    const s = calculateStreak();
    const now = Date.now();
    
    // Throttle updates to prevent Firestore write spam
    if (s !== stats.streak && (now - lastUpdateRef.current > 5000)) {
      lastUpdateRef.current = now;
      updateDoc(doc(db, 'users', user.uid), { 
        streak: s, 
        longestStreak: Math.max(stats.longestStreak || 0, s) 
      }).catch(console.error);
    }
  }, [isLoaded, calculateStreak, user, stats.streak, stats.longestStreak]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'archived' | 'points'>) => {
    if (!user) return;
    const points = getPointsForType(task.type);
    await addDoc(collection(db, 'users', user.uid, 'tasks'), { ...task, createdAt: Date.now(), archived: false, points });
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    if (updates.type) updates.points = getPointsForType(updates.type);
    await updateDoc(taskRef, updates);
  };

  const deleteTask = async (taskId: string) => {
    if (!user || !taskId) return;
    
    try {
      const batch = writeBatch(db);
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      batch.delete(taskRef);
      
      const activitiesQuery = query(
        collection(db, 'users', user.uid, 'taskactivities'),
        where('taskId', '==', taskId)
      );
      // Fix: Use correctly named 'activitiesQuery' instead of 'activityQuery'
      const activitySnaps = await getDocs(activitiesQuery);
      activitySnaps.forEach((d) => {
        batch.delete(doc(db, 'users', user.uid, 'taskactivities', d.id));
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  const addCategory = async (name: string) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'categories'), { name, createdAt: Date.now() });
  };

  const updateCategory = async (catId: string, name: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'categories', catId), { name });
  };

  const deleteCategory = async (catId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'categories', catId));
  };

  const toggleTask = async (taskId: string, date: Date = new Date()) => {
    if (!user) return;
    const dateKey = getDateKey(date);
    const existing = activities.find(c => c.taskId === taskId && c.dateKey === dateKey);
    const userRef = doc(db, 'users', user.uid);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (existing) {
      if (!existing.status || existing.status === ActivityStatus.COMPLETED) {
        // Switch from COMPLETED to COMPLETED_BY_OTHER
        await updateDoc(doc(db, 'users', user.uid, 'taskactivities', existing.id), { 
          status: ActivityStatus.COMPLETED_BY_OTHER 
        });
        // Subtract points because it's now completed by another
        const newTotal = Math.max(0, stats.totalPoints - task.points);
        const { level, xp } = calculateXP(newTotal);
        await updateDoc(userRef, { totalPoints: newTotal, level, xp });
      } else {
        // Switch from COMPLETED_BY_OTHER to NONE
        await deleteDoc(doc(db, 'users', user.uid, 'taskactivities', existing.id));
        // No points to subtract here because we already subtracted them when moving to COMPLETED_BY_OTHER
      }
    } else {
      // Switch from NONE to COMPLETED
      await addDoc(collection(db, 'users', user.uid, 'taskactivities'), { 
        taskId, 
        completedAt: Date.now(), 
        dateKey,
        status: ActivityStatus.COMPLETED
      });
      const newTotal = stats.totalPoints + task.points;
      const { level, xp } = calculateXP(newTotal);
      await updateDoc(userRef, { totalPoints: newTotal, level, xp });
    }
  };

  const addReward = async (reward: Omit<Reward, 'id' | 'active'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'rewards'), { ...reward, active: true });
  };

  const calculateTaskStreak = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.type !== TaskType.REQUIRED) return 0;

    // Get unique completion dates from dateKey, sorted descending
    const completionDateTimes: number[] = (Array.from(new Set(
      activities
        .filter(a => a.taskId === taskId)
        .map(a => {
          // Use dateKey as the source of truth for the "day" of completion
          const d = new Date(a.dateKey);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
    )) as number[]).sort((a: number, b: number) => b - a);
    
    if (completionDateTimes.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const lastCompletionTime = completionDateTimes[0];
    const diffDays = (start: number, end: number) => Math.round((end - start) / (1000 * 3600 * 24));

    // Allowed gap depends on frequency. If frequency is 0 (fixed days), we allow a gap based on schedule.
    // However, for simplicity in "Option 2" (total days), we check if the chain is broken.
    const allowedGap = (task.frequency && task.frequency > 0) ? task.frequency : 1;
    
    // If the gap since last completion is greater than the allowed gap, streak is broken
    // Note: If today is not completed yet, we check if the gap from last completion to today is still within allowedGap
    const gapToToday = diffDays(lastCompletionTime, todayTime);
    if (gapToToday > allowedGap) return 0;

    // Find the earliest activity in the current chain
    let earliestTime = lastCompletionTime;
    for (let i = 0; i < completionDateTimes.length - 1; i++) {
      const current = completionDateTimes[i];
      const previous = completionDateTimes[i+1];
      
      // For frequency tasks, we use the set frequency. 
      // For fixed days, we check if the previous completion was within a reasonable range.
      // If frequency is 0, it's daily/weekly. A gap of 7 days is a safe "max" for any weekly task.
      const maxGap = (task.frequency && task.frequency > 0) ? task.frequency : 7;
      
      if (diffDays(previous, current) <= maxGap) {
        earliestTime = previous;
      } else {
        break;
      }
    }
    
    // The streak is the number of days from the earliest completion in the chain until today
    return diffDays(earliestTime, todayTime) + 1;
  }, [activities, tasks]);

  const claimReward = async (rewardId: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'rewards', rewardId), {
      achievedAt: Date.now(),
      active: false
    });
  };

  return { tasks, activities, rewards, stats, categories, language, setLanguage, calculateTaskStreak, addTask, updateTask, deleteTask, toggleTask, addReward, claimReward, addCategory, updateCategory, deleteCategory };
};