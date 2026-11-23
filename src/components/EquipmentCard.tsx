import React from 'react';
import { 
  Cpu, 
  Activity, 
  Printer, 
  Microchip, 
  FlaskRound as Flask, 
  Flame, 
  Glasses, 
  Bot, 
  MapPin, 
  ShieldAlert, 
  Clock, 
  ExternalLink,
  Eye,
  Wind,
  Dna,
  Scale
} from 'lucide-react';
import { Equipment } from '../types';

interface EquipmentCardProps {
  equipment: Equipment;
  onSelect: (equipment: Equipment) => void;
  onBook: (equipment: Equipment) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onSelect,
  onBook
}) => {
  const renderIcon = () => {
    switch (equipment.iconType) {
      case 'gpu':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'oscilloscope':
        return <Activity className="w-5 h-5 text-indigo-400" />;
      case 'printer3d':
        return <Printer className="w-5 h-5 text-emerald-400" />;
      case 'fpga':
        return <Microchip className="w-5 h-5 text-amber-400" />;
      case 'centrifuge':
        return <Flask className="w-5 h-5 text-rose-400" />;
      case 'laser':
        return <Flame className="w-5 h-5 text-red-400" />;
      case 'vr':
        return <Glasses className="w-5 h-5 text-purple-400" />;
      case 'robot':
        return <Bot className="w-5 h-5 text-cyan-400" />;
      case 'microscope':
        return <Eye className="w-5 h-5 text-teal-400" />;
      case 'windtunnel':
        return <Wind className="w-5 h-5 text-sky-400" />;
      case 'tensile':
        return <Scale className="w-5 h-5 text-orange-400" />;
      case 'bioreactor':
        return <Dna className="w-5 h-5 text-emerald-400" />;
      default:
        return <Cpu className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getSafetyBadge = () => {
    switch (equipment.safetyLevel) {
      case 'General':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
            Open Access
          </span>
        );
      case 'Trained_Only':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">
            Training Required
          </span>
        );
      case 'Hazardous_Supervised':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            Supervised SOP
          </span>
        );
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
    if (rate >= 50) return 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]';
    return 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]';
  };

  return (
    <div className="bg-[#0D1322] rounded-2xl border border-white/10 hover:border-cyan-500/50 shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 hover:shadow-cyan-500/10 h-full">
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Badges */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 group-hover:border-cyan-500/40 transition-colors">
              {renderIcon()}
            </div>
            <div className="flex flex-col items-end gap-1">
              {getSafetyBadge()}
              <span className="text-[11px] font-mono font-medium text-slate-400">
                {equipment.availableUnits}/{equipment.totalUnits} Units Online
              </span>
            </div>
          </div>

          {/* Title and Department */}
          <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">
            {equipment.department.split('&')[0]}
          </span>
          <h3 className="font-bold text-base text-white mt-1 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-cyan-200 transition-colors">
            {equipment.name}
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            {equipment.model}
          </p>

          {/* Location */}
          <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 mt-2.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{equipment.location}</span>
          </p>

          {/* Description */}
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed min-h-[2rem]">
            {equipment.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {equipment.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-300 border border-white/5"
              >
                #{tag}
              </span>
            ))}
            {equipment.tags.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500">
                +{equipment.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Utilization Meter */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              Peak Load Strain
            </span>
            <span className={`font-mono font-bold text-xs ${equipment.utilizationRate >= 80 ? 'text-rose-400' : 'text-slate-200'}`}>
              {equipment.utilizationRate}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getUtilizationColor(equipment.utilizationRate)}`}
              style={{ width: `${equipment.utilizationRate}%` }}
              role="progressbar"
              aria-valuenow={equipment.utilizationRate}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-5 py-3 bg-slate-900/80 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect(equipment)}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          aria-label={`View detailed specifications for ${equipment.name}`}
        >
          <span>Specs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onBook(equipment)}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
          aria-label={`Request slot booking for ${equipment.name}`}
        >
          <span>Book Slot</span>
        </button>
      </div>
    </div>
  );
};
