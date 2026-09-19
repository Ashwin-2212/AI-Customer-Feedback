import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { Feedback, SentimentType, PriorityLevel, FeedbackStatus, Product } from '../../types.js';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  Upload,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
  User,
  Tag,
  Mail,
  X
} from 'lucide-react';
import { getSentimentBadgeClass, getPriorityBadgeClass, exportToCSV, formatDate } from '../../lib/utils.js';

export function FeedbackView() {
  const {
    setSelectedFeedbackId,
    setIsManualModalOpen,
    setIsCSVModalOpen,
    refreshTrigger,
    triggerRefresh,
    globalSearch,
    setGlobalSearch
  } = useApp();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(globalSearch || '');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedIntent, setSelectedIntent] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date_desc');

  // Selected items for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await ApiService.getProducts();
        setProducts(res.products || []);
      } catch (err) {}
    }
    loadProducts();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await ApiService.getFeedbacks({
        page: currentPage,
        limit: 25,
        search: search.trim() || undefined,
        sentiment: (selectedSentiment as SentimentType) || undefined,
        priority: (selectedPriority as PriorityLevel) || undefined,
        productId: selectedProduct || undefined,
        status: (selectedStatus as FeedbackStatus) || undefined,
        intent: selectedIntent || undefined,
        sortBy: sortBy as any
      });
      setFeedbacks(res.items || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to load feedback:', err);
      setErrorMessage(err?.message || 'Failed to load feedback list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [
    currentPage,
    search,
    selectedSentiment,
    selectedPriority,
    selectedProduct,
    selectedStatus,
    selectedIntent,
    sortBy,
    refreshTrigger
  ]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(feedbacks.map(f => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (status: FeedbackStatus) => {
    for (const id of selectedIds) {
      await ApiService.updateFeedbackStatus(id, status);
    }
    setSelectedIds([]);
    triggerRefresh();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} feedback records?`)) return;
    for (const id of selectedIds) {
      await ApiService.deleteFeedback(id);
    }
    setSelectedIds([]);
    triggerRefresh();
  };

  const handleExport = () => {
    const exportRows = feedbacks.map(f => ({
      ID: f.id,
      Date: f.createdAt,
      Customer: f.customerName,
      Email: f.customerEmail,
      Segment: f.customerSegment,
      Product: f.productName,
      Rating: f.rating,
      Feedback: f.text,
      Sentiment: f.analysis?.sentiment,
      Priority: f.analysis?.priority,
      Intent: f.analysis?.intent,
      Emotion: f.analysis?.emotion,
      Topics: f.analysis?.topics.join('; '),
      Status: f.status
    }));
    exportToCSV(`feedback_export_${Date.now()}`, exportRows);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Feedback Ingestion & Intelligence Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {totalCount} analyzed customer signals across omnichannel streams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Export filtered feedback to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCSVModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-700"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search feedback text, tags, customer name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sentiment Filter */}
          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="h-9 rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Sentiments</option>
            <option value="POSITIVE">Positive</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="NEGATIVE">Negative</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-9 rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Product Filter */}
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="h-9 rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="rating_desc">Highest Rating</option>
            <option value="rating_asc">Lowest Rating</option>
            <option value="priority">Highest Priority</option>
          </select>
        </div>

        {/* Quick Tag Filter Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1">
            <Tag className="h-3 w-3 text-indigo-500" />
            Quick Tags:
          </span>
          {['UI/UX', 'Performance', 'Bug', 'Billing', 'Feature Request', 'Integration', 'Mobile', 'Security'].map(t => {
            const isActive = search.toLowerCase() === t.toLowerCase();
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSearch(isActive ? '' : t)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                #{t}
                {isActive && <X className="h-2.5 w-2.5" />}
              </button>
            );
          })}
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-[11px] font-medium text-slate-400 hover:text-rose-500 ml-1 transition"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Bulk Action Bar if items selected */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200">
            <span className="font-semibold">{selectedIds.length} feedback items selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('REVIEWED')}
                className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200"
              >
                Mark Reviewed
              </button>
              <button
                onClick={() => handleBulkStatusChange('RESOLVED')}
                className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200"
              >
                Mark Resolved
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white shadow-2xs hover:bg-rose-700"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-700 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="w-8 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === feedbacks.length && feedbacks.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Feedback & AI Summary</th>
                <th className="px-3 py-3">Rating</th>
                <th className="px-3 py-3">Sentiment</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin mb-2 text-indigo-500" />
                    Ingesting and analyzing signals...
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-xs text-slate-400">
                    <p className="text-sm font-medium text-rose-500 mb-1">Failed to load feedback records</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{errorMessage}</p>
                    <button
                      id="btn-retry-feedbacks"
                      onClick={loadFeedbacks}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retry
                    </button>
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    No feedback matches your current filter criteria.
                  </td>
                </tr>
              ) : (
                feedbacks.map((fb) => (
                  <tr
                    key={fb.id}
                    onClick={() => setSelectedFeedbackId(fb.id)}
                    className="cursor-pointer transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(fb.id)}
                        onChange={() => handleToggleSelect(fb.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span>{fb.customerName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[150px] mt-0.5" title={fb.customerEmail}>
                        {fb.customerEmail}
                      </div>
                      {fb.customerSegment && (
                        <span className="mt-1 inline-block rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {fb.customerSegment}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="line-clamp-2 text-slate-800 dark:text-slate-200 font-normal">
                        "{fb.text}"
                      </div>
                      {fb.analysis?.summary && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                          <Sparkles className="h-3 w-3 shrink-0" />
                          <span className="truncate">{fb.analysis.summary}</span>
                        </div>
                      )}
                      {/* All tags: custom tags + AI topics */}
                      {((fb.tags && fb.tags.length > 0) || (fb.analysis?.topics && fb.analysis.topics.length > 0)) && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {Array.from(new Set([...(fb.tags || []), ...(fb.analysis?.topics || [])])).slice(0, 4).map((t, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearch(t);
                              }}
                              title={`Filter by tag #${t}`}
                              className="rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/70 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 transition"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{fb.rating}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getSentimentBadgeClass(fb.analysis?.sentiment)}`}>
                        {fb.analysis?.sentiment}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] ${getPriorityBadgeClass(fb.analysis?.priority)}`}>
                        {fb.analysis?.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[100px] block">
                        {fb.productName}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {fb.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap text-[10px] text-slate-400">
                      {formatDate(fb.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({totalCount} total)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
