
import React from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Gift, BarChart2, Settings, LogOut, Shield, Zap, Target, User as UserIcon } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { RewardsPage } from './pages/RewardsPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { useStore } from './store/useStore';

const translations = {
  EN: {
    heroProfile: "Hero Profile",
    preferences: "Preferences",
    gamifiedAudio: "Gamified Audio",
    sfxOnTask: "SFX on task completion",
    dailyReminders: "Daily Reminders",
    pushNotifications: "Push notifications",
    level: "Level",
    streak: "Streak",
    totalXP: "Total XP",
    dashboard: "Dashboard",
    missions: "Missions",
    treasure: "Treasure",
    analytics: "Analytics",
    settings: "Settings",
    logout: "Logout",
    hero: "Hero",
    dayStreak: "Day Streak"
  },
  NL: {
    heroProfile: "Hero Profiel",
    preferences: "Voorkeuren",
    gamifiedAudio: "Gegamificeerde Audio",
    sfxOnTask: "SFX bij voltooiing taak",
    dailyReminders: "Dagelijkse Herinneringen",
    pushNotifications: "Push notificaties",
    level: "Niveau",
    streak: "Streak",
    totalXP: "Totaal XP",
    dashboard: "Dashboard",
    missions: "Missies",
    treasure: "Schatkist",
    analytics: "Statistieken",
    settings: "Instellingen",
    logout: "Uitloggen",
    hero: "Held",
    dayStreak: "Dagen Streak"
  }
};

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { stats, language } = useStore();
  const t = translations[language];

  const getTitle = (level: number) => {
    if (language === 'EN') {
      if (level < 5) return 'Quest Novice';
      if (level < 10) return 'Habit Warrior';
      if (level < 20) return 'Consistency Knight';
      return 'Quest Master';
    } else {
      if (level < 5) return 'Quest Groentje';
      if (level < 10) return 'Habit Krijger';
      if (level < 20) return 'Consistentie Ridder';
      return 'Quest Meester';
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black text-slate-800 mb-8 rpg-font">{t.heroProfile}</h1>
      
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex flex-col items-center text-white">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl font-black mb-4 border border-white/30 animate-float">
            {user?.email?.[0].toUpperCase()}
          </div>
          <h2 className="text-2xl font-black">{user?.email?.split('@')[0]}</h2>
          <div className="flex items-center gap-2 mt-2 bg-white/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md">
            <Shield className="w-3 h-3" /> {getTitle(stats.level)}
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.level}</p>
            <p className="text-2xl font-black text-slate-800">{stats.level}</p>
          </div>
          <div className="border-x border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.streak}</p>
            <p className="text-2xl font-black text-blue-600">{stats.streak}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.totalXP}</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalPoints}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 ml-4 rpg-font">{t.preferences}</h3>
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-bold text-slate-800 text-sm">{t.gamifiedAudio}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{t.sfxOnTask}</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
               <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-bold text-slate-800 text-sm">{t.dailyReminders}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{t.pushNotifications}</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-slate-200 rounded-full relative">
               <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { stats, language } = useStore();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <nav className="fixed bottom-0 left-0 w-full md:relative md:w-64 md:h-screen bg-white border-t md:border-t-0 md:border-r border-slate-100 z-50">
        <div className="flex flex-row md:flex-col h-full px-2 md:px-4 py-3 md:py-8 justify-between md:justify-start gap-1 md:gap-4">
          {/* Logo Section */}
          <div className="hidden md:flex flex-col gap-6 px-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-100">
                H
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight rpg-font">HabitQuest</h1>
            </div>
            
            {/* User Identity Display */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 truncate">{user?.email?.split('@')[0]}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Lvl {stats.level} {t.hero}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-500 uppercase">
                <Zap className="w-3 h-3 fill-orange-500" /> {stats.streak} {t.dayStreak}
              </div>
            </div>
          </div>

          <NavLink 
            to="/" 
            className={({isActive}) => `flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl transition-all ${isActive ? 'bg-blue-50 text-blue-600 font-black shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] md:text-sm">{t.dashboard}</span>
          </NavLink>

          <NavLink 
            to="/tasks" 
            className={({isActive}) => `flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl transition-all ${isActive ? 'bg-blue-50 text-blue-600 font-black shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <CheckSquare className="w-6 h-6" />
            <span className="text-[10px] md:text-sm">{t.missions}</span>
          </NavLink>

          <NavLink 
            to="/rewards" 
            className={({isActive}) => `flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-600 font-black shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Gift className="w-6 h-6" />
            <span className="text-[10px] md:text-sm">{t.treasure}</span>
          </NavLink>

          <NavLink 
            to="/stats" 
            className={({isActive}) => `flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl transition-all ${isActive ? 'bg-blue-50 text-blue-600 font-black shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <BarChart2 className="w-6 h-6" />
            <span className="text-[10px] md:text-sm">{t.analytics}</span>
          </NavLink>

          <div className="md:mt-auto space-y-2 pb-2 md:pb-0">
             {/* Mobile User Profile indicator - compact */}
             <div className="md:hidden flex flex-col items-center justify-center px-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="text-[8px] font-bold text-slate-500 mt-1 truncate max-w-[40px]">{user?.email?.split('@')[0]}</span>
             </div>

             <NavLink 
              to="/settings" 
              className={({isActive}) => `flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl transition-all ${isActive ? 'bg-slate-100 text-slate-800 font-black' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <Settings className="w-6 h-6" />
              <span className="text-[10px] md:text-sm">{t.settings}</span>
            </NavLink>
            <button 
              onClick={logout}
              className="w-full flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-bold"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-[10px] md:text-sm">{t.logout}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPageWrapper />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><StatisticsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

const LoginPageWrapper = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <LoginPage />;
};

export default App;
