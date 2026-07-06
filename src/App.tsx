import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { Smartphone } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
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

      {/* Mobile Preview Button */}
      <button 
        onClick={() => window.open(window.location.href, 'MobilePreview', 'width=390,height=844,resizable=no')}
        className="fixed bottom-6 left-6 z-[9999] bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all flex items-center space-x-2 group border border-slate-700/50 hover:scale-105"
      >
        <Smartphone className="w-5 h-5" />
        <span className="hidden group-hover:inline font-bold text-sm whitespace-nowrap">
          Mobile Preview
        </span>
      </button>
    </div>
  );
}

export default App;
