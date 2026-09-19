import { runUnitTests } from './unit.test.js';
import { runIntegrationTests } from './integration.test.js';
import { runSecurityTests } from './security.test.js';

async function main() {
  console.log('================================================================');
  console.log('🚀 AI Customer Feedback Platform — Automated Test Suite Runner');
  console.log('================================================================');

  const startTime = Date.now();
  const unit = await runUnitTests();
  const integration = await runIntegrationTests();
  const security = await runSecurityTests();

  const totalPassed = unit.passed + integration.passed + security.passed;
  const totalFailed = unit.failed + integration.failed + security.failed;
  const totalTests = totalPassed + totalFailed;
  const elapsedMs = Date.now() - startTime;

  console.log('\n================================================================');
  console.log('📊 TEST EXECUTION SUMMARY:');
  console.log('================================================================');
  console.log(`✅ Passed:   ${totalPassed} / ${totalTests}`);
  console.log(`❌ Failed:   ${totalFailed} / ${totalTests}`);
  console.log(`⏱️  Duration: ${elapsedMs}ms`);

  if (totalFailed > 0) {
    console.log('\n❌ Failed Tests:');
    [...unit.results, ...integration.results, ...security.results]
      .filter(r => !r.success)
      .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL UNIT, INTEGRATION, AND SECURITY TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
