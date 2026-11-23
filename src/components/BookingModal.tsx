import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  Users, 
  UserPlus 
} from 'lucide-react';
import { Equipment, Department, ProjectType, BookingRequest, AIRiskAssessment } from '../types';
import { BookingSubmissionSchema } from '../lib/zodSchemas';
import { GeminiService } from '../services/geminiService';
import { ConflictResolver } from '../services/conflictResolver';

interface BookingModalProps {
  equipment: Equipment;
  onClose: () => void;
  onSubmitBooking: (newBooking: BookingRequest) => void;
  existingBookings: BookingRequest[];
  allEquipment?: Equipment[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  equipment,
  onClose,
  onSubmitBooking,
  existingBookings
}) => {
  const [studentName, setStudentName] = useState('Bhuvan Krishna');
  const [studentId, setStudentId] = useState('1RU23CS042');
  const [studentDepartment, setStudentDepartment] = useState<Department>('Computer Science & Engineering');
  const [projectTitle, setProjectTitle] = useState('Autonomous Edge Drone Telemetry & Vision Processing');
  const [projectType, setProjectType] = useState<ProjectType>('capstone');
  const [projectDeadline, setProjectDeadline] = useState('2026-11-27');
  const [date, setDate] = useState('2026-11-24');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('13:00');
  const [justification, setJustification] = useState(
    'Final year capstone requirement. Need to deploy neural network weights on physical hardware and measure real-time latency and power draw before our review.'
  );

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isEvaluatingAI, setIsEvaluatingAI] = useState(false);
  const [aiPreview, setAiPreview] = useState<AIRiskAssessment | null>(null);

  // Interdisciplinary Collaborator State
  const [collaborators, setCollaborators] = useState<Array<{ name: string; studentId: string; department: Department; roleInProject: string; safetyCertified: boolean }>>([
    {
      name: 'Rohan Sharma',
      studentId: '1RU23ME022',
      department: 'Mechanical & Aerospace',
      roleInProject: 'Mechanical Aerodynamics & Chassis',
      safetyCertified: true
    }
  ]);
  const [showAddCollab, setShowAddCollab] = useState(false);
  const [collabName, setCollabName] = useState('');
  const [collabId, setCollabId] = useState('');
  const [collabDept, setCollabDept] = useState<Department>('Electronics & Communication');

  const handleAddCollaborator = () => {
    if (collabName.trim() && collabId.trim()) {
      setCollaborators(prev => [
        ...prev,
        {
          name: collabName.trim(),
          studentId: collabId.trim(),
          department: collabDept,
          roleInProject: 'Hardware Integration Specialist',
          safetyCertified: true
        }
      ]);
      setCollabName('');
      setCollabId('');
      setShowAddCollab(false);
    }
  };

  const handleRunAiEvaluation = async () => {
    setIsEvaluatingAI(true);
    try {
      const assessment = await GeminiService.assessBookingReadiness(
        {
          equipmentId: equipment.id,
          studentName,
          studentId,
          studentDepartment,
          projectTitle,
          projectType,
          projectDeadline,
          date,
          startTime,
          endTime,
          justification
        },
        equipment
      );
      setAiPreview(assessment);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluatingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const formData = {
      equipmentId: equipment.id,
      studentName,
      studentId,
      studentDepartment,
      projectTitle,
      projectType,
      projectDeadline,
      date,
      startTime,
      endTime,
      justification
    };

    const result = BookingSubmissionSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    let finalAssessment = aiPreview;
    if (!finalAssessment) {
      finalAssessment = await GeminiService.assessBookingReadiness(formData, equipment);
    }

    const tempBooking: BookingRequest = {
      id: `req-${Date.now()}`,
      ...formData,
      teamCollaborators: collaborators,
      status: 'pending_approval',
      submittedAt: new Date().toISOString(),
      aiRiskAssessment: finalAssessment
    };

    const conflicting = existingBookings.find(
      (b) => b.equipmentId === equipment.id && b.status !== 'rejected' && ConflictResolver.hasTimeConflict(b, tempBooking)
    );

    if (conflicting) {
      tempBooking.hasConflict = true;
      tempBooking.conflictingBookingId = conflicting.id;
      tempBooking.status = 'conflict_detected';
    }

    onSubmitBooking(tempBooking);
    onClose();
  };

  const departments: Department[] = [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Mechanical & Aerospace',
    'Biotechnology & Healthcare',
    'Robotics & Automation',
    'Civil & Structural Engineering',
    'Chemical & Nanotechnology',
    'Physics & Materials Science'
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#0D1322] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-white/15 my-8 animate-in fade-in zoom-in-95 text-white">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                Slot Reservation
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {equipment.id}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Request Access: {equipment.name}
            </h3>
            <p className="text-xs text-slate-400">
              Department: {equipment.department} • Room: {equipment.location}
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

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {/* Student Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none text-white"
              />
              {validationErrors.studentName && (
                <p className="text-[11px] text-rose-400 mt-0.5">{validationErrors.studentName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                University USN / ID *
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none text-white font-mono"
              />
              {validationErrors.studentId && (
                <p className="text-[11px] text-rose-400 mt-0.5">{validationErrors.studentId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Department *
              </label>
              <select
                value={studentDepartment}
                onChange={(e) => setStudentDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none text-slate-200"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none text-white"
              />
              {validationErrors.projectTitle && (
                <p className="text-[11px] text-rose-400 mt-0.5">{validationErrors.projectTitle}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Classification *
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none text-slate-200 font-medium"
              >
                <option value="capstone">Final Year Capstone (P1)</option>
                <option value="sponsored_research">Sponsored Research (P2)</option>
                <option value="hackathon">Hackathon / Competition (P3)</option>
                <option value="coursework">Semester Coursework (P4)</option>
                <option value="personal_exploration">Personal Project (P5)</option>
              </select>
            </div>
          </div>

          {/* Collaborator Section */}
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Interdisciplinary Co-Investigators ({collaborators.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddCollab(!showAddCollab)}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                {showAddCollab ? 'Cancel' : '+ Add Cross-Dept Partner'}
              </button>
            </div>

            {showAddCollab && (
              <div className="mb-3 p-3 bg-slate-950 rounded-xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Collaborator Name"
                  value={collabName}
                  onChange={(e) => setCollabName(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded outline-none"
                />
                <input
                  type="text"
                  placeholder="USN (e.g. 1RU23EC010)"
                  value={collabId}
                  onChange={(e) => setCollabId(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded outline-none font-mono"
                />
                <div className="flex gap-1.5">
                  <select
                    value={collabDept}
                    onChange={(e) => setCollabDept(e.target.value as Department)}
                    className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 text-white rounded outline-none text-[11px]"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d.split('&')[0]}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCollaborator}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {collaborators.map((c, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-xs flex items-center gap-2"
                >
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{c.studentId}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {c.department.split('&')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ Safety Certified</span>
                </div>
              ))}
            </div>
          </div>

          {/* Date, Times & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Slot Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none font-mono text-white"
              />
              {validationErrors.date && (
                <p className="text-[11px] text-rose-400 mt-0.5">{validationErrors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none font-mono text-white"
              />
              {validationErrors.startTime && (
                <p className="text-[11px] text-rose-400 mt-0.5">{validationErrors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none font-mono text-white"
              />
              {validationErrors.endTime && (
                <p className="text-[11px] text-rose-400 mt-0.5">{validationErrors.endTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Deadline *
              </label>
              <input
                type="date"
                value={projectDeadline}
                onChange={(e) => setProjectDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none font-mono text-white"
              />
            </div>
          </div>

          {/* Justification Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Detailed Academic Justification & Resource Needs *
              </label>
              <button
                type="button"
                onClick={handleRunAiEvaluation}
                disabled={isEvaluatingAI || justification.length < 10}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 disabled:opacity-50"
              >
                {isEvaluatingAI ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                )}
                <span>Run Gemini Pre-Check</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain why your project requires this specific instrument..."
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none text-white leading-relaxed"
            />
            {validationErrors.justification && (
              <p className="text-[11px] text-rose-400 mt-0.5">{validationErrors.justification}</p>
            )}
          </div>

          {/* Live Gemini Readiness Assessment Card */}
          {aiPreview && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-cyan-500/30 text-xs">
              <div className="flex items-center justify-between font-bold text-cyan-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Gemini Automated Readiness Assessment
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-mono">
                  Readiness: {aiPreview.readinessScore}/100
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed mt-1">
                {aiPreview.summary}
              </p>
              {aiPreview.mitigationNotes && (
                <p className="text-cyan-200 text-[11px] font-medium mt-1">
                  💡 Note: {aiPreview.mitigationNotes}
                </p>
              )}
            </div>
          )}

          {/* Prerequisites Notice */}
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-3 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Safety & Prerequisite Notice</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                This asset requires: {equipment.prerequisites.join('; ')}. Submitting this request confirms you have reviewed the department lab SOP.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Request to Faculty</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
