import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import BackButton from './components/BackButton';
import FirstAid from './components/FirstAid';
import HealthHistory from './components/HealthHistory';
import HealthAnalytics from './components/HealthAnalytics';
import RealTimeMonitoring from './components/RealTimeMonitoring';
import HealthRiskPrediction from './components/HealthRiskPrediction';

type PageType = 'home' | 'first-aid' | 'monitoring' | 'history' | 'analytics' | 'risk-prediction';

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle navigation based on current pathname
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('first-aid')) {
      setCurrentPage('first-aid');
    } else if (pathname.includes('monitoring')) {
      setCurrentPage('monitoring');
    } else if (pathname.includes('history')) {
      setCurrentPage('history');
    } else if (pathname.includes('analytics')) {
      setCurrentPage('analytics');
    } else if (pathname.includes('risk-prediction')) {
      setCurrentPage('risk-prediction');
    } else {
      setCurrentPage('home');
    }
  }, []);

  // Render appropriate page based on currentPage
  switch (currentPage) {
    case 'first-aid':
      return <FirstAid />;
    case 'history':
      return <HealthHistory />;
    case 'analytics':
      return <HealthAnalytics />;
    case 'monitoring':
      return <RealTimeMonitoring />;
    case 'risk-prediction':
      return <HealthRiskPrediction />;
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <Navbar scrollY={scrollY} />
          <Hero scrollY={scrollY} />
          <Features scrollY={scrollY} />
          <Footer />
          <BackButton />
        </div>
      );
  }
}

export default App;
