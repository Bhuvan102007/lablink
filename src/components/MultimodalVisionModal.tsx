import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Camera, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Wrench, 
  ArrowRight, 
  Loader2, 
  FileCode, 
  Image as ImageIcon 
} from 'lucide-react';
import { MultimodalAnalysisResult, Equipment } from '../types';
import { GeminiService } from '../services/geminiService';

interface MultimodalVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  allEquipment: Equipment[];
  onSelectAndBook: (equipment: Equipment) => void;
}

export const MultimodalVisionModal: React.FC<MultimodalVisionModalProps> = ({
  isOpen,
  onClose,
  allEquipment,
  onSelectAndBook
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'pcb_schematic' | 'cad_model' | 'nanomaterial' | 'airfoil_mesh'>('pcb_schematic');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MultimodalAnalysisResult | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'pcb_schematic' as const,
      title: 'Circuit Schematic / PCB',
      desc: 'CAN-Bus Telemetry & ARM Controller differential traces',
      icon: <FileCode className="w-5 h-5 text-indigo-500" />
    },
    {
      id: 'cad_model' as const,
      title: '3D CAD Manifold',
      desc: '150µm serpentine microfluidic lab-on-a-chip channels',
      icon: <Layers className="w-5 h-5 text-emerald-500" />
    },
    {
      id: 'nanomaterial' as const,
      title: 'Nanomaterial Micrograph',
      desc: 'Graphene platelet fracture surface & microcracks',
      icon: <Camera className="w-5 h-5 text-rose-500" />
    },
    {
      id: 'airfoil_mesh' as const,
      title: 'Aerodynamic Airfoil',
      desc: 'NACA 0012 drone wing section for boundary flow',
      icon: <ImageIcon className="w-5 h-5 text-cyan-500" />
    }
  ];

  const handleRunAnalysis = async (type: typeof selectedPreset, customDataUrl?: string) => {
    setIsAnalyzing(true);
    try {
      const result = await GeminiService.analyzeImageOrSchematic(type, customDataUrl);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCustomImage(dataUrl);
        handleRunAnalysis('custom' as any, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vision-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 flex items-center gap-1.5 border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                Gemini Vision 2.5 Multimodal Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                Snap & Identify Lab Tools
              </span>
            </div>
            <h3 id="vision-modal-title" className="text-xl font-extrabold text-slate-900 mt-1.5">
              Visual Equipment Diagnostic Assistant
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a circuit schematic, 3D CAD sketch, or electron micrograph. Gemini will visually inspect the design and identify the exact campus laboratory facilities you need.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector or Upload */}
        <div className="my-5 space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Step 1: Choose a Project Design Sample or Upload Custom Image
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPreset(p.id);
                  setCustomImage(null);
                  handleRunAnalysis(p.id);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  selectedPreset === p.id && !customImage
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-200 shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{p.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* File Upload Zone */}
          <div className="relative border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload custom project schematic or design image"
            />
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
              <Upload className="w-4 h-4 text-brand-600" />
              <span>Or click to upload your own design image (.PNG, .JPG, .WebP)</span>
            </div>
            {customImage && (
              <p className="text-[11px] text-emerald-600 font-bold mt-1">
                ✓ Custom image loaded into Gemini Vision!
              </p>
            )}
          </div>
        </div>

        {/* Gemini Vision Output */}
        {isAnalyzing ? (
          <div className="p-8 text-center bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-indigo-950">
              Gemini Vision is inspecting pixel structures, component layers & tolerances...
            </p>
          </div>
        ) : analysisResult ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-brand-950 text-white shadow-xl space-y-4 border border-indigo-800/40 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                  Detected Engineering Domain
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {analysisResult.detectedDomain}
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Visual Confidence: 99.4%
              </span>
            </div>

            {/* Identified Visual Components */}
            <div>
              <p className="text-xs font-bold text-indigo-200 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Identified Visual Features & Components:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.identifiedComponents.map((comp, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-medium border border-white/10"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Equipment */}
            <div>
              <p className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Matched Campus Lab Facilities:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysisResult.recommendedEquipmentIds.map((eqId, idx) => {
                  const eq = allEquipment.find((e) => e.id === eqId);
                  const displayName = eq ? eq.name : analysisResult.recommendedEquipmentNames[idx] || eqId;

                  return (
                    <div
                      key={eqId}
                      className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{displayName}</p>
                        <p className="text-[10px] text-indigo-200">{eq?.location || 'Campus Facility'}</p>
                      </div>
                      {eq && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectAndBook(eq);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold shrink-0 flex items-center gap-1 shadow-xs"
                        >
                          <span>Reserve</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Safety Warnings & SOP */}
            <div className="bg-rose-500/10 border border-rose-400/30 p-3 rounded-xl text-xs space-y-1">
              <p className="text-rose-300 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Mandatory Laboratory Safety Protocol:
              </p>
              {analysisResult.safetyWarnings.map((w, idx) => (
                <p key={idx} className="text-rose-100 text-[11px]">
                  • {w}
                </p>
              ))}
            </div>

            {/* Suggested Workflow */}
            <div className="text-[11px] text-indigo-100 bg-black/30 p-3 rounded-xl border border-white/10">
              <strong className="text-indigo-200">Recommended Lab Scope:</strong>{' '}
              {analysisResult.suggestedProjectScope}
            </div>
          </div>
        ) : null}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
