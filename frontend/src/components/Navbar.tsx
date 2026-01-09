import { Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  scrollY: number;
}

export default function Navbar({ scrollY }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = scrollY > 50;

  return (
    <nav
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 ${
        isScrolled ? 'top-2' : 'top-4'
      }`}
    >
      <div
        className={`mx-auto max-w-7xl backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl shadow-2xl shadow-blue-200/20 transition-all duration-500 ${
          isScrolled ? 'py-3' : 'py-4'
        }`}
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 2px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-300/50">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                HealthChain
              </h1>
              <p className="text-xs text-slate-500 font-medium">Blockchain Healthcare</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </a>
            <a href="#features" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
              Features
            </a>
            <a href="#about" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
              About
            </a>
            <button
              onClick={() => window.location.replace('https://www.jotform.com/app/253583637449470')}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full font-medium shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/60 transition-all duration-300 hover:scale-105">
              Get Started
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl bg-white/60 backdrop-blur-sm"
          >
            {isOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 px-6 pb-4 border-t border-white/40 pt-4">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </a>
              <a href="#features" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Features
              </a>
              <a href="#about" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                About
              </a>
              <button
                onClick={() => window.location.replace('https://www.jotform.com/app/253583637449470')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full font-medium shadow-lg shadow-blue-300/50">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
