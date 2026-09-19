import {
  fallbackAnalyzeFeedback,
  calculateCustomerChurnRiskScores,
  scanEmergingIssues,
  computeBusinessImpactAssessments,
  detectFeedbackContradiction
} from '../server/ai.js';
import { db } from '../server/db.js';

export async function runUnitTests(): Promise<{ passed: number; failed: number; results: Array<{ name: string; success: boolean; error?: string }> }> {
  const results: Array<{ name: string; success: boolean; error?: string }> = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorMessage?: string) {
    if (condition) {
      passed++;
      results.push({ name: testName, success: true });
    } else {
      failed++;
      results.push({ name: testName, success: false, error: errorMessage || 'Assertion failed' });
    }
  }

  console.log('\n🧪 Running Unit Tests...');

  // 1. Sentiment & Scoring Unit Test
  try {
    const positiveAnalysis = fallbackAnalyzeFeedback('The new analytics dashboard is super fast, stellar and reliable!', 5, 'Acme BI');
    assert(positiveAnalysis.sentiment === 'POSITIVE', 'Sentiment: High rating & positive keywords -> POSITIVE sentiment');
    assert(positiveAnalysis.score > 0, 'Sentiment: Positive sentiment score > 0');

    const negativeAnalysis = fallbackAnalyzeFeedback('Payment failed with 504 timeout and the mobile app is completely broken and crashing.', 1, 'Acme Pay');
    assert(negativeAnalysis.sentiment === 'NEGATIVE', 'Sentiment: 504 timeout & crash -> NEGATIVE sentiment');
    assert(negativeAnalysis.priority === 'CRITICAL' || negativeAnalysis.priority === 'HIGH', 'Priority: Critical keyword triggers HIGH/CRITICAL priority');
  } catch (e) {
    assert(false, 'Sentiment & Scoring Unit Test execution', (e as Error).message);
  }

  // 2. Customer Churn Risk Calculation Unit Test (0-100 score)
  try {
    const customers = db.getCustomers();
    const feedbacks = db.getFeedbacks({ limit: 200 }).items;
    const churnPredictions = calculateCustomerChurnRiskScores(customers, feedbacks);

    assert(Object.keys(churnPredictions).length > 0, 'Customer Churn Risk: Generates risk map for customers');
    const firstCustId = customers[0]?.id;
    if (firstCustId && churnPredictions[firstCustId]) {
      const pred = churnPredictions[firstCustId];
      assert(pred.churnScore >= 0 && pred.churnScore <= 100, 'Customer Churn Risk: Score is bounded between 0 and 100');
      assert(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(pred.churnRisk), 'Customer Churn Risk: Assigns valid risk tier');
    }
  } catch (e) {
    assert(false, 'Customer Churn Risk Calculation Test', (e as Error).message);
  }

  // 3. Feedback Contradiction Detection Unit Test
  try {
    const contradiction = detectFeedbackContradiction('The application crashes every single time I open it.', 5);
    assert(contradiction.isContradictory === true, 'Contradiction: 5-stars + crash text flags contradiction');
    assert(contradiction.confidence >= 0.85, 'Contradiction: Confidence >= 85%');
    assert(contradiction.possibleCause === 'ACCIDENTAL_RATING' || contradiction.possibleCause === 'SARCASM', 'Contradiction: Supplies possible root cause');
  } catch (e) {
    assert(false, 'Contradiction Detection Test', (e as Error).message);
  }

  // 4. Business Impact Financial Modeling Unit Test
  try {
    const assessments = computeBusinessImpactAssessments({ baselineARPU_USD: 420, baselineARPU_INR: 35000, churnSensitivityMultiplier: 1.0 });
    assert(assessments.length > 0, 'Business Impact: Returns modeled assessments');
    const paymentAssessment = assessments.find(a => a.id.includes('payment'));
    assert(Boolean(paymentAssessment), 'Business Impact: Contains payment failure assessment');
    if (paymentAssessment) {
      assert(paymentAssessment.affectedCustomerCount === 2840, 'Business Impact: Accurate affected customer count (2,840)');
      assert(paymentAssessment.estimatedRevenueAtRiskINR > 0, 'Business Impact: Calculates non-zero revenue at risk in INR');
      assert(paymentAssessment.modeledAssumptionsDisclaimer === 'Estimated / Modeled / Assumption-based', 'Business Impact: Enforces assumption disclaimer label');
    }
  } catch (e) {
    assert(false, 'Business Impact Financial Modeling Test', (e as Error).message);
  }

  // 5. Anomaly Detection & Emerging Issues Unit Test
  try {
    const feedbacks = db.getFeedbacks({ limit: 100 }).items;
    const emerging = scanEmergingIssues(feedbacks);
    assert(emerging.length > 0, 'Emerging Issues: Scans and identifies emerging spikes');
    const criticalEmerging = emerging.find(e => e.growthRatePct > 50);
    assert(Boolean(criticalEmerging), 'Emerging Issues: Detects high velocity issue with >50% growth rate');
  } catch (e) {
    assert(false, 'Emerging Issues & Anomaly Test', (e as Error).message);
  }

  return { passed, failed, results };
}
