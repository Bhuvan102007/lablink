import React from 'react';
import { 
  Sparkles, 
  Play, 
  Scale, 
  Layers, 
  ShieldCheck, 
  BarChart3 
} from 'lucide-react';

interface DemoScenarioPresetsProps {
  onLoadScenario: (scenarioId: string) => void;
}

export const DemoScenarioPresets: React.FC<DemoScenarioPresetsProps> = ({
  onLoadScenario
}) => {
  const scenarios = [
    {
      id: 'scenario-conflict',
      badge: 'Core Problem Winner',
      title: 'Scenario A: Intelligent Scheduling Conflict Arbitration',
      description:
        'Two students collide on the same NVIDIA DGX A100 GPU cluster. Aarav (Capstone deadline in 3 days) vs Sneha (Coursework assignment in 17 days). Watch Gemini evaluate academic priority and propose an equitable reallocation plan.',
      icon: <Scale className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/40 bg-[#160D18]',
      actionText: 'Simulate & Solve Collision',
      btnColor: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
    },
    {
      id: 'scenario-discovery',
      badge: 'GenAI Multidisciplinary',
      title: 'Scenario B: Cross-Department Equipment Discovery',
      description:
        'A student with a natural language query ("Autonomous Swarm Drone with RF telemetry and 3D printed mount") discovers specialized assets across ECE and Mechanical departments with Gemini reasoning.',
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/40 bg-[#0B1528]',
      actionText: 'Run GenAI Discovery',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
    },
    {
      id: 'scenario-faculty',
      badge: 'Governance & Safety',
      title: 'Scenario C: Faculty Project-Based Access & Risk Scoring',
      description:
        'Review student requests with automated Gemini Readiness Scores (0-100), prerequisite verification, and interdepartmental SOP compliance before granting laboratory access.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-[#0A1716]',
      actionText: 'Open Faculty Portal',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
    },
    {
      id: 'scenario-analytics',
      badge: 'Resource Optimization',
      title: 'Scenario D: Campus Lab Utilization & Bottleneck Heatmap',
      description:
        'Explore campus-wide equipment utilization metrics, identify overbooked bottleneck instruments vs underutilized assets, and review GenAI executive policy recommendations.',
      icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 bg-[#17140B]',
      actionText: 'View Campus Heatmap',
      btnColor: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#0F172A] via-[#0B132B] to-[#0A0E1A] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-cyan-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            PromptWars 2026 • Judge Interactive Walkthrough
          </span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          One-Click Evaluation Presets
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
          Select any interactive scenario below to test LabLink against every criterion of the evaluation rubric: Code Quality, Security, Efficiency, Testing, Accessibility, and Problem Statement Alignment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            className={`p-6 rounded-2xl border transition-all shadow-xl flex flex-col justify-between h-full ${sc.color}`}
          >
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 shadow-xs">
                  {sc.icon}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/10 text-white border border-white/10">
                  {sc.badge}
                </span>
              </div>

              <h3 className="font-bold text-base text-white leading-snug">
                {sc.title}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed flex-1">
                {sc.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Preset Test Vector
              </span>
              <button
                type="button"
                onClick={() => onLoadScenario(sc.id)}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${sc.btnColor}`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{sc.actionText}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
