import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';


type AppState = 'loading' | 'landing' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');

  useEffect(() => {
    // Simulate asset loading for the pre-loader
    const timer = setTimeout(() => {
      setAppState('landing');
    }, 2500); // Wait 2.5 seconds before transitioning

    return () => clearTimeout(timer);
  }, []);

  const handleStartJourney = () => {
    // Scroll to top immediately to ensure smooth transition
    window.scrollTo(0, 0);
    setAppState('dashboard');
  };

  return (
    <div className="min-h-screen bg-white max-w-[100vw] overflow-x-clip">
      <AnimatePresence mode="wait">
        {appState === 'loading' && (
          <Preloader key="preloader" />
        )}
      </AnimatePresence>

      {/* Render Landing Page only if we're in landing state */}
      {appState === 'landing' && (
        <LandingPage onStartJourney={handleStartJourney} />
      )}

      {/* Render Dashboard only if we're in dashboard state */}
      {appState === 'dashboard' && (
        <Dashboard onBackToHome={() => setAppState('landing')} />
      )}


    </div>
  );
}

export default App;
