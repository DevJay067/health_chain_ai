import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Clock, LogOut } from 'lucide-react';
import Preloader from './components/Preloader';
import LandingPage from './components/LandingPage';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Signup from './components/Signup';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type AppState = 'loading' | 'landing' | 'login' | 'signup' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Hard fallback: If Firebase doesn't respond in 3 seconds, force to landing
    const fallbackTimeout = setTimeout(() => {
      if (isMounted && appState === 'loading') {
        console.warn("Firebase Auth timed out, forcing to landing page");
        setAppState('landing');
      }
    }, 3000);

    // We can show the preloader while checking auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(fallbackTimeout);
      if (!isMounted) return;
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
             setUser(userDoc.data());
             setAppState('dashboard');
          } else {
             // Admin hardcoded mock fallback if needed, or just handle missing doc
             if (firebaseUser.email === 'admin@healthchain.ai') {
                 setUser({
                   id: firebaseUser.uid,
                   name: 'System Admin',
                   email: 'admin@healthchain.ai',
                   role: 'admin',
                   status: 'approved'
                 });
                 setAppState('dashboard');
             } else {
                 setUser(null);
                 setAppState('landing');
             }
          }
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          // Fallback if client is offline or Firestore blocked, but user is authenticated
          if (error.message?.includes('offline') || error.code === 'unavailable') {
              setUser({
                 id: firebaseUser.uid,
                 name: firebaseUser.displayName || 'Offline User',
                 email: firebaseUser.email,
                 role: firebaseUser.email === 'admin@healthchain.ai' ? 'admin' : 'patient', // default to patient
                 status: 'approved',
                 isOfflineFallback: true
              });
              setAppState('dashboard');
          } else {
              setUser(null);
              setAppState('landing');
          }
        }
      } else {
        setUser(null);
        setAppState('landing');
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      unsubscribe();
    };
  }, []);

  const handleStartJourney = () => {
    window.scrollTo(0, 0);
    setAppState('signup');
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    window.scrollTo(0, 0);
    setAppState('dashboard');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setAppState('landing');
  };

  return (
    <div className="min-h-screen bg-white max-w-[100vw] overflow-x-clip">
      <AnimatePresence mode="wait">
        {appState === 'loading' && (
          <Preloader key="preloader" />
        )}
      </AnimatePresence>

      {appState === 'landing' && (
        <LandingPage onStartJourney={handleStartJourney} />
      )}

      {appState === 'login' && (
        <Login 
          onBack={() => setAppState('landing')} 
          onLoginSuccess={handleAuthSuccess}
          onGoToSignup={() => setAppState('signup')}
        />
      )}

      {appState === 'signup' && (
        <Signup 
          onBack={() => setAppState('landing')} 
          onSignupSuccess={handleAuthSuccess}
          onGoToLogin={() => setAppState('login')}
        />
      )}

      {appState === 'dashboard' && user && (
        <>
          {user.role === 'admin' && <AdminDashboard user={user} onLogout={handleLogout} />}
          {user.role === 'patient' && <PatientDashboard user={user} onLogout={handleLogout} />}
          
          {user.role === 'doctor' && user.status === 'pending' && (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 max-w-md text-center">
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Pending Approval</h1>
                <p className="text-slate-500 mb-8">Your doctor account is currently pending admin verification. You will gain access once approved.</p>
                <button onClick={handleLogout} className="flex items-center justify-center space-x-2 bg-slate-900 text-white w-full py-3 rounded-xl font-bold">
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
          
          {user.role === 'doctor' && user.status === 'approved' && <DoctorDashboard user={user} onLogout={handleLogout} />}
        </>
      )}
    </div>
  );
}

export default App;
