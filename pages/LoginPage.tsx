
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [language, setLanguageState] = useState<'EN' | 'NL'>(() => {
    return (localStorage.getItem('habitquest_language') as 'EN' | 'NL') || 'NL';
  });

  const setLanguage = (lang: 'EN' | 'NL') => {
    setLanguageState(lang);
    localStorage.setItem('habitquest_language', lang);
  };

  const translations = {
    EN: {
      signUpDesc: 'Create your character and start the journey.',
      loginDesc: 'Level up your life, one habit at a time.',
      email: 'Email Address',
      password: 'Password',
      createAccount: 'Create Account',
      enterQuest: 'Enter the Quest',
      alreadyAccount: 'Already have an account? Log in',
      noAccount: "Don't have an account? Sign up",
      authFailed: 'Authentication failed.'
    },
    NL: {
      signUpDesc: 'Creëer je personage en begin de reis.',
      loginDesc: 'Verbeter je leven, één gewoonte per keer.',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      createAccount: 'Account aanmaken',
      enterQuest: 'Betreed de Quest',
      alreadyAccount: 'Heb je al een account? Log in',
      noAccount: "Nog geen account? Meld je aan",
      authFailed: 'Authenticatie mislukt.'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Register User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in 'users' collection
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          createdAt: Date.now(),
          streak: 0,
          longestStreak: 0,
          totalPoints: 0,
          level: 1,
          xp: 0,
          nextLevelXp: 500,
          language: language
        });

        // Seed initial categories
        const initialCategories = ['Work', 'Health', 'Personal', 'Household'];
        for (const catName of initialCategories) {
          const catRef = doc(db, 'users', user.uid, 'categories', Math.random().toString(36).substr(2, 9));
          await setDoc(catRef, {
            name: catName,
            createdAt: Date.now()
          });
        }
      } else {
        // Login User
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setLanguage('EN')}
                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${language === 'EN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ENG
              </button>
              <button 
                onClick={() => setLanguage('NL')}
                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${language === 'NL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                NL
              </button>
            </div>
          </div>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white font-black text-4xl shadow-2xl shadow-blue-200 mb-6">
            H
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">HabitQuest</h1>
          <p className="text-slate-500 mt-2">
            {isSignUp ? t.signUpDesc : t.loginDesc}
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="line-clamp-2">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 bg-white placeholder:text-slate-400"
                  placeholder="warrior@habitquest.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 bg-white placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isSignUp ? t.createAccount : t.enterQuest}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 font-bold text-sm hover:underline"
            >
              {isSignUp ? t.alreadyAccount : t.noAccount}
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-xs">
          &copy; 2024 HabitQuest. All rights reserved.
        </p>
      </div>
    </div>
  );
};
