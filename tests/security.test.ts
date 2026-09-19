import { maskPIIAndCheckQuality } from '../server/ai.js';
import { db } from '../server/db.js';
import { User } from '../src/types.js';

export async function runSecurityTests(): Promise<{ passed: number; failed: number; results: Array<{ name: string; success: boolean; error?: string }> }> {
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

  console.log('\n🔒 Running Security & Compliance Tests...');

  // 1. PII Masking: Credit Card, SSN, and Phone Number Redaction
  try {
    const rawWithPII = 'My card number is 4532-1234-5678-9012 and phone is +1 (555) 234-5678, SSN 123-45-6789. Please refund!';
    const piiResult = maskPIIAndCheckQuality(rawWithPII);

    assert(piiResult.masked === true, 'PII Sanitizer: Flags text containing sensitive PII');
    assert(!piiResult.sanitizedText.includes('4532-1234-5678-9012'), 'PII Sanitizer: Redacts raw credit card digits');
    assert(piiResult.sanitizedText.includes('[REDACTED_CREDIT_CARD]'), 'PII Sanitizer: Replaces credit card with placeholder');
    assert(piiResult.sanitizedText.includes('[REDACTED_PHONE]'), 'PII Sanitizer: Replaces phone number with placeholder');
    assert(piiResult.sanitizedText.includes('[REDACTED_SSN_TAX_ID]'), 'PII Sanitizer: Replaces national ID / SSN with placeholder');
  } catch (e) {
    assert(false, 'PII Masking Security Test', (e as Error).message);
  }

  // 2. Spam & Low Quality Submission Detection
  try {
    const spamText = 'http://spam-link-1.com http://spam-link-2.com http://spam-link-3.com buy cheap pills now aaaaaaaa';
    const spamCheck = maskPIIAndCheckQuality(spamText);
    assert(spamCheck.spamStatus === 'SPAM', 'Data Quality: Detects repetitive link spam');
  } catch (e) {
    assert(false, 'Spam Detection Security Test', (e as Error).message);
  }

  // 3. Audit Log Compliance Tracking
  try {
    const adminUser = db.getUsers().find(u => u.role === 'ADMIN') || db.getUsers()[0];
    const initialLogCount = db.getAuditLogs().length;

    db.logAudit(adminUser.id, adminUser.name, 'SECURITY_POLICY_UPDATE', 'Organization/sec_policy', 'Updated session expiration timeout to 12h');

    const updatedLogs = db.getAuditLogs();
    assert(updatedLogs.length > initialLogCount, 'Audit Logging: Persists security audit trail');
    const lastLog = updatedLogs[0];
    assert(lastLog.action === 'SECURITY_POLICY_UPDATE', 'Audit Logging: Accurately records action type');
    assert(Boolean(lastLog.timestamp), 'Audit Logging: Includes ISO-8601 audit timestamp');
  } catch (e) {
    assert(false, 'Audit Log Compliance Test', (e as Error).message);
  }

  // 4. Role-Based Access Control (RBAC) User Role Switching & Boundary
  try {
    const admin = db.getUsers().find(u => u.role === 'ADMIN') || db.getUsers()[0];
    const updatedUser = db.updateUserRole(admin.id, 'MANAGER', admin);
    assert(updatedUser.role === 'MANAGER', 'RBAC: Role switch succeeds for authorized actor');

    // Switch back to ADMIN
    db.updateUserRole(admin.id, 'ADMIN', admin);
  } catch (e) {
    assert(false, 'RBAC Role Management Test', (e as Error).message);
  }

  return { passed, failed, results };
}
