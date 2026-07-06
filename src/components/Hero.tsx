import { Sparkles, Lock, Zap, Infinity } from 'lucide-react';
import { motion } from 'framer-motion';

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
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const }
    },
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
      {/* Background Gradients & Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60" style={{ pointerEvents: 'none' }}></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[30rem] h-[30rem] bg-blue-300/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-cyan-300/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-300/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        className="relative max-w-6xl mx-auto text-center z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-2 glass-panel rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-700 tracking-wide">Next-Gen Healthcare</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-[clamp(3.5rem,8vw,6rem)] font-black mb-6 leading-tight tracking-tight">
          <span className="text-slate-800">Your Health,</span>
          <br />
          <span className="text-gradient">
            Secured by Blockchain
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-[clamp(1.125rem,3vw,1.5rem)] text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          Experience the future of healthcare with AI-powered insights, secure blockchain storage, and comprehensive health management tools designed for your wellbeing.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          <button
            onClick={() => window.location.replace('https://www.jotform.com/app/253583637449470')}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex items-center space-x-2">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Zap className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Try B-Max AI</span>
          </button>
          <button
            onClick={() => window.location.replace('/history')}
            className="px-8 py-4 glass-panel text-slate-700 rounded-full font-semibold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            View Health History
          </button>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Lock, color: "from-blue-500 to-cyan-400", title: "100%", subtitle: "Data Security", desc: "End-to-end encryption" },
            { icon: Sparkles, color: "from-indigo-500 to-purple-500", title: "24/7", subtitle: "AI Assistant", desc: "Always available" },
            { icon: Infinity, color: "from-emerald-500 to-teal-400", title: "∞", subtitle: "Storage", desc: "Unlimited blockchain storage" },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="glass-card rounded-3xl p-8 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-[clamp(1.5rem,4vw,2.25rem)] font-black text-slate-800 mb-2">{stat.title}</h3>
              <p className="text-base font-semibold text-slate-700">{stat.subtitle}</p>
              <p className="text-sm text-slate-500 mt-2 font-medium">{stat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
