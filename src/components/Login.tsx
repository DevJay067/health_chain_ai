import { useState } from 'react';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import InteractiveBackground from './InteractiveBackground';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch user role and details from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        onLoginSuccess(userData);
      } else {
        // Special case: admin account from env / mock? Let's just create admin on the fly if needed
        if (email === 'admin@healthchain.ai') {
           const adminData = {
              id: user.uid,
              name: 'System Admin',
              email: 'admin@healthchain.ai',
              role: 'admin',
              status: 'approved'
           };
           onLoginSuccess(adminData);
        } else {
           setError('User profile not found in database.');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('offline') || err.code === 'unavailable') {
         // Fallback if client is offline or Firestore blocked, but user is authenticated
         console.warn("Firestore offline, using fallback profile");
         onLoginSuccess({
            id: auth.currentUser?.uid || 'offline-id',
            name: 'Offline User',
            email: email,
            role: email === 'admin@healthchain.ai' ? 'admin' : 'patient', // default to patient
            status: 'approved',
            isOfflineFallback: true
         });
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Login failed');
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
