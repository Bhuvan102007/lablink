import React, { useState } from 'react';
import { Sparkles, Search, ArrowRight, Loader2, Lightbulb, CheckCircle2, Building, Wrench } from 'lucide-react';
import { Equipment, GenAIMatchResult } from '../types';
import { GeminiService } from '../services/geminiService';

interface GeminiSearchBarProps {
  allEquipment: Equipment[];
  onSelectEquipment: (equipmentId: string) => void;
  onInitiateBooking: (equipment: Equipment) => void;
}

export const GeminiSearchBar: React.FC<GeminiSearchBarProps> = ({
  allEquipment,
  onSelectEquipment,
  onInitiateBooking
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GenAIMatchResult[] | null>(null);

  const samplePrompts = [
    'Autonomous drone with RF telemetry and 3D printed aerodynamic mount',
    'Fine-tuning Vision Transformer on 50k CT medical scans',
    'Microfluidic lab-on-a-chip with 25-micron channels for pathogen testing',
    'High-resolution electron microscopy of graphene composite fractures'
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const matches = await GeminiService.discoverEquipment(searchQuery, allEquipment);
      setResults(matches);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
    handleSearch(prompt);
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
  };

  return (
    <div className="relative rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0F172A] via-[#0B132B] to-[#0A0E1A] overflow-hidden">
      {/* Glow Orbs in background */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Title & Tagline */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-bold mb-3 border border-cyan-700/60 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            GenAI Semantic Laboratory Discovery Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Describe what you need to build. <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Gemini will find the tools.</span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl mx-auto">
            Breaks departmental silos to match your exact project specifications with university supercomputers, scopes, and cleanrooms.
          </p>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative flex items-center shadow-xl shadow-black/40 rounded-2xl"
        >
          <div className="absolute left-4 text-cyan-400 pointer-events-none">
            <Search className="w-5 h-5" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., I am testing an autonomous drone telemetry system and need to 3D print a mount..."
            className="w-full pl-12 pr-36 py-4 rounded-2xl bg-slate-900/90 text-white placeholder-slate-400 border border-slate-700/80 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 text-sm sm:text-base outline-none transition-all"
            aria-label="Describe your project requirements for AI equipment discovery"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all active:scale-95"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Matching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Ask Gemini</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Prompts */}
        <div className="mt-4 flex flex-wrap items-center gap-2 justify-center text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-semibold">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Quick Prompts:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePromptClick(p)}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors text-[11px] truncate max-w-xs"
              title={p}
            >
              {p}
            </button>
          ))}
          {results && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline ml-2 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Live Gemini Discovery Results */}
        {results && (
          <div className="mt-6 space-y-3" aria-live="polite">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300 px-1">
              <span>Gemini Recommended Campus Resources ({results.length})</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Multi-Department Match Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {results.map((res) => {
                const eq = allEquipment.find((e) => e.id === res.equipmentId);
                if (!eq) return null;

                return (
                  <div
                    key={res.equipmentId}
                    className="bg-[#0B1220] text-slate-100 rounded-2xl p-4 shadow-xl flex flex-col justify-between border border-cyan-500/30 transition-all hover:border-cyan-400 hover:shadow-cyan-500/10 h-full"
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {eq.department.split('&')[0]}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-700/80 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            {res.matchScore}% Match
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-white line-clamp-1">
                          {eq.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-500" />
                          {eq.location}
                        </p>

                        <div className="mt-2.5 text-xs bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                          <p className="font-bold text-cyan-300 text-[11px] mb-0.5">Why this fits:</p>
                          <p className="text-[11px] leading-relaxed text-slate-300">{res.relevanceReason}</p>
                        </div>
                      </div>

                      <div className="mt-2 text-xs bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-900/50">
                        <p className="font-bold text-indigo-300 text-[11px] flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-indigo-400" /> Suggested Workflow:
                        </p>
                        <p className="text-[11px] leading-relaxed text-indigo-200">{res.suggestedWorkflow}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectEquipment(eq.id)}
                        className="text-xs text-slate-400 hover:text-white font-semibold underline"
                      >
                        Specifications
                      </button>
                      <button
                        type="button"
                        onClick={() => onInitiateBooking(eq)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <span>Reserve</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
