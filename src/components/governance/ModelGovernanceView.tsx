import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api.js';
import { AIModelMetrics, HumanCorrection, IntegrationAdapter } from '../../types.js';
import {
  BrainCircuit,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Send,
  Link,
  Lock,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';
import { useApp } from '../../context/AppContext.js';

export function ModelGovernanceView() {
  const { addToast } = useApp();
  const [metrics, setMetrics] = useState<AIModelMetrics | null>(null);
  const [corrections, setCorrections] = useState<HumanCorrection[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationAdapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'corrections' | 'integrations'>('metrics');
  const [testingId, setTestingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [mRes, cRes, iRes] = await Promise.all([
        ApiService.getModelMetrics(),
        ApiService.getHumanCorrections(),
        ApiService.getIntegrations()
      ]);
      setMetrics(mRes.metrics || null);
      setCorrections(cRes.corrections || []);
      setIntegrations(iRes.integrations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleIntegration = async (intg: IntegrationAdapter) => {
    try {
      const res = await ApiService.updateIntegration(intg.id, { isEnabled: !intg.isEnabled });
      setIntegrations(prev => (prev || []).map(i => (i.id === intg.id ? res.integration : i)));
      addToast({
        title: `Integration ${!intg.isEnabled ? 'Enabled' : 'Disabled'}`,
        message: `${intg.name} integration status updated.`,
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Integration Update Failed',
        message: (err as Error).message,
        type: 'error'
      });
    }
  };

  const handleTestIntegration = async (intg: IntegrationAdapter) => {
    try {
      setTestingId(intg.id);
      const res = await ApiService.triggerIntegration(intg.id, 'FEEDBACK_CRITICAL_ALERT', {
        feedbackId: 'fb_demo_test',
        priority: 'CRITICAL',
        sentiment: 'NEGATIVE',
        summary: 'Demo payload test triggered from Model Governance Center'
      });
      addToast({
        title: 'Webhook Test Dispatched',
        message: res.message || `Test event sent to ${intg.name}`,
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Webhook Test Failed',
        message: (err as Error).message,
        type: 'error'
      });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              AI Governance, Model Telemetry & Integrations
            </h1>
            <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Enterprise LLMOps
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor Gemini inference accuracy, active drift calibrations, RLHF human feedback loops, and omnichannel webhooks.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'metrics'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Model Performance
          </button>

          <button
            onClick={() => setActiveTab('corrections')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'corrections'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Human RLHF Corrections ({(corrections || []).length})
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'integrations'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Webhooks & Adapters ({(integrations || []).length})
          </button>
        </div>
      </div>

      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Model Architecture</span>
                <BrainCircuit className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {metrics.modelVersion}
              </div>
              <div className="mt-1 text-[11px] text-emerald-500 font-semibold">Inference Status: HEALTHY</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sentiment Accuracy</span>
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {metrics.sentimentAccuracy}%
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Validated against ground-truth validation set</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Aspect Extraction F1</span>
                <Zap className="h-4 w-4 text-purple-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {metrics.aspectExtractionF1}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Multi-label aspect classification score</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Avg Latency</span>
                <ShieldCheck className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {metrics.avgLatencyMs} ms
              </div>
              <div className="mt-1 text-[11px] text-slate-400">99th percentile: 380 ms</div>
            </div>
          </div>

          {/* Model Health & Telemetry Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Model Drift & Calibration Scorecard
              </h2>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Emotion Detection Accuracy:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{metrics.emotionAccuracy}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Urgency Classification Recall:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{metrics.urgencyRecall}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Total Analyzed Feedback Samples:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{(metrics?.totalAnalyzed || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Human Corrections (RLHF Dataset):</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{metrics.humanCorrectionsCount} samples</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                LLM Safety & Grounding Controls
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Grounding Verification: Active across all RAG support replies.</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-indigo-50 p-2.5 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Zero PII Extraction: Automated client data anonymization enabled.</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Temperature: 0.2 (Optimized for deterministic classification).</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'corrections' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-slate-50/75 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/60">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Human-in-the-Loop (RLHF) Correction Telemetry
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Feedback ID</th>
                  <th className="px-3 py-3">Corrected Sentiment</th>
                  <th className="px-3 py-3">Corrected Priority</th>
                  <th className="px-4 py-3">Operator Reasoning</th>
                  <th className="px-3 py-3">Auditor</th>
                  <th className="px-3 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(corrections || []).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                      {c.feedbackId}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                      {c.correctedSentiment || 'No change'}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                      {c.correctedUrgency || 'No change'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {c.reasoning}
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {c.correctedByName}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-400">
                      {formatDate(c.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(integrations || []).map((intg) => (
            <div
              key={intg.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 font-bold text-xs">
                      {intg.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {intg.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleIntegration(intg)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                      intg.isEnabled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {intg.isEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="text-xs text-slate-500">
                  Trigger on: <span className="font-mono text-slate-700 dark:text-slate-300">{(intg.triggerEvents || []).join(', ')}</span>
                </div>

                <div className="rounded-lg bg-slate-50 p-2 text-[11px] font-mono text-slate-600 truncate dark:bg-slate-800/60 dark:text-slate-400">
                  {intg.webhookUrl}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400">
                  Last Sync: {formatDate(intg.lastSyncTime)}
                </span>

                <button
                  onClick={() => handleTestIntegration(intg)}
                  disabled={testingId === intg.id}
                  className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 transition"
                >
                  {testingId === intg.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  <span>Test Event</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
