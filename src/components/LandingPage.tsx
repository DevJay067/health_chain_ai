import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Brain, Activity, ArrowRight, Lock, Grid, Shield, Star, FileText, Layers, Dribbble } from 'lucide-react';
import InteractiveBackground from './InteractiveBackground';
import SponsorMarquee from './SponsorMarquee';
import AnimatedLogo from './AnimatedLogo';
import NavTimelineString from './NavTimelineString';

interface LandingPageProps {
  onStartJourney: () => void;
  onGuestEnter: () => void;
}

export default function LandingPage({ onStartJourney, onGuestEnter }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll of the entire page
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Timeline mapped from 0% to 100% across the line
  const scrubberX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [activeIndex, setActiveIndex] = useState(0);

  // Update active index based on scroll position
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // These thresholds correspond roughly to when each section enters view
    if (latest < 0.20) setActiveIndex(0);
    else if (latest < 0.40) setActiveIndex(1);
    else if (latest < 0.60) setActiveIndex(2);
    else if (latest < 0.80) setActiveIndex(3);
    else setActiveIndex(4);
  });

  const timelineNodes = [
    { id: '01', title: 'Intro', icon: Grid, subtitle: 'THE PLATFORM' },
    { id: '02', title: 'Diagnostics', icon: Brain, subtitle: 'AI ANALYSIS · METRICS ·' },
    { id: '03', title: 'Blockchain', icon: Lock, subtitle: 'SECURE LEDGER · DECENTRALIZED ·' },
    { id: '04', title: 'Monitoring', icon: Activity, subtitle: 'REAL-TIME · INSIGHTS ·' },
    { id: '05', title: 'Contact', icon: Shield, subtitle: 'GET IN TOUCH ·' },
  ];

  const ActiveIcon = timelineNodes[activeIndex].icon;

  return (
    <div ref={containerRef} className="relative bg-[#fcfcfc] text-slate-900 font-sans selection:bg-lime-200 selection:text-slate-900 max-w-[100vw] overflow-x-clip">
      
      {/* Background Wavy Lines */}
      <InteractiveBackground />

      {/* Sticky Top Timeline Navbar */}
      <nav className="sticky top-0 w-full z-50 pt-8 pb-10">
        {/* Solid Background with Blur to prevent text overlap */}
        <div className="absolute inset-0 bg-[#fcfcfc]/95 backdrop-blur-xl border-b border-slate-200/50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
          
          {/* Logo & Section Titles Container */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 px-2">
            
            {/* Animated Logo */}
            <div className="hidden lg:block w-48 shrink-0">
              <AnimatedLogo />
            </div>

            {/* Timeline Wrapper (Right Side) */}
            <div className="flex-1 w-full flex justify-end">
              <div className="w-full lg:w-[650px] xl:w-[750px] relative mt-6 lg:mt-0">
                
                {/* Section Titles */}
                <div className="flex justify-between items-end w-full relative z-10 px-2 lg:px-4">
                  {timelineNodes.map((node, i) => (
                    <div 
                      key={node.id} 
                      className={`flex flex-col items-center transition-colors duration-300 relative ${
                        activeIndex >= i ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      <span className="text-[11px] font-bold tracking-widest mb-1">{node.id}</span>
                      <span className="text-sm font-serif italic hidden sm:block">{node.title}</span>
                      
                      {/* Fixed Timeline Dot */}
                      <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                        <div className={`w-[4px] h-[4px] rounded-full transition-all duration-300 ${
                          activeIndex === i ? 'bg-lime-500 scale-[1.5] shadow-[0_0_8px_rgba(132,204,22,0.8)]' : 
                          activeIndex > i ? 'bg-slate-900' : 'bg-slate-300'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline Line & Scrubber */}
                <div className="absolute -bottom-[9px] left-4 right-4 h-[2px]">
                  
                  {/* Interactive Physics String for the Timeline */}
                  <NavTimelineString scrollYProgress={scrollYProgress} />

                  {/* The Scrubber */}
                  <div className="absolute top-0 left-0 w-full pointer-events-none mt-[16px]">
                    <motion.div 
                      style={{ left: scrubberX }} 
                      className="absolute top-1/2 -translate-y-1/2 -ml-[24px] group pointer-events-auto cursor-grab active:cursor-grabbing"
                    >
                      {/* Scrubber Pill */}
                      <div className="w-[48px] h-[48px] bg-slate-900 rounded-full flex items-center justify-center text-white transform transition-transform duration-300 hover:scale-105 shadow-xl shadow-slate-900/10 z-20 relative">
                        <motion.div
                          key={activeIndex}
                          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <ActiveIcon className="w-5 h-5" />
                        </motion.div>
                      </div>
                      
                      {/* The Scrubber Tail (Dynamic Subtitle) */}
                      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-[40px] items-center h-full pointer-events-none w-[350px] z-10">
                        <div className="h-[1px] w-full bg-gradient-to-r from-slate-300 via-slate-200/50 to-transparent relative">
                          <div className="absolute bottom-1/2 translate-y-[1px] left-4 flex items-center space-x-4 text-[9px] font-bold tracking-[0.2em] whitespace-nowrap">
                            <span className="text-slate-900">{timelineNodes[activeIndex].title.toUpperCase()}</span>
                            <span className="text-slate-400">{timelineNodes[activeIndex].subtitle}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Drag to scrub tooltip */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 text-white text-[9px] font-bold tracking-widest px-3 py-1.5 rounded whitespace-nowrap pointer-events-none">
                        DRAG TO SCRUB
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="w-full relative z-10">

        {/* HERO SECTION */}
        <section className="min-h-[85vh] flex items-center justify-center px-6 md:px-12 relative">
          
          {/* Rotating Circular Text Badge */}
          <div className="absolute left-6 md:left-24 top-1/3 hidden lg:flex items-center justify-center w-32 h-32">
            <svg className="w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
              <path id="curve" fill="transparent" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" />
              <text className="text-[9.5px] font-bold tracking-[3px] uppercase fill-slate-900">
                <textPath href="#curve">DECENTRALIZED • AI-DRIVEN • HEALTH PLATFORM •</textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Star className="w-5 h-5 text-slate-900 fill-current" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-slate-900 leading-[1.1] mb-8"
            >
              Intelligent health <br />
              <span className="italic">deserves</span> a secure chain.
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
            >
              We build decentralized health vaults, AI-driven medical insights, and real-time vital monitoring with <span className="underline decoration-lime-400 decoration-2 underline-offset-4 font-serif italic">classic clinical rigor</span> and modern AI-assisted speed.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <button 
                onClick={onGuestEnter}
                className="group flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center space-x-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></div>
                <span>Replies within 24h</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SPONSOR MARQUEE SECTION */}
        <SponsorMarquee />

        {/* SECTION 2: Diagnostics */}
        <section className="px-6 md:px-12 py-16 md:py-32 border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Sticky Left Column */}
            <div className="lg:w-1/3">
              <div className="sticky top-40">
                <h2 className="text-[5rem] md:text-[8rem] font-serif leading-none font-light text-slate-900 mb-6 tracking-tighter">02</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-[1px] bg-slate-900"></div>
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-900">Services</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif text-slate-900 leading-tight">
                  An intelligent body <br/><span className="italic text-slate-600">of clinical insights.</span>
                </h3>
                <p className="mt-6 text-slate-500">Upload your reports, MRIs, or blood work. Our RAG AI system analyzes it against peer-reviewed sources.</p>
              </div>
            </div>

            {/* Scrolling Right Column */}
            <div className="lg:w-2/3 space-y-8">
              {[
                { title: 'Clinical Insights via RAG', desc: 'Our Retrieval-Augmented Generation system analyzes reports against peer-reviewed sources.', year: '2026' },
                { title: 'Vector Database Indexing', desc: 'Secure and efficient indexing of complex medical terminologies and patient history.', year: '2026' },
                { title: 'Evidence-based Generation', desc: 'Unbiased second opinions grounded entirely in verified medical literature.', year: '2025' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 md:p-12 border border-slate-200 hover:border-slate-300 transition-colors rounded-2xl group cursor-pointer shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-16">
                    <div className="flex items-center space-x-3 text-xs font-bold tracking-widest uppercase text-slate-500">
                      <span className="text-lime-500">{`0${i+1}`} / 03</span>
                      <span>{item.title}</span>
                    </div>
                    <span className="text-sm font-serif italic text-slate-400">{item.year}</span>
                  </div>
                  <h4 className="text-3xl md:text-5xl font-serif text-slate-900 mb-6 group-hover:text-lime-600 transition-colors">{item.title}</h4>
                  <p className="text-lg text-slate-500 max-w-lg">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* SECTION 3: Blockchain */}
        <section className="px-6 md:px-12 py-16 md:py-32 border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Sticky Left Column */}
            <div className="lg:w-1/3">
              <div className="sticky top-40">
                <h2 className="text-[5rem] md:text-[8rem] font-serif leading-none font-light text-slate-900 mb-6 tracking-tighter">03</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-[1px] bg-slate-900"></div>
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-900">Process</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif text-slate-900 leading-tight">
                  Decentralized Vault. <br/><span className="italic text-slate-600">No compromises.</span>
                </h3>
                <p className="mt-6 text-slate-500">Your data is secured in a decentralized, HIPAA-compliant vault. You control access, not corporations.</p>
              </div>
            </div>

            {/* Scrolling Right Column (Vertical Timeline) */}
            <div className="lg:w-2/3 relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-slate-200"></div>
              
              <div className="space-y-16">
                {[
                  { phase: '01', title: 'HIPAA Compliant Vault', week: 'WEEK 01', items: 'Strict adherence • US medical data • Privacy standards' },
                  { phase: '02', title: 'DISHA Readiness', week: 'WEEK 02', items: 'Digital info security • Healthcare Act • Compliance' },
                  { phase: '03', title: 'Decentralized Ledger', week: 'WEEK 03', items: 'Immutable records • Encrypted pointers • Owner access only' },
                  { phase: '04', title: 'Handoff & Support', week: 'WEEK 04', items: 'Key handover • App setup • 24/7 monitoring' }
                ].map((item, i) => (
                  <div key={i} className="flex relative pl-24">
                    <div className="absolute left-[31px] -translate-x-1/2 top-2 w-4 h-4 rounded-full bg-white border-4 border-lime-400 z-10"></div>
                    <div className="w-full">
                      <div className="flex justify-between items-baseline mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-4xl font-serif text-slate-300 italic">{item.phase}</span>
                          <h4 className="text-3xl font-serif text-slate-900">{item.title}</h4>
                        </div>
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase hidden md:block">{item.week}</span>
                      </div>
                      <p className="text-lg text-slate-500 mb-6">{item.items}</p>
                      {i === 3 && (
                        <div className="mt-8 p-6 bg-lime-50 rounded-xl border border-lime-100 text-lime-800 font-medium flex items-center space-x-3">
                          <Star className="w-5 h-5 text-lime-500" />
                          <span><span className="font-serif italic font-bold">Beyond launch.</span> One month of support, included.</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 4: Monitoring */}
        <section className="px-6 md:px-12 py-16 md:py-32 border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Sticky Left Column */}
            <div className="lg:w-1/3">
              <div className="sticky top-40">
                <h2 className="text-[5rem] md:text-[8rem] font-serif leading-none font-light text-slate-900 mb-6 tracking-tighter">04</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-[1px] bg-slate-900"></div>
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-900">Six Reasons</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif text-slate-900 leading-tight mb-6">
                  Decentralized, intelligent, <br/>
                  <span className="italic text-slate-600">secure records, and AI-assisted diagnostics.</span>
                </h3>
                <p className="text-slate-500 mb-8">Every feature is built to prioritize patient security, provide clinical-grade AI insights, and ensure real-time life-saving alerts.</p>
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white">
                  <Star className="w-6 h-6 fill-current" />
                </div>
              </div>
            </div>

            {/* Scrolling Right Column (Grid) */}
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { num: '01', title: 'Decentralized Vault', desc: 'Immutable records encrypted and stored on a secure ledger. Only you hold the access keys.' },
                { num: '02', title: 'Live Vitals IoT', desc: 'Sync your smartwatch or medical devices for real-time tracking of heart rate, oxygen, and sleep.' },
                { num: '03', title: 'B-MAX Insights', desc: 'Upload lab reports or X-rays and let our clinical AI engine summarize and detect anomalies.' },
                { num: '04', title: 'SOS Protocols', desc: 'One-tap emergency response that shares your encrypted live location and medical history with first responders.' },
                { num: '05', title: 'HIPAA & DISHA', desc: 'Fully compliant with global medical data and digital security healthcare standards.' },
                { num: '06', title: 'Open Interoperability', desc: 'Easily port your records to any doctor or hospital securely, without being locked into a single provider.' }
              ].map((item, i) => (
                <div key={i} className="p-10 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-sm font-bold text-lime-500 mb-4 block">{item.num}</span>
                  <h4 className="text-2xl font-serif text-slate-900 mb-4">{item.title}</h4>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* SECTION 5: Contact */}
        <section className="px-6 md:px-12 py-16 md:py-32">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Sticky Left Column */}
            <div className="lg:w-1/3">
              <div className="sticky top-40">
                <h2 className="text-[5rem] md:text-[8rem] font-serif leading-none font-light text-slate-900 mb-6 tracking-tighter">05</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-[1px] bg-slate-900"></div>
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-900">Contact</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif text-slate-900 leading-tight mb-6">
                  Join the <span className="italic text-slate-600">Beta.</span>
                </h3>
                <p className="text-slate-500">Whether you are managing chronic conditions or just want a secure health vault, request access today.</p>
              </div>
            </div>

            {/* Scrolling Right Column (Form) */}
            <div className="lg:w-2/3">
              <h2 className="text-4xl sm:text-6xl md:text-[6rem] lg:text-[7rem] font-serif text-slate-900 leading-[0.9] mb-16 tracking-tighter">
                Let's <br />
                build a <span className="bg-lime-400 px-2 italic">secure</span> <br />
                future, <br />
                <span className="italic">together.</span>
              </h2>

              <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-xl">
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onGuestEnter(); }}>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Your Name</label>
                    <input type="text" placeholder="Jane Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-slate-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Email</label>
                    <input type="email" placeholder="jane@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-slate-400 transition-colors" />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-4 font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors group">
                    <span>Access Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
                
                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500 font-medium">Follow our design journey</span>
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors group">
                    <Dribbble className="w-5 h-5 group-hover:animate-spin-slow" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

