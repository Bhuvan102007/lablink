export type Department = 
  | 'Computer Science & Engineering'
  | 'Electronics & Communication'
  | 'Mechanical & Aerospace'
  | 'Biotechnology & Healthcare'
  | 'Robotics & Automation'
  | 'Civil & Structural Engineering'
  | 'Chemical & Nanotechnology'
  | 'Physics & Materials Science';

export type EquipmentCategory = 
  | 'workstation'
  | 'dev_kit'
  | 'specialized_machinery'
  | 'testing_measurement'
  | 'spectroscopy'
  | 'microscopy'
  | 'aerodynamics';

export type SafetyLevel = 'General' | 'Trained_Only' | 'Hazardous_Supervised';

export type ProjectType = 
  | 'capstone'
  | 'sponsored_research'
  | 'hackathon'
  | 'coursework'
  | 'personal_exploration';

export interface Equipment {
  id: string;
  name: string;
  model: string;
  department: Department;
  category: EquipmentCategory;
  location: string;
  description: string;
  specifications: Record<string, string>;
  safetyLevel: SafetyLevel;
  prerequisites: string[];
  totalUnits: number;
  availableUnits: number;
  hourlySlotCapacity: number;
  utilizationRate: number; // 0 to 100 percentage
  tags: string[];
  iconType: 'gpu' | 'oscilloscope' | 'printer3d' | 'fpga' | 'centrifuge' | 'laser' | 'vr' | 'robot' | 'microscope' | 'windtunnel' | 'tensile' | 'bioreactor';
}

export interface AIRiskAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  readinessScore: number; // 0 to 100
  prerequisiteSatisfied: boolean;
  recommendation: 'APPROVE' | 'CONDITIONAL_APPROVAL' | 'REQUIRES_REVISION' | 'REJECT';
  summary: string;
  mitigationNotes?: string;
}

export interface TeamCollaborator {
  name: string;
  studentId: string;
  department: Department;
  roleInProject: string;
  safetyCertified: boolean;
}

export interface BookingRequest {
  id: string;
  equipmentId: string;
  studentName: string;
  studentId: string;
  studentDepartment: Department;
  teamCollaborators?: TeamCollaborator[];
  projectTitle: string;
  projectType: ProjectType;
  projectDeadline: string; // ISO date
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'pending_approval' | 'approved' | 'rejected' | 'conflict_detected' | 'reallocated';
  checkInStatus?: 'not_checked_in' | 'checked_in' | 'completed';
  checkInTime?: string;
  accessPassCode?: string;
  justification: string;
  submittedAt: string;
  aiRiskAssessment?: AIRiskAssessment;
  hasConflict?: boolean;
  conflictingBookingId?: string;
  facultyFeedback?: string;
  allocatedSlotNote?: string;
}

export interface ConflictResolutionPlan {
  conflictId: string;
  severity: 'CRITICAL' | 'MODERATE' | 'LOW';
  detectedReason: string;
  originalBookings: BookingRequest[];
  recommendedResolution: {
    primaryBookingId: string;
    secondaryBookingId: string;
    actionForPrimary: string;
    actionForSecondary: string;
    suggestedAlternativeEquipment?: {
      equipmentId: string;
      equipmentName: string;
      department: Department;
      location: string;
      reason: string;
    };
    suggestedAlternativeSlot?: {
      date: string;
      startTime: string;
      endTime: string;
    };
    fairnessRationale: string;
  };
}

export interface GenAIMatchResult {
  equipmentId: string;
  matchScore: number; // 0 to 100
  relevanceReason: string;
  suggestedWorkflow: string;
  departmentAdvantage: string;
}

export interface MultimodalAnalysisResult {
  detectedDomain: string;
  identifiedComponents: string[];
  recommendedEquipmentIds: string[];
  recommendedEquipmentNames: string[];
  safetyWarnings: string[];
  suggestedProjectScope: string;
}

export interface UtilizationMetric {
  department: Department;
  totalAssets: number;
  averageUtilization: number;
  crossDeptRequests: number;
  bottleneckAssets: string[];
  underutilizedAssets: string[];
}
