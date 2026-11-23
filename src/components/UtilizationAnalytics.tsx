import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Building, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Sliders, 
  FileText 
} from 'lucide-react';
import { Equipment, BookingRequest } from '../types';
import { AnalyticsService } from '../services/analyticsService';

interface UtilizationAnalyticsProps {
  equipmentList: Equipment[];
  bookings: BookingRequest[];
  onOpenAccreditationReport: () => void;
}

export const UtilizationAnalytics: React.FC<UtilizationAnalyticsProps> = ({
  equipmentList,
  bookings,
  onOpenAccreditationReport
}) => {
  const departmentalMetrics = AnalyticsService.computeDepartmentalMetrics(equipmentList, bookings);
  const optimizationInsights = AnalyticsService.generateOptimizationInsights(equipmentList, bookings);

  // What-If Simulator State
  const [addSecondGpu, setAddSecondGpu] = useState(false);
  const [addSecond3DPrinter, setAddSecond3DPrinter] = useState(false);
  const [extendedHours, setExtendedHours] = useState(false);

  // Calculate dynamic simulated stats
  const totalAssets = equipmentList.length + (addSecondGpu ? 1 : 0) + (addSecond3DPrinter ? 1 : 0);
  let baseStrain = Math.round(
    equipmentList.reduce((acc, curr) => acc + curr.utilizationRate, 0) / equipmentList.length
  );
  if (addSecondGpu) baseStrain -= 14;
  if (addSecond3DPrinter) baseStrain -= 9;
  if (extendedHours) baseStrain -= 12;
  const simulatedStrain = Math.max(28, baseStrain);

  const crossDeptBookings = bookings.filter((b) => {
    const eq = equipmentList.find((e) => e.id === b.equipmentId);
    return eq && eq.department !== b.studentDepartment;
  }).length;

  const crossSharingPercentage = bookings.length > 0
    ? Math.round((crossDeptBookings / bookings.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Controls: Title & Accreditation Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0D1322] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Campus-Wide Laboratory Resource Utilization Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time capacity tracking, bottleneck telemetry, and predictive university CapEx simulation.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAccreditationReport}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all active:scale-95 shrink-0"
        >
          <FileText className="w-4 h-4 text-amber-300" />
          <span>Export NAAC Criteria 4.2 Report</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D1322] p-5 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between h-full">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Connected Lab Assets
            </p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {totalAssets} <span className="text-xs font-normal text-slate-400">Instruments</span>
            </h3>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-0.5 mt-1">
              <CheckCircle2 className="w-3 h-3" /> 8 Departments Unified
            </p>
          </div>
          <div className="p-3 bg-cyan-950/80 rounded-xl text-cyan-400 border border-cyan-800 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0D1322] p-5 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between h-full">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cross-Dept Sharing
            </p>
            <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">
              {crossSharingPercentage}%
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {crossDeptBookings} Interdisciplinary reservations
            </p>
          </div>
          <div className="p-3 bg-indigo-950/80 rounded-xl text-indigo-400 border border-indigo-800 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0D1322] p-5 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between h-full">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Simulated Campus Strain
            </p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {simulatedStrain}%
            </h3>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> Optimal Capacity
            </p>
          </div>
          <div className="p-3 bg-amber-950/80 rounded-xl text-amber-400 border border-amber-800 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0D1322] p-5 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between h-full">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              AI Arbitrated Collisions
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
              100%
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Zero Manual Deadlocks
            </p>
          </div>
          <div className="p-3 bg-emerald-950/80 rounded-xl text-emerald-400 border border-emerald-800 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive What-If Simulator for Deans & HODs */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#0B132B] to-[#0A0E1A] text-white p-6 rounded-2xl shadow-xl border border-cyan-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                <Sliders className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-cyan-300">
                Dean & HOD "What-If" CapEx & Capacity Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Simulate high-impact capital investments or operational changes to forecast bottleneck reductions.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-emerald-400 border border-white/10">
            Live AI Simulation Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors h-full">
            <input
              type="checkbox"
              checked={addSecondGpu}
              onChange={(e) => setAddSecondGpu(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-0 shrink-0"
            />
            <div className="text-xs">
              <p className="font-bold text-white">Add 2nd DGX A100 GPU Cluster</p>
              <p className="text-[11px] text-cyan-300">Reduces peak AI strain by 14%</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors h-full">
            <input
              type="checkbox"
              checked={addSecond3DPrinter}
              onChange={(e) => setAddSecond3DPrinter(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-0 shrink-0"
            />
            <div className="text-xs">
              <p className="font-bold text-white">Add 2nd SLA 3D Printer Node</p>
              <p className="text-[11px] text-cyan-300">Reduces Mech strain by 9%</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors h-full">
            <input
              type="checkbox"
              checked={extendedHours}
              onChange={(e) => setExtendedHours(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-0 shrink-0"
            />
            <div className="text-xs">
              <p className="font-bold text-white">Extend Lab Hours to 10:00 PM</p>
              <p className="text-[11px] text-cyan-300">Expands access windows by 12%</p>
            </div>
          </label>
        </div>

        {(addSecondGpu || addSecond3DPrinter || extendedHours) && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Forecast:</strong> Proposed changes will decrease campus contention by <strong>{65 - simulatedStrain}%</strong> and accelerate capstone thesis completions by 2.4 weeks.
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Department Heatmap & AI Optimization Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Heatmap */}
        <div className="lg:col-span-2 bg-[#0D1322] p-6 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">
                Departmental Resource Utilization & Bottleneck Index
              </h3>
              <p className="text-xs text-slate-400">
                Live capacity tracking across university laboratories.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {departmentalMetrics.map((dm) => (
              <div key={dm.department} className="p-3.5 bg-slate-900/90 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    {dm.department}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      {dm.crossDeptRequests} Cross-Dept Requests
                    </span>
                    <span className={`font-mono font-bold ${dm.averageUtilization >= 75 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {dm.averageUtilization}% Load
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      dm.averageUtilization >= 75
                        ? 'bg-rose-500'
                        : dm.averageUtilization >= 45
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                    }`}
                    style={{ width: `${dm.averageUtilization}%` }}
                  />
                </div>

                {(dm.bottleneckAssets.length > 0 || dm.underutilizedAssets.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                    {dm.bottleneckAssets.map((name) => (
                      <span
                        key={name}
                        className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 font-semibold border border-rose-800/80 flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        Strain Bottleneck: {name}
                      </span>
                    ))}
                    {dm.underutilizedAssets.map((name) => (
                      <span
                        key={name}
                        className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/80"
                      >
                        ★ Available Capacity: {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* GenAI Executive Optimization Advisor */}
        <div className="bg-gradient-to-br from-[#0F172A] via-[#0B132B] to-[#0A0E1A] text-white p-6 rounded-2xl shadow-xl border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <h3 className="font-extrabold text-sm tracking-wide uppercase text-cyan-300">
                Gemini Optimization Insights
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              AI-generated policy recommendations to optimize university lab capital expenditure & student access.
            </p>

            <div className="space-y-3">
              {optimizationInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-slate-900/90 p-3.5 rounded-xl border border-white/5 text-xs"
                >
                  <div className="flex items-center justify-between text-amber-300 font-bold mb-1">
                    <span>{insight.title}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
                    {insight.description}
                  </p>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-[11px] text-emerald-300 font-medium">
                    <strong>Suggested Action:</strong> {insight.suggestedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <span className="text-[11px] font-mono text-cyan-400">
              LabLink Autonomous Allocator v2.5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
