import React from 'react';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Building, 
  Printer 
} from 'lucide-react';
import { BookingRequest, Equipment } from '../types';

interface DigitalAccessPassModalProps {
  booking: BookingRequest;
  equipment: Equipment;
  onClose: () => void;
  onCheckInToggle: (bookingId: string) => void;
}

export const DigitalAccessPassModal: React.FC<DigitalAccessPassModalProps> = ({
  booking,
  equipment,
  onClose,
  onCheckInToggle
}) => {
  const isCheckedIn = booking.checkInStatus === 'checked_in';

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden animate-in zoom-in-95">
        {/* Holographic Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400" />

        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              RUAS Campus Laboratory Gatekeeper Pass
            </div>
            <h3 id="pass-modal-title" className="text-xl font-extrabold text-slate-900 mt-1">
              Authorized Lab Access Pass
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Badge Container */}
        <div className="my-5 p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
          {/* Subtle Watermark Badge */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <QrCode className="w-48 h-48 text-white" />
          </div>

          {/* Pass Top Meta */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div>
              <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider block">
                Authorization Code
              </span>
              <span className="text-sm font-mono font-extrabold text-amber-300">
                {booking.accessPassCode || `PASS-${booking.id.toUpperCase()}`}
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
              isCheckedIn
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-brand-500/20 text-brand-300 border-brand-400/40'
            }`}>
              {isCheckedIn ? '● Active Session Inside Lab' : 'Ready For Check-In'}
            </span>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div>
              <p className="text-[10px] text-indigo-300 font-semibold uppercase">Authorized Researcher</p>
              <p className="font-bold text-white text-sm">{booking.studentName}</p>
              <p className="text-[11px] font-mono text-slate-300">{booking.studentId}</p>
            </div>
            <div>
              <p className="text-[10px] text-indigo-300 font-semibold uppercase">Academic Unit</p>
              <p className="font-bold text-white text-xs">{booking.studentDepartment.split('&')[0]}</p>
              <p className="text-[10px] text-indigo-200 uppercase font-semibold mt-0.5">
                {booking.projectType.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Equipment & Location */}
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-xs space-y-1 mb-4">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Building className="w-3.5 h-3.5" />
              <span>{equipment.name}</span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-400" />
              {equipment.location}
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-indigo-200">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-300" /> {booking.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-300" /> {booking.startTime} - {booking.endTime}
              </span>
            </div>
          </div>

          {/* Simulated Cryptographic QR Code */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
            <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* QR Code pattern simulation */}
                <rect width="100" height="100" fill="white" />
                <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                <rect x="9" y="9" width="17" height="17" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                <rect x="74" y="9" width="17" height="17" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                <rect x="9" y="74" width="17" height="17" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

                {/* Simulated Data Bits */}
                <rect x="35" y="10" width="8" height="8" fill="#0f172a" />
                <rect x="47" y="15" width="8" height="8" fill="#0f172a" />
                <rect x="55" y="25" width="8" height="8" fill="#0f172a" />
                <rect x="35" y="35" width="12" height="12" fill="#0284c7" />
                <rect x="52" y="35" width="10" height="10" fill="#0f172a" />
                <rect x="68" y="45" width="12" height="8" fill="#0f172a" />
                <rect x="35" y="55" width="8" height="15" fill="#0f172a" />
                <rect x="48" y="60" width="15" height="8" fill="#0f172a" />
                <rect x="70" y="70" width="15" height="15" fill="#0f172a" />
                <rect x="74" y="74" width="7" height="7" fill="#0284c7" />
              </svg>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <p className="font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Cryptographically Verified
              </p>
              <p className="text-indigo-200">
                Authorized by Faculty Board. Valid for single-entry duration on {booking.date}.
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                SHA256: e8b9f4c102a9b3d1...
              </p>
            </div>
          </div>
        </div>

        {/* Lab In-Charge Gatekeeper Actions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onCheckInToggle(booking.id)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                isCheckedIn
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>
                {isCheckedIn ? 'Technician Gatekeeper: Check Out Student' : 'Technician Gatekeeper: Scan & Check In'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700"
              title="Print Badge"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Laboratory Technicians verify this digital pass before powering workstation mains.
          </p>
        </div>
      </div>
    </div>
  );
};
