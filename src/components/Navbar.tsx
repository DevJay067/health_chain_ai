import { Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  scrollY: number;
}

export default function Navbar({ scrollY }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = scrollY > 20;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed left-4 right-4 z-50 transition-all duration-500 ${
        isScrolled ? 'top-2' : 'top-6'
      }`}
    >
      <div
        className={`mx-auto max-w-7xl glass-panel rounded-[2rem] transition-all duration-500 ${
          isScrolled ? 'py-3 bg-white/70 shadow-2xl shadow-blue-900/10' : 'py-4 bg-white/40 shadow-lg'
        }`}
        style={{
          boxShadow: isScrolled ? '0 10px 40px -10px rgba(31, 38, 135, 0.15), inset 0 1px 2px 0 rgba(255, 255, 255, 0.9)' : '0 8px 32px 0 rgba(31, 38, 135, 0.05), inset 0 1px 2px 0 rgba(255, 255, 255, 0.6)',
        }}
      >
        <div className="px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
                HealthChain
              </h1>
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mt-0.5">Blockchain Security</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {['Home', 'Features', 'About'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="relative px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors group"
              >
                {item}
                <span className="absolute inset-x-4 bottom-1 h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </a>
            ))}
            <div className="pl-4 ml-2 border-l border-slate-200">
              <button
                onClick={() => window.location.replace('https://www.jotform.com/app/253583637449470')}
                className="group relative px-6 py-2.5 bg-slate-900 text-white rounded-full font-semibold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/40 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Get Started</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-6 py-4 mt-2 border-t border-slate-200/50 flex flex-col space-y-3">
                {['Home', 'Features', 'About'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`} 
                    className="px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    {item}
                  </a>
                ))}
                <button
                  onClick={() => window.location.replace('https://www.jotform.com/app/253583637449470')}
                  className="mt-4 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 text-center">
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
