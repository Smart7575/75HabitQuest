
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { useStore } from '../store/useStore';
import { 
  addDays, 
  eachDayOfInterval, 
  startOfDay, 
  format, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  isBefore, 
  isSameDay 
} from 'date-fns';
import { 
  TrendingUp, 
  CheckCircle, 
  Activity, 
  Award, 
  Target, 
  Flame, 
  ArrowUpDown, 
  Filter,
  Gift,
  Zap,
  Sparkles,
  Calendar,
  BarChart3,
  Trophy
} from 'lucide-react';
import { getDateKey, getDayName, isTaskScheduledOnDate, calculateRewardProgress } from '../utils/helpers';
import { Task, ActivityStatus, Reward } from '../types';

const translations = {
  EN: {
    analytics: "Analytics",
    visualize: "Visualize your progress, consistency, and habit momentum.",
    totalCompletions: "Total Completions",
    consistencyScore: "Consistency Score",
    currentStreak: "Current Streak",
    treasureProgress: "Treasure Progress",
    achievements: "Achievements",
    activityLast7: "Activity (Last 7 Days)",
    distribution: "Distribution (Last 7 Days)",
    taskConsistency: "Task Consistency",
    taskConsistencyDesc: "Completion percentage of scheduled days per mission.",
    days7: "7 Days",
    days14: "14 Days",
    days30: "30 Days",
    noTasks: "No active missions found. Create missions to start tracking consistency.",
    completedDays: "Completed",
    scheduledDays: "Scheduled",
    rate: "Consistency",
    streak: "Streak",
    avgConsistency: "Average Consistency",
    topPerformer: "Top Performer",
    activeMissions: "Active Missions",
    sortHighest: "Highest %",
    sortLowest: "Lowest %",
    sortName: "A-Z",
    days: "days",
    optimal: "Optimal (≥80%)",
    onTrack: "On Track (50-79%)",
    needsFocus: "Needs Focus (<50%)",
    firstScheduledDay: "First scheduled day",
    notStartedYet: "Not started yet",
    // Treasure Quest Weekly XP
    treasureQuestXp: "Treasure Quest: Weekly XP Progress",
    treasureQuestXpDesc: "XP earned per week from your quest start date until the current week.",
    noActiveQuest: "No Active Treasure Quest Found",
    noActiveQuestDesc: "Set a 13-week reward goal in the Treasure Vault to start tracking your weekly XP momentum!",
    goToVault: "Go to Treasure Vault",
    viewWeeklyBars: "Weekly XP",
    viewCumulative: "Cumulative Growth",
    avgPace: "Avg. Pace",
    targetPace: "Target Pace",
    thisWeek: "Current Week",
    questTarget: "Quest Target",
    progressToGoal: "Progress",
    questWeek: "Week",
    weeklyTargetLine: "Target",
    activeQuestBadge: "Active Quest",
    completedQuestBadge: "Completed Quest",
    selectQuest: "Select Quest",
    startedOn: "Started on",
    totalEarned: "Total Earned",
    earnedXp: "Earned XP",
    targetWeekly: "Weekly Target",
    onTrackStatus: "Met or exceeded weekly target",
    belowTargetStatus: "Below weekly target",
    currentWeekTag: "In progress"
  },
  NL: {
    analytics: "Statistieken",
    visualize: "Visualiseer je voortgang, consistentie en gewoonte-opbouw.",
    totalCompletions: "Totaal Voltooid",
    consistencyScore: "Consistentie Score",
    currentStreak: "Huidige Streak",
    treasureProgress: "Voortgang Schat",
    achievements: "Prestaties",
    activityLast7: "Activiteit (Laatste 7 Dagen)",
    distribution: "Verdeling (Laatste 7 Dagen)",
    taskConsistency: "Consistentie per Taak",
    taskConsistencyDesc: "Voltooiingspercentage van geplande dagen per missie.",
    days7: "7 Dagen",
    days14: "14 Dagen",
    days30: "30 Dagen",
    noTasks: "Geen actieve missies gevonden. Maak missies aan om consistentie te meten.",
    completedDays: "Voltooid",
    scheduledDays: "Gepland",
    rate: "Consistentie",
    streak: "Streak",
    avgConsistency: "Gemiddelde Consistentie",
    topPerformer: "Beste Prestatie",
    activeMissions: "Actieve Missies",
    sortHighest: "Hoogste %",
    sortLowest: "Laagste %",
    sortName: "A-Z",
    days: "dagen",
    optimal: "Optimaal (≥80%)",
    onTrack: "Op schema (50-79%)",
    needsFocus: "Aandacht nodig (<50%)",
    firstScheduledDay: "Eerste ingeplande dag",
    notStartedYet: "Nog niet gestart",
    // Treasure Quest Weekly XP
    treasureQuestXp: "Treasure Quest: Wekelijkse XP-Voortgang",
    treasureQuestXpDesc: "Behaalde XP per week vanaf de startdatum van je schat tot de huidige week.",
    noActiveQuest: "Geen Actieve Schatquest Gevonden",
    noActiveQuestDesc: "Stel een 13-weken beloningsdoel in De Schatkist in om je wekelijkse XP-tempo en voortgang bij te houden!",
    goToVault: "Naar De Schatkist",
    viewWeeklyBars: "Wekelijkse XP",
    viewCumulative: "Cumulatieve Groei",
    avgPace: "Gem. Tempo",
    targetPace: "Doel Tempo",
    thisWeek: "Huidige Week",
    questTarget: "Quest Doel",
    progressToGoal: "Voortgang",
    questWeek: "Week",
    weeklyTargetLine: "Doel",
    activeQuestBadge: "Actieve Quest",
    completedQuestBadge: "Voltooide Quest",
    selectQuest: "Selecteer Quest",
    startedOn: "Gestart op",
    totalEarned: "Totaal Behaald",
    earnedXp: "Behaalde XP",
    targetWeekly: "Wekelijks Doel",
    onTrackStatus: "Wekelijks doel behaald",
    belowTargetStatus: "Onder wekelijks doel",
    currentWeekTag: "Loopt nog"
  }
};

