import { db } from '../server/db.js';
import { User } from '../src/types.js';

export async function runIntegrationTests(): Promise<{ passed: number; failed: number; results: Array<{ name: string; success: boolean; error?: string }> }> {
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

  console.log('\n🔄 Running Integration Tests...');
  const testAdminActor: User = {
    id: 'usr_test_admin',
    name: 'Integration Test Admin',
    email: 'integration.admin@example.com',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    organizationId: 'org_acme_tech',
    createdAt: new Date().toISOString()
  };

  // 1. Ingestion & Automated AI Classification Pipeline
  try {
    const feedback = await db.createFeedback({
      customerName: 'Integration Test User',
      customerEmail: 'integration.user@test.io',
      productId: db.getProducts()[0]?.id || 'prod_1',
      rating: 1,
      text: 'Error 504 on payment gateway renewal during enterprise subscription upgrade.',
      source: 'MANUAL',
      tags: ['Payment', 'IntegrationTest']
    });

    assert(Boolean(feedback.id), 'Feedback Ingestion: Records feedback ID');
    assert(feedback.analysis?.sentiment === 'NEGATIVE', 'Feedback Ingestion: AI pipeline assigns negative sentiment');
    assert(feedback.analysis?.priority === 'CRITICAL' || feedback.analysis?.priority === 'HIGH', 'Feedback Ingestion: AI pipeline assigns High/Critical priority');
  } catch (e) {
    assert(false, 'Feedback Ingestion Integration Test', (e as Error).message);
  }

  // 2. What-If Simulation Integration Test
  try {
    const simResult = await db.runWhatIfSimulation({
      problemTopic: 'Payment',
      targetIntervention: 'Add secondary failover route & buffer keep-alive timeout',
      improvementPercentage: 30,
      customerSegmentFilter: 'ALL'
    }, testAdminActor);

    assert(Boolean(simResult.id), 'What-If Simulation: Generates persistent simulation record');
    assert(simResult.simulatedMetrics.projectedCSAT >= simResult.baselineMetrics.currentCSAT, 'What-If Simulation: Projects improved CSAT score');
    assert(simResult.simulatedMetrics.estimatedRevenueSavedUSD >= 0, 'What-If Simulation: Calculates positive revenue saved');
  } catch (e) {
    assert(false, 'What-If Simulation Integration Test', (e as Error).message);
  }

  // 3. Human-In-The-Loop Recommendation Approval Workflow
  try {
    const recApproval = db.approveRecommendation('rec_test_101', 'Approved hotfix deployment for production ingress pool.', testAdminActor);
    assert(recApproval.success === true, 'Recommendation Workflow: Approves recommendation');
    assert(recApproval.approval.approvedBy === testAdminActor.id, 'Recommendation Workflow: Records approving actor ID');

    const approvedList = db.getApprovedRecommendations();
    assert(approvedList.some(a => a.recommendationId === 'rec_test_101'), 'Recommendation Workflow: Stores in approved recommendations registry');
  } catch (e) {
    assert(false, 'Recommendation Workflow Integration Test', (e as Error).message);
  }

  // 4. Closed-Loop Resolution Learning Integration Test
  try {
    const resolutionOutcome = db.createResolution({
      issueTitle: 'Stripe Webhook Timeout Mitigation',
      interventionAction: 'Scaled worker thread pool from 8 to 32 instances.',
      recommendationEffectivenessPct: 96,
      savedRevenueUSD: 62000
    }, testAdminActor);

    assert(resolutionOutcome.success === true, 'Resolution Learning: Creates resolution record');
    assert(resolutionOutcome.resolution.recommendationEffectivenessPct === 96, 'Resolution Learning: Preserves effectiveness metric');
  } catch (e) {
    assert(false, 'Resolution Learning Integration Test', (e as Error).message);
  }

  // 5. Causal Graph Traversal Integration Test
  try {
    const causalGraph = db.getCausalGraph({ segment: 'ALL' });
    assert(causalGraph.nodes.length > 0, 'Causal Graph: Returns nodes hierarchy');
    assert(causalGraph.edges.length > 0, 'Causal Graph: Returns causal relationships and edges');
  } catch (e) {
    assert(false, 'Causal Graph Traversal Test', (e as Error).message);
  }

  return { passed, failed, results };
}
