import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api.js';
import { RootCauseReport, PriorityLevel } from '../../types.js';
import {
  AlertOctagon,
  Sparkles,
  X,
  CheckCircle2,
  DollarSign,
  Building,
  ArrowRight,
  Loader2,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { formatDate } from '../../lib/utils.js';

interface RootCauseAnalysisModalProps {
  feedbackId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RootCauseAnalysisModal({ feedbackId, isOpen, onClose }: RootCauseAnalysisModalProps) {
  const { addToast, setActiveTab } = useApp();
  const [report, setReport] = useState<RootCauseReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !feedbackId) return;

    async function loadReport() {
      try {
        setIsLoading(true);
        // Try getting existing or generate new
        try {
          const res = await ApiService.getRootCauseByFeedbackId(feedbackId);
          setReport(res.report);
        } catch (e) {
          const genRes = await ApiService.generateRootCause(feedbackId);
          setReport(genRes.report);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [feedbackId, isOpen]);

  if (!isOpen) return null;

  const handleCreateIssueFromAction = async (action: any) => {
    try {
      await ApiService.createIssue({
        title: action.title,
        description: `Action item generated from Root Cause Report (Feedback ${feedbackId}):\n${action.description}\nDepartment: ${action.department}\nOwner: ${action.owner}`,
        priority: action.priority as PriorityLevel,
        category: action.department || 'Engineering',
        productId: report?.productId || 'prod_1',
        feedbackIds: [feedbackId]
      });
      addToast({
        title: 'Action Item Added to Kanban',
        message: `${action.title} assigned to ${action.owner}`,
        type: 'success'
      });
      onClose();
      setActiveTab('issues');
    } catch (err) {
      addToast({
        title: 'Action Item Failed',
        message: (err as Error).message,
        type: 'error'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Deep Root-Cause Diagnostics & Action Plan
              </h2>
              <span className="text-[11px] text-slate-400">Feedback Signal: {feedbackId}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6 text-xs">
          {isLoading || !report ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-rose-500 mb-2" />
              Synthesizing cross-system logs, latency traces, and feedback history...
            </div>
          ) : (
            <>
              {/* Executive Summary Card */}
              <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/50 to-white p-4 dark:border-rose-950 dark:from-slate-900 dark:to-rose-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Identified Root Cause: {report.category}</span>
                  </div>

                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    report.isSystemic
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {report.isSystemic ? 'SYSTEMIC ISSUE' : 'ISOLATED INCIDENT'}
                  </span>
                </div>

                <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">
                  {report.summary}
                </p>

                {/* Financial & Dept Impact */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-rose-100 dark:border-rose-900/60">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Estimated Revenue at Risk</div>
                      <div className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                        ${report.estimatedRevenueAtRiskUSD.toLocaleString()} USD
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Responsible Departments</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {(report.involvedDepartments || []).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contributing Factors (5 Whys) */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Contributing Failure Vectors
                </h3>
                <div className="space-y-1.5">
                  {(report.contributingFactors || []).map((factor, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {factor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescribed Action Items */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Prescribed Corrective Action Items ({(report.actionItems || []).length})
                </h3>
                <div className="space-y-2">
                  {(report.actionItems || []).map((action) => (
                    <div
                      key={action.id}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {action.department}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                            {action.title}
                          </h4>
                        </div>

                        <button
                          onClick={() => handleCreateIssueFromAction(action)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          <span>Track in Kanban</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {action.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{action.owner}</strong></span>
                        <span>Priority: <strong className="text-rose-600 dark:text-rose-400">{action.priority}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
