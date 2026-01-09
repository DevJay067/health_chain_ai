import { Shield, Check, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-300/50">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    HealthChain
                  </h3>
                  <p className="text-xs text-slate-500">Blockchain Healthcare</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-light">
                Revolutionizing healthcare with secure blockchain technology, AI-powered insights, and comprehensive health management tools.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-4">Quick Access</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => window.location.replace('/first-aid')}
                    className="text-slate-600 hover:text-blue-600 transition-colors text-sm cursor-pointer">
                    Health Emergency
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => window.location.replace('https://www.jotform.com/app/253583637449470')}
                    className="text-slate-600 hover:text-blue-600 transition-colors text-sm cursor-pointer">
                    Health Analytics
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => window.location.replace('/history')}
                    className="text-slate-600 hover:text-blue-600 transition-colors text-sm cursor-pointer">
                    Health Records
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => window.location.replace('/monitoring')}
                    className="text-slate-600 hover:text-blue-600 transition-colors text-sm cursor-pointer">
                    Real-Time Monitoring
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-4">System Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Blockchain</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">AI Assistant</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Data Security</span>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/50 pt-6 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-slate-500 mb-4 md:mb-0">
              © 2025 HealthChain. Developed by Jay Magar. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors flex items-center space-x-1">
                <Database className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </a>
              <a href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                End-to-End Encrypted
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-slate-400 mt-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </footer>
  );
}
