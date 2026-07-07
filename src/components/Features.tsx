import { AlertCircle, BarChart3, FileText, Activity, ArrowRight, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturesProps {
  scrollY: number;
}

export default function Features({ scrollY }: FeaturesProps) {
  const handleNavigation = (href: string) => {
    if (href.startsWith('http')) {
      window.location.href = href;
    } else {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new Event('navigate'));
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'B-Max AI',
      description: 'Advanced AI-powered health insights and personalized recommendations. Analyze your health patterns with machine learning.',
      color: 'from-violet-500 to-purple-400',
      shadowColor: 'shadow-violet-500/30',
      badge: 'AI Powered',
      badgeColor: 'bg-violet-100/50 text-violet-700',
      href: '/bmax',
      isSpecial: true,
    },
    {
      icon: AlertCircle,
      title: 'Health Emergency',
      description: 'Instant access to emergency protocols, first aid guides, and emergency contact integration.',
      color: 'from-red-500 to-rose-400',
      shadowColor: 'shadow-red-500/30',
      badge: 'Emergency',
      badgeColor: 'bg-red-100/50 text-red-700',
      href: '/first-aid',
      isSpecial: true,
    },
    {
      icon: BarChart3,
      title: 'Health Analytics',
      description: 'Advanced analytics and insights from your health data with predictive AI modeling.',
      color: 'from-orange-500 to-amber-400',
      shadowColor: 'shadow-orange-500/30',
      badge: 'AI Insights',
      badgeColor: 'bg-orange-100/50 text-orange-700',
      href: '/analytics',
    },
    {
      icon: FileText,
      title: 'Health Records',
      description: 'Comprehensive health records and AI search history securely stored on blockchain.',
      color: 'from-emerald-500 to-teal-400',
      shadowColor: 'shadow-emerald-500/30',
      badge: 'Secure & Private',
      badgeColor: 'bg-emerald-100/50 text-emerald-700',
      href: '/history',
    },
    {
      icon: Activity,
      title: 'Real-Time Monitoring',
      description: 'Live health monitoring dashboard with IoT device integration and real-time vital signs tracking.',
      color: 'from-blue-600 to-cyan-500',
      shadowColor: 'shadow-blue-500/30',
      badge: 'Live IoT Data',
      badgeColor: 'bg-blue-100/50 text-blue-700',
      href: '/monitoring',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  return (
    <section id="features" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-slate-50/50"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black text-slate-800 mb-6 tracking-tight">
            Comprehensive <span className="text-gradient">Health Solutions</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Five powerful tools to transform your healthcare experience and keep you in control
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const isEmergencyCard = feature.title === 'Health Emergency';
            const isBmaxCard = feature.title === 'B-Max AI';

            return (
              <motion.div
                variants={itemVariants}
                key={feature.title}
                onClick={() => handleNavigation(feature.href)}
                className={`group relative glass-card rounded-[2rem] p-8 cursor-pointer overflow-hidden ${
                  isEmergencyCard
                    ? 'bg-red-50/40 hover:bg-red-50/60 border-red-100'
                    : isBmaxCard
                    ? 'bg-violet-50/40 hover:bg-violet-50/60 border-violet-100'
                    : 'hover:bg-white/60'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg ${feature.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span
                    className={`text-xs font-bold px-4 py-1.5 rounded-full ${feature.badgeColor} backdrop-blur-md shadow-sm`}
                  >
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-3 relative z-10">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-8 font-medium relative z-10">
                  {feature.description}
                </p>

                <div className="flex items-center space-x-2 text-blue-600 font-bold group-hover:space-x-4 transition-all duration-300 relative z-10">
                  <span>Learn more</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 relative overflow-hidden glass-panel rounded-[3rem] p-10 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-400/5"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">
              Ready to Transform Your <span className="text-gradient">Healthcare?</span>
            </h3>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
              Join thousands of users who trust Health Chain AI for secure, AI-powered health management.
            </p>
            <button
              onClick={() => handleNavigation('/bmax')}
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10">Get Started Today</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
