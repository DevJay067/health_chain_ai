import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const handleBackHome = () => {
    const homeURL = window.location.origin;
    window.location.href = homeURL;
  };

  return (
    <button
      onClick={handleBackHome}
      className="fixed bottom-6 right-6 z-40 p-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/60 transition-all duration-300 hover:scale-110"
      title="Back to HealthChain Home"
      aria-label="Back to home"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}
