import { AssessmentData } from "../types";

export async function generateClinicalInsights(data: AssessmentData) {
  try {
    const response = await fetch('/api/analyze-skin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      throw new Error('Server returned error for clinical analysis');
    }

    const result = await response.json();
    if (result.success) {
      return result.insights as NonNullable<AssessmentData['clinicalInsights']>;
    }
    throw new Error(result.error || 'Analysis failed');
  } catch (error) {
    console.error("Clinical Insight Generation Failed:", error);
    return {
      analysis: "Identifying patterns in your clinical focus and biological flow. We will discuss these in detail during our deep-dive.",
      solutions: ["Prioritize moisture barrier restoration", "Schedule diagnostic consultation"],
      recommendedProducts: ["Gentle Clinical Cleanser", "Barrier Repair Serum"]
    };
  }
}
