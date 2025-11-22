import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertOctagon } from 'lucide-react';

export const LiveMonitor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setPermission(true);
        }
      } catch (err) {
        console.error("Camera denied", err);
        setPermission(false);
      }
    }
    setupCamera();

    // Simulate random detections for "Wow" demo effect
    const interval = setInterval(() => {
      const scenarios = [
        null, null, null,
        "ID Card Visible",
        null, null,
        "Credit Card on Screen"
      ];
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      setAlert(scenario);
      
      if (scenario) {
         // Play subtle alert sound
         const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
         audio.volume = 0.2;
         audio.play().catch(() => {}); // Ignore auto-play errors
      }

    }, 4000);

    return () => {
        clearInterval(interval);
        // Stop stream tracks
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(t => t.stop());
        }
    };
  }, []);

  return (
    <div className="h-full flex flex-col p-8 bg-slate-950">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Live Privacy Mirror</h2>
        <p className="text-slate-400">Simulating background agent monitoring video feed or screen share.</p>
      </div>

      <div className="flex-1 relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl max-w-5xl mx-auto w-full">
        {permission === false ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <p>Camera permission denied. Cannot demonstrate live mirror.</p>
            </div>
        ) : (
            <>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-80"
                />
                
                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Grid Lines */}
                    <div className="w-full h-full border-[20px] border-emerald-500/5 relative">
                        <div className="absolute top-4 left-4 text-emerald-500/50 font-mono text-xs">REC ● 00:12:43</div>
                        <div className="absolute bottom-4 right-4 text-emerald-500/50 font-mono text-xs">PRIV_AI_AGENT_ACTIVE</div>
                    </div>

                    {/* Augmented Reality Alert */}
                    {alert && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                             <div className="relative w-64 h-40 border-2 border-rose-500 rounded-lg animate-pulse-slow flex items-center justify-center bg-rose-500/10">
                                <div className="absolute -top-3 bg-rose-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                                    SENSITIVE DATA
                                </div>
                             </div>
                             <div className="mt-4 bg-rose-950/90 text-rose-400 px-6 py-3 rounded-lg border border-rose-500/50 flex items-center gap-3 shadow-xl backdrop-blur-md">
                                <AlertOctagon className="w-6 h-6 animate-bounce" />
                                <div>
                                    <p className="font-bold text-lg">Warning</p>
                                    <p className="text-sm text-rose-200">{alert}</p>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};
