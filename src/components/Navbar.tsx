import React from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  Key, 
  Camera, 
  GraduationCap 
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavbarProps {
  activeTab: 'catalog' | 'approvals' | 'analytics' | 'scenarios';
  setActiveTab: (tab: 'catalog' | 'approvals' | 'analytics' | 'scenarios') => void;
  userRole: 'student' | 'faculty';
  setUserRole: (role: 'student' | 'faculty') => void;
  onOpenApiKeyModal: () => void;
  onOpenVisionModal: () => void;
  hasApiKey: boolean;
  pendingApprovalsCount: number;
  conflictsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenApiKeyModal,
  onOpenVisionModal,
  hasApiKey,
  pendingApprovalsCount,
  conflictsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080C14]/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <FlaskConical className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                  Lab<span className="text-cyan-400">Link</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-xs">
                  <Sparkles className="w-3 h-3 mr-1 text-cyan-400 animate-spin" />
                  Gemini 2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Ramaiah University • Central Laboratory Resource Grid
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              Equipment Catalog
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'approvals'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {userRole === 'faculty' ? 'Faculty Governance' : 'My Requests & Passes'}
              {(pendingApprovalsCount > 0 || conflictsCount > 0) && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-rose-500 text-white animate-pulse shadow-sm">
                  {conflictsCount > 0 ? `${conflictsCount} Collision` : pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Campus Analytics
            </button>

            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
                activeTab === 'scenarios'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                  : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/80 hover:bg-indigo-900/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Judge Presets
            </button>
          </nav>

          {/* Right Controls: Vision AI + Role Switcher + API Key */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Gemini Vision Button */}
            <button
              type="button"
              onClick={onOpenVisionModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all border border-cyan-400/30"
              title="Snap & Identify Lab Equipment with Gemini Vision"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden lg:inline">Gemini Vision</span>
            </button>

            {/* Role Switcher */}
            <div className="bg-slate-900/90 p-1 rounded-xl flex items-center border border-white/10" role="group">
              <button
                type="button"
                onClick={() => setUserRole('student')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  userRole === 'student'
                    ? 'bg-white/15 text-cyan-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRole('faculty')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  userRole === 'faculty'
                    ? 'bg-white/15 text-indigo-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Faculty</span>
              </button>
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Google Gemini Key Status */}
            <button
              type="button"
              onClick={onOpenApiKeyModal}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                hasApiKey
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/60'
                  : 'bg-slate-900/90 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
              title="Gemini Configuration"
            >
              <Key className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">{hasApiKey ? 'Gemini Active' : 'Key'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden flex border-t border-white/10 bg-[#0B0F19] px-2 py-1 justify-around text-xs">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-1.5 px-2 rounded-lg font-bold ${activeTab === 'catalog' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          Catalog
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`py-1.5 px-2 rounded-lg font-bold ${activeTab === 'approvals' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          {userRole === 'faculty' ? 'Governance' : 'Bookings'}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-1.5 px-2 rounded-lg font-bold ${activeTab === 'analytics' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`py-1.5 px-2 rounded-lg font-bold ${activeTab === 'scenarios' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          Demo Presets
        </button>
      </div>
    </header>
  );
};
