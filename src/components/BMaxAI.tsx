import { ArrowLeft, Brain, ExternalLink } from 'lucide-react';

export default function BMaxAI() {
  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('navigate'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-violet-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 px-4 py-2 text-violet-700 hover:text-violet-900 bg-violet-100 hover:bg-violet-200 rounded-full transition-all duration-300 font-medium"
              data-testid="bmax-back-button"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">B-Max AI</h1>
                <p className="text-sm text-slate-500">Health Assistant</p>
              </div>
            </div>

            <a
              href="https://www.jotform.com/app/253583637449470"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-all duration-300 font-medium text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </a>
          </div>
        </div>
      </div>

      {/* Main Content - JotForm Iframe */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Card */}
        <div className="mb-6 p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg flex-shrink-0">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">B-Max AI Health Assistant</h2>
              <p className="text-slate-600">
                Complete your health profile below to receive personalized AI-powered health insights and recommendations. 
                Your data is securely processed to provide accurate health assessments.
              </p>
            </div>
          </div>
        </div>

        {/* JotForm Iframe Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-violet-100">
          <iframe
            src="https://www.jotform.com/app/253583637449470"
            title="B-Max AI Health Form"
            className="w-full border-0"
            style={{ minHeight: '800px', height: 'calc(100vh - 280px)' }}
            allow="accelerometer; autoplay; camera; clipboard-write; encrypted-media; gyroscope; microphone; payment"
            loading="lazy"
          />
        </div>

        {/* Bottom Back Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-semibold shadow-lg shadow-violet-300/50 hover:shadow-violet-400/60 transition-all duration-300 hover:scale-105"
            data-testid="bmax-back-button-bottom"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Health Chain AI Home
          </button>
        </div>
      </div>
    </div>
  );
}
