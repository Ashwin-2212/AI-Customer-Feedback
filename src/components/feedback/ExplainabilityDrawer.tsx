import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api.js';
import { ExplainabilityReport } from '../../types.js';
import {
  BrainCircuit,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Loader2
} from 'lucide-react';

interface ExplainabilityDrawerProps {
  feedbackId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExplainabilityDrawer({ feedbackId, isOpen, onClose }: ExplainabilityDrawerProps) {
  const [report, setReport] = useState<ExplainabilityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !feedbackId) return;

    async function loadReport() {
      try {
        setIsLoading(true);
        const res = await ApiService.explainFeedback(feedbackId);
        setReport(res.report);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [feedbackId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Explainable AI (XAI) Attribution
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Why did Gemini predict this outcome?</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
          {isLoading || !report ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-purple-500 mb-2" />
              Computing token attention weights and decision boundaries...
            </div>
          ) : (
            <>
              {/* Confidence & Decision Boundary */}
              <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-3.5 dark:border-purple-950 dark:bg-purple-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 dark:text-purple-300">
                    Decision Confidence Score
                  </span>
                  <span className="text-base font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(report.confidenceScore * 100)}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-purple-200 dark:bg-purple-900">
                  <div
                    className="h-full bg-purple-600 transition-all"
                    style={{ width: `${report.confidenceScore * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                  {report.decisionBoundaryReasoning}
                </p>
              </div>

              {/* Feature Attention Weights */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5 text-purple-500" />
                  Token & Aspect Attention Weights
                </h3>
                <div className="space-y-2">
                  {(report.featureWeights || []).map((fw, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-slate-700 dark:text-slate-300">"{fw.feature}"</span>
                        <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                          {fw.weight > 0 ? `+${(fw.weight * 100).toFixed(0)}%` : `${(fw.weight * 100).toFixed(0)}%`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${Math.min(100, Math.abs(fw.weight) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salient Trigger Phrases */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  High-Impact Linguistic Triggers
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(report.triggerPhrases || []).map((phrase, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-rose-800 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300 font-semibold"
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>

              {/* Counterfactual Simulations */}
              {report.counterfactuals && report.counterfactuals.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    What-If Counterfactual Simulations
                  </h3>
                  <div className="space-y-1.5">
                    {report.counterfactuals.map((cf, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40 text-[11px] text-slate-700 dark:text-slate-300"
                      >
                        {cf}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
