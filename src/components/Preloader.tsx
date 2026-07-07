import { motion } from 'framer-motion';

export default function Preloader() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
    >
      <motion.div 
        initial={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="relative flex flex-col items-center justify-center"
      >
        {/* Minimalist SVG Line Art Logo */}
        <div className="w-32 h-32 mb-8 text-slate-900">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Hexagon Base */}
            <motion.path
              d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
            />
            {/* Inner Cross/Medical Symbol */}
            <motion.path
              d="M50 35 L50 65 M35 50 L65 50"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", delay: 0.5 }}
            />
            {/* Minimalist Tech Nodes */}
            <motion.circle cx="50" cy="10" r="3" fill="currentColor" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }} />
            <motion.circle cx="85" cy="70" r="3" fill="currentColor" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", delay: 0.3 }} />
            <motion.circle cx="15" cy="70" r="3" fill="currentColor" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", delay: 0.6 }} />
          </svg>
        </div>
        
        {/* Elegant typography below logo */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-2xl font-serif tracking-[0.3em] text-slate-900 uppercase"
        >
          Health Chain AI
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}
