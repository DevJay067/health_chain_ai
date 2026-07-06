import { Sparkles, Lock, Zap, Infinity } from 'lucide-react';
import { motion } from 'framer-motion';
import DNABackground from './DNABackground';

interface HeroProps {
  scrollY: number;
}

export default function Hero({ scrollY }: HeroProps) {
  const opacity = Math.max(1 - scrollY / 900, 0);
  const translateY = scrollY * 0.4;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-20 overflow-hidden"
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <DNABackground className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" style={{ pointerEvents: 'none' }}></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[140px] animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        className="relative max-w-6xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-xl rounded-full border border-white/60 shadow-lg mb-8"
        >
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-700">Next-Gen Healthcare</span>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="text-slate-800">Your Health,</span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Secured by Blockchain
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
        >
          Experience the future of healthcare with AI-powered insights, secure blockchain storage, and comprehensive health management tools designed for your wellbeing.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => window.location.replace('https://www.jotform.com/app/253583637449470')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full font-semibold shadow-2xl shadow-blue-300/50 hover:shadow-blue-400/60 transition-all duration-300 hover:scale-105 flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Try B-Max AI</span>
          </button>
          <button
            onClick={() => window.location.replace('/history')}
            className="px-8 py-4 bg-white/60 backdrop-blur-xl text-slate-700 rounded-full font-semibold border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            View Health History
          </button>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <motion.div 
            variants={floatingVariants}
            animate="animate"
            className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-300/50">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-2">100%</h3>
            <p className="text-sm font-medium text-slate-600">Data Security</p>
            <p className="text-xs text-slate-500 mt-1">End-to-end encryption</p>
          </motion.div>

          <motion.div 
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-300/50">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-2">24/7</h3>
            <p className="text-sm font-medium text-slate-600">AI Assistant</p>
            <p className="text-xs text-slate-500 mt-1">Always available</p>
          </motion.div>

          <motion.div 
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
            className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-300/50">
              <Infinity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-2">∞</h3>
            <p className="text-sm font-medium text-slate-600">Storage</p>
            <p className="text-xs text-slate-500 mt-1">Unlimited blockchain storage</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
    </section>
  );
}
