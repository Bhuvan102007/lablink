import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  Calendar, 
  Building, 
  Scale, 
  QrCode 
} from 'lucide-react';
import { BookingRequest, Equipment } from '../types';

interface FacultyApprovalDashboardProps {
  bookings: BookingRequest[];
  equipmentList: Equipment[];
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string, feedback?: string) => void;
  onOpenConflictModal: (bookingA: BookingRequest, bookingB: BookingRequest, eq: Equipment) => void;
  onViewAccessPass?: (booking: BookingRequest, eq: Equipment) => void;
}

export const FacultyApprovalDashboard: React.FC<FacultyApprovalDashboardProps> = ({
  bookings,
  equipmentList,
  onApproveBooking,
  onRejectBooking,
  onOpenConflictModal,
  onViewAccessPass
}) => {
  const [filterTab, setFilterTab] = useState<'conflicts' | 'pending' | 'approved' | 'all'>('conflicts');
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const getEquipment = (id: string) => equipmentList.find((e) => e.id === id);

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'conflicts') return b.status === 'conflict_detected' || b.hasConflict;
    if (filterTab === 'pending') return b.status === 'pending_approval';
    if (filterTab === 'approved') return b.status === 'approved';
    return true;
  });

  const conflictCount = bookings.filter((b) => b.status === 'conflict_detected' || b.hasConflict).length;
  const pendingCount = bookings.filter((b) => b.status === 'pending_approval').length;

  const handleConfirmReject = (id: string) => {
    onRejectBooking(id, feedbackText);
    setRejectingBookingId(null);
    setFeedbackText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D1322] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">
                Faculty & Lab In-Charge Governance Portal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review project-based access requests, monitor automated safety screenings, and resolve resource collisions.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl text-xs font-bold border border-white/10">
          <button
            onClick={() => setFilterTab('conflicts')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterTab === 'conflicts'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Conflicts</span>
            {conflictCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterTab === 'conflicts' ? 'bg-white text-rose-700 font-extrabold' : 'bg-rose-950 text-rose-300'}`}>
                {conflictCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterTab === 'pending'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterTab === 'pending' ? 'bg-white text-cyan-800 font-extrabold' : 'bg-cyan-950 text-cyan-300'}`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterTab('approved')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterTab === 'approved'
                ? 'bg-white/15 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Approved
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterTab === 'all'
                ? 'bg-white/15 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((req) => {
            const eq = getEquipment(req.equipmentId);
            const conflictingReq = req.conflictingBookingId
              ? bookings.find((b) => b.id === req.conflictingBookingId)
              : null;

            return (
              <div
                key={req.id}
                className={`rounded-2xl p-5 sm:p-6 transition-all shadow-xl ${
                  req.status === 'conflict_detected'
                    ? 'bg-[#150D15] border border-rose-500/50 shadow-rose-900/10'
                    : 'bg-[#0D1322] border border-white/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  {/* Student & Equipment summary */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {req.studentId}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {req.studentName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-slate-300">
                        {req.studentDepartment}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {req.projectType.replace('_', ' ')}
                      </span>
                      {req.status === 'conflict_detected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          Collision Flagged
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Approved
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-white mt-1">
                      {req.projectTitle}
                    </h3>

                    <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                      <strong className="text-slate-200 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-cyan-400" />
                        Target: {eq?.name || req.equipmentId}
                      </strong>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {req.date} ({req.startTime} - {req.endTime})
                      </span>
                      <span>•</span>
                      <span className="text-rose-400 font-semibold font-mono">
                        Deadline: {req.projectDeadline}
                      </span>
                    </p>
                  </div>

                  {/* Gemini Assessment Badge */}
                  {req.aiRiskAssessment && (
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950/80 p-3 rounded-2xl border border-indigo-500/30 text-xs shrink-0 max-w-sm">
                      <div className="flex items-center justify-between font-bold text-indigo-300 mb-1">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          Gemini Readiness Score
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-extrabold">
                          {req.aiRiskAssessment.readinessScore}/100
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                        {req.aiRiskAssessment.summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Justification & Conflict Callout */}
                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-300">
                    <strong className="text-slate-200">Justification:</strong> {req.justification}
                    {req.allocatedSlotNote && (
                      <p className="text-emerald-400 font-semibold mt-1">
                        ✓ Note: {req.allocatedSlotNote}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'conflict_detected' && conflictingReq && eq && (
                      <button
                        type="button"
                        onClick={() => onOpenConflictModal(req, conflictingReq, eq)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-95 transition-all"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Launch AI Conflict Arbiter</span>
                      </button>
                    )}

                    {req.status === 'approved' && eq && onViewAccessPass && (
                      <button
                        type="button"
                        onClick={() => onViewAccessPass(req, eq)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 shadow-xs transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View Gatekeeper Pass</span>
                      </button>
                    )}

                    {req.status !== 'approved' && req.status !== 'rejected' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setRejectingBookingId(req.id)}
                          className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-semibold text-xs transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => onApproveBooking(req.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve Access</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Rejection Feedback Dialog */}
                {rejectingBookingId === req.id && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-white/10">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Reason for Rejection:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="E.g., Complete Laser Safety Class II training before booking."
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmReject(req.id)}
                        className="px-3 py-1.5 bg-rose-600 text-white font-semibold text-xs rounded-lg"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingBookingId(null)}
                        className="px-2 py-1.5 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-[#0D1322] rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-200">No requests in this category.</p>
            <p className="text-xs text-slate-500 mt-0.5">All laboratory access queues are fully processed.</p>
          </div>
        )}
      </div>
    </div>
  );
};
