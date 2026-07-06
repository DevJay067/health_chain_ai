import { motion } from 'framer-motion';

export default function AnimatedLogo() {
  return (
    <div className="flex items-center cursor-pointer group select-none">
      <motion.div 
        className="flex items-baseline space-x-[2px] font-serif font-black text-2xl tracking-tighter text-slate-900"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span>H</span>
        <span>e</span>
        <span>a</span>
        <span>l</span>
        <span>t</span>
        <span>h</span>
        <div className="relative mx-1 overflow-hidden h-7 flex items-center justify-center">
          {/* Default 'C' */}
          <motion.span 
            className="block"
            initial={{ y: 0 }}
            whileHover={{ y: -30 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            C
          </motion.span>
          {/* Smiley Face replacing 'C' on hover */}
          <motion.div 
            className="absolute top-0 w-full h-full flex items-center justify-center text-lime-500"
            initial={{ y: 30 }}
            whileHover={{ y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
              <path d="M7 10v.01M17 10v.01M7 15a6 6 0 0 0 10 0" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
        <span>h</span>
        <span>a</span>
        <span>i</span>
        <span>n</span>
      </motion.div>
    </div>
  );
}
