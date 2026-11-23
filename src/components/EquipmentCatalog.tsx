import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Search, X, CheckCircle } from 'lucide-react';
import { Equipment } from '../types';
import { EquipmentCard } from './EquipmentCard';

interface EquipmentCatalogProps {
  equipmentList: Equipment[];
  onBookEquipment: (equipment: Equipment) => void;
  selectedEquipmentId?: string | null;
  onClearSelectedEquipment?: () => void;
}

export const EquipmentCatalog: React.FC<EquipmentCatalogProps> = ({
  equipmentList,
  onBookEquipment,
  selectedEquipmentId,
  onClearSelectedEquipment
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedEquipment, setInspectedEquipment] = useState<Equipment | null>(null);

  React.useEffect(() => {
    if (selectedEquipmentId) {
      const found = equipmentList.find((e) => e.id === selectedEquipmentId);
      if (found) setInspectedEquipment(found);
    }
  }, [selectedEquipmentId, equipmentList]);

  const departments = [
    'ALL',
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Mechanical & Aerospace',
    'Biotechnology & Healthcare',
    'Robotics & Automation',
    'Civil & Structural Engineering',
    'Chemical & Nanotechnology'
  ];

  const categories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Workstations & Supercomputers', value: 'workstation' },
    { label: 'Development Kits & FPGAs', value: 'dev_kit' },
    { label: 'Specialized Machinery & 3D Print', value: 'specialized_machinery' },
    { label: 'Testing & RF Scopes', value: 'testing_measurement' },
    { label: 'Spectroscopy & Bio-Instruments', value: 'spectroscopy' },
    { label: 'Electron Microscopy', value: 'microscopy' },
    { label: 'Aerodynamics & Wind Tunnels', value: 'aerodynamics' }
  ];

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((eq) => {
      const matchesDept = selectedDept === 'ALL' || eq.department === selectedDept;
      const matchesCat = selectedCategory === 'ALL' || eq.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDept && matchesCat && matchesSearch;
    });
  }, [equipmentList, selectedDept, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Filter, Category, Search */}
      <div className="bg-[#0D1322] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by equipment name, model number, keyword, or tag..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-900/90 text-white border border-slate-700/80 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400 shrink-0 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-400 outline-none text-slate-200"
              aria-label="Filter by equipment category"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1 mr-1 text-[11px]">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Dept:
          </span>
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all text-xs ${
                selectedDept === d
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {d === 'ALL' ? 'All Departments' : d.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Active Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-cyan-300">{filteredEquipment.length}</strong> specialized lab instruments
        </span>
        {(selectedDept !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedDept('ALL');
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
            className="text-cyan-400 hover:text-cyan-300 font-bold underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Equipment Cards Grid */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEquipment.map((eq) => (
            <EquipmentCard
              key={eq.id}
              equipment={eq}
              onSelect={(item) => setInspectedEquipment(item)}
              onBook={(item) => onBookEquipment(item)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#0D1322] rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-sm font-semibold text-slate-300">No lab equipment matches your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or selecting All Departments.</p>
        </div>
      )}

      {/* Specifications Inspection Modal */}
      {inspectedEquipment && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#0D1322] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white/15 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 text-white">
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {inspectedEquipment.department}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {inspectedEquipment.name}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Model: {inspectedEquipment.model} | {inspectedEquipment.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInspectedEquipment(null);
                  if (onClearSelectedEquipment) onClearSelectedEquipment();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Equipment Overview
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {inspectedEquipment.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Technical Specifications
                </h4>
                <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {Object.entries(inspectedEquipment.specifications).map(([key, value]) => (
                      <div key={key} className="border-b border-white/5 pb-2">
                        <dt className="text-slate-400 font-medium">{key}</dt>
                        <dd className="text-white font-mono font-bold mt-0.5">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Safety Protocols & Training Required
                </h4>
                <div className="space-y-1.5">
                  {inspectedEquipment.prerequisites.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs font-medium text-amber-200 bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl"
                    >
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setInspectedEquipment(null);
                  if (onClearSelectedEquipment) onClearSelectedEquipment();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = inspectedEquipment;
                  setInspectedEquipment(null);
                  if (onClearSelectedEquipment) onClearSelectedEquipment();
                  onBookEquipment(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
              >
                Request Slot for this Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
