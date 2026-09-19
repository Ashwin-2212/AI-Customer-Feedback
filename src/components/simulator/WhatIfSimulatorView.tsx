import React, { useState, useEffect } from 'react';
import {
  Sliders,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Sparkles,
  AlertCircle,
  History,
  RotateCcw,
  CheckCircle2,
  Info,
  Layers,
  Users,
  BrainCircuit
} from 'lucide-react';
import { WhatIfSimulationResult, WhatIfSimulationParams } from '../../types.js';

const PRESET_SCENARIOS: Array<{
  name: string;
  topic: string;
  intervention: string;
  pct: number;
  segment: string;
}> = [
  {
    name: 'Payment Gateway Resilience',
    topic: 'Payment failures and 504 gateway timeout',
    intervention: 'Provision auto-scaling Redis BullMQ worker queue with idempotent retry locks',
    pct: 20,
    segment: 'Enterprise VIP Accounts'
  },
  {
    name: 'Mobile App Camera Stability',
    topic: 'Android mobile app crash on photo upload',
    intervention: 'Deploy client-side TurboModule image downsampling to 1080p before native buffer allocation',
    pct: 35,
    segment: 'Mobile Field Workers'
  },
  {
    name: 'Large Dataset BI Performance',
    topic: 'Dashboard latency on 500k row datasets',
    intervention: 'Implement server-side cursor pagination and vectorized WebAssembly aggregation filters',
    pct: 50,
    segment: 'ALL'
  }
];

