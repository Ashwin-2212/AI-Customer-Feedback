import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  Table
} from 'lucide-react';
import { exportToCSV } from '../../lib/utils.js';

export function CSVImportModal() {
  const { isCSVModalOpen, setIsCSVModalOpen, triggerRefresh, addToast } = useApp();

  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCSVModalOpen) return null;

  const handleDownloadSample = () => {
    const sampleRows = [
      { customer_name: 'John Doe', email: 'john@acme.org', product: 'Acme Cloud Platform', rating: '5', feedback: 'The automated scaling and latency enhancements have drastically boosted our checkout conversion rates!' },
      { customer_name: 'Alice Smith', email: 'alice@fintech.io', product: 'Acme Pay Engine', rating: '1', feedback: 'Recurring payment webhooks returned 504 timeouts three times today, blocking transaction processing.' },
      { customer_name: 'David Chen', email: 'david@agency.co', product: 'Acme Mobile App', rating: '2', feedback: 'App crashes immediately on Android 14 when trying to select multiple media items.' },
      { customer_name: 'Elena Rostova', email: 'elena@bi.io', product: 'Acme Realtime BI Suite', rating: '4', feedback: 'Custom dashboard widgets and CSV scheduling make weekly executive reporting effortless.' }
    ];
    exportToCSV('sample_feedback_template', sampleRows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const parseFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        addToast({
          title: 'CSV Format Error',
          message: 'CSV file must contain a header row and at least 1 data row.',
          type: 'warning'
        });
        return;
      }

      // Simple CSV header parse
      const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      setHeaders(rawHeaders);

      const parsed: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        // Regex to split by comma outside quotes
        const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        const cols = match ? match.map(m => m.replace(/^"|"$/g, '').trim()) : lines[i].split(',');

        const rowObj: any = {};
        rawHeaders.forEach((h, index) => {
          rowObj[h] = cols[index] || '';
        });
        parsed.push(rowObj);
      }

      setCsvRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (csvRows.length === 0) return;

    try {
      setIsProcessing(true);
      setProgress(25);

      // Normalize row field names
      const normalizedRows = csvRows.map(r => ({
        customer_name: r.customer_name || r.name || r.Customer || r.customerName || 'Anonymous',
        email: r.email || r.Email || r.customerEmail || 'user@example.com',
        product: r.product || r.Product || r.productName || 'Acme Cloud Platform',
        rating: r.rating || r.Rating || 3,
        feedback: r.feedback || r.Feedback || r.text || r.Text || r.comment || 'Imported feedback'
      }));

      setProgress(60);
      const res = await ApiService.importCSV(normalizedRows);
      setProgress(100);

      addToast({
        title: 'Batch Import Complete',
        message: `Successfully ingested and analyzed ${res.importedCount} customer feedback records.`,
        type: 'success'
      });

      triggerRefresh();
      setIsCSVModalOpen(false);
    } catch (err) {
      addToast({
        title: 'Batch Import Failed',
        message: (err as Error).message,
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Batch CSV Ingestion Pipeline
              </h2>
              <span className="text-[11px] text-slate-400">Upload bulk reviews, tickets, or survey export</span>
            </div>
          </div>
          <button
            onClick={() => setIsCSVModalOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {/* Sample template banner */}
          <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs dark:border-indigo-950/60 dark:bg-indigo-950/20">
            <span className="text-slate-700 dark:text-slate-300">
              Need a standard schema format? Download our pre-configured CSV template.
            </span>
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400 shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Sample Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {csvRows.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) parseFile(e.dataTransfer.files[0]);
              }}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-indigo-500 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:hover:bg-slate-800/50"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop CSV file
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Columns supported: customer_name, email, product, rating, feedback
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Loaded "{fileName}" ({csvRows.length} rows)
                </span>
                <button
                  onClick={() => {
                    setCsvRows([]);
                    setFileName('');
                  }}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Choose Different File
                </button>
              </div>

              {/* Preview Table */}
              <div className="max-h-56 overflow-auto rounded-xl border border-slate-200 text-[11px] dark:border-slate-800">
                <table className="w-full text-left">
                  <thead className="sticky top-0 border-b border-slate-200 bg-slate-100 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      {(headers || []).slice(0, 5).map((h, i) => (
                        <th key={i} className="px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(csvRows || []).slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        {(headers || []).slice(0, 5).map((h, i) => (
                          <td key={i} className="px-3 py-1.5 truncate max-w-[150px]">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ingestion Progress Bar */}
          {isProcessing && (
            <div className="space-y-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs dark:border-indigo-950 dark:bg-indigo-950/20">
              <div className="flex items-center justify-between font-semibold text-indigo-700 dark:text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  AI Classification Queue Ingesting...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-slate-800">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setIsCSVModalOpen(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={csvRows.length === 0 || isProcessing}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing AI Pipeline...</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                <span>Start Batch Ingestion ({csvRows.length} items)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
