import React from 'react';
import { ShieldAlert, LayoutDashboard, Eye, Settings, Activity } from 'lucide-react';
import { AppMode } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { id: AppMode.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppMode.LIVE_MIRROR, label: 'Live Mirror', icon: Eye },
    { id: AppMode.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-emerald-500/10 p-2 rounded-lg">
          <ShieldAlert className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">PrivAI</h1>
          <p className="text-xs text-slate-400">Guardian v1.0.4</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentMode === item.id
                ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentMode === item.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-500 uppercase">System Active</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            PrivAI is monitoring system clipboard and active windows for sensitive data leakage.
          </p>
        </div>
      </div>
    </aside>
  );
};
