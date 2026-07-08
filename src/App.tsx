import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Clock, LogOut } from 'lucide-react';
import LandingPage from './components/LandingPage';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Signup from './components/Signup';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Guest user object — gets the full PatientDashboard in read-only mode
const GUEST_USER = { id: 'guest', name: 'Guest', email: '', role: 'patient', status: 'approved', isGuest: true };

// Hardcoded admin emails — always get admin role regardless of Firestore doc
const ADMIN_EMAILS = ['admin@healthchain.ai', 'jaymagar310@gmail.com'];

type AppState = 'landing' | 'login' | 'signup' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState<any>(GUEST_USER);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check if Firebase has a cached session — resolve instantly from localStorage
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
          if (userDoc.exists()) {
            // Override role if this is a hardcoded admin email
            const data = userDoc.data();
            setUser(isAdmin ? { ...data, role: 'admin', status: 'approved' } : data);
          } else if (isAdmin) {
            setUser({ id: firebaseUser.uid, name: firebaseUser.displayName || 'Admin', email: firebaseUser.email, role: 'admin', status: 'approved' });
          } else {
            // Google user with no Firestore doc yet
            setUser({ id: firebaseUser.uid, name: firebaseUser.displayName || 'User', email: firebaseUser.email, role: 'patient', status: 'approved' });
          }
        } catch {
          // Offline/blocked Firestore — use Firebase Auth data directly
          const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            role: isAdmin ? 'admin' : 'patient',
            status: 'approved',
            isOfflineFallback: true
          });
        }
      } else {
        // No session: put in guest mode, stay on landing or dashboard depending on current state
        setUser(GUEST_USER);
      }
      setAuthChecked(true);
    });

    return () => { isMounted = false; unsubscribe(); };
  }, []);

  const handleStartJourney = () => {
    window.scrollTo(0, 0);
    setAppState('signup');
  };

  const handleAuthSuccess = (userData: any) => {
    // Always enforce admin role for hardcoded admin emails, regardless of what Firestore says
    const finalUser = ADMIN_EMAILS.includes(userData.email)
      ? { ...userData, role: 'admin', status: 'approved' }
      : userData;
    setUser(finalUser);
    window.scrollTo(0, 0);
    setAppState('dashboard');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(GUEST_USER);
    setAppState('landing');
  };

  // Guest enters dashboard directly without logging in
  const handleGuestEnter = () => {
    setUser(GUEST_USER);
    setAppState('dashboard');
  };

  return (
    <div className="min-h-screen bg-white max-w-[100vw] overflow-x-clip">
      {appState === 'landing' && (
        <LandingPage
          onStartJourney={handleStartJourney}
          onGuestEnter={handleGuestEnter}
        />
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
          {(user.role === 'patient' || user.isGuest) && (
            <PatientDashboard
              user={user}
              onLogout={handleLogout}
              onNeedLogin={() => setAppState('login')}
              onNeedSignup={() => setAppState('signup')}
            />
          )}

          {user.role === 'admin' && <AdminDashboard user={user} onLogout={handleLogout} />}

          {user.role === 'doctor' && user.status === 'pending' && (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 max-w-md text-center">
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Pending Approval</h1>
                <p className="text-slate-500 mb-8">Your doctor account is pending admin verification.</p>
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
