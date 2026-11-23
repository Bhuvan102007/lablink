import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { GeminiSearchBar } from './components/GeminiSearchBar';
import { EquipmentCatalog } from './components/EquipmentCatalog';
import { INITIAL_EQUIPMENT, INITIAL_BOOKINGS } from './data/mockData';
import { Equipment, BookingRequest, ConflictResolutionPlan } from './types';
import { GeminiService } from './services/geminiService';
import { useTheme } from './context/ThemeContext';
import { CheckCircle2, AlertCircle, Info, Sparkles, Loader2 } from 'lucide-react';

// High-Performance Code-Splitting: Lazy-load heavy modals and auxiliary tab views
const BookingModal = lazy(() => import('./components/BookingModal').then(m => ({ default: m.BookingModal })));
const ConflictResolverModal = lazy(() => import('./components/ConflictResolverModal').then(m => ({ default: m.ConflictResolverModal })));
const FacultyApprovalDashboard = lazy(() => import('./components/FacultyApprovalDashboard').then(m => ({ default: m.FacultyApprovalDashboard })));
const UtilizationAnalytics = lazy(() => import('./components/UtilizationAnalytics').then(m => ({ default: m.UtilizationAnalytics })));
const DemoScenarioPresets = lazy(() => import('./components/DemoScenarioPresets').then(m => ({ default: m.DemoScenarioPresets })));
const ApiKeyModal = lazy(() => import('./components/ApiKeyModal').then(m => ({ default: m.ApiKeyModal })));
const MultimodalVisionModal = lazy(() => import('./components/MultimodalVisionModal').then(m => ({ default: m.MultimodalVisionModal })));
const DigitalAccessPassModal = lazy(() => import('./components/DigitalAccessPassModal').then(m => ({ default: m.DigitalAccessPassModal })));
const AccreditationReportModal = lazy(() => import('./components/AccreditationReportModal').then(m => ({ default: m.AccreditationReportModal })));

const ComponentLoader: React.FC = () => (
  <div className="flex items-center justify-center p-12 text-cyan-400 gap-2">
    <Loader2 className="w-5 h-5 animate-spin" />
    <span className="text-xs font-semibold text-slate-400">Loading module...</span>
  </div>
);

