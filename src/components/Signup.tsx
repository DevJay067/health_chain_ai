import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, UserPlus } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import InteractiveBackground from './InteractiveBackground';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Helper: race a Firestore promise against a timeout
const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))
  ]);

interface SignupProps {
  onBack: () => void;
  onSignupSuccess: (user: any) => void;
  onGoToLogin: () => void;
}

export default function Signup({ onBack, onSignupSuccess, onGoToLogin }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Build user data object
      const assignedRole = role === 'doctor' ? 'doctor' : 'patient';
      const status = assignedRole === 'doctor' ? 'pending' : 'approved';

      const userData = {
        id: user.uid,
        name,
        email,
        role: assignedRole,
        status,
        createdAt: new Date().toISOString()
      };

      // 3. Trigger success IMMEDIATELY (don't wait for Firestore)
      onSignupSuccess(userData);

      // 4. Write to Firestore in background (fire-and-forget)
      setDoc(doc(db, 'users', user.uid), userData).catch(err => {
        console.warn('Firestore write failed (offline?), user still logged in:', err);
      });

    } catch (err: any) {
      if (err.message?.includes('offline') || err.code === 'unavailable') {
         console.warn("Firestore offline, bypassing setDoc");
         const assignedRole = role === 'doctor' ? 'doctor' : 'patient';
         const status = assignedRole === 'doctor' ? 'pending' : 'approved';
         onSignupSuccess({
            id: auth.currentUser?.uid || 'offline-id',
            name,
            email,
            role: assignedRole,
            status,
            isOfflineFallback: true
         });
      } else {
         console.error(err);
         if (err.code === 'auth/email-already-in-use') {
           setError('An account with this email already exists.');
         } else if (err.code === 'auth/weak-password') {
           setError('Password is too weak.');
         } else {
           setError(err.message || 'Signup failed');
         }
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

      // Fetch profile with 3-second timeout
      const userDocSnap = await withTimeout(
        getDoc(doc(db, 'users', user.uid)),
        3000,
        null as any
      );

      if (userDocSnap && userDocSnap.exists()) {
        onSignupSuccess(userDocSnap.data());
      } else {
        // Timed out or new user — log in immediately, write profile in background
        const userData = {
          id: user.uid,
          name: user.displayName || 'Google User',
          email: user.email,
          role: 'patient',
          status: 'approved',
          photoURL: user.photoURL,
          createdAt: new Date().toISOString()
        };
        onSignupSuccess(userData);
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
          <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Create <span className="italic font-light">Account.</span></h2>
          <p className="text-slate-500 mt-2">Join HealthChain and take control of your data.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'patient' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'doctor' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Doctor
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all placeholder:text-slate-400"
                placeholder="Jane Doe"
              />
            </div>
          </div>
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
            className="w-full bg-lime-500 text-white rounded-xl py-3.5 font-bold shadow-[0_4px_14px_0_rgb(132,204,22,0.39)] hover:bg-lime-600 hover:shadow-[0_6px_20px_rgba(132,204,22,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign Up</span>
                <UserPlus className="w-4 h-4" />
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
          Already have an account?{' '}
          <button onClick={onGoToLogin} className="text-slate-900 font-bold hover:underline transition-all">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
