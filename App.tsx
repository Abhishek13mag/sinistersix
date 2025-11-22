import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitor } from './pages/LiveMonitor';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [settings, setSettings] = useState({
    autoSanitize: true,
    uploadGuard: true,
    sensitivity: 'HIGH'
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as 'autoSanitize' | 'uploadGuard']
    }));
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.DASHBOARD:
        return <Dashboard />;
      case AppMode.LIVE_MIRROR:
        return <LiveMonitor />;
      case AppMode.SETTINGS:
        return (
          <div className="p-10 flex flex-col items-center justify-center h-full text-slate-500">
            <div className="max-w-md w-full text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
              <p className="text-slate-400">Configuration options for local privacy guard.</p>
            </div>
            
            <div className="p-6 bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800 max-w-md w-full shadow-2xl">
                
                {/* Auto Sanitize Toggle */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-left">
                      <span className="block text-white font-medium">Auto-Sanitize Faces</span>
                      <span className="text-xs text-slate-500">Blur detected faces automatically</span>
                    </div>
                    <button 
                      onClick={() => toggleSetting('autoSanitize')}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${settings.autoSanitize ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.autoSanitize ? 'translate-x-7' : 'translate-x-1'}`}></div>
                    </button>
                </div>

                {/* Upload Guard Toggle */}
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-800">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="block text-white font-medium">Upload Guard</span>
                        <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700">Chrome Ext</span>
                      </div>
                      <span className="text-xs text-slate-500">Intercept sensitive uploads</span>
                    </div>
                    <button 
                      onClick={() => toggleSetting('uploadGuard')}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${settings.uploadGuard ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.uploadGuard ? 'translate-x-7' : 'translate-x-1'}`}></div>
                    </button>
                </div>

                {/* Sensitivity Slider (Mock) */}
                <div className="flex justify-between items-center">
                    <div className="text-left">
                      <span className="block text-white font-medium">Detection Sensitivity</span>
                      <span className="text-xs text-slate-500">Threshold for privacy warnings</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      <span className="text-emerald-500 font-mono text-sm font-bold">{settings.sensitivity}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-xs text-slate-600 max-w-xs text-center">
              PrivAI runs locally on your device. No data leaves your machine without explicit consent.
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
      <Sidebar currentMode={mode} setMode={setMode} />
      <div className="flex-1 h-full overflow-hidden relative">
        {/* Background Gradient Mesh */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 h-full">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;