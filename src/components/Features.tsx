import { AlertCircle, BarChart3, FileText, Activity, ArrowRight, Brain } from 'lucide-react';

interface FeaturesProps {
  scrollY: number;
}

export default function Features({ scrollY }: FeaturesProps) {
  const features = [
    {
      icon: Brain,
      title: 'B-Max AI',
      description: 'Advanced AI-powered health insights and personalized recommendations. Analyze your health patterns with machine learning.',
      color: 'from-violet-500 to-purple-400',
      shadowColor: 'shadow-violet-300/50',
      badge: 'AI Powered',
      badgeColor: 'bg-violet-100 text-violet-600',
      href: 'https://www.jotform.com/app/253583637449470',
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
    {
      icon: Brain,
      title: 'Risk Prediction',
      description: 'AI-powered health risk prediction with machine learning analysis and personalized prevention strategies.',
      color: 'from-indigo-500 to-purple-400',
      shadowColor: 'shadow-indigo-300/50',
      badge: 'ML Powered',
      badgeColor: 'bg-indigo-100 text-indigo-600',
      href: '/risk-prediction',
    },
  ];

  return (
    <section id="features" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Comprehensive Health Solutions
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
            Five powerful tools to transform your healthcare experience and keep you in control
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const scrollOffset = 600 + index * 100;
            const cardOpacity = Math.min(Math.max((scrollY - scrollOffset) / 200 + 1, 0), 1);
            const cardTranslateY = Math.max(50 - (scrollY - scrollOffset) / 5, 0);

            const isSpecialCard = feature.isSpecial;
            const isEmergencyCard = feature.title === 'Health Emergency';
            const isBmaxCard = feature.title === 'B-Max AI';

            return (
              <div
                key={feature.title}
                className={`group backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer ${
                  isEmergencyCard
                    ? 'bg-gradient-to-br from-red-400/25 via-red-300/20 to-rose-300/20 border border-red-200/50 shadow-2xl shadow-red-400/30'
                    : isBmaxCard
                    ? 'bg-gradient-to-br from-violet-300/25 via-blue-300/20 to-purple-300/20 border border-violet-200/40 shadow-2xl shadow-blue-200/30'
                    : 'bg-white/50 border border-white/60'
                }`}
                style={{
                  opacity: cardOpacity,
                  transform: `translateY(${cardTranslateY}px)`,
                  boxShadow: isEmergencyCard
                    ? '0 8px 32px 0 rgba(239, 68, 68, 0.2), inset 0 1px 2px 0 rgba(255, 150, 150, 0.4), inset 0 -1px 2px 0 rgba(255, 200, 200, 0.3)'
                    : isBmaxCard
                    ? '0 8px 32px 0 rgba(148, 113, 255, 0.15), inset 0 1px 2px 0 rgba(255, 200, 200, 0.2), inset 0 -1px 2px 0 rgba(100, 200, 255, 0.3)'
                    : '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 2px 0 rgba(255, 255, 255, 0.8)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
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

                <button
                  onClick={() => feature.href !== '#' && window.location.replace(feature.href)}
                  className="flex items-center space-x-2 text-blue-600 font-semibold group-hover:space-x-3 transition-all duration-300"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border border-white/60 rounded-3xl p-8 md:p-12 shadow-xl text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Ready to Transform Your Healthcare?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto font-light">
            Join thousands of users who trust HealthChain for secure, AI-powered health management
          </p>
          <button
            onClick={() => window.location.replace('https://www.jotform.com/app/253583637449470')}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full font-semibold shadow-2xl shadow-blue-300/50 hover:shadow-blue-400/60 transition-all duration-300 hover:scale-105">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
}
