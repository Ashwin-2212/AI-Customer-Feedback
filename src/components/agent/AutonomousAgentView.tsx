import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import {
  AgentEvent,
  AgentRun,
  AgentDecision,
  AgentRecommendation,
  AgentOutcome,
  AgentMemory,
  AgentConfig,
  AgentDashboardMetrics,
  AutonomousAgentIncident
} from '../../types.js';
import {
  Bot,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  Zap,
  Lock,
  ArrowRight,
  UserCheck,
  Ban,
  Activity,
  X,
  Play,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  BrainCircuit,
  Sliders,
  Radio,
  FileCheck,
  Send,
  Eye,
  SlidersHorizontal,
  Workflow,
  History,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

type AgentSubTab = 'CONTROL_CENTER' | 'APPROVAL_QUEUE' | 'ACTIVITY_STREAM' | 'DECISION_TRACE' | 'AGENT_MEMORY' | 'SAFETY_CONFIG';

export function AutonomousAgentView() {
  const { addToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<AgentSubTab>('CONTROL_CENTER');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core Data
  const [metrics, setMetrics] = useState<AgentDashboardMetrics>({
    agentStatus: 'ACTIVE',
    feedbackProcessedToday: 1842,
    issuesDetected: 47,
    emergingIssuesCount: 6,
    criticalIssuesCount: 2,
    recommendationsCount: 18,
    awaitingApprovalCount: 5,
    resolvedCount: 31,
    averageConfidencePct: 92.4,
    uptimeHours: 348
  });
  const [incidents, setIncidents] = useState<AutonomousAgentIncident[]>([]);
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [outcomes, setOutcomes] = useState<AgentOutcome[]>([]);
  const [memories, setMemories] = useState<AgentMemory[]>([]);
  const [config, setConfig] = useState<AgentConfig>({
    isAutoEnabled: true,
    minConfidenceThreshold: 0.85,
    emergingGrowthThresholdPct: 50,
    highSeverityIncidentThreshold: 5,
    autoCreateIncident: true,
    maxActionsPerHour: 10,
    notificationChannels: ['SLACK_ALERTS', 'PAGERDUTY', 'EMAIL_EXECS']
  });

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<AgentDecision | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AgentRecommendation | null>(null);
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [modifiedActionText, setModifiedActionText] = useState('');

  // Demo state
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoRunResult, setDemoRunResult] = useState<any | null>(null);
  const [demoStep, setDemoStep] = useState<number>(0);

  // Custom live feedback input
  const [customFeedbackInput, setCustomFeedbackInput] = useState('');
  const [customAnalyzing, setCustomAnalyzing] = useState(false);

  const fetchAgentData = async () => {
    try {
      setRefreshing(true);
      const [
        statusRes,
        incidentsRes,
        recsRes,
        eventsRes,
        decisionsRes,
        outcomesRes,
        memoryRes,
        configRes
      ] = await Promise.all([
        ApiService.getAgentStatus().catch(() => null),
        ApiService.getAutonomousIncidents().catch(() => ({ incidents: [] })),
        ApiService.getAgentRecommendations().catch(() => ({ success: true, recommendations: [] })),
        ApiService.getAgentEvents(40).catch(() => ({ success: true, events: [] })),
        ApiService.getAgentDecisions().catch(() => ({ success: true, decisions: [] })),
        ApiService.getAgentOutcomes().catch(() => ({ success: true, outcomes: [] })),
        ApiService.getAgentMemory().catch(() => ({ success: true, memories: [] })),
        ApiService.getAgentConfig().catch(() => null)
      ]);

      if (statusRes?.metrics) setMetrics(statusRes.metrics);
      if (incidentsRes?.incidents) setIncidents(incidentsRes.incidents);
      if (recsRes?.recommendations) setRecommendations(recsRes.recommendations);
      if (eventsRes?.events) setEvents(eventsRes.events);
      if (decisionsRes?.decisions) setDecisions(decisionsRes.decisions);
      if (outcomesRes?.outcomes) setOutcomes(outcomesRes.outcomes);
      if (memoryRes?.memories) setMemories(memoryRes.memories);
      if (configRes?.config) setConfig(configRes.config);
    } catch (err) {
      console.error('Failed to load agent data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgentData();

    // SSE Event Listener for real-time live activity stream
    const eventSource = new EventSource('/api/v1/stream');
    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed.type === 'agent:event' && parsed.event) {
          setEvents((prev) => [parsed.event, ...prev.slice(0, 49)]);
        }
      } catch (err) {
        // ignore parse error
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Run 5-Min Interactive Demo Scenario
  const handleTriggerDemo = async () => {
    try {
      setDemoRunning(true);
      setDemoStep(1);
      const res = await ApiService.triggerAgentDemoWorkflow({
        sampleText: "I've tried paying three times and the payment still fails."
      });

      if (res.success) {
        setDemoRunResult(res);
        // Animate progression through the 14 stages
        let step = 1;
        const interval = setInterval(() => {
          step++;
          setDemoStep(step);
          if (step >= 14) {
            clearInterval(interval);
            setDemoRunning(false);
            fetchAgentData();
            addToast({
              title: 'Autonomous Demo Pipeline Complete 🎯',
              message: 'Processed: "I\'ve tried paying three times and the payment still fails." -> High-Severity Incident & Action Recommendation created.',
              type: 'success'
            });
          }
        }, 350);
      }
    } catch (err) {
      setDemoRunning(false);
      addToast({
        title: 'Demo Execution Failed',
        message: (err as Error).message,
        type: 'error'
      });
    }
  };

  // Analyze Custom Feedback
  const handleAnalyzeCustom = async () => {
    if (!customFeedbackInput.trim()) return;
    try {
      setCustomAnalyzing(true);
      const res = await ApiService.analyzeAgentFeedback({
        text: customFeedbackInput,
        rating: 1
      });
      if (res.success) {
        addToast({
          title: 'Feedback Processed By Agent Brain',
          message: `Triage complete. Severity: ${res.triage?.severity || 'Assessed'}, Duplicate Prob: ${Math.round((res.duplicateCheck?.duplicateProbability || 0) * 100)}%`,
          type: 'success'
        });
        setCustomFeedbackInput('');
        fetchAgentData();
      }
    } catch (err) {
      addToast({
        title: 'Analysis Error',
        message: (err as Error).message,
        type: 'error'
      });
    } finally {
      setCustomAnalyzing(false);
    }
  };

  // Human Decisions
  const handleApproveRec = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await ApiService.approveAgentRecommendation(id);
      if (res.success) {
        addToast({
          title: 'Action Approved & Dispatched 🚀',
          message: 'Remediation playbook initiated. Audit log recorded and telemetry tracking started.',
          type: 'success'
        });
        fetchAgentData();
      }
    } catch (err) {
      addToast({
        title: 'Approval Failed',
        message: (err as Error).message,
        type: 'error'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRec = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await ApiService.rejectAgentRecommendation(id, 'Human operator rejected proposed playbook.');
      if (res.success) {
        addToast({
          title: 'Action Rejected',
          message: 'Recommendation marked as rejected.',
          type: 'info'
        });
        fetchAgentData();
      }
    } catch (err) {
      addToast({
        title: 'Rejection Failed',
        message: (err as Error).message,
        type: 'error'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleInvestigateRec = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await ApiService.investigateAgentRecommendation(id, 'Assigned to L3 Engineering for deep telemetry audit.');
      if (res.success) {
        addToast({
          title: 'Assigned for Deep Investigation 🔍',
          message: 'Issue tagged for engineering telemetry capture.',
          type: 'info'
        });
        fetchAgentData();
      }
    } catch (err) {
      addToast({
        title: 'Investigation Dispatch Failed',
        message: (err as Error).message,
        type: 'error'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleModifySubmit = async () => {
    if (!selectedRecommendation || !modifiedActionText.trim()) return;
    try {
      setActionLoadingId(selectedRecommendation.id);
      const res = await ApiService.modifyAgentRecommendation(selectedRecommendation.id, modifiedActionText);
      if (res.success) {
        addToast({
          title: 'Action Modified & Saved',
          message: 'Customized playbook action updated in queue.',
          type: 'success'
        });
        setModifyModalOpen(false);
        fetchAgentData();
      }
    } catch (err) {
      addToast({
        title: 'Modification Failed',
        message: (err as Error).message,
        type: 'error'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveConfig = async (newConfig: Partial<AgentConfig>) => {
    try {
      const res = await ApiService.updateAgentConfig(newConfig);
      if (res.success) {
        setConfig(res.config);
        addToast({
          title: 'Safety Parameters Updated ⚙️',
          message: 'Autonomous thresholds and rate limits updated.',
          type: 'success'
        });
      }
    } catch (err) {
      addToast({
        title: 'Failed to update config',
        message: (err as Error).message,
        type: 'error'
      });
    }
  };

  const pipelineStagesList = [
    { key: 'INGESTION', label: '1. Ingestion', icon: Layers },
    { key: 'PREPROCESSING', label: '2. Preprocess', icon: Cpu },
    { key: 'AI_ANALYSIS', label: '3. AI Triage', icon: Sparkles },
    { key: 'DUPLICATE_DETECTION', label: '4. De-duplicate', icon: Search },
    { key: 'SEMANTIC_MATCHING', label: '5. Semantic Match', icon: BrainCircuit },
    { key: 'ISSUE_CLUSTERING', label: '6. Clustering', icon: Layers },
    { key: 'SEVERITY_ANALYSIS', label: '7. Multi-Severity', icon: AlertTriangle },
    { key: 'EMERGING_DETECTION', label: '8. Emerging Spike', icon: Radio },
    { key: 'CUSTOMER_RISK', label: '9. Churn Risk', icon: ShieldAlert },
    { key: 'BUSINESS_IMPACT', label: '10. Impact Model', icon: DollarSign },
    { key: 'ROOT_CAUSE', label: '11. Root-Cause', icon: HelpCircle },
    { key: 'RECOMMENDATION', label: '12. Prescribe', icon: LightbulbIcon },
    { key: 'HUMAN_APPROVAL', label: '13. Human Approval', icon: Lock },
    { key: 'OUTCOME_LEARNING', label: '14. Learning Loop', icon: RefreshCw }
  ];

  function LightbulbIcon(props: any) {
    return <Sparkles {...props} />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner: Enterprise Agent Control Center */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 p-2.5 text-white shadow-md">
                <Bot className="h-6 w-6 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                AI Autonomous Feedback Agent
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Agent Status: 🟢 ACTIVE
              </span>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-0.5 text-xs font-mono text-indigo-300">
                v2.6.4 Continuous Brain
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Continuous AI monitoring, root-cause investigation, and decision support engine.
              Observes incoming signals, predicts customer churn & financial impact, and guards consequential actions with Human-in-the-Loop approval.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTriggerDemo}
              disabled={demoRunning}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-amber-400 hover:to-rose-500 transition active:scale-95 disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 ${demoRunning ? 'animate-spin' : ''}`} />
              <span>{demoRunning ? 'Executing 14 Stages...' : '⚡ Run 5-Min Demo Scenario'}</span>
            </button>

            <button
              onClick={fetchAgentData}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 backdrop-blur transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-300' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 14-Stage Visual Observability Breadcrumb Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Workflow className="h-3.5 w-3.5 text-indigo-400" />
              14-STAGE OBSERVABLE FEEDBACK LIFECYCLE
            </span>
            <span className="text-[11px] text-indigo-300">
              MONITOR → UNDERSTAND → DETECT → INVESTIGATE → PREDICT → RECOMMEND → APPROVE → RESOLVE → MEASURE
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-14 gap-1.5 text-[10px]">
            {pipelineStagesList.map((st, i) => {
              const isHighlight = demoRunning && demoStep >= i + 1;
              return (
                <div
                  key={st.key}
                  className={`rounded-lg p-1.5 text-center border transition ${
                    isHighlight
                      ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 scale-105 shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="truncate font-mono">{st.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Stats Bar (Section 15) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-black text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            ACTIVE
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Processed Today</div>
          <div className="mt-1 text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
            {(metrics?.feedbackProcessedToday || 0).toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issues Detected</div>
          <div className="mt-1 text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {metrics.issuesDetected}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20 shadow-xs">
          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Emerging Spikes</div>
          <div className="mt-1 text-base sm:text-lg font-black text-amber-600 dark:text-amber-300 font-mono flex items-center gap-1">
            <Flame className="h-4 w-4 text-amber-500" />
            {metrics.emergingIssuesCount}
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3.5 dark:border-rose-900/50 dark:bg-rose-950/20 shadow-xs">
          <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Critical Incidents</div>
          <div className="mt-1 text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            {metrics.criticalIssuesCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommendations</div>
          <div className="mt-1 text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
            {metrics.recommendationsCount}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-100/60 p-3.5 dark:border-amber-800 dark:bg-amber-950/50 shadow-xs ring-2 ring-amber-400/40 animate-pulse">
          <div className="text-[10px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1">
            <Lock className="h-3 w-3 text-amber-600" />
            Awaiting Approval
          </div>
          <div className="mt-1 text-base sm:text-lg font-black text-amber-900 dark:text-amber-100 font-mono">
            {recommendations.filter(r => r.status === 'PENDING').length || metrics.awaitingApprovalCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved Outcomes</div>
          <div className="mt-1 text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {metrics.resolvedCount}
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('CONTROL_CENTER')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'CONTROL_CENTER'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>Control Center & Live Pipeline</span>
        </button>

        <button
          onClick={() => setActiveSubTab('APPROVAL_QUEUE')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition relative ${
            activeSubTab === 'APPROVAL_QUEUE'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Human Approval Queue</span>
          {recommendations.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {recommendations.filter(r => r.status === 'PENDING').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('ACTIVITY_STREAM')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'ACTIVITY_STREAM'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Live Activity Stream</span>
        </button>

        <button
          onClick={() => setActiveSubTab('DECISION_TRACE')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'DECISION_TRACE'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Decision Traces (Explainability)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('AGENT_MEMORY')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'AGENT_MEMORY'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <BrainCircuit className="h-4 w-4" />
          <span>Agent Memory & Closed-Loop Learning</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SAFETY_CONFIG')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === 'SAFETY_CONFIG'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Safety Safeguards & Config</span>
        </button>
      </div>

      {/* SUB-TAB 1: CONTROL CENTER & LIVE PIPELINE */}
      {activeSubTab === 'CONTROL_CENTER' && (
        <div className="space-y-6">
          {/* Live Feedback Ingestion Sandbox Simulator */}
          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Live Feedback Ingestion Sandbox
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Input sample customer feedback to watch the autonomous agent run live triage, duplicate detection, severity assessment, and root-cause analysis.
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Continuous Ingestion Active
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={customFeedbackInput}
                onChange={(e) => setCustomFeedbackInput(e.target.value)}
                placeholder="e.g. 'I tried paying three times and the payment still fails with timeout error 504.'"
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeCustom()}
              />
              <button
                onClick={handleAnalyzeCustom}
                disabled={customAnalyzing || !customFeedbackInput.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
              >
                {customAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Ingest & Trigger Agent</span>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="font-semibold">Quick Presets:</span>
              <button
                onClick={() => setCustomFeedbackInput("I've tried paying three times and the payment still fails.")}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-mono"
              >
                "I've tried paying three times and the payment still fails."
              </button>
              <button
                onClick={() => setCustomFeedbackInput("App crashes immediately upon biometric FaceID sign-in on iOS 18.")}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-mono"
              >
                "App crashes on FaceID sign-in"
              </button>
              <button
                onClick={() => setCustomFeedbackInput("Monthly invoice PDF exports are missing GST tax calculations.")}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-mono"
              >
                "Invoice PDF tax bug"
              </button>
            </div>
          </div>

          {/* Autonomous Incidents List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Active Autonomous Incidents & Pipeline Traces
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {incidents.length} Autonomous Incidents Registered
              </span>
            </div>

            {incidents.map((incident) => {
              const isPending = incident.pendingAction?.status === 'PENDING_APPROVAL';

              return (
                <div
                  key={incident.id}
                  className="rounded-3xl border border-rose-200 bg-white p-6 shadow-md dark:border-rose-900/60 dark:bg-slate-900 border-l-8 border-l-rose-500"
                >
                  {/* Top Alert Banner */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-rose-100 p-2.5 text-rose-700 dark:bg-rose-950 dark:text-rose-300 mt-1">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                            {incident.severity} Anomaly
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {incident.id} • {incident.timeWindow} • {incident.reportedCustomerCount} Affected Reports
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {incident.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Revenue at Modeled Risk
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                        ${(incident?.estimatedRevenueAtRiskUSD || 0).toLocaleString()}
                        <span className="text-xs font-normal text-slate-400 ml-1.5">(₹{(((incident?.estimatedRevenueAtRiskUSD || 0) * 83) / 100000).toFixed(1)} Lakhs)</span>
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-mono">ESTIMATED / MODELED</span>
                    </div>
                  </div>

                  {/* 10/14-Stage Pipeline Visualizer */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      <span>Autonomous Pipeline Execution Stages:</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-normal">
                        {incident.pipelineSteps.filter(s => s.status === 'COMPLETED').length} / {incident.pipelineSteps.length} Completed
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {incident.pipelineSteps.map((step) => {
                        const isDone = step.status === 'COMPLETED';
                        const isTrigger = step.status === 'TRIGGERED_ACTION';

                        return (
                          <div
                            key={step.stepNumber}
                            className={`rounded-2xl p-3 border text-xs transition ${
                              isTrigger
                                ? 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700 ring-2 ring-amber-400/50'
                                : isDone
                                ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
                                : 'bg-white border-slate-100 dark:bg-slate-900 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                              <span className="font-bold text-slate-400">Step {step.stepNumber}</span>
                              {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                              {isTrigger && <Lock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />}
                            </div>
                            <div className="font-bold text-slate-900 dark:text-white leading-tight">
                              {step.name}
                            </div>
                            <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {step.outputSummary || step.description}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Evidence Quotes */}
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                      Correlated Signal Evidence ({incident.evidenceQuotes.length} quotes):
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {incident.evidenceQuotes.slice(0, 4).map((q, idx) => (
                        <div key={idx} className="rounded-xl bg-white p-2.5 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300 italic">
                          "{q}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consequential Action Approval Safeguard Box */}
                  {incident.pendingAction && (
                    <div className={`mt-5 rounded-2xl border p-5 transition ${
                      isPending
                        ? 'border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/30'
                        : 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30'
                    }`}>
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                              Consequential Action Safeguard
                            </span>
                            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                              {incident.pendingAction.title}
                            </span>
                          </div>
                          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-2xl">
                            {incident.pendingAction.description}
                          </p>
                          <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 mt-1">
                            Target: {incident.pendingAction.targetEntity} • Impact: {incident.pendingAction.estimatedImpact}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleRejectRec(incident.id)}
                                disabled={actionLoadingId === incident.id}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              >
                                <Ban className="h-3.5 w-3.5 text-rose-500" />
                                <span>Reject</span>
                              </button>
                              <button
                                onClick={() => handleApproveRec(incident.id)}
                                disabled={actionLoadingId === incident.id}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50"
                              >
                                {actionLoadingId === incident.id ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <UserCheck className="h-3.5 w-3.5 text-emerald-300" />
                                )}
                                <span>Approve & Execute Action</span>
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Action Authorized & Executed</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: HUMAN APPROVAL QUEUE (Section 13) */}
      {activeSubTab === 'APPROVAL_QUEUE' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/20 dark:border-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Human-in-the-Loop Consequential Action Safeguard
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  The agent generates high-confidence remediation playbooks, but never autonomously mutates critical infrastructure without operator sign-off.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
              {recommendations.filter(r => r.status === 'PENDING').length} Pending Approval
            </span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => {
              const isPending = rec.status === 'PENDING';

              return (
                <div
                  key={rec.id}
                  className={`rounded-3xl border bg-white p-6 shadow-sm transition dark:bg-slate-900 ${
                    isPending
                      ? 'border-amber-300 ring-2 ring-amber-400/20 dark:border-amber-800'
                      : 'border-slate-200 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          rec.priority === 'CRITICAL'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}>
                          {rec.priority} Priority
                        </span>
                        <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          Target Team: {rec.targetTeam}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Confidence: {Math.round(rec.confidence * 100)}%
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                        {rec.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
                        {rec.reason}
                      </p>
                    </div>

                    <div className="flex flex-col items-start lg:items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Impact</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {rec.expectedImpact}
                      </span>
                      <span className="text-xs text-slate-400 font-mono mt-0.5">
                        {(rec?.affectedCustomersCount || 0).toLocaleString()} Affected Customers
                      </span>
                    </div>
                  </div>

                  {/* Evidence Items */}
                  <div className="mt-4">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                      Investigation Evidence Points:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                      {rec.evidence.map((ev, idx) => (
                        <li key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <CheckCircle className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Decision Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-400">Status:</span>
                      <span className={`rounded-md px-2 py-0.5 font-bold text-xs ${
                        rec.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : rec.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                      }`}>
                        {rec.status}
                      </span>
                    </div>

                    {isPending ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRecommendation(rec);
                            setModifiedActionText(rec.title);
                            setModifyModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" />
                          <span>[Modify]</span>
                        </button>

                        <button
                          onClick={() => handleInvestigateRec(rec.id)}
                          disabled={actionLoadingId === rec.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <Search className="h-3.5 w-3.5 text-purple-500" />
                          <span>[Investigate More]</span>
                        </button>

                        <button
                          onClick={() => handleRejectRec(rec.id)}
                          disabled={actionLoadingId === rec.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <Ban className="h-3.5 w-3.5 text-rose-500" />
                          <span>[Reject]</span>
                        </button>

                        <button
                          onClick={() => handleApproveRec(rec.id)}
                          disabled={actionLoadingId === rec.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50"
                        >
                          {actionLoadingId === rec.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                          )}
                          <span>[Approve]</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">
                        Decision recorded at {rec.decidedAt ? formatDate(rec.decidedAt) : 'Recent'} by {rec.decidedBy || 'Admin'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LIVE ACTIVITY STREAM (Section 16) */}
      {activeSubTab === 'ACTIVITY_STREAM' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Autonomous Event Feed
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              SSE Stream Connected
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs max-h-[600px] overflow-y-auto pr-2">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 hover:border-indigo-200 transition dark:bg-slate-800/50 dark:border-slate-800"
              >
                <div className="rounded-xl bg-white p-2 text-indigo-600 dark:bg-slate-700 dark:text-indigo-300 shadow-2xs mt-0.5">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {ev.eventType}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 font-sans text-xs">
                    {ev.message}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Source: {ev.source}</span>
                    <span>•</span>
                    <span className={`font-bold ${
                      ev.severity === 'CRITICAL' ? 'text-rose-500' : ev.severity === 'HIGH' ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      {ev.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DECISION TRACES (Section 17) */}
      {activeSubTab === 'DECISION_TRACE' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 dark:bg-indigo-950/20 dark:border-indigo-900 flex items-center gap-3">
            <Eye className="h-5 w-5 text-indigo-600" />
            <div>
              <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Autonomous Decision Explainability & Auditability
              </h4>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                Every agent action, incident trigger, and severity adjustment retains a full cryptographic decision trace with causal evidence breakdown.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-300 transition"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 mb-3">
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono">
                    {dec.decisionType}
                  </span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Confidence: {Math.round(dec.confidence * 100)}%
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  WHY DID THE AGENT TRIGGER THIS DECISION?
                </h4>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {dec.whyFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Probable Root-Cause Hypothesis:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {dec.rootCauseHypothesis}
                  </p>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block mt-1">
                    *Evidence-supported hypothesis (Correlation is not proven causation)
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{dec.evidenceDataPointsCount} Correlated Customer Reports</span>
                  <span className="font-mono">{formatDate(dec.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AGENT MEMORY & CLOSED-LOOP LEARNING (Section 18, 19, 20) */}
      {activeSubTab === 'AGENT_MEMORY' && (
        <div className="space-y-6">
          {/* Controlled Memory Summary */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Controlled Intervention Memory
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {memories.length} Historical Incident Patterns Retained
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {mem.incidentType}
                    </span>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Avg Effectiveness: {mem.averageEffectivenessPct}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Root Cause: {mem.rootCause}
                  </p>

                  <div className="mt-3 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Learned Successful Interventions:
                    </span>
                    <ul className="list-disc list-inside text-emerald-600 dark:text-emerald-400 text-[11px] space-y-0.5">
                      {mem.successfulInterventions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Observed {mem.timesObserved} times</span>
                    <span>Last: {formatDate(mem.lastObservedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outcome Evaluation Cards (Before / After) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Closed-Loop Intervention Outcome Evaluations
                </h3>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                Learning Loop Active
              </span>
            </div>

            <div className="space-y-4">
              {outcomes.map((out) => (
                <div
                  key={out.id}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5 dark:border-emerald-950 dark:bg-emerald-950/20"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-100 dark:border-emerald-900 pb-3">
                    <div>
                      <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                        {out.status}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {out.interventionName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">EFFECTIVENESS</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {out.effectivenessPct}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">SAVED REVENUE</span>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                          ${(out?.savedRevenueUSD || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Before / After Metrics Comparison */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-xl bg-rose-50/60 p-3 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900">
                      <span className="font-bold text-rose-800 dark:text-rose-300 block mb-2">
                        BEFORE INTERVENTION:
                      </span>
                      <div className="space-y-1 text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span>Negative Sentiment:</span>
                          <span className="font-mono font-bold text-rose-600">{out.beforeMetrics.negativeSentimentPct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Complaint Volume:</span>
                          <span className="font-mono font-bold">{out.beforeMetrics.complaintVolume}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CSAT Score:</span>
                          <span className="font-mono font-bold">{out.beforeMetrics.csat} / 5.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-emerald-50/60 p-3 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-2">
                        AFTER INTERVENTION:
                      </span>
                      <div className="space-y-1 text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span>Negative Sentiment:</span>
                          <span className="font-mono font-bold text-emerald-600">{out.afterMetrics.negativeSentimentPct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Complaint Volume:</span>
                          <span className="font-mono font-bold">{out.afterMetrics.complaintVolume}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CSAT Score:</span>
                          <span className="font-mono font-bold text-emerald-600">{out.afterMetrics.csat} / 5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SAFETY SAFEGUARDS & CONFIG (Section 23, 24) */}
      {activeSubTab === 'SAFETY_CONFIG' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-500" />
              Autonomous Safety Parameters & Thresholds
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure strict thresholds, rate limits, and safety tripwires for autonomous incident triggers and recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Minimum AI Confidence Threshold ({Math.round(config.minConfidenceThreshold * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={config.minConfidenceThreshold}
                  onChange={(e) => handleSaveConfig({ minConfidenceThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <span className="text-[11px] text-slate-400">
                  Recommendations below this confidence will be flagged with "INSUFFICIENT EVIDENCE".
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Emerging Growth Rate Spike Trigger (+{config.emergingGrowthThresholdPct}%)
                </label>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={config.emergingGrowthThresholdPct}
                  onChange={(e) => handleSaveConfig({ emergingGrowthThresholdPct: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <span className="text-[11px] text-slate-400">
                  Issues growing faster than this rate automatically elevate to EMERGING SPIKE status.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Max Autonomous Actions Per Hour ({config.maxActionsPerHour})
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={config.maxActionsPerHour}
                  onChange={(e) => handleSaveConfig({ maxActionsPerHour: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <span className="text-[11px] text-slate-400">
                  Rate limiting safety boundary to prevent cascade playbook executions.
                </span>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Autonomous Safety Tripwires
              </h4>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Auto-Create Incident on High Severity:</span>
                  <input
                    type="checkbox"
                    checked={config.autoCreateIncident}
                    onChange={(e) => handleSaveConfig({ autoCreateIncident: e.target.checked })}
                    className="h-4 w-4 rounded accent-indigo-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Require Human Sign-Off for Consequential Actions:</span>
                  <span className="font-bold text-emerald-600">STRICTLY ENFORCED (YES)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>LLM Tiered Cost Optimization:</span>
                  <span className="font-bold text-indigo-600">ENABLED (Deterministic → Embeddings → LLM)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modify Action Modal */}
      {modifyModalOpen && selectedRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Modify Autonomous Playbook Action
              </h3>
              <button
                onClick={() => setModifyModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Customized Action Instruction:
              </label>
              <textarea
                rows={4}
                value={modifiedActionText}
                onChange={(e) => setModifiedActionText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setModifyModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleModifySubmit}
                disabled={actionLoadingId === selectedRecommendation.id}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
              >
                Save & Update Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
