import { useState } from 'react';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import InteractiveBackground from './InteractiveBackground';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';

// Helper: race a Firestore promise against a timeout
const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))
  ]);

interface LoginProps {
  onBack: () => void;
  onLoginSuccess: (user: any) => void;
  onGoToSignup: () => void;
}

export default function Login({ onBack, onLoginSuccess, onGoToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Authenticate with Firebase Auth (fast)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch Firestore profile with a 3-second timeout
      const ADMIN_EMAILS = ['admin@healthchain.ai', 'jaymagar310@gmail.com'];
      const isAdmin = ADMIN_EMAILS.includes(email);

      const userDocSnap = await withTimeout(
        getDoc(doc(db, 'users', user.uid)),
        3000,
        null as any
      );

      if (userDocSnap && userDocSnap.exists()) {
        const data = userDocSnap.data();
        onLoginSuccess(isAdmin ? { ...data, role: 'admin', status: 'approved' } : data);
      } else {
        // Timeout or no doc: log in using Firebase Auth data directly
        onLoginSuccess({
          id: user.uid,
          name: user.displayName || email.split('@')[0],
          email: email,
          role: isAdmin ? 'admin' : 'patient',
          status: 'approved',
          isOfflineFallback: !userDocSnap
        });
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.message?.includes('offline') || err.code === 'unavailable') {
        // Offline: log in using whatever auth state we have
        const curUser = auth.currentUser;
        if (curUser) {
          onLoginSuccess({ id: curUser.uid, name: curUser.displayName || 'User', email, role: 'patient', status: 'approved', isOfflineFallback: true });
        } else {
          setError('You appear to be offline. Please check your internet connection.');
        }
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const ADMIN_EMAILS = ['admin@healthchain.ai', 'jaymagar310@gmail.com'];
      const isAdmin = ADMIN_EMAILS.includes(user.email || '');

      // Fetch Firestore profile with 3-second timeout
      const userDocSnap = await withTimeout(
        getDoc(doc(db, 'users', user.uid)),
        3000,
        null as any
      );

      if (userDocSnap && userDocSnap.exists()) {
        const data = userDocSnap.data();
        onLoginSuccess(isAdmin ? { ...data, role: 'admin', status: 'approved' } : data);
      } else {
        // No doc or timed out — create patient profile in background, log in immediately
        const userData = {
          id: user.uid,
          name: user.displayName || 'Google User',
          email: user.email,
          role: isAdmin ? 'admin' : 'patient',
          status: 'approved',
          photoURL: user.photoURL,
          createdAt: new Date().toISOString()
        };
        onLoginSuccess(userData);
        // Write to Firestore in background
        setDoc(doc(db, 'users', user.uid), userData).catch(console.warn);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans selection:bg-lime-200 relative flex items-center justify-center p-4">
      <InteractiveBackground />
      
      <div className="relative z-10 w-full max-w-md bg-white/60 backdrop-blur-3xl p-8 rounded-[2rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.06)] animate-fade-in">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors text-sm font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex justify-center mb-6">
          <AnimatedLogo />
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Welcome <span className="italic font-light">Back.</span></h2>
          <p className="text-slate-500 mt-2">Sign in to access your secure health portal.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all placeholder:text-slate-400"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center my-6">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 rounded-xl py-3.5 font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="text-center text-slate-500 text-sm mt-8">
          Don't have an account?{' '}
          <button onClick={onGoToSignup} className="text-lime-600 font-bold hover:underline transition-all">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
