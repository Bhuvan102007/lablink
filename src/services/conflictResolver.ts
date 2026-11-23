import { BookingRequest, ConflictResolutionPlan, Equipment } from '../types';
import { GeminiService } from './geminiService';

export class ConflictResolver {
  /**
   * Checks if two bookings for the same equipment conflict in date and time
   */
  public static hasTimeConflict(b1: BookingRequest, b2: BookingRequest): boolean {
    if (b1.equipmentId !== b2.equipmentId || b1.date !== b2.date) {
      return false;
    }

    const [startH1, startM1] = b1.startTime.split(':').map(Number);
    const [endH1, endM1] = b1.endTime.split(':').map(Number);
    const [startH2, startM2] = b2.startTime.split(':').map(Number);
    const [endH2, endM2] = b2.endTime.split(':').map(Number);

    const start1 = startH1 * 60 + startM1;
    const end1 = endH1 * 60 + endM1;
    const start2 = startH2 * 60 + startM2;
    const end2 = endH2 * 60 + endM2;

    // Overlapping condition: start1 < end2 && start2 < end1
    return start1 < end2 && start2 < end1;
  }

  /**
   * Intelligently resolves conflicts using Google Gemini & Multi-Factor Fairness Weights
   */
  public static async resolveConflict(
    bookingA: BookingRequest,
    bookingB: BookingRequest,
    equipment: Equipment,
    allEquipment: Equipment[]
  ): Promise<ConflictResolutionPlan> {
    const key = GeminiService.getApiKey();

    if (key) {
      try {
        const prompt = `You are the Google Gemini AI Conflict Resolution Arbiter for University LabLink.
A scheduling collision occurred on equipment: "${equipment.name}" (${equipment.department}) on Date ${bookingA.date}.

Request 1:
- ID: ${bookingA.id}
- Student: ${bookingA.studentName} (${bookingA.studentDepartment})
- Project: ${bookingA.projectTitle} (Type: ${bookingA.projectType})
- Deadline: ${bookingA.projectDeadline}
- Slot: ${bookingA.startTime} - ${bookingA.endTime}
- Justification: ${bookingA.justification}

Request 2:
- ID: ${bookingB.id}
- Student: ${bookingB.studentName} (${bookingB.studentDepartment})
- Project: ${bookingB.projectTitle} (Type: ${bookingB.projectType})
- Deadline: ${bookingB.projectDeadline}
- Slot: ${bookingB.startTime} - ${bookingB.endTime}
- Justification: ${bookingB.justification}

Other campus equipment that might serve as alternatives:
${allEquipment.filter(e => e.id !== equipment.id).map(e => `- ${e.id}: ${e.name} (${e.department}, ${e.category})`).join('\n')}

Intelligently arbitrate this conflict fairly. Prioritize:
1. Academic weight (Capstones/Sponsored Research outrank exploratory coursework)
2. Imminent deadlines (closer deadline wins primary slot)
3. Provide a win-win alternative for the deferred student (suggest alternative equipment or shift time slot).

Respond strictly with valid JSON:
{
  "severity": "CRITICAL" | "MODERATE" | "LOW",
  "primaryBookingId": "ID of request granted original slot",
  "secondaryBookingId": "ID of request deferred or reallocated",
  "actionForPrimary": "Explanation of slot confirmation",
  "actionForSecondary": "Specific adjustment for secondary student",
  "suggestedAlternativeEquipment": {
    "equipmentId": "ID",
    "equipmentName": "Name",
    "department": "Dept",
    "location": "Location",
    "reason": "Why this alternative is suitable"
  },
  "suggestedAlternativeSlot": {
    "date": "YYYY-MM-DD",
    "startTime": "HH:mm",
    "endTime": "HH:mm"
  },
  "fairnessRationale": "Clear, objective academic justification for faculty approval"
}
Output ONLY JSON.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json"
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            return {
              conflictId: `conf-${Date.now()}`,
              severity: parsed.severity || 'MODERATE',
              detectedReason: `Slot collision on ${equipment.name} between ${bookingA.studentName} and ${bookingB.studentName}`,
              originalBookings: [bookingA, bookingB],
              recommendedResolution: {
                primaryBookingId: parsed.primaryBookingId,
                secondaryBookingId: parsed.secondaryBookingId,
                actionForPrimary: parsed.actionForPrimary,
                actionForSecondary: parsed.actionForSecondary,
                suggestedAlternativeEquipment: parsed.suggestedAlternativeEquipment,
                suggestedAlternativeSlot: parsed.suggestedAlternativeSlot,
                fairnessRationale: parsed.fairnessRationale
              }
            };
          }
        }
      } catch (err) {
        console.warn('Gemini conflict arbitration failed, falling back to deterministic MCDA engine:', err);
      }
    }

    // High-precision fallback Multi-Criteria Decision Arbiter
    return this.fallbackConflictResolution(bookingA, bookingB, equipment, allEquipment);
  }

  /**
   * Deterministic Multi-Criteria Decision Analysis (MCDA) Scoring Engine
   */
  public static fallbackConflictResolution(
    bookingA: BookingRequest,
    bookingB: BookingRequest,
    equipment: Equipment,
    allEquipment: Equipment[]
  ): ConflictResolutionPlan {
    const scoreA = this.calculatePriorityScore(bookingA);
    const scoreB = this.calculatePriorityScore(bookingB);

    const primary = scoreA >= scoreB ? bookingA : bookingB;
    const secondary = scoreA >= scoreB ? bookingB : bookingA;

    // Look for alternative equipment in the same category or sister department
    const alternativeEq = allEquipment.find(
      (e) => e.id !== equipment.id && (e.category === equipment.category || e.department === secondary.studentDepartment)
    );

    // Calculate next available non-overlapping time slot
    const [endH, endM] = primary.endTime.split(':').map(Number);
    const altStartH = endH;
    const altStartM = endM;
    const altEndH = Math.min(20, altStartH + 2);
    const altStartTimeStr = `${String(altStartH).padStart(2, '0')}:${String(altStartM).padStart(2, '0')}`;
    const altEndTimeStr = `${String(altEndH).padStart(2, '0')}:${String(altStartM).padStart(2, '0')}`;

    return {
      conflictId: `conf-${primary.id}-${secondary.id}`,
      severity: 'CRITICAL',
      detectedReason: `Time overlap detected for ${equipment.name} on ${primary.date} between [${bookingA.startTime}-${bookingA.endTime}] and [${bookingB.startTime}-${bookingB.endTime}].`,
      originalBookings: [bookingA, bookingB],
      recommendedResolution: {
        primaryBookingId: primary.id,
        secondaryBookingId: secondary.id,
        actionForPrimary: `Grant requested slot [${primary.startTime} - ${primary.endTime}] to ${primary.studentName} based on higher priority score (${Math.round(Math.max(scoreA, scoreB))}/100).`,
        actionForSecondary: `Reallocate ${secondary.studentName} to adjacent slot [${altStartTimeStr} - ${altEndTimeStr}] or reserve alternative resource in sister department.`,
        suggestedAlternativeEquipment: alternativeEq ? {
          equipmentId: alternativeEq.id,
          equipmentName: alternativeEq.name,
          department: alternativeEq.department,
          location: alternativeEq.location,
          reason: `Complementary ${alternativeEq.category.replace('_', ' ')} available with low utilization rate (${alternativeEq.utilizationRate}%).`
        } : undefined,
        suggestedAlternativeSlot: {
          date: primary.date,
          startTime: altStartTimeStr,
          endTime: altEndTimeStr
        },
        fairnessRationale: `Fairness Index: ${primary.studentName}'s ${primary.projectType.replace('_', ' ')} has a critical deadline in ${this.getDaysRemaining(primary.projectDeadline)} days vs ${this.getDaysRemaining(secondary.projectDeadline)} days for ${secondary.studentName}. Reallocating to ${altStartTimeStr} satisfies both academic objectives with zero project disruption.`
      }
    };
  }

  private static calculatePriorityScore(booking: BookingRequest): number {
    let score = 0;

    // Project Type Weights
    const typeWeights: Record<string, number> = {
      capstone: 45,
      sponsored_research: 40,
      hackathon: 30,
      coursework: 15,
      personal_exploration: 5
    };
    score += typeWeights[booking.projectType] || 15;

    // Urgency (Days remaining until deadline)
    const days = this.getDaysRemaining(booking.projectDeadline);
    if (days <= 3) score += 40;
    else if (days <= 7) score += 28;
    else if (days <= 14) score += 15;
    else score += 5;

    // AI readiness adjustment if available
    if (booking.aiRiskAssessment) {
      score += (booking.aiRiskAssessment.readinessScore / 100) * 15;
    }

    return score;
  }

  private static getDaysRemaining(deadlineStr: string): number {
    const deadline = new Date(deadlineStr).getTime();
    const now = Date.now();
    return Math.max(1, Math.round((deadline - now) / (1000 * 60 * 60 * 24)));
  }
}
