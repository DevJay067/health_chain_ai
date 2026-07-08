import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, UserPlus } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import InteractiveBackground from './InteractiveBackground';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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

      // 2. Set user role and details in Firestore
      const assignedRole = role === 'doctor' ? 'doctor' : 'patient';
      const status = assignedRole === 'doctor' ? 'pending' : 'approved'; // Doctors need admin approval

      const userData = {
        id: user.uid,
        name,
        email,
        role: assignedRole,
        status,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      // 3. Trigger success
      onSignupSuccess(userData);
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