export function WhatIfSimulatorView() {
  const [problemTopic, setProblemTopic] = useState(PRESET_SCENARIOS[0].topic);
  const [targetIntervention, setTargetIntervention] = useState(PRESET_SCENARIOS[0].intervention);
  const [improvementPercentage, setImprovementPercentage] = useState(PRESET_SCENARIOS[0].pct);
  const [customerSegmentFilter, setCustomerSegmentFilter] = useState(PRESET_SCENARIOS[0].segment);
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<WhatIfSimulationResult | null>(null);
  const [history, setHistory] = useState<WhatIfSimulationResult[]>([]);

  useEffect(() => {
    runSimulation();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/simulations/history');
      const data = await res.json();
      if (data.success && data.simulations) {
        setHistory(data.simulations);
      }
    } catch (e) {
      console.error('Failed to load simulation history', e);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/simulations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTopic,
          targetIntervention,
          improvementPercentage,
          customerSegmentFilter
        })
      });
      const data = await res.json();
      if (data.success && data.simulation) {
        setCurrentResult(data.simulation);
        fetchHistory();
      }
    } catch (e) {
      console.error('Failed to run simulation', e);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setProblemTopic(preset.topic);
    setTargetIntervention(preset.intervention);
    setImprovementPercentage(preset.pct);
    setCustomerSegmentFilter(preset.segment);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sliders className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI What-If Intervention Simulator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Predictive Decision Intelligence
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate policy, engineering, and support interventions to forecast downstream sentiment improvement, CSAT lift, churn reduction, and protected revenue before writing a single line of code.
          </p>
        </div>

        {/* Disclaimer Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs shrink-0">
          <Info className="h-4 w-4" />
          <span>All projected metrics are labeled as <strong>[ESTIMATED / MODELED]</strong></span>
        </div>
      </div>

      {/* Preset Scenarios Pill Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-2">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Presets:
        </span>
        {PRESET_SCENARIOS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => applyPreset(preset)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 transition-all text-slate-700 dark:text-slate-300 shadow-sm"
          >
            {preset.name} ({preset.pct}%)
          </button>
        ))}
      </div>

      {/* Main Grid: Parameters on Left, Predictions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Simulation Parameter Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-500" />
              Intervention Parameters
            </h2>

            {/* Problem Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Target Problem / Friction Area
              </label>
              <textarea
                value={problemTopic}
                onChange={(e) => setProblemTopic(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="e.g. Payment failures and 504 gateway timeout"
              />
            </div>

            {/* Proposed Intervention */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Proposed Action / Resolution
              </label>
              <textarea
                value={targetIntervention}
                onChange={(e) => setTargetIntervention(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="e.g. Upgrade payment gateway worker concurrency"
              />
            </div>

            {/* Expected Improvement Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Targeted Problem Reduction
                </label>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-md">
                  {improvementPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={improvementPercentage}
                onChange={(e) => setImprovementPercentage(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>5% (Minor Tweak)</span>
                <span>40% (Major Fix)</span>
                <span>80% (Complete Overhaul)</span>
              </div>
            </div>

            {/* Customer Segment Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Target Customer Segment Cohort
              </label>
              <select
                value={customerSegmentFilter}
                onChange={(e) => setCustomerSegmentFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              >
                <option value="ALL">All Segments (Global)</option>
                <option value="Enterprise VIP Accounts">Enterprise VIP Accounts</option>
                <option value="Mobile Field Workers">Mobile Field Workers</option>
                <option value="At-Risk Customer">At-Risk & Churn Susceptible</option>
              </select>
            </div>

            {/* Run Button */}
            <button
              onClick={runSimulation}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Calculating Statistical Model...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Simulate What-If Impact
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Simulation Output & Predicted Metrics */}
        <div className="lg:col-span-7 space-y-6">
          {currentResult ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Header result banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    AI Forecast Output
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Simulation Impact Prediction
                  </h3>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Confidence: {currentResult.modelConfidence}%
                  </div>
                </div>
              </div>

              {/* KPI Prediction Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* 1. Negative Feedback Reduction */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Negative Feedback</span>
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ↓ {currentResult.simulatedMetrics.negativeFeedbackReductionPct}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    From {currentResult.baselineMetrics.totalNegativeFeedback} baseline complaints
                  </div>
                </div>

                {/* 2. Topic Complaint Reduction */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Topic Complaints</span>
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ↓ {currentResult.simulatedMetrics.topicComplaintReductionPct}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Target friction drop
                  </div>
                </div>

                {/* 3. CSAT Lift */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>CSAT Score</span>
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    ↑ +{currentResult.simulatedMetrics.projectedCSATDelta}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    New CSAT: {currentResult.simulatedMetrics.projectedCSAT} / 5.0
                  </div>
                </div>

                {/* 4. High-Risk Customer Reduction */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>High-Risk Accounts</span>
                    <Users className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ↓ {currentResult.simulatedMetrics.highRiskCustomerReductionPct}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Stabilizing at-risk cohort
                  </div>
                </div>

                {/* 5. Retention Lift */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Retention Gain</span>
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    ↑ {currentResult.simulatedMetrics.projectedRetentionGainPct}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cohort baseline 88.4%
                  </div>
                </div>

                {/* 6. Estimated Revenue Saved */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                    <span>ARR Protected</span>
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                    ${(currentResult.simulatedMetrics?.estimatedRevenueSavedUSD || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                    [MODELED / MONTHLY]
                  </div>
                </div>
              </div>

              {/* Qualitative AI Executive Summary */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  AI Executive Intelligence Rationale
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentResult.qualitativeSummary}
                </p>
              </div>

              {/* Explicit Assumptions & Trust Layer */}
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" /> Model Assumptions & Evidence Base ({currentResult.evidenceDataPointsCount} related feedback records):
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {currentResult.assumptions.map((assump, idx) => (
                    <li key={idx}>{assump}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
              Run a simulation to view impact predictions
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Recent Simulation History Log */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Simulation Audit History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Problem Focus</th>
                  <th className="py-2.5 px-3">Target %</th>
                  <th className="py-2.5 px-3">CSAT Lift</th>
                  <th className="py-2.5 px-3">Neg. Drop</th>
                  <th className="py-2.5 px-3">ARR Saved (Est.)</th>
                  <th className="py-2.5 px-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {history.slice(0, 5).map((sim) => (
                  <tr key={sim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(sim.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                      {sim.params.problemTopic}
                    </td>
                    <td className="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {sim.params.improvementPercentage}%
                    </td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                      +{sim.simulatedMetrics.projectedCSATDelta}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">
                      ↓ {sim.simulatedMetrics.negativeFeedbackReductionPct}%
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      ${(sim.simulatedMetrics?.estimatedRevenueSavedUSD || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {sim.modelConfidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
