import React, { useState } from 'react';
import { 
  Shield, 
  Globe, 
  Zap, 
  Target, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  Lock, 
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useStore } from '../store/useStore';
import { deleteUserAccountAndData } from '../utils/accountDeletion';
import { playTaskCompleteSound } from '../utils/audio';

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
    languageLabel: "Language",
    chooseLanguage: "Choose thy language",
    dangerZone: "Danger Zone",
    deleteAccount: "Delete Account",
    deleteAccountDesc: "Permanently delete your account and all associated Firestore data.",
    deleteAccountButton: "Delete My Account",
    modalTitle: "Permanently delete account?",
    modalSubtitle: "This action is irreversible. All of your data will be wiped permanently:",
    itemTasks: "All tasks, schedules, and active missions",
    itemHistory: "All completion history, daily streaks, and XP points",
    itemRewards: "All created rewards and custom categories",
    itemAuth: "Your Firebase authentication credentials and profile",
    passwordLabel: "Current Password",
    passwordPlaceholder: "Enter your password to verify",
    googleNotice: "Your account is linked to Google. A secure Google prompt will confirm your identity before wiping data.",
    typePrompt: 'Type "DELETE" to confirm:',
    confirmationWord: "DELETE",
    cancel: "Cancel",
    confirmDelete: "Permanently Delete",
    deleting: "Deleting data and account...",
    wrongPassword: "The password you entered is incorrect.",
    authCancelled: "Identity verification was cancelled. Account was not deleted.",
    deleteFailed: "Failed to delete account. Please try again."
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
    languageLabel: "Taal",
    chooseLanguage: "Kies uw taal",
    dangerZone: "Gevarenzone",
    deleteAccount: "Account Verwijderen",
    deleteAccountDesc: "Verwijder permanent je account en alle bijbehorende Firestore-gegevens.",
    deleteAccountButton: "Mijn Account Verwijderen",
    modalTitle: "Account definitief verwijderen?",
    modalSubtitle: "Deze actie kan niet ongedaan worden gemaakt. Al je gegevens worden direct gewist:",
    itemTasks: "Alle taken, missies en herhalingsschema's",
    itemHistory: "Alle voltooiingsgeschiedenis, dagelijkse streaks en XP-punten",
    itemRewards: "Alle schatkistbeloningen en eigen categorieën",
    itemAuth: "Je Firebase authenticatie-account en inloggegevens",
    passwordLabel: "Huidig Wachtwoord",
    passwordPlaceholder: "Voer je wachtwoord in ter verificatie",
    googleNotice: "Je account is gekoppeld aan Google. Er opent een Google-beveiligingsvenster om je identiteit te bevestigen.",
    typePrompt: 'Typ "VERWIJDER" om te bevestigen:',
    confirmationWord: "VERWIJDER",
    cancel: "Annuleren",
    confirmDelete: "Definitief Verwijderen",
    deleting: "Gegevens en account worden verwijderd...",
    wrongPassword: "Het ingevoerde wachtwoord is onjuist.",
    authCancelled: "Verificatie geannuleerd. Je account is niet verwijderd.",
    deleteFailed: "Verwijderen van account is mislukt. Probeer het opnieuw."
  }
};

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { stats, language, setLanguage, audioEnabled, setAudioEnabled } = useStore();
  const t = translations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');
  const isPasswordUser = user?.providerData.some(p => p.providerId === 'password');

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

  const handleOpenModal = () => {
    setConfirmInput('');
    setPassword('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (loading) return;
    setIsModalOpen(false);
    setError(null);
  };

  const isConfirmationValid = 
    confirmInput.trim().toUpperCase() === t.confirmationWord && 
    (!isPasswordUser || password.length > 0);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isConfirmationValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      await deleteUserAccountAndData(user, password);
      // Upon successful deletion, Firebase onAuthStateChanged fires and sets user to null,
      // which automatically navigates back to /login via AppRoutes.
    } catch (err: any) {
      console.error("Account deletion error:", err);
      if (err.message === 'REAUTH_CANCELLED') {
        setError(t.authCancelled);
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(t.wrongPassword);
      } else if (err.code === 'auth/requires-recent-login') {
        setError(language === 'NL' 
          ? 'Log opnieuw in en voer de verwijdering daarna nogmaals uit.' 
          : 'Please log in again and retry account deletion.');
      } else {
        setError(err.message || t.deleteFailed);
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <h1 className="text-3xl font-black text-slate-800 mb-8 rpg-font">{t.heroProfile}</h1>
      
      {/* Hero Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex flex-col items-center text-white">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'Avatar'} 
              className="w-24 h-24 rounded-3xl object-cover mb-4 border-2 border-white/30 shadow-lg animate-float"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl font-black mb-4 border border-white/30 animate-float">
              {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <h2 className="text-2xl font-black">
            {user?.displayName || user?.email?.split('@')[0]}
          </h2>
          <p className="text-xs text-blue-100 mt-0.5">{user?.email}</p>
          <div className="flex items-center gap-2 mt-3 bg-white/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md">
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

      {/* Preferences Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-black text-slate-800 ml-4 rpg-font">{t.preferences}</h3>
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-bold text-slate-800 text-sm">{t.languageLabel}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{t.chooseLanguage}</p>
              </div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setLanguage('EN')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'EN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ENG
              </button>
              <button 
                onClick={() => setLanguage('NL')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'NL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                NL
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Zap className={`w-5 h-5 transition-colors ${audioEnabled ? 'text-amber-500' : 'text-slate-400'}`} />
              <div>
                <p className="font-bold text-slate-800 text-sm">{t.gamifiedAudio}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{t.sfxOnTask}</p>
              </div>
            </div>
            <button
              type="button"
              id="toggle-gamified-audio"
              onClick={() => {
                const next = !audioEnabled;
                setAudioEnabled(next);
                if (next) {
                  playTaskCompleteSound();
                }
              }}
              aria-label={t.gamifiedAudio}
              className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none cursor-pointer ${
                audioEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  audioEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
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

      {/* Danger Zone: Account Deletion */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-rose-600 ml-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          {t.dangerZone}
        </h3>
        <div className="bg-rose-50/50 rounded-3xl border border-rose-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-800 text-base">{t.deleteAccount}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                {t.deleteAccountDesc}
              </p>
            </div>
            <button
              onClick={handleOpenModal}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.deleteAccountButton}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in slide-in-from-bottom-4 duration-300">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              disabled={loading}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <h4 className="text-xl font-black text-slate-800">{t.modalTitle}</h4>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {t.modalSubtitle}
            </p>

            {/* List of deleted items */}
            <ul className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>{t.itemTasks}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>{t.itemHistory}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>{t.itemRewards}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>{t.itemAuth}</span>
              </li>
            </ul>

            {/* Error notice */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="flex-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              {isPasswordUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      disabled={loading}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {isGoogleUser && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800">
                  {t.googleNotice}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.typePrompt}
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={t.confirmationWord}
                  disabled={loading}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black tracking-widest text-slate-800 uppercase focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!isConfirmationValid || loading}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.deleting}</span>
                    </>
                  ) : (
                    <span>{t.confirmDelete}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
