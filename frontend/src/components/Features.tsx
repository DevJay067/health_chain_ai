import { AlertCircle, BarChart3, FileText, Activity, ArrowRight, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturesProps {
  scrollY: number;
}

export default function Features({ scrollY }: FeaturesProps) {
  const handleNavigation = (href: string) => {
    if (href.startsWith('http')) {
      // External link - open directly
      window.location.href = href;
    } else {
      // Internal link - use SPA navigation
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
      shadowColor: 'shadow-violet-300/50',
      badge: 'AI Powered',
      badgeColor: 'bg-violet-100 text-violet-600',
      href: '/bmax',
      isSpecial: true,
    },
    {
      icon: AlertCircle,
      title: 'Health Emergency',
      description: 'Instant access to emergency protocols, first aid guides, and emergency contact integration.',
      color: 'from-red-500 to-rose-400',
      shadowColor: 'shadow-red-300/50',
      badge: 'Emergency',
      badgeColor: 'bg-red-100 text-red-600',
      href: '/first-aid',
      isSpecial: true,
    },
    {
      icon: BarChart3,
      title: 'Health Analytics',
      description: 'Advanced analytics and insights from your health data with predictive AI modeling.',
      color: 'from-orange-500 to-amber-400',
      shadowColor: 'shadow-orange-300/50',
      badge: 'AI Insights',
      badgeColor: 'bg-orange-100 text-orange-600',
      href: '/analytics',
    },
    {
      icon: FileText,
      title: 'Health Records',
      description: 'Comprehensive health records and AI search history securely stored on blockchain.',
      color: 'from-emerald-500 to-teal-400',
      shadowColor: 'shadow-emerald-300/50',
      badge: 'Secure & Private',
      badgeColor: 'bg-emerald-100 text-emerald-600',
      href: '/history',
    },
    {
      icon: Activity,
      title: 'Real-Time Monitoring',
      description: 'Live health monitoring dashboard with IoT device integration and real-time vital signs tracking.',
      color: 'from-blue-500 to-cyan-400',
      shadowColor: 'shadow-blue-300/50',
      badge: 'Live IoT Data',
      badgeColor: 'bg-blue-100 text-blue-600',
      href: '/monitoring',
    },
  ];

  return (
    <section id="features" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Comprehensive Health Solutions
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
            Five powerful tools to transform your healthcare experience and keep you in control
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEmergencyCard = feature.title === 'Health Emergency';
            const isBmaxCard = feature.title === 'B-Max AI';

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => handleNavigation(feature.href)}
                className={`group backdrop-blur-xl rounded-3xl p-8 shadow-xl cursor-pointer transition-all duration-300 ${
                  isEmergencyCard
                    ? 'bg-gradient-to-br from-red-400/25 via-red-300/20 to-rose-300/20 border border-red-200/50'
                    : isBmaxCard
                    ? 'bg-gradient-to-br from-violet-300/25 via-blue-300/20 to-purple-300/20 border border-violet-200/40'
                    : 'bg-white/50 border border-white/60'
                }`}
                style={{
                  boxShadow: isEmergencyCard
                    ? '0 8px 32px 0 rgba(239, 68, 68, 0.2), inset 0 1px 2px 0 rgba(255, 150, 150, 0.4)'
                    : isBmaxCard
                    ? '0 8px 32px 0 rgba(148, 113, 255, 0.15), inset 0 1px 2px 0 rgba(255, 200, 200, 0.2)'
                    : '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 2px 0 rgba(255, 255, 255, 0.8)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg ${feature.shadowColor}`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${feature.badgeColor}`}
                  >
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-4 font-light">
                  {feature.description}
                </p>

                <div className="flex items-center space-x-2 text-blue-600 font-semibold group-hover:space-x-3 transition-all duration-300">
                  <span>Learn more</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border border-white/60 rounded-3xl p-8 md:p-12 shadow-xl text-center"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Ready to Transform Your Healthcare?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto font-light">
            Join thousands of users who trust HealthChain for secure, AI-powered health management
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation('/bmax')}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full font-semibold shadow-2xl shadow-blue-300/50 hover:shadow-blue-400/60 transition-all duration-300">
            Get Started Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
