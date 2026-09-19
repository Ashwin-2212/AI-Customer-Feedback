import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { Product, FeedbackAnalysis, Customer } from '../../types.js';
import {
  X,
  Star,
  Sparkles,
  Send,
  Loader2,
  Tag,
  Plus,
  User,
  Mail,
  Users,
  Check
} from 'lucide-react';
import { getSentimentBadgeClass, getPriorityBadgeClass, getEmotionEmoji } from '../../lib/utils.js';

import { VoiceFeedbackRecorder } from './VoiceFeedbackRecorder.js';

const PRESET_TAG_SUGGESTIONS = [
  'UI/UX',
  'Performance',
  'Bug',
  'Feature Request',
  'Billing',
  'Integration',
  'Mobile',
  'Security',
  'API',
  'Onboarding'
];

export function ManualFeedbackModal() {
  const { isManualModalOpen, setIsManualModalOpen, triggerRefresh, addToast } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState(4);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live AI Preview
  const [aiPreview, setAiPreview] = useState<FeedbackAnalysis | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, custRes] = await Promise.all([
          ApiService.getProducts(),
          ApiService.getCustomers()
        ]);
        const pList = prodRes.products || [];
        const cList = custRes.customers || [];
        setProducts(pList);
        setCustomers(cList);
        if (pList.length > 0) setProductId(pList[0].id);
      } catch (err) {
        console.error('Failed to load products/customers for modal:', err);
      }
    }
    if (isManualModalOpen) {
      loadData();
    }
  }, [isManualModalOpen]);

  // Debounced live AI analysis preview as user writes
  useEffect(() => {
    if (!text || text.trim().length < 15) {
      setAiPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsPreviewLoading(true);
        const prod = products.find(p => p.id === productId)?.name || 'Acme Platform';
        const res = await ApiService.analyzePreview(text, rating, prod);
        setAiPreview(res.analysis);
      } catch (err) {
        // ignore
      } finally {
        setIsPreviewLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [text, rating, productId]);

  if (!isManualModalOpen) return null;

  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.trim().replace(/^#/, '');
    if (!clean) return;
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSelectCustomer = (cust: Customer) => {
    setCustomerName(cust.name);
    setCustomerEmail(cust.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !text.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Please fill out all required fields (Name, Email, Feedback text)',
        type: 'warning'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await ApiService.createFeedback({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        productId,
        rating,
        text: text.trim(),
        source: 'MANUAL',
        tags: tags.length > 0 ? tags : undefined
      });

      addToast({
        title: 'Feedback Ingested & Analyzed',
        message: `Successfully recorded for ${res.feedback.customerName} (${res.feedback.analysis?.sentiment} - ${res.feedback.analysis?.priority} Priority)`,
        type: 'success'
      });

      triggerRefresh();
      setIsManualModalOpen(false);
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setText('');
      setTags([]);
      setTagInput('');
      setAiPreview(null);
    } catch (err) {
      addToast({
        title: 'Ingestion Failed',
        message: (err as Error).message,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ingest New Customer Feedback
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Live Gemini AI classification, auto-tagging, and sentiment scoring
              </span>
            </div>
          </div>
          <button
            id="btn-close-manual-feedback-modal"
            onClick={() => setIsManualModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {/* Quick Scenario Fillers */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Quick Test Scenarios (1-Click Fill):
              </span>
              <span className="text-[10px] text-indigo-500">Auto-populates text, rating & tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setCustomerName('Anand Narayanan');
                  setCustomerEmail('anand.n@chennaitech.io');
                  setRating(2);
                  setText('App romba slow ah iruku');
                  setTags(['Performance', 'Tanglish', 'Mobile']);
                }}
                className="rounded-lg border border-indigo-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-slate-200"
              >
                🇮🇳 Tanglish: "App romba slow ah iruku"
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerName('Rahul Verma');
                  setCustomerEmail('rahul.v@delhienterprise.in');
                  setRating(1);
                  setText('Payment fail ho gaya aur paise kat gaye. Please refund immediately!');
                  setTags(['Payment', 'Hinglish', 'Critical']);
                }}
                className="rounded-lg border border-indigo-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-slate-200"
              >
                🇮🇳 Hinglish: "Payment fail ho gaya..."
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerName('Marcus Vance');
                  setCustomerEmail('m.vance@vortexcloud.io');
                  setRating(5);
                  setText('The application crashes every time I open it.');
                  setTags(['Bug', 'Mobile', 'Crash']);
                }}
                className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
              >
                ⚠️ 5★ Contradiction: "The app crashes every time..."
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerName('Kavitha Ramaswamy');
                  setCustomerEmail('kavitha@vortexretail.com');
                  setRating(1);
                  setText('Transaction Failed — Error 504 Gateway Timeout during checkout upgrade.');
                  setTags(['Payment', '504-Timeout', 'Critical']);
                }}
                className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[10px] font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-300"
              >
                📸 Screenshot OCR: "Error 504 Gateway Timeout"
              </button>
            </div>
          </div>

          {/* Customer Selection / Inputs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-indigo-500" />
                Customer Identity
              </span>
              {customers.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Users className="h-3 w-3" />
                  <span>Quick pick:</span>
                  <select
                    onChange={(e) => {
                      const found = customers.find(c => c.id === e.target.value);
                      if (found) handleSelectCustomer(found);
                    }}
                    defaultValue=""
                    className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="" disabled>Select existing customer...</option>
                    {(customers || []).slice(0, 8).map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="customer-name-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none" />
                  <input
                    id="customer-name-input"
                    type="text"
                    required
                    placeholder="e.g. Maria Gonzalez"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="customer-email-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none" />
                  <input
                    id="customer-email-input"
                    type="email"
                    required
                    placeholder="e.g. maria@enterprise.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product and Rating */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="target-product-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Product / Module *
              </label>
              <select
                id="target-product-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Rating (1 to 5 Stars) *
              </label>
              <div className="flex items-center gap-1.5 h-9">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:scale-110 transition"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">{rating} / 5 Stars</span>
              </div>
            </div>
          </div>

          {/* Feedback Text Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="feedback-quote-textarea" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Feedback Text / Customer Quote *
              </label>
              <div className="flex items-center gap-3">
                <VoiceFeedbackRecorder
                  onTranscriptionComplete={(transcript) => {
                    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
                  }}
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-400 font-mono">
                  {text.length} chars {text.length < 15 && text.length > 0 ? '(min 15 for AI preview)' : ''}
                </span>
              </div>
            </div>
            <textarea
              id="feedback-quote-textarea"
              rows={3}
              required
              placeholder="Paste or write the customer's verbatim message, review, or ticket note..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          {/* Feedback Tags Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="feedback-tag-input" className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-indigo-500" />
                Feedback Tags & Categorization
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Press Enter, comma, or click Add</span>
            </div>

            {/* Tag Input Box */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none" />
                <input
                  id="feedback-tag-input"
                  type="text"
                  placeholder="e.g. UI/UX, billing-issue, mobile-app, v2-release..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="h-8 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
              <button
                type="button"
                id="btn-add-tag"
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput.trim()}
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-500 disabled:opacity-40 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Tag</span>
              </button>
            </div>

            {/* Active Tags Chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Active Tags:</span>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded-xs p-0.5 text-indigo-600 hover:bg-indigo-200 hover:text-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Preset Suggested Tags */}
            <div className="pt-1">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Suggested tag presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAG_SUGGESTIONS.map((preset) => {
                  const isSelected = tags.includes(preset);
                  return (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => isSelected ? handleRemoveTag(preset) : handleAddTag(preset)}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3 opacity-60" />}
                      #{preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Detected Topics Quick-Add if available */}
            {aiPreview?.topics && aiPreview.topics.length > 0 && (
              <div className="pt-1.5 border-t border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  AI-Detected Topics (Click to add as tags):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {aiPreview.topics.map((top) => {
                    const isAdded = tags.includes(top);
                    return (
                      <button
                        type="button"
                        key={top}
                        onClick={() => isAdded ? handleRemoveTag(top) : handleAddTag(top)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium border ${
                          isAdded
                            ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700'
                        }`}
                      >
                        {isAdded ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                        #{top}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Live AI Analysis Preview Box */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 dark:border-indigo-950/60 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Live AI Classifier Preview
              </span>
              {isPreviewLoading && (
                <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium">
                  <Loader2 className="h-3 w-3 animate-spin" /> Analyzing text...
                </span>
              )}
            </div>

            {aiPreview ? (
              <div className="space-y-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold ${getSentimentBadgeClass(aiPreview.sentiment)}`}>
                    {aiPreview.sentiment}
                  </span>
                  <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] ${getPriorityBadgeClass(aiPreview.priority)}`}>
                    {aiPreview.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                    Emotion: {getEmotionEmoji(aiPreview.emotion)}
                  </span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {aiPreview.intent}
                  </span>
                </div>
                <div className="text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                  Summary: "{aiPreview.summary}"
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Write at least 15 characters to trigger live sentiment, emotion, intent, and priority classification.
              </p>
            )}
          </div>

          {/* Form Controls */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-manual-feedback"
              disabled={isSubmitting || !customerName.trim() || !customerEmail.trim() || !text.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Ingesting Feedback...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Ingest & Run Pipeline</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
