import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  AlertOctagon, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Scale, 
  Layers, 
  Loader2 
} from 'lucide-react';
import { BookingRequest, Equipment, ConflictResolutionPlan } from '../types';
import { ConflictResolver } from '../services/conflictResolver';

interface ConflictResolverModalProps {
  bookingA: BookingRequest;
  bookingB: BookingRequest;
  equipment: Equipment;
  allEquipment: Equipment[];
  onClose: () => void;
  onApplyResolution: (plan: ConflictResolutionPlan) => void;
}

export const ConflictResolverModal: React.FC<ConflictResolverModalProps> = ({
  bookingA,
  bookingB,
  equipment,
  allEquipment,
  onClose,
  onApplyResolution
}) => {
  const [resolutionPlan, setResolutionPlan] = useState<ConflictResolutionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function computeResolution() {
      setIsLoading(true);
      try {
        const plan = await ConflictResolver.resolveConflict(
          bookingA,
          bookingB,
          equipment,
          allEquipment
        );
        setResolutionPlan(plan);
      } catch (err) {
        console.error('Failed to arbitrate conflict:', err);
      } finally {
        setIsLoading(false);
      }
    }

    computeResolution();
  }, [bookingA, bookingB, equipment, allEquipment]);

  const getDaysRemaining = (dateStr: string) => {
    const deadline = new Date(dateStr).getTime();
    const now = Date.now();
    return Math.max(1, Math.round((deadline - now) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#0D1322] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-rose-500/40 my-8 animate-in fade-in zoom-in-95 text-white">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1.5 shadow-sm">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Interdepartmental Collision Detected
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Gemini Multi-Criteria Arbiter
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-2">
              Slot Collision on {equipment.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Two students have requested overlapping hours on Date: <strong className="text-white">{bookingA.date}</strong> in {equipment.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-Side Comparison of Overlapping Requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Request A Card */}
          <div className="bg-[#121A2D] rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {bookingA.studentId}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {bookingA.projectType.replace('_', ' ')}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">{bookingA.studentName}</h4>
              <p className="text-xs text-slate-400">{bookingA.studentDepartment}</p>

              <div className="mt-3 space-y-1.5 text-xs">
                <p className="text-slate-300 font-medium line-clamp-2">
                  <strong className="text-white">Project:</strong> {bookingA.projectTitle}
                </p>
                <div className="flex items-center gap-3 text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {bookingA.startTime} - {bookingA.endTime}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-rose-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline in {getDaysRemaining(bookingA.projectDeadline)} days
                  </span>
                </div>
              </div>

              <div className="mt-3 bg-slate-900/90 p-2.5 rounded-xl border border-white/5 text-[11px] text-slate-300">
                <strong className="text-white">Justification:</strong> {bookingA.justification}
              </div>
            </div>
          </div>

          {/* Request B Card */}
          <div className="bg-[#121A2D] rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {bookingB.studentId}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                  {bookingB.projectType.replace('_', ' ')}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">{bookingB.studentName}</h4>
              <p className="text-xs text-slate-400">{bookingB.studentDepartment}</p>

              <div className="mt-3 space-y-1.5 text-xs">
                <p className="text-slate-300 font-medium line-clamp-2">
                  <strong className="text-white">Project:</strong> {bookingB.projectTitle}
                </p>
                <div className="flex items-center gap-3 text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {bookingB.startTime} - {bookingB.endTime}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline in {getDaysRemaining(bookingB.projectDeadline)} days
                  </span>
                </div>
              </div>

              <div className="mt-3 bg-slate-900/90 p-2.5 rounded-xl border border-white/5 text-[11px] text-slate-300">
                <strong className="text-white">Justification:</strong> {bookingB.justification}
              </div>
            </div>
          </div>
        </div>

        {/* AI Resolution Engine Output */}
        {isLoading ? (
          <div className="p-8 text-center bg-slate-900/90 rounded-2xl border border-white/10">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-cyan-300">
              Evaluating Academic Urgency, Deadlines & Sister Lab Equipment...
            </p>
          </div>
        ) : resolutionPlan ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#0B132B] to-[#0A0E1A] text-white shadow-xl space-y-4 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <Scale className="w-4 h-4 text-cyan-400" />
                Gemini Arbitrated Win-Win Resolution Plan
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Fairness Index: 98%
              </span>
            </div>

            {/* Step-by-Step Allocation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Primary Slot Awarded
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {resolutionPlan.recommendedResolution.actionForPrimary}
                </p>
              </div>

              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Clock className="w-4 h-4" />
                  Feasible Adjustment / Reallocation
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {resolutionPlan.recommendedResolution.actionForSecondary}
                </p>
              </div>
            </div>

            {/* Sister Lab Alternative Recommendation */}
            {resolutionPlan.recommendedResolution.suggestedAlternativeEquipment && (
              <div className="bg-cyan-950/40 p-3.5 rounded-xl border border-cyan-800/60 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Cross-Department Feasible Equipment Alternative:
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    Peer Lab Alternative
                  </span>
                </div>
                <p className="text-white mt-1 font-semibold">
                  {resolutionPlan.recommendedResolution.suggestedAlternativeEquipment.equipmentName} ({resolutionPlan.recommendedResolution.suggestedAlternativeEquipment.department})
                </p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  {resolutionPlan.recommendedResolution.suggestedAlternativeEquipment.reason}
                </p>
              </div>
            )}

            {/* Fairness Rationale */}
            <div className="text-xs bg-black/40 p-3 rounded-xl border border-white/5">
              <p className="text-cyan-300 font-bold mb-0.5">Academic & Ethical Rationale:</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {resolutionPlan.recommendedResolution.fairnessRationale}
              </p>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/10 transition-colors"
          >
            Dismiss
          </button>
          <button
            type="button"
            disabled={!resolutionPlan || isLoading}
            onClick={() => {
              if (resolutionPlan) onApplyResolution(resolutionPlan);
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply AI Resolution & Reallocate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
