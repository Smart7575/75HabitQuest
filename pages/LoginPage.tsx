
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
      googleSignIn: 'Continue with Google',
      googleSignUp: 'Sign up with Google',
      or: 'or',
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
      googleSignIn: 'Inloggen met Google',
      googleSignUp: 'Aanmelden met Google',
      or: 'of',
      alreadyAccount: 'Heb je al een account? Log in',
      noAccount: "Nog geen account? Meld je aan",
      authFailed: 'Authenticatie mislukt.'
    }
  };

  const t = translations[language];

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user profile already exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Initialize user document for first-time Google sign-up
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
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
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed or dismissed the popup
        return;
      }
      if (err.code === 'auth/popup-blocked') {
        setError(language === 'NL' 
          ? 'De Google pop-up werd geblokkeerd door je browser. Sta pop-ups toe en probeer het opnieuw.' 
          : 'The Google popup was blocked by your browser. Please allow popups and try again.');
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        setError(language === 'NL'
          ? `Dit domein (${currentDomain}) is nog niet toegevoegd aan "Authorized domains" in de Firebase Console (Authentication > Settings > Authorized domains). Voeg dit domein toe om Google Sign-in toe te staan.`
          : `This domain (${currentDomain}) is not authorized in the Firebase Console (Authentication > Settings > Authorized domains). Please add this domain to allow Google Sign-in.`);
        return;
      }
      setError(err.message || t.authFailed);
    } finally {
      setLoading(false);
    }
  };

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
          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="line-clamp-2">{error}</p>
            </div>
          )}

          {/* Google Sign-in / Sign-up Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSignUp ? t.googleSignUp : t.googleSignIn}</span>
          </button>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-4 text-xs font-bold uppercase text-slate-400">
              {t.or}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
