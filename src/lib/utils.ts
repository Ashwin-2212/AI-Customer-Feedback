import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsPDF } from 'jspdf';
import { ReportData, Feedback } from '../types.js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateString;
  }
}

export function getSentimentBadgeClass(sentiment?: string): string {
  switch (sentiment) {
    case 'POSITIVE':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    case 'NEGATIVE':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
    case 'NEUTRAL':
    default:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  }
}

export function getPriorityBadgeClass(priority?: string): string {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-300 dark:border-red-800 font-semibold';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300 dark:border-orange-800';
    case 'MEDIUM':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
    case 'LOW':
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

export function getEmotionEmoji(emotion?: string): string {
  switch (emotion) {
    case 'HAPPY': return '😊 Happy';
    case 'EXCITED': return '🤩 Excited';
    case 'SATISFIED': return '👍 Satisfied';
    case 'ANGRY': return '😡 Angry';
    case 'FRUSTRATED': return '😤 Frustrated';
    case 'DISAPPOINTED': return '😞 Disappointed';
    case 'CONFUSED': return '🤔 Confused';
    case 'WORRIED': return '😰 Worried';
    case 'NEUTRAL': default: return '😐 Neutral';
  }
}

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          let val = row[header];
          if (val === undefined || val === null) val = '';
          else if (typeof val === 'object') val = JSON.stringify(val);
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateReportPDF(report: ReportData) {
  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text(report.title, 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()} | Period: ${report.period}`, 20, y);
  y += 15;

  // KPIs
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Performance Indicators (KPIs)', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Total Feedback Volume: ${report.kpis.totalFeedback}`, 25, y); y += 6;
  doc.text(`• Customer Satisfaction (CSAT): ${report.kpis.csat}%`, 25, y); y += 6;
  doc.text(`• Net Promoter Score (NPS): ${report.kpis.nps > 0 ? '+' : ''}${report.kpis.nps}`, 25, y); y += 6;
  doc.text(`• Positive Feedback: ${report.kpis.positivePercentage}% | Negative: ${report.kpis.negativePercentage}%`, 25, y); y += 6;
  doc.text(`• Average Rating: ${report.kpis.avgRating}/5.0 | Critical Open Issues: ${report.kpis.criticalIssuesCount}`, 25, y); y += 12;

  // Executive Summary
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Executive Intelligence Summary', 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const cleanSummary = report.executiveSummary.replace(/[#*]/g, '');
  const splitSummary = doc.splitTextToSize(cleanSummary, 170);
  doc.text(splitSummary, 20, y);
  y += splitSummary.length * 4.5 + 10;

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Top Complaints
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Top Negative Feedback Drivers', 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  report.topComplaints.forEach((c, idx) => {
    doc.text(`${idx + 1}. ${c.topic} — ${c.count} mentions (${c.percentage}% of complaints) [${c.severity}]`, 25, y);
    y += 6;
  });
  y += 8;

  // Strategic Next Steps
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Prioritized Action Recommendations', 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  report.recommendations.forEach((r, idx) => {
    const lines = doc.splitTextToSize(`${idx + 1}. [${r.priority}] ${r.issue} -> Action: ${r.action} (Impact: ${r.expectedImpact})`, 165);
    doc.text(lines, 20, y);
    y += lines.length * 4.5 + 4;
  });

  doc.save(`${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);
}

// ==========================================
// SAFE FORMATTING UTILITIES
// ==========================================

/** Safe number formatter — returns fallback for undefined/NaN values */
export function formatNumber(val: number | undefined | null, fallback: string = '0'): string {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  return val.toLocaleString('en-US');
}

/** Safe currency formatter */
export function formatCurrency(val: number | undefined | null, currency: string = 'USD', fallback: string = '$0'): string {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);
  } catch {
    return `$${val.toLocaleString()}`;
  }
}

/** Safe percentage formatter */
export function formatPercentage(val: number | undefined | null, decimals: number = 1, fallback: string = '0%'): string {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  return `${val.toFixed(decimals)}%`;
}

/** Safe deep property access */
export function safeGet<T>(obj: any, path: string, fallback: T): T {
  try {
    const result = path.split('.').reduce((acc, part) => acc?.[part], obj);
    return (result === undefined || result === null) ? fallback : result as T;
  } catch {
    return fallback;
  }
}

/** Safe compact number (e.g., 1.2K, 3.5M) */
export function formatCompact(val: number | undefined | null, fallback: string = '0'): string {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}
