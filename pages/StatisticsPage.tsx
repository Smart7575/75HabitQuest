
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useStore } from '../store/useStore';
import { addDays } from 'date-fns';
import { TrendingUp, CheckCircle, Activity, Award } from 'lucide-react';
import { getDateKey, getDayName } from '../utils/helpers';

const translations = {
  EN: {
    analytics: "Analytics",
    visualize: "Visualize your progress and consistency.",
    totalCompletions: "Total Completions",
    consistencyScore: "Consistency Score",
    currentStreak: "Current Streak",
    achievements: "Achievements",
    activityLast7: "Activity (Last 7 Days)",
    distribution: "Distribution"
  },
  NL: {
    analytics: "Statistieken",
    visualize: "Visualiseer je voortgang en consistentie.",
    totalCompletions: "Totaal Voltooid",
    consistencyScore: "Consistentie Score",
    currentStreak: "Huidige Streak",
    achievements: "Prestaties",
    activityLast7: "Activiteit (Laatste 7 Dagen)",
    distribution: "Verdeling"
  }
};

export const StatisticsPage: React.FC = () => {
  const { activities, stats, language } = useStore();
  const t = translations[language];

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

  const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#EAB308'];

  return (
    <div className="pb-24 animate-in fade-in duration-700">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2">{t.analytics}</h1>
      <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">{t.visualize}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: t.totalCompletions, value: activities.length, icon: <CheckCircle className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-emerald-50' },
          { label: t.consistencyScore, value: '84%', icon: <Activity className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-blue-50' },
          { label: t.currentStreak, value: stats.streak, icon: <TrendingUp className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-orange-50' },
          { label: t.achievements, value: '12', icon: <Award className="text-indigo-500 w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-indigo-50' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">{t.activityLast7}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
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
            <ResponsiveContainer width="100%" height="100%">
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
