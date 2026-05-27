
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useStore } from '../store/useStore';
// Fix: Use named imports from date-fns for better reliability
// Fix: Use addDays with negative value instead of missing subDays export
import { format, isSameDay, addDays } from 'date-fns';
import { TrendingUp, CheckCircle, Activity, Award } from 'lucide-react';
import { getDateKey } from '../utils/helpers';

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
      // Fix: Use addDays(..., -i) instead of subDays
      const date = addDays(new Date(), -i);
      const dayName = format(date, 'EEE', { locale: language === 'NL' ? undefined : undefined }); // date-fns locale could be added if needed
      const targetDateKey = getDateKey(date);
      const count = activities.filter(c => c.dateKey === targetDateKey).length;
      data.push({ name: dayName, count });
    }
    return data;
  }, [activities, language]);

  const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#EAB308'];

  return (
    <div className="pb-24 animate-in fade-in duration-700">
      <h1 className="text-3xl font-black text-gray-800 mb-2">{t.analytics}</h1>
      <p className="text-gray-500 mb-8">{t.visualize}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t.totalCompletions, value: activities.length, icon: <CheckCircle className="text-emerald-500" />, bg: 'bg-emerald-50' },
          { label: t.consistencyScore, value: '84%', icon: <Activity className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: t.currentStreak, value: stats.streak, icon: <TrendingUp className="text-orange-500" />, bg: 'bg-orange-50' },
          { label: t.achievements, value: '12', icon: <Award className="text-indigo-500" />, bg: 'bg-indigo-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-2xl font-black text-gray-800">{item.value}</p>
            </div>
            <div className={`${item.bg} p-3 rounded-xl`}>{item.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">{t.activityLast7}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">{t.distribution}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
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
