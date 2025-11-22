import React, { useState, useRef, useEffect } from 'react';
import { Upload, AlertTriangle, CheckCircle2, Zap, Shield, Download, RefreshCw } from 'lucide-react';
import { analyzeImagePrivacy } from '../services/geminiService';
import { ScanResult, RiskLevel } from '../types';
import { PrivacyScoreChart } from '../components/PrivacyScoreChart';

export const Dashboard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [sanitized, setSanitized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleFile = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFile(uploadedFile);
        setImageSrc(e.target.result as string);
        setResult(null);
        setSanitized(false);
        startScan(e.target.result as string);
      }
    };
    reader.readAsDataURL(uploadedFile);
  };

  const startScan = async (base64: string) => {
    setIsScanning(true);
    
    // Simulate backend delay for dramatic effect if API is too fast
    const scanPromise = analyzeImagePrivacy(base64);
    const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));
    
    const [scanData] = await Promise.all([scanPromise, delayPromise]);
    
    setResult(scanData);
    setIsScanning(false);

    if (scanData.score < 80) {
      speak(`Warning. ${scanData.contextAnalysis.split('.')[0]}. Suggested action: ${scanData.suggestedAction.replace('_', ' ')}.`);
    } else {
      speak("Image safe to share.");
    }
  };

  const toggleSanitize = () => {
    setSanitized(!sanitized);
  };

  // Calculate bounding box styles
  const getBoxStyle = (bbox: any) => ({
    top: `${bbox.ymin / 10}%`,
    left: `${bbox.xmin / 10}%`,
    height: `${(bbox.ymax - bbox.ymin) / 10}%`,
    width: `${(bbox.xmax - bbox.xmin) / 10}%`,
  });

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-8">
        <h2 className="text-lg font-semibold text-white">Privacy Scanner</h2>
        <div className="flex gap-4">
             <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected to Localhost:5050
             </div>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Upload & Preview */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Dropzone / Preview Area */}
            <div className="relative flex-1 bg-slate-900 border-2 border-slate-800 border-dashed rounded-2xl overflow-hidden flex items-center justify-center min-h-[500px]">
              
              {!imageSrc ? (
                <div 
                  className="text-center p-10 cursor-pointer hover:bg-slate-800/50 transition-colors w-full h-full flex flex-col items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
                  }}
                >
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Drop sensitive files here</h3>
                  <p className="text-slate-400 max-w-xs mx-auto">Support for Screenshots, Bank Statements, IDs (JPG, PNG)</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
                  />
                </div>
              ) : (
                <div className="relative w-full h-full bg-slate-950 flex items-center justify-center p-4 group">
                  
                  <div className="relative shadow-2xl rounded-lg overflow-hidden max-h-full">
                    <img 
                      src={imageSrc} 
                      alt="Analysis Target" 
                      className={`max-h-[600px] object-contain transition-all duration-500 ${sanitized ? 'opacity-90' : 'opacity-100'}`}
                    />

                    {/* Scanning Line Animation */}
                    {isScanning && (
                      <div className="absolute inset-0 pointer-events-none z-20 border-b-2 border-emerald-500 bg-gradient-to-b from-transparent to-emerald-500/20 animate-scan-line opacity-50"></div>
                    )}

                    {/* Detection Overlays */}
                    {!isScanning && result && result.detections.map((det) => (
                      <div
                        key={det.id}
                        className={`absolute border-2 transition-all duration-300 group/box
                          ${sanitized 
                            ? 'border-transparent backdrop-blur-md bg-slate-900/20' // Redacted state
                            : det.risk === RiskLevel.HIGH || det.risk === RiskLevel.CRITICAL 
                              ? 'border-rose-500 bg-rose-500/10' 
                              : 'border-amber-500 bg-amber-500/10'
                          }
                        `}
                        style={getBoxStyle(det.bbox)}
                      >
                        {!sanitized && (
                          <div className={`absolute -top-7 left-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white rounded shadow-sm
                             ${det.risk === RiskLevel.HIGH ? 'bg-rose-500' : 'bg-amber-500'}
                          `}>
                            {det.label}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                   {/* Floating Action Bar */}
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-xl shadow-2xl z-30">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="New Upload"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <div className="w-px h-6 bg-slate-700 mx-1"></div>
                      <button 
                        onClick={toggleSanitize}
                        disabled={!result}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                          ${sanitized 
                            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                            : 'bg-white text-slate-950 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
                          }
                        `}
                      >
                        {sanitized ? <Shield className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        {sanitized ? 'Sanitized Safe ✅' : 'Sanitize Image'}
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Analysis Results */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Score Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-slate-400 text-sm font-medium mb-4">PRIVACY SCORE</h3>
              <div className="flex items-center justify-between">
                <PrivacyScoreChart score={result ? result.score : 100} />
                <div className="flex-1 ml-6">
                  {isScanning ? (
                    <div className="space-y-3">
                      <div className="h-2 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                      <div className="h-2 bg-slate-800 rounded w-1/2 animate-pulse"></div>
                    </div>
                  ) : result ? (
                    <div>
                       <p className={`text-lg font-bold ${result.score > 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {result.score > 80 ? 'Safe to Share' : 'Risky Content'}
                       </p>
                       <p className="text-xs text-slate-500 mt-1">{result.detections.length} issues found</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Ready to scan</p>
                  )}
                </div>
              </div>
            </div>

            {/* Context Analysis */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 overflow-hidden flex flex-col">
              <h3 className="text-slate-400 text-sm font-medium mb-4 flex items-center gap-2">
                CONTEXT AWARENESS
                <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded">AI Powered</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {isScanning ? (
                  <div className="flex items-center gap-3 text-slate-500 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyzing semantic context...</span>
                  </div>
                ) : result ? (
                  <>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        "{result.contextAnalysis}"
                      </p>
                    </div>

                    <h4 className="text-xs font-bold text-slate-500 uppercase mt-4 mb-2">Detections</h4>
                    <div className="space-y-2">
                      {result.detections.map(det => (
                        <div key={det.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors">
                           <AlertTriangle className={`w-4 h-4 mt-0.5 ${det.risk === RiskLevel.HIGH ? 'text-rose-500' : 'text-amber-500'}`} />
                           <div>
                             <div className="flex items-center gap-2">
                               <span className="text-sm font-medium text-slate-200">{det.label}</span>
                               <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                 det.risk === RiskLevel.HIGH 
                                  ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' 
                                  : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                               }`}>
                                 {det.risk}
                               </span>
                             </div>
                             <p className="text-xs text-slate-500 mt-1">{det.description}</p>
                           </div>
                        </div>
                      ))}
                      {result.detections.length === 0 && (
                        <div className="flex items-center gap-2 text-emerald-500 text-sm p-3">
                          <CheckCircle2 className="w-4 h-4" />
                          No sensitive data found.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-600 py-10">
                    <p className="text-sm">Upload an image to generate a privacy report.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
               <button 
                 disabled={!sanitized}
                 className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 text-white py-3 rounded-xl font-medium transition-all"
               >
                 <Download className="w-4 h-4" />
                 Download Safe Image
               </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
