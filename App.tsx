
import React from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Gift, BarChart2, Settings, LogOut, Zap } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { RewardsPage } from './pages/RewardsPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { useStore } from './store/useStore';

const translations = {
  EN: {
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

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { stats, language } = useStore();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Navigation: fixed bottom bar on mobile/tablet (< md), sidebar on desktop (>= md) */}
      <nav className="fixed bottom-0 left-0 right-0 w-full md:relative md:w-64 md:h-screen bg-white/95 md:bg-white backdrop-blur-md md:backdrop-blur-none border-t md:border-t-0 md:border-r border-slate-200/90 md:border-slate-100 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none">
        
        {/* Desktop Sidebar Layout */}
        <div className="hidden md:flex flex-col h-full px-4 py-8 justify-start gap-3">
          {/* Logo Section */}
          <div className="flex flex-col gap-6 px-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-100">
                H
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight rpg-font">HabitQuest</h1>
            </div>
            
            {/* User Identity Display */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 truncate">
                    {user?.displayName || user?.email?.split('@')[0]}
                  </p>
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
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-blue-50 text-blue-600 font-black shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm">{t.dashboard}</span>
          </NavLink>

          <NavLink 
            to="/tasks" 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-blue-50 text-blue-600 font-black shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-sm">{t.missions}</span>
          </NavLink>

          <NavLink 
            to="/rewards" 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-600 font-black shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Gift className="w-5 h-5" />
            <span className="text-sm">{t.treasure}</span>
          </NavLink>

          <NavLink 
            to="/stats" 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-blue-50 text-blue-600 font-black shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-sm">{t.analytics}</span>
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-slate-100 text-slate-800 font-black' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">{t.settings}</span>
          </NavLink>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-bold"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">{t.logout}</span>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Bottom Bar: 1 clean horizontal row without wrapping */}
        <div className="flex md:hidden items-center justify-between px-1.5 py-1.5 w-full">
          <NavLink 
            to="/" 
            className={({isActive}) => `flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${isActive ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap truncate">{t.dashboard}</span>
          </NavLink>

          <NavLink 
            to="/tasks" 
            className={({isActive}) => `flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${isActive ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap truncate">{t.missions}</span>
          </NavLink>

          <NavLink 
            to="/rewards" 
            className={({isActive}) => `flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${isActive ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Gift className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap truncate">{t.treasure}</span>
          </NavLink>

          <NavLink 
            to="/stats" 
            className={({isActive}) => `flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${isActive ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap truncate">{t.analytics}</span>
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({isActive}) => `flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${isActive ? 'text-slate-800 font-bold bg-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap truncate">{t.settings}</span>
          </NavLink>

          <button 
            onClick={logout}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl text-rose-400 hover:text-rose-600 transition-all"
            title={t.logout}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap truncate">{t.logout}</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto custom-scrollbar min-h-screen">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-28 md:py-12">
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
