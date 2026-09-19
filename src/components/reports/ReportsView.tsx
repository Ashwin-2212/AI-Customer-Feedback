import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { ReportData } from '../../types.js';
import {
  FileText,
  Download,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  FileDown
} from 'lucide-react';
import { generateReportPDF, formatDate } from '../../lib/utils.js';

export function ReportsView() {
  const { addToast } = useApp();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportData['period']>('WEEKLY');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await ApiService.getReports();
        setReports(res.reports || []);
        if (res.reports && res.reports.length > 0) setSelectedReport(res.reports[0]);
      } catch (err) {}
    }
    loadReports();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const res = await ApiService.generateReport(selectedPeriod);
      setReports(prev => [res.report, ...prev]);
      setSelectedReport(res.report);
      addToast({
        title: 'Executive Report Generated',
        message: `${res.report.title} successfully compiled with AI insights.`,
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Report Generation Failed',
        message: (err as Error).message,
        type: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Executive Intelligence Reports & Synthesis
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated executive briefs, KPI benchmarks, negative driver decomposition, and downloadable PDF reports.
          </p>
        </div>

        {/* Generate Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as ReportData['period'])}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="DAILY">Daily Flash Brief</option>
            <option value="WEEKLY">Weekly Intelligence</option>
            <option value="MONTHLY">Monthly Overview</option>
            <option value="QUARTERLY">Quarterly Strategic</option>
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Reports Archive List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Archived Reports
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`cursor-pointer rounded-xl border p-3.5 transition ${
                  selectedReport?.id === rep.id
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs dark:border-indigo-500/80 dark:bg-indigo-950/40'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                    {rep.title}
                  </span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[9px] font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {rep.period}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{formatDate(rep.generatedAt)}</span>
                  <span>CSAT: {rep.kpis.csat}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Report Preview (2 cols) */}
        {selectedReport && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2 space-y-6">
            {/* Top title and PDF download action */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedReport.title}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Generated: {formatDate(selectedReport.generatedAt)} | Scope: {selectedReport.period}
                </div>
              </div>

              <button
                onClick={() => generateReportPDF(selectedReport)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <FileDown className="h-4 w-4 text-indigo-500" />
                <span>Download PDF Report</span>
              </button>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[10px] text-slate-400">Total Volume</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{selectedReport.kpis?.totalFeedback ?? 0}</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[10px] text-slate-400">Customer CSAT</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{selectedReport.kpis?.csat ?? 0}%</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[10px] text-slate-400">NPS Benchmark</div>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">+{selectedReport.kpis?.nps ?? 0}</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[10px] text-slate-400">Critical Issues</div>
                <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{selectedReport.kpis?.criticalIssuesCount ?? 0}</div>
              </div>
            </div>

            {/* AI Executive Summary Block */}
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-slate-50 p-4 dark:border-indigo-950 dark:from-slate-900 dark:to-indigo-950/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Executive Intelligence Narrative</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {selectedReport.executiveSummary}
              </div>
            </div>

            {/* Top Negative Feedback Drivers */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Top Negative Feedback Drivers
              </h3>
              <div className="space-y-2">
                {(selectedReport.topComplaints || []).map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {idx + 1}. {c.topic}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{c.count} mentions ({c.percentage}%)</span>
                      <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {c.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Recommendations */}
            {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Prioritized Action Plan
                </h3>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {selectedReport.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span>{rec.issue}</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400">{rec.priority}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">{rec.action}</p>
                      <div className="mt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Expected Impact: {rec.expectedImpact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