export const App: React.FC = () => {
  const { theme } = useTheme();
  const [equipmentList] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [bookings, setBookings] = useState<BookingRequest[]>(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState<'catalog' | 'approvals' | 'analytics' | 'scenarios'>('catalog');
  const [userRole, setUserRole] = useState<'student' | 'faculty'>('student');

  // Modals state
  const [bookingTarget, setBookingTarget] = useState<Equipment | null>(null);
  const [conflictPair, setConflictPair] = useState<{
    bookingA: BookingRequest;
    bookingB: BookingRequest;
    equipment: Equipment;
  } | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [isAccreditationReportOpen, setIsAccreditationReportOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<{ booking: BookingRequest; equipment: Equipment } | null>(null);

  const [hasApiKey, setHasApiKey] = useState(!!GeminiService.getApiKey());
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Handle new booking submission
  const handleNewBooking = useCallback((newBooking: BookingRequest) => {
    setBookings((prev) => [newBooking, ...prev]);

    if (newBooking.hasConflict) {
      showToast(
        'Collision Detected!',
        'Slot overlaps with an existing reservation. Gemini Arbiter flagged this for faculty arbitration.',
        'warning'
      );
    } else {
      showToast(
        'Request Submitted to Faculty',
        `Access request submitted for ${newBooking.projectTitle}. Automated Gemini readiness review attached.`,
        'success'
      );
    }
  }, []);

  // Handle Faculty approval
  const handleApproveBooking = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'approved' as const, hasConflict: false, accessPassCode: `PASS-${Math.floor(1000 + Math.random() * 9000)}` } : b))
    );
    showToast('Request Approved', `Digital Pass generated for booking ${bookingId}.`, 'success');
  }, []);

  // Handle Faculty rejection
  const handleRejectBooking = useCallback((bookingId: string, feedback?: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'rejected' as const, facultyFeedback: feedback } : b))
    );
    showToast('Request Rejected', feedback || 'Student has been notified to modify parameters.', 'info');
  }, []);

  // Handle Check-In / Check-Out from Technician Gatekeeper
  const handleCheckInToggle = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const isCheckingIn = b.checkInStatus !== 'checked_in';
          return {
            ...b,
            checkInStatus: isCheckingIn ? ('checked_in' as const) : ('completed' as const),
            checkInTime: isCheckingIn ? new Date().toISOString() : b.checkInTime
          };
        }
        return b;
      })
    );

    setSelectedPass((prev) => {
      if (prev && prev.booking.id === bookingId) {
        const isCheckingIn = prev.booking.checkInStatus !== 'checked_in';
        return {
          ...prev,
          booking: {
            ...prev.booking,
            checkInStatus: isCheckingIn ? 'checked_in' : 'completed',
            checkInTime: isCheckingIn ? new Date().toISOString() : prev.booking.checkInTime
          }
        };
      }
      return prev;
    });

    showToast('Gatekeeper Scan Logged', `Student presence updated in central lab security registry.`, 'success');
  }, []);

  // Handle Resolution execution from AI Conflict Arbiter
  const handleApplyResolution = useCallback((plan: ConflictResolutionPlan) => {
    const { primaryBookingId, secondaryBookingId, actionForPrimary, actionForSecondary, suggestedAlternativeSlot, suggestedAlternativeEquipment } =
      plan.recommendedResolution;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === primaryBookingId) {
          return {
            ...b,
            status: 'approved' as const,
            hasConflict: false,
            allocatedSlotNote: actionForPrimary,
            accessPassCode: 'PASS-DGX-9981'
          };
        }
        if (b.id === secondaryBookingId) {
          return {
            ...b,
            status: 'reallocated' as const,
            hasConflict: false,
            date: suggestedAlternativeSlot ? suggestedAlternativeSlot.date : b.date,
            startTime: suggestedAlternativeSlot ? suggestedAlternativeSlot.startTime : b.startTime,
            endTime: suggestedAlternativeSlot ? suggestedAlternativeSlot.endTime : b.endTime,
            allocatedSlotNote: suggestedAlternativeEquipment
              ? `Reallocated: Recommended alternative asset ${suggestedAlternativeEquipment.equipmentName}`
              : actionForSecondary,
            accessPassCode: 'PASS-DGX-9982'
          };
        }
        return b;
      })
    );

    setConflictPair(null);
    showToast(
      'AI Resolution Applied!',
      'Primary slot confirmed and secondary reservation reallocated with zero academic disruption.',
      'success'
    );
  }, []);

  // Preset Scenario Loader for Judges
  const handleLoadScenario = useCallback((scenarioId: string) => {
    if (scenarioId === 'scenario-conflict') {
      setUserRole('faculty');
      setActiveTab('approvals');
      const b1 = bookings.find((b) => b.id === 'req-101');
      const b2 = bookings.find((b) => b.id === 'req-102');
      const eq = equipmentList.find((e) => e.id === 'eq-gpu-a100');
      if (b1 && b2 && eq) {
        setConflictPair({ bookingA: b1, bookingB: b2, equipment: eq });
      }
    } else if (scenarioId === 'scenario-discovery') {
      setUserRole('student');
      setActiveTab('catalog');
      showToast('Discovery Preset Loaded', 'Try running the pre-loaded drone prompt in the Gemini Search Bar.', 'info');
    } else if (scenarioId === 'scenario-faculty') {
      setUserRole('faculty');
      setActiveTab('approvals');
    } else if (scenarioId === 'scenario-analytics') {
      setActiveTab('analytics');
    }
  }, [bookings, equipmentList]);

  const pendingApprovalsCount = useMemo(() => bookings.filter((b) => b.status === 'pending_approval').length, [bookings]);
  const conflictsCount = useMemo(() => bookings.filter((b) => b.status === 'conflict_detected' || b.hasConflict).length, [bookings]);

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#F8FAFC] text-slate-900' : theme === 'midnight' ? 'bg-[#090514] text-purple-100' : 'bg-[#080C14] text-slate-100'} flex flex-col antialiased relative selection:bg-cyan-500 selection:text-black transition-colors duration-200`}>
      {/* Background Cyber-Grid and Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-grid-pattern">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div 
          className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/15 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5"
          role="status"
          aria-live="polite"
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : toastMessage.type === 'warning' ? (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white">{toastMessage.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenVisionModal={() => setIsVisionModalOpen(true)}
        hasApiKey={hasApiKey}
        pendingApprovalsCount={pendingApprovalsCount}
        conflictsCount={conflictsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10" role="main">
        {/* Banner Alert for Detected Conflicts */}
        {conflictsCount > 0 && activeTab !== 'approvals' && (
          <div className="bg-[#170E1A] border border-rose-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-rose-950 text-rose-400 shrink-0 border border-rose-800">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">
                  {conflictsCount} Interdepartmental Scheduling Collision Detected!
                </h3>
                <p className="text-[11px] text-slate-300">
                  Overlapping bookings on NVIDIA DGX A100. Gemini has generated an optimal win-win reallocation plan.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setUserRole('faculty');
                setActiveTab('approvals');
                const b1 = bookings.find((b) => b.id === 'req-101');
                const b2 = bookings.find((b) => b.id === 'req-102');
                const eq = equipmentList.find((e) => e.id === 'eq-gpu-a100');
                if (b1 && b2 && eq) {
                  setConflictPair({ bookingA: b1, bookingB: b2, equipment: eq });
                }
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 whitespace-nowrap active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Launch Gemini Arbiter
            </button>
          </div>
        )}

        {/* Tab 1: Equipment Catalog & Gemini Search */}
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            <GeminiSearchBar
              allEquipment={equipmentList}
              onSelectEquipment={(id) => setSelectedEquipmentId(id)}
              onInitiateBooking={(eq) => setBookingTarget(eq)}
            />

            <EquipmentCatalog
              equipmentList={equipmentList}
              onBookEquipment={(eq) => setBookingTarget(eq)}
              selectedEquipmentId={selectedEquipmentId}
              onClearSelectedEquipment={() => setSelectedEquipmentId(null)}
            />
          </div>
        )}

        {/* Tab 2: Faculty Approvals & Access Requests */}
        {activeTab === 'approvals' && (
          <Suspense fallback={<ComponentLoader />}>
            <FacultyApprovalDashboard
              bookings={bookings}
              equipmentList={equipmentList}
              onApproveBooking={handleApproveBooking}
              onRejectBooking={handleRejectBooking}
              onOpenConflictModal={(b1, b2, eq) => setConflictPair({ bookingA: b1, bookingB: b2, equipment: eq })}
              onViewAccessPass={(booking, eq) => setSelectedPass({ booking, equipment: eq })}
            />
          </Suspense>
        )}

        {/* Tab 3: Campus Analytics & Heatmap */}
        {activeTab === 'analytics' && (
          <Suspense fallback={<ComponentLoader />}>
            <UtilizationAnalytics
              equipmentList={equipmentList}
              bookings={bookings}
              onOpenAccreditationReport={() => setIsAccreditationReportOpen(true)}
            />
          </Suspense>
        )}

        {/* Tab 4: Judge Demo Walkthrough Presets */}
        {activeTab === 'scenarios' && (
          <Suspense fallback={<ComponentLoader />}>
            <DemoScenarioPresets onLoadScenario={handleLoadScenario} />
          </Suspense>
        )}
      </main>

      <Suspense fallback={null}>
        {/* Booking Modal */}
        {bookingTarget && (
          <BookingModal
            equipment={bookingTarget}
            onClose={() => setBookingTarget(null)}
            onSubmitBooking={handleNewBooking}
            existingBookings={bookings}
            allEquipment={equipmentList}
          />
        )}

        {/* Conflict Resolver Modal */}
        {conflictPair && (
          <ConflictResolverModal
            bookingA={conflictPair.bookingA}
            bookingB={conflictPair.bookingB}
            equipment={conflictPair.equipment}
            allEquipment={equipmentList}
            onClose={() => setConflictPair(null)}
            onApplyResolution={handleApplyResolution}
          />
        )}

        {/* Digital Access Pass Modal */}
        {selectedPass && (
          <DigitalAccessPassModal
            booking={selectedPass.booking}
            equipment={selectedPass.equipment}
            onClose={() => setSelectedPass(null)}
            onCheckInToggle={handleCheckInToggle}
          />
        )}

        {/* Accreditation Report Modal */}
        {isAccreditationReportOpen && (
          <AccreditationReportModal
            isOpen={isAccreditationReportOpen}
            onClose={() => setIsAccreditationReportOpen(false)}
            equipmentList={equipmentList}
            bookings={bookings}
          />
        )}

        {/* Gemini Multimodal Vision Modal */}
        {isVisionModalOpen && (
          <MultimodalVisionModal
            isOpen={isVisionModalOpen}
            onClose={() => setIsVisionModalOpen(false)}
            allEquipment={equipmentList}
            onSelectAndBook={(eq) => setBookingTarget(eq)}
          />
        )}

        {/* Gemini API Key Modal */}
        {isApiKeyModalOpen && (
          <ApiKeyModal
            isOpen={isApiKeyModalOpen}
            onClose={() => setIsApiKeyModalOpen(false)}
            onSave={(key) => setHasApiKey(!!key)}
          />
        )}
      </Suspense>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#080C14]/90 backdrop-blur-md py-6 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong className="text-white">LabLink</strong> — Built for PromptWars 2026 • Ramaiah University of Applied Sciences & Cynergy Coding Club
          </p>
          <p className="flex items-center gap-1.5 font-medium text-slate-400">
            Powered by <strong className="text-cyan-400">Google Gemini 2.5</strong> & <strong className="text-white">Google for Developers</strong>
          </p>
        </div>
      </footer>
    </div>
  );
};
