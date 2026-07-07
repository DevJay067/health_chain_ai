import { Shield, Check, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative py-12 px-4 mt-20 border-t border-slate-200/50 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-[2.5rem] p-8 md:p-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6 group cursor-pointer w-fit">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
                    Health Chain AI
                  </h3>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">Blockchain Healthcare</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium max-w-sm">
                Revolutionizing healthcare with secure blockchain technology, AI-powered insights, and comprehensive health management tools.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-6">Quick Access</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Health Emergency', path: '/first-aid' },
                  { name: 'Health Analytics', path: 'https://www.jotform.com/app/253583637449470', external: true },
                  { name: 'Health Records', path: '/history' },
                  { name: 'Real-Time Monitoring', path: '/monitoring' },
                ].map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => link.external ? window.location.replace(link.path) : window.location.replace(link.path)}
                      className="text-slate-500 font-medium hover:text-blue-600 hover:translate-x-1 transition-all text-sm cursor-pointer flex items-center">
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-6">System Status</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">Blockchain</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-sm font-bold text-emerald-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">AI Assistant</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-sm font-bold text-emerald-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">Data Security</span>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-600">Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">
              © 2025 Health Chain AI. Developed by Jay Magar. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center space-x-1.5">
                <Database className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </a>
              <a href="#" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                End-to-End Encrypted
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs font-semibold text-slate-400 mt-8 uppercase tracking-widest">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </footer>
  );
}
