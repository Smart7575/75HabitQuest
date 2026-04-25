
import React, { useMemo, useState } from 'react';
import { Flame, Award, Zap, ChevronLeft, ChevronRight, Calendar, Gift, Sparkles, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { XPBar } from '../components/XPBar';
import { RewardCard } from '../components/RewardCard';
import { getDateKey, getWeekDays } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { isSameDay, format, addWeeks } from 'date-fns';
import { Task, TaskType, ActivityStatus, Language } from '../types';

const translations = {
  EN: {
    weeklyProgress: "Weekly Progress",
    trackConsistency: "Track your consistency across all missions.",
    week: "Week",
    mission: "Mission",
    activeQuest: "Active Quest",
    noActiveReward: "No Active Reward",
    setGoal: "Set a goal to motivate your streak!",
    chooseReward: "Choose a Reward",
    heroInsights: "Hero Insights",
    statsOverview: "Stats Overview",
    longestStreak: "Longest Streak",
    nextLevel: "Next Level",
    xpToLevel: "XP to Level",
    missionInfo: "Mission Info",
    noInfo: "No additional information provided for this mission.",
    close: "Close",
    completed: "Completed",
    byOther: "By other",
    scheduled: "Scheduled",
    missed: "Missed",
    all: "All",
    required: "Required",
    optional: "Optional/Bonus",
    totalPoints: "Total Points",
    days: "days",
    noMissions: "No missions active. Go to the Tasks tab to start your quest!"
  },
  NL: {
    weeklyProgress: "Wekelijkse Voortgang",
    trackConsistency: "Volg je consistentie over alle missies.",
    week: "Week",
    mission: "Missie",
    activeQuest: "Actieve Quest",
    noActiveReward: "Geen Actieve Beloning",
    setGoal: "Stel een doel in om je streak te motiveren!",
    chooseReward: "Kies een Beloning",
    heroInsights: "Hero Inzichten",
    statsOverview: "Statistieken Overzicht",
    longestStreak: "Langste Streak",
    nextLevel: "Volgend Niveau",
    xpToLevel: "XP naar Niveau",
    missionInfo: "Missie Info",
    noInfo: "Geen extra informatie beschikbaar voor deze missie.",
    close: "Sluiten",
    completed: "Voltooid",
    byOther: "Door ander",
    scheduled: "Ingepland",
    missed: "Gemist",
    all: "Alle",
    required: "Verplicht",
    optional: "Optioneel/Bonus",
    totalPoints: "Totaal Punten",
    days: "dagen",
    noMissions: "Geen actieve missies. Ga naar de Taken tab om je quest te starten!"
  }
};

export const Dashboard: React.FC = () => {
  const { tasks, activities, stats, rewards, toggleTask, language, setLanguage, calculateTaskStreak } = useStore();
  const navigate = useNavigate();
  const [baseDate, setBaseDate] = useState(new Date());
  const [infoTask, setInfoTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'REQUIRED' | 'OPTIONAL'>('ALL');
  
  const t = translations[language];
  
  // Weekly grid data based on baseDate
  const weekDays = useMemo(() => getWeekDays(baseDate), [baseDate]);
  
  // Sorted and filtered tasks: First by category, then by name
  const allActiveTasks = useMemo(() => {
    return tasks
      .filter(t => !t.archived)
      .filter(task => {
        if (filter === 'REQUIRED') return task.type === TaskType.REQUIRED;
        if (filter === 'OPTIONAL') return task.type !== TaskType.REQUIRED;
        return true;
      })
      .sort((a, b) => {
        const catA = (a.categoryName || 'General').toLowerCase();
        const catB = (b.categoryName || 'General').toLowerCase();
        if (catA < catB) return -1;
        if (catA > catB) return 1;
        
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
  }, [tasks, filter]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    allActiveTasks.forEach(task => {
      const cat = task.categoryName || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(task);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [allActiveTasks]);
  
  const getTaskActivityOnDate = (taskId: string, date: Date) => {
    const key = getDateKey(date);
    return activities.find(a => a.taskId === taskId && a.dateKey === key);
  };

  const isTaskScheduledOnDate = (task: Task, date: Date) => {
    const taskStart = new Date(task.startDate || task.createdAt);
    taskStart.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // If the task hasn't started yet relative to the check date, it's not scheduled
    if (taskStart > checkDate) return false;

    if (task.frequency && task.frequency > 0) {
      // Find the most recent completion BEFORE 'date' to project the next scheduled day.
      const taskActivities = activities
        .filter(a => a.taskId === task.id)
        .sort((a, b) => b.completedAt - a.completedAt);
      
      const lastActivityBeforeDate = taskActivities.find(a => new Date(a.dateKey) < checkDate);
      const referenceDate = lastActivityBeforeDate 
        ? new Date(lastActivityBeforeDate.dateKey) 
        : taskStart;
      
      referenceDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((checkDate.getTime() - referenceDate.getTime()) / (1000 * 3600 * 24));
      
      // Corrected: include diffDays === 0 to allow the task to be scheduled on its start date
      return diffDays >= 0 && diffDays % task.frequency === 0;
    }
    return task.days?.includes(date.getDay());
  };
  
  const activeReward = rewards.find(r => r.active);

  const goToNextWeek = () => setBaseDate(prev => addWeeks(prev, 1));
  const goToPrevWeek = () => setBaseDate(prev => addWeeks(prev, -1));
  const goToToday = () => setBaseDate(new Date());

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      {/* Hero Stats */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                <Flame className="w-10 h-10 text-orange-400 animate-fire" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-widest">Hero Level</p>
                <h2 className="text-4xl font-black">Lvl {stats.level}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-full md:w-64 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <XPBar level={stats.level} xp={stats.xp} nextLevelXp={stats.nextLevelXp} />
                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider font-bold text-blue-100">
                  <span>{t.totalPoints}</span>
                  <span>{stats.totalPoints}</span>
                </div>
              </div>
              
              <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/20">
                <button 
                  onClick={() => setLanguage('EN')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'EN' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
                >
                  ENG
                </button>
                <button 
                  onClick={() => setLanguage('NL')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'NL' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
                >
                  NL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Overview */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-800">{t.weeklyProgress}</h2>
            <p className="text-gray-500 text-sm">{t.trackConsistency}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              <button 
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t.all}
              </button>
              <button 
                onClick={() => setFilter('REQUIRED')}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${filter === 'REQUIRED' ? 'bg-rose-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t.required}
              </button>
              <button 
                onClick={() => setFilter('OPTIONAL')}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${filter === 'OPTIONAL' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t.optional}
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
              <button 
                onClick={goToPrevWeek}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={goToToday}
                className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" /> {t.week}
              </button>
              <button 
                onClick={goToNextWeek}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-500"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-2 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest min-w-[220px]">{t.mission}</th>
                  {weekDays.map((day) => (
                    <th key={day.toString()} className="p-1 text-center">
                      <div className={`text-[9px] font-black uppercase tracking-tighter ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-400'}`}>
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-base font-bold mt-0.5 ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-700'}`}>
                        {format(day, 'd')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {groupedTasks.length > 0 ? (
                  groupedTasks.map(([category, catTasks]) => (
                    <React.Fragment key={category}>
                      <tr className="bg-blue-50">
                        <td colSpan={8} className="py-1 px-6 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                          {category}
                        </td>
                      </tr>
                      {catTasks.map((task) => {
                        const taskStreak = calculateTaskStreak(task.id);
                        return (
                          <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-1.5 px-6">
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-gray-800 text-xs leading-tight">{task.name}</div>
                                {taskStreak > 0 && (
                                  <div className="flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded-lg border border-orange-100">
                                    <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                                    <span className="text-[9px] font-black text-orange-600">{taskStreak}</span>
                                  </div>
                                )}
                                {task.description && (
                                  <button 
                                    onClick={() => setInfoTask(task)}
                                    className="p-1 hover:bg-blue-50 rounded-full transition-colors"
                                  >
                                    <Info className="w-3 h-3 text-blue-500" />
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[7px] font-black uppercase px-1 py-0.25 rounded ${task.type === TaskType.REQUIRED ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                  {task.type === TaskType.REQUIRED ? t.required : (task.type === TaskType.OPTIONAL ? t.optional : 'Bonus')}
                                </span>
                              </div>
                            </td>
                          {weekDays.map((day) => {
                            const activity = getTaskActivityOnDate(task.id, day);
                            const isCompleted = !!activity;
                            const isCompletedByOther = activity?.status === ActivityStatus.COMPLETED_BY_OTHER;
                            const isScheduled = isTaskScheduledOnDate(task, day);
                            const isToday = isSameDay(day, new Date());
                            const isPast = !isToday && day < new Date();
                            const dayLetter = format(day, 'EEE').charAt(0);
                            
                            return (
                              <td key={day.toString()} className="p-1 text-center">
                                <button
                                  onClick={() => toggleTask(task.id, day)}
                                  className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto font-black text-[9px]
                                    ${isCompleted 
                                      ? (isCompletedByOther 
                                          ? 'bg-amber-400 text-white shadow-lg shadow-amber-100 scale-105' 
                                          : 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 scale-105')
                                      : isScheduled 
                                        ? (isPast 
                                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' 
                                            : 'bg-blue-600 text-white shadow-lg shadow-blue-100') 
                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }
                                    ${isToday && !isCompleted ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                                  `}
                                >
                                  {dayLetter}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      )})}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400 italic font-medium">
                      {t.noMissions}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-12 flex flex-wrap gap-4 px-6 py-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500"></div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.completed}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-400"></div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.byOther}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-600"></div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.scheduled}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-500"></div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.missed}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Active Reward */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            {t.activeQuest}
            <Award className="w-5 h-5 text-indigo-500" />
          </h2>
          {activeReward ? (
            <RewardCard reward={activeReward} currentStreak={stats.streak} />
          ) : (
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 text-center h-full flex flex-col justify-center">
              <Gift className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
              <p className="text-indigo-900 font-bold text-sm mb-1">{t.noActiveReward}</p>
              <p className="text-indigo-600 text-xs mb-4">{t.setGoal}</p>
              <button 
                onClick={() => navigate('/rewards')}
                className="w-full py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100"
              >
                {t.chooseReward}
              </button>
            </div>
          )}
        </div>

        {/* Quick Insights */}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            {t.heroInsights}
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex-1">
            <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wider">{t.statsOverview}</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">{t.longestStreak}</p>
                  <p className="text-lg font-black text-gray-800">{stats.longestStreak} {t.days}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">{t.nextLevel}</p>
                  <p className="text-lg font-black text-gray-800">{500 - stats.xp} {t.xpToLevel} {stats.level + 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {infoTask && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">{t.missionInfo}</h3>
              </div>
              <button type="button" onClick={() => setInfoTask(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6">
              <h4 className="font-black text-slate-800 mb-2">{infoTask.name}</h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {infoTask.description || t.noInfo}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setInfoTask(null)}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
