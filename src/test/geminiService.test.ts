import { describe, it, expect } from 'vitest';
import { GeminiService } from '../services/geminiService';
import { INITIAL_EQUIPMENT } from '../data/mockData';

describe('Gemini Semantic Discovery & Readiness Engine', () => {
  it('matches drone and casing queries with 3D Printer and Oscilloscope', () => {
    const query = 'Autonomous drone telemetry and 3D printed aerodynamic enclosure';
    const matches = GeminiService.fallbackSemanticSearch(query, INITIAL_EQUIPMENT);

    expect(matches.length).toBeGreaterThan(0);
    const topMatchIds = matches.map(m => m.equipmentId);
    expect(topMatchIds).toContain('eq-3dprint-formlabs');
  });

  it('matches deep learning queries with NVIDIA DGX A100 Workstation', () => {
    const query = 'Fine-tune vision transformer LLM on medical CT scans';
    const matches = GeminiService.fallbackSemanticSearch(query, INITIAL_EQUIPMENT);

    expect(matches[0].equipmentId).toBe('eq-gpu-a100');
    expect(matches[0].matchScore).toBeGreaterThanOrEqual(80);
  });

  it('evaluates readiness and flags hazard equipment with mitigation advice', () => {
    const hazardousEquip = INITIAL_EQUIPMENT.find(e => e.safetyLevel === 'Hazardous_Supervised')!;
    const assessment = GeminiService.fallbackRiskAssessment(
      {
        equipmentId: hazardousEquip.id,
        studentName: 'Rohan Deshmukh',
        studentId: '1RU23BT031',
        studentDepartment: 'Biotechnology & Healthcare',
        projectTitle: 'Microfluidic Chip Fabrication',
        projectType: 'sponsored_research',
        projectDeadline: '2026-11-30',
        date: '2026-11-25',
        startTime: '09:00',
        endTime: '13:00',
        justification: 'High-precision microfluidic channels requiring 25um SLA printing.'
      },
      hazardousEquip
    );

    expect(assessment.readinessScore).toBeGreaterThanOrEqual(70);
    expect(assessment.mitigationNotes).toBeDefined();
  });

  it('performs multimodal vision analysis for PCB and CAD model inputs', () => {
    const pcbResult = GeminiService.fallbackMultimodalAnalysis('pcb_schematic');
    expect(pcbResult.detectedDomain).toContain('RF Signal Integrity');
    expect(pcbResult.recommendedEquipmentIds).toContain('eq-scope-tektronix');
    expect(pcbResult.safetyWarnings.length).toBeGreaterThan(0);

    const cadResult = GeminiService.fallbackMultimodalAnalysis('cad_model');
    expect(cadResult.detectedDomain).toContain('Microfluidics');
    expect(cadResult.recommendedEquipmentIds).toContain('eq-3dprint-formlabs');
  });
});