export const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activities, stats, tasks, rewards, language, calculateTaskStreak } = useStore();
  const t = translations[language];

  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);
  const [sortBy, setSortBy] = useState<'highest' | 'lowest' | 'name'>('highest');
  const [selectedRewardId, setSelectedRewardId] = useState<string>('');
  const [treasureChartView, setTreasureChartView] = useState<'weekly' | 'cumulative'>('weekly');
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeReward = useMemo(() => {
    return rewards.find(r => r.active && !r.achievedAt) || rewards.find(r => !r.achievedAt) || rewards[0] || null;
  }, [rewards]);

  const currentReward = useMemo(() => {
    if (selectedRewardId) {
      const found = rewards.find(r => r.id === selectedRewardId);
      if (found) return found;
    }
    return activeReward;
  }, [rewards, selectedRewardId, activeReward]);

  // Weekly XP data from treasure start date to current week
  const treasureWeeklyData = useMemo(() => {
    if (!currentReward) return null;

    let startDateObj: Date;
    if (currentReward.startDate) {
      startDateObj = new Date(currentReward.startDate);
      if (isNaN(startDateObj.getTime())) {
        startDateObj = new Date();
      }
    } else {
      startDateObj = new Date();
    }

    const questStartWeek = startOfWeek(startDateObj, { weekStartsOn: 1 });
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

    const weeksList: {
      weekNumber: number;
      startDate: Date;
      endDate: Date;
      isCurrent: boolean;
    }[] = [];

    // If start week is in the future, show at least week 1
    if (isBefore(currentWeekStart, questStartWeek)) {
      weeksList.push({
        weekNumber: 1,
        startDate: questStartWeek,
        endDate: endOfWeek(questStartWeek, { weekStartsOn: 1 }),
        isCurrent: isSameDay(questStartWeek, currentWeekStart)
      });
    } else {
      let curr = questStartWeek;
      let weekIdx = 1;
      // Cap at 104 weeks to prevent runaway loops
      while ((isBefore(curr, currentWeekStart) || isSameDay(curr, currentWeekStart)) && weekIdx <= 104) {
        weeksList.push({
          weekNumber: weekIdx,
          startDate: curr,
          endDate: endOfWeek(curr, { weekStartsOn: 1 }),
          isCurrent: isSameDay(curr, currentWeekStart)
        });
        curr = addWeeks(curr, 1);
        weekIdx++;
      }
    }

    const completedActivities = activities.filter(
      a => !a.status || a.status === ActivityStatus.COMPLETED
    );

    const durationWeeks = currentReward.durationWeeks || 13;
    const weeklyTarget = currentReward.weeklyXp || 
      (currentReward.targetXp ? Math.round(currentReward.targetXp / durationWeeks) : 250);
    const totalTargetXp = currentReward.targetXp || (weeklyTarget * durationWeeks);

    let runningCumulative = 0;
    const chartData = weeksList.map((week) => {
      const wStartKey = getDateKey(week.startDate);
      const wEndKey = getDateKey(week.endDate);

      const weekActs = completedActivities.filter(a => a.dateKey >= wStartKey && a.dateKey <= wEndKey);
      const earnedXp = weekActs.reduce((sum, a) => {
        const task = tasks.find(t => t.id === a.taskId);
        return sum + (task?.points || 10);
      }, 0);

      runningCumulative += earnedXp;

      const startFormatted = format(week.startDate, 'd MMM');
      const endFormatted = format(week.endDate, 'd MMM');

      return {
        weekNumber: week.weekNumber,
        name: `Wk ${week.weekNumber}`,
        displayLabel: `Wk ${week.weekNumber} (${startFormatted})`,
        fullRange: `${startFormatted} - ${endFormatted}`,
        earnedXp,
        cumulative: runningCumulative,
        targetWeekly: weeklyTarget,
        taskCount: weekActs.length,
        isCurrent: week.isCurrent
      };
    });

    const totalEarned = runningCumulative;
    const avgWeeklyXp = chartData.length > 0 ? Math.round(totalEarned / chartData.length) : 0;
    const currentWeekXp = chartData.find(w => w.isCurrent)?.earnedXp || 0;
    const progressPercent = totalTargetXp > 0 ? Math.min(100, Math.round((totalEarned / totalTargetXp) * 100)) : 0;

    return {
      reward: currentReward,
      chartData,
      totalEarned,
      totalTargetXp,
      weeklyTarget,
      avgWeeklyXp,
      currentWeekXp,
      progressPercent,
      durationWeeks,
      weeksElapsed: chartData.length,
      startDateFormatted: format(startDateObj, 'd MMM yyyy')
    };
  }, [currentReward, activities, tasks]);

  // Custom tooltips for treasure weekly charts
  const renderWeeklyTooltip = (props: any) => {
    const { active, payload } = props;
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const diff = data.earnedXp - data.targetWeekly;
    return (
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5 font-black text-slate-800">
          <span>{data.name} {data.isCurrent ? `(${t.currentWeekTag})` : ''}</span>
          <span className="text-[10px] font-bold text-slate-400">{data.fullRange}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">{t.earnedXp}:</span>
          <span className="font-black text-indigo-600 text-sm">{data.earnedXp.toLocaleString()} XP</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">{t.targetWeekly}:</span>
          <span className="font-bold text-slate-700">{data.targetWeekly.toLocaleString()} XP</span>
        </div>
        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100">
          <span className="text-slate-400 font-medium">{language === 'NL' ? 'Verschil:' : 'Difference:'}</span>
          <span className={`font-black ${diff >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {diff >= 0 ? `+${diff}` : diff} XP
          </span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span>{language === 'NL' ? 'Voltooide missies:' : 'Completed missions:'}</span>
          <span className="font-bold text-slate-600">{data.taskCount}</span>
        </div>
      </div>
    );
  };

  const renderCumulativeTooltip = (props: any) => {
    const { active, payload } = props;
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const target = treasureWeeklyData?.totalTargetXp || 0;
    const pct = target > 0 ? Math.min(100, Math.round((data.cumulative / target) * 100)) : 0;
    return (
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5 font-black text-slate-800">
          <span>{data.name}</span>
          <span className="text-[10px] font-bold text-slate-400">{data.fullRange}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">{t.viewCumulative}:</span>
          <span className="font-black text-emerald-600 text-sm">{data.cumulative.toLocaleString()} XP</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">{t.questTarget}:</span>
          <span className="font-bold text-slate-700">{target.toLocaleString()} XP</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
          <span className="text-slate-400 font-medium">{t.progressToGoal}:</span>
          <span className="font-black text-indigo-600">{pct}%</span>
        </div>
      </div>
    );
  };

  // Activity data for the past 7 days
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(new Date(), -i);
      const dayName = getDayName(date.getDay(), language);
      const targetDateKey = getDateKey(date);
      const count = activities.filter(c => c.dateKey === targetDateKey).length;
      data.push({ name: dayName, count });
    }
    return data;
  }, [activities, language]);

  // Consistency per task over the selected time range
  const taskConsistencyData = useMemo(() => {
    const activeTasks = tasks.filter(t => !t.archived);
    if (activeTasks.length === 0) return [];

    const today = startOfDay(new Date());
    const startDate = startOfDay(addDays(today, -(timeRange - 1)));
    const daysInterval = eachDayOfInterval({
      start: startDate,
      end: today
    });
    const intervalDateKeySet = new Set(daysInterval.map(d => getDateKey(d)));

    const results = activeTasks.map(task => {
      // Find all completed activities for this task
      const validActivities = activities.filter(a => 
        a.taskId === task.id && 
        (!a.status || a.status === ActivityStatus.COMPLETED)
      );
      
      // Dates within the interval that were completed
      const completedDatesInInterval = new Set<string>();
      validActivities.forEach(a => {
        if (intervalDateKeySet.has(a.dateKey)) {
          completedDatesInInterval.add(a.dateKey);
        }
      });

      // Determine the task's first scheduled day
      let taskStartDay: Date;
      if (task.startDate) {
        if (typeof task.startDate === 'string') {
          const s = (task.startDate as string).split('T')[0];
          taskStartDay = startOfDay(new Date(`${s}T00:00:00`));
        } else {
          taskStartDay = startOfDay(new Date(task.startDate));
        }
      } else if (task.createdAt) {
        taskStartDay = startOfDay(new Date(task.createdAt));
      } else {
        taskStartDay = startDate;
      }

      // If user has historical activity logged before taskStartDay, ensure we also include it
      validActivities.forEach(a => {
        const aDate = startOfDay(new Date(a.dateKey.includes('T') ? a.dateKey : `${a.dateKey}T00:00:00`));
        if (!isNaN(aDate.getTime()) && aDate < taskStartDay) {
          taskStartDay = aDate;
        }
      });

      let scheduledCount = 0;
      let completedCount = 0;

      if (task.frequency && task.frequency > 0) {
        // Frequency-based task: expected completions across the active days in interval
        const relevantDays = daysInterval.filter(d => startOfDay(d) >= taskStartDay).length;
        if (relevantDays > 0) {
          const expectedCount = Math.max(1, Math.round(relevantDays / task.frequency));
          scheduledCount = expectedCount;
          completedCount = Math.min(expectedCount, completedDatesInInterval.size);
        } else {
          scheduledCount = 0;
          completedCount = 0;
        }
      } else {
        // Day-of-week based task
        const targetDays = (task.days && task.days.length > 0) ? task.days : [0, 1, 2, 3, 4, 5, 6];

        daysInterval.forEach(day => {
          const dayStart = startOfDay(day);
          // If this day is before the task's first scheduled day, it was not scheduled
          if (dayStart < taskStartDay) return;

          if (targetDays.includes(day.getDay())) {
            scheduledCount++;
            const dateKey = getDateKey(day);
            if (completedDatesInInterval.has(dateKey)) {
              completedCount++;
            }
          }
        });

        // If user completed on non-scheduled days as well within the active window, factor into completedCount
        const completedInActivePeriod = Array.from(completedDatesInInterval).filter(dateKey => {
          const d = startOfDay(new Date(dateKey.includes('T') ? dateKey : `${dateKey}T00:00:00`));
          return d >= taskStartDay;
        }).length;

        if (completedCount < completedInActivePeriod) {
          completedCount = Math.min(scheduledCount, completedInActivePeriod);
        }
      }

      let percentage = 0;
      if (scheduledCount > 0) {
        percentage = Math.min(100, Math.round((completedCount / scheduledCount) * 100));
      } else if (completedDatesInInterval.size > 0) {
        percentage = 100;
      }

      // Determine color based on consistency tier
      let barColor = '#10B981'; // Emerald for >= 80% (Optimal)
      if (percentage < 50) {
        barColor = '#F43F5E'; // Rose for < 50% (Needs Focus)
      } else if (percentage < 80) {
        barColor = '#3B82F6'; // Blue for 50 - 79% (On Track)
      }

      const streak = calculateTaskStreak ? calculateTaskStreak(task.id) : 0;

      // Truncate name for axis if very long
      const displayName = task.name.length > 18 ? `${task.name.substring(0, 16)}…` : task.name;
      const displayNameMobile = task.name.length > 11 ? `${task.name.substring(0, 9)}…` : task.name;

      return {
        id: task.id,
        name: task.name,
        displayName,
        displayNameMobile,
        category: task.categoryName || 'General',
        percentage,
        scheduledCount,
        completedCount,
        streak,
        barColor,
        points: task.points,
        startDateFormatted: format(taskStartDay, 'd MMM yyyy')
      };
    });

    // Sort data
    return results.sort((a, b) => {
      if (sortBy === 'highest') return b.percentage - a.percentage;
      if (sortBy === 'lowest') return a.percentage - b.percentage;
      return a.name.localeCompare(b.name);
    });
  }, [tasks, activities, timeRange, sortBy, calculateTaskStreak]);

  // Fast lookup map for custom Y-axis tick
  const taskConsistencyMap = useMemo(() => {
    const map = new Map<string, (typeof taskConsistencyData)[0]>();
    taskConsistencyData.forEach(item => map.set(item.id, item));
    return map;
  }, [taskConsistencyData]);

  // Custom tick showing task name and percentage directly left of the bar
  const renderCustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const item = taskConsistencyMap.get(payload.value);
    if (!item) return null;

    const nameX = isMobile ? -32 : -56;
    const percentX = isMobile ? -4 : -8;
    const fontSize = isMobile ? 10 : 12;
    const labelText = isMobile ? item.displayNameMobile : item.displayName;

    return (
      <g transform={`translate(${x},${y})`}>
        <title>{item.name}</title>
        {/* Task Name */}
        <text
          x={nameX}
          y={3}
          textAnchor="end"
          fill="#334155"
          fontSize={fontSize}
          fontWeight={600}
          className="select-none"
        >
          {labelText}
        </text>
        {/* Percentage shown directly to the left of the bar */}
        <text
          x={percentX}
          y={3}
          textAnchor="end"
          fill={item.barColor}
          fontSize={fontSize}
          fontWeight={800}
          className="select-none"
        >
          {item.percentage}%
        </text>
      </g>
    );
  };

  // Overall average consistency across all tasks
  const overallConsistencyScore = useMemo(() => {
    if (taskConsistencyData.length === 0) return 0;
    const total = taskConsistencyData.reduce((acc, item) => acc + item.percentage, 0);
    return Math.round(total / taskConsistencyData.length);
  }, [taskConsistencyData]);

  // Top performing task
  const topTask = useMemo(() => {
    if (taskConsistencyData.length === 0) return null;
    const sorted = [...taskConsistencyData].sort((a, b) => b.percentage - a.percentage);
    return sorted[0];
  }, [taskConsistencyData]);

  // Total unlocked rewards count
  const unlockedAchievementsCount = useMemo(() => {
    return rewards.filter(r => r.achievedAt || !r.active).length;
  }, [rewards]);

  // Treasure Progress Percentage
  const treasureProgressPercent = useMemo(() => {
    if (treasureWeeklyData) {
      return treasureWeeklyData.progressPercent;
    }
    const targetReward = currentReward || activeReward;
    if (!targetReward) return 0;
    return calculateRewardProgress(targetReward, tasks, activities, stats.totalPoints).progress;
  }, [treasureWeeklyData, currentReward, activeReward, tasks, activities, stats.totalPoints]);

  const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#EAB308'];

  return (
    <div className="pb-24 animate-in fade-in duration-700 w-full">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2">{t.analytics}</h1>
      <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">{t.visualize}</p>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: t.totalCompletions, value: activities.length, icon: <CheckCircle className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-emerald-50' },
          { label: t.consistencyScore, value: `${overallConsistencyScore}%`, icon: <Activity className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-blue-50' },
          { label: t.treasureProgress, value: `${treasureProgressPercent}%`, icon: <Gift className="text-amber-500 w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-amber-50' },
          { label: t.achievements, value: unlockedAchievementsCount, icon: <Award className="text-indigo-500 w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-indigo-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">{item.label}</p>
              <p className="text-xl sm:text-2xl font-black text-gray-800">{item.value}</p>
            </div>
            <div className={`${item.bg} p-2 sm:p-3 rounded-xl shrink-0`}>{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Treasure Quest: Weekly XP Progress Section */}
      {!treasureWeeklyData ? (
        <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/40 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-indigo-100/80 shadow-xs mb-6 sm:mb-8 text-center">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm border border-indigo-100">
            <Gift className="w-7 h-7 text-indigo-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-1.5">{t.noActiveQuest}</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 font-medium">{t.noActiveQuestDesc}</p>
          <button
            onClick={() => navigate('/rewards')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200 inline-flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            {t.goToVault}
          </button>
        </div>
      ) : (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm mb-6 sm:mb-8 w-full">
          {/* Header Row: Title, Quest Selector, and View Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-gray-100">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                  <Gift className="w-5 h-5 shrink-0" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  {t.treasureQuestXp}
                </h2>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 truncate">
                  {treasureWeeklyData.reward.name}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                {t.treasureQuestXpDesc} ({t.startedOn}: <span className="font-semibold text-slate-700">{treasureWeeklyData.startDateFormatted}</span>)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
              {/* Quest Selector dropdown if multiple rewards */}
              {rewards.length > 1 && (
                <div className="flex items-center bg-slate-100 rounded-xl px-2.5 py-1 gap-1.5 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={currentReward?.id || ''}
                    onChange={e => setSelectedRewardId(e.target.value)}
                    className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer py-1 pr-1 text-xs max-w-[140px] truncate"
                  >
                    {rewards.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.achievedAt ? `(${t.completedQuestBadge})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* View Toggle: Weekly Bars vs Cumulative Line */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTreasureChartView('weekly')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    treasureChartView === 'weekly'
                      ? 'bg-white text-indigo-600 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  {t.viewWeeklyBars}
                </button>
                <button
                  type="button"
                  onClick={() => setTreasureChartView('cumulative')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    treasureChartView === 'cumulative'
                      ? 'bg-white text-indigo-600 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {t.viewCumulative}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
            {/* Total Earned & % */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-black">
                <Zap className="w-4 h-4 fill-indigo-600 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 truncate">{t.totalEarned}</p>
                <p className="text-base sm:text-lg font-black text-slate-800 truncate">
                  {treasureWeeklyData.totalEarned.toLocaleString()} <span className="text-xs font-bold text-slate-400">XP</span>
                </p>
                <p className="text-[10px] font-bold text-indigo-600">{treasureWeeklyData.progressPercent}% {t.progressToGoal}</p>
              </div>
            </div>

            {/* Current Week XP */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-black">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 truncate">{t.thisWeek}</p>
                <p className="text-base sm:text-lg font-black text-blue-600 truncate">
                  {treasureWeeklyData.currentWeekXp.toLocaleString()} <span className="text-xs font-bold text-slate-400">XP</span>
                </p>
                <p className="text-[10px] font-bold text-slate-500">
                  {treasureWeeklyData.weeksElapsed} / {treasureWeeklyData.durationWeeks} {language === 'NL' ? 'weken' : 'weeks'}
                </p>
              </div>
            </div>

            {/* Weekly Target Pace */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 font-black">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 truncate">{t.targetPace}</p>
                <p className="text-base sm:text-lg font-black text-amber-600 truncate">
                  {treasureWeeklyData.weeklyTarget.toLocaleString()} <span className="text-xs font-bold text-slate-400">XP/wk</span>
                </p>
                <p className="text-[10px] font-bold text-slate-500">{t.questTarget}: {treasureWeeklyData.totalTargetXp.toLocaleString()}</p>
              </div>
            </div>

            {/* Average Pace */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-black">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 truncate">{t.avgPace}</p>
                <p className="text-base sm:text-lg font-black text-emerald-600 truncate">
                  {treasureWeeklyData.avgWeeklyXp.toLocaleString()} <span className="text-xs font-bold text-slate-400">XP/wk</span>
                </p>
                <p className="text-[10px] font-bold text-slate-500">
                  {treasureWeeklyData.avgWeeklyXp >= treasureWeeklyData.weeklyTarget ? '🔥 ' + t.onTrackStatus : t.belowTargetStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer 
              width="100%" 
              height="100%" 
              minHeight={270}
              initialDimension={{ width: 500, height: 270 }}
            >
              {treasureChartView === 'weekly' ? (
                <BarChart 
                  data={treasureWeeklyData.chartData} 
                  margin={{ top: 20, right: 15, left: -10, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }} 
                    tickLine={{ stroke: '#cbd5e1' }} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                    dy={6}
                  />
                  <YAxis 
                    domain={[0, (dataMax: number) => Math.max(dataMax || 0, treasureWeeklyData.weeklyTarget + 50)]}
                    axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }} 
                    tickLine={{ stroke: '#cbd5e1' }} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                    allowDecimals={false}
                    width={40}
                  />
                  <Tooltip content={renderWeeklyTooltip} />
                  {treasureWeeklyData.weeklyTarget > 0 && (
                    <ReferenceLine 
                      y={treasureWeeklyData.weeklyTarget} 
                      stroke="#f59e0b" 
                      strokeDasharray="4 4" 
                      strokeWidth={2}
                      label={{ 
                        value: `${t.weeklyTargetLine}: ${treasureWeeklyData.weeklyTarget} XP`, 
                        position: 'top', 
                        fill: '#d97706', 
                        fontSize: 11,
                        fontWeight: 800
                      }} 
                    />
                  )}
                  <Bar dataKey="earnedXp" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {treasureWeeklyData.chartData.map((entry, index) => {
                      let fillColor = '#818CF8'; // default soft indigo
                      if (entry.isCurrent) {
                        fillColor = '#4F46E5'; // darker vibrant indigo for current week
                      } else if (entry.earnedXp >= entry.targetWeekly) {
                        fillColor = '#10B981'; // emerald for target achieved
                      }
                      return (
                        <Cell 
                          key={`week-bar-${index}`} 
                          fill={fillColor}
                          stroke={entry.isCurrent ? '#312E81' : 'transparent'}
                          strokeWidth={entry.isCurrent ? 2 : 0}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart 
                  data={treasureWeeklyData.chartData} 
                  margin={{ top: 20, right: 15, left: -10, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="colorTreasureCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }} 
                    tickLine={{ stroke: '#cbd5e1' }} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                    dy={6}
                  />
                  <YAxis 
                    domain={[0, (dataMax: number) => Math.max(dataMax || 0, treasureWeeklyData.totalTargetXp)]}
                    axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }} 
                    tickLine={{ stroke: '#cbd5e1' }} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                    allowDecimals={false}
                    width={48}
                  />
                  <Tooltip content={renderCumulativeTooltip} />
                  {treasureWeeklyData.totalTargetXp > 0 && (
                    <ReferenceLine 
                      y={treasureWeeklyData.totalTargetXp} 
                      stroke="#10B981" 
                      strokeDasharray="4 4" 
                      strokeWidth={2}
                      label={{ 
                        value: `${t.questTarget}: ${treasureWeeklyData.totalTargetXp.toLocaleString()} XP`, 
                        position: 'top', 
                        fill: '#059669', 
                        fontSize: 11,
                        fontWeight: 800
                      }} 
                    />
                  )}
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorTreasureCumulative)" 
                    dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Chart Legend & Context Notes */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
            {treasureChartView === 'weekly' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
                  <span>{t.onTrackStatus} (≥ {treasureWeeklyData.weeklyTarget} XP)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block"></span>
                  <span>{t.belowTargetStatus}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-600 border border-indigo-900 inline-block"></span>
                  <span>{t.thisWeek} ({t.currentWeekTag})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500 inline-block"></span>
                  <span>{t.targetPace} ({treasureWeeklyData.weeklyTarget} XP)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span>{t.viewCumulative}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-600 inline-block"></span>
                  <span>{t.questTarget} ({treasureWeeklyData.totalTargetXp.toLocaleString()} XP)</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Task Consistency Section */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm mb-6 sm:mb-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-indigo-600 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t.taskConsistency}</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{t.taskConsistencyDesc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Timeframe Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {([7, 14, 30] as const).map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTimeRange(days)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeRange === days 
                      ? 'bg-white text-indigo-600 shadow-xs font-black' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {days === 7 ? t.days7 : days === 14 ? t.days14 : t.days30}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center bg-slate-100 rounded-xl px-2 py-1 gap-1 text-xs font-bold">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'highest' | 'lowest' | 'name')}
                className="bg-transparent text-slate-600 font-bold focus:outline-none cursor-pointer py-1 pr-1 text-xs"
              >
                <option value="highest">{t.sortHighest}</option>
                <option value="lowest">{t.sortLowest}</option>
                <option value="name">{t.sortName}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick summary strip */}
        {taskConsistencyData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-black text-sm">
                %
              </div>
              <div>
                <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">{t.avgConsistency}</p>
                <p className="text-base font-black text-slate-800">{overallConsistencyScore}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">{t.topPerformer}</p>
                <p className="text-base font-black text-slate-800 truncate" title={topTask?.name}>
                  {topTask ? `${topTask.name} (${topTask.percentage}%)` : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-black text-sm">
                {taskConsistencyData.length}
              </div>
              <div>
                <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">{t.activeMissions}</p>
                <p className="text-base font-black text-slate-800">{taskConsistencyData.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Consistency Chart */}
        {taskConsistencyData.length === 0 ? (
          <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">{t.noTasks}</p>
          </div>
        ) : (
          <div className="w-full">
            {(() => {
              const rowHeight = isMobile ? 26 : 32;
              const chartHeight = Math.max(isMobile ? 150 : 200, taskConsistencyData.length * rowHeight);
              return (
                <div 
                  className="w-full overflow-hidden" 
                  style={{ minHeight: `${chartHeight}px` }}
                >
                  <div style={{ width: '100%', height: `${chartHeight}px` }}>
                    <ResponsiveContainer 
                      width="100%" 
                      height="100%"
                      minHeight={chartHeight}
                    >
                      <BarChart
                        layout="vertical"
                        data={taskConsistencyData}
                        margin={{ top: 6, right: isMobile ? 12 : 30, left: 0, bottom: 6 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]} 
                          unit="%" 
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={{ stroke: '#cbd5e1' }}
                          tick={{ fill: '#64748b', fontSize: isMobile ? 9 : 11, fontWeight: 600 }}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="id" 
                          width={isMobile ? 100 : 185}
                          interval={0}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          tick={renderCustomYAxisTick}
                        />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc', opacity: 0.8 }}
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[200px]">
                              <div className="font-black text-slate-800 text-sm">{data.name}</div>
                              <div className="text-slate-500 flex justify-between">
                                <span>{t.rate}:</span>
                                <span className="font-black" style={{ color: data.barColor }}>
                                  {data.percentage}%
                                </span>
                              </div>
                              <div className="text-slate-500 flex justify-between">
                                <span>{t.completedDays}:</span>
                                <span className="font-bold text-slate-700">
                                  {data.scheduledCount > 0 
                                    ? `${data.completedCount} / ${data.scheduledCount} ${t.days}`
                                    : `0 / 0 ${t.days} (${t.notStartedYet})`
                                  }
                                </span>
                              </div>
                              <div className="text-slate-500 flex justify-between">
                                <span>{t.firstScheduledDay}:</span>
                                <span className="font-semibold text-slate-700">
                                  {data.startDateFormatted}
                                </span>
                              </div>
                              {data.streak > 0 && (
                                <div className="text-slate-500 flex justify-between">
                                  <span>{t.streak}:</span>
                                  <span className="font-bold text-orange-600 flex items-center gap-1">
                                    <Flame className="w-3 h-3" /> {data.streak} {t.days}
                                  </span>
                                </div>
                              )}
                              <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-100 flex justify-between">
                                <span>Categorie:</span>
                                <span className="font-semibold text-slate-600">{data.category}</span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar 
                        dataKey="percentage" 
                        radius={[0, 4, 4, 0]} 
                        barSize={isMobile ? 11 : 15}
                      >
                        {taskConsistencyData.map((entry, index) => (
                          <Cell key={`task-bar-${entry.id || index}`} fill={entry.barColor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })()}

            {/* Legend / Tiers */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span>{t.optimal}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                <span>{t.onTrack}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span>{t.needsFocus}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7-day Activity and Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">{t.activityLast7}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer 
              width="100%" 
              height="100%"
              minWidth={0}
              minHeight={256}
              initialDimension={{ width: 500, height: 256 }}
            >
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }} 
                  tickLine={{ stroke: '#cbd5e1' }} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                  dy={6}
                  interval={0}
                />
                <YAxis 
                  domain={[0, (dataMax: number) => Math.max(dataMax || 0, 4)]}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }} 
                  tickLine={{ stroke: '#cbd5e1' }} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                  allowDecimals={false}
                  width={32}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">{t.distribution}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer 
              width="100%" 
              height="100%"
              minWidth={0}
              minHeight={256}
              initialDimension={{ width: 500, height: 256 }}
            >
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }} 
                  tickLine={{ stroke: '#cbd5e1' }} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                  dy={6}
                  interval={0}
                />
                <YAxis 
                  domain={[0, (dataMax: number) => Math.max(dataMax || 0, 4)]}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }} 
                  tickLine={{ stroke: '#cbd5e1' }} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                  allowDecimals={false}
                  width={32}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.6 }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`dist-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
