import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { Feedback, FeedbackStatus, SentimentType, PriorityLevel, TranslationResult, CopilotTicket } from '../../types.js';
import {
  X,
  Star,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Copy,
  Check,
  User,
  Mail,
  Layers,
  ArrowRight,
  Tag,
  Plus,
  Loader2,
  Globe,
  BrainCircuit,
  Bot,
  Sliders,
  Send,
  HelpCircle
} from 'lucide-react';
import { getSentimentBadgeClass, getPriorityBadgeClass, getEmotionEmoji, formatDate } from '../../lib/utils.js';
import { ExplainabilityDrawer } from './ExplainabilityDrawer.js';
import { RootCauseAnalysisModal } from './RootCauseAnalysisModal.js';

export function FeedbackDetailModal() {
  const {
    selectedFeedbackId,
    setSelectedFeedbackId,
    triggerRefresh,
    setActiveTab,
    addToast
  } = useApp();

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [similarFeedback, setSimilarFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);

  // Enterprise Feature States
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isRootCauseOpen, setIsRootCauseOpen] = useState(false);
  
  // Translation
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);

  // Copilot Response
  const [isGeneratingCopilot, setIsGeneratingCopilot] = useState(false);
  const [copilotTicket, setCopilotTicket] = useState<CopilotTicket | null>(null);

  // RLHF Correction Form
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctedSentiment, setCorrectedSentiment] = useState<SentimentType>('NEUTRAL');
  const [correctedUrgency, setCorrectedUrgency] = useState<PriorityLevel>('MEDIUM');
  const [correctionReasoning, setCorrectionReasoning] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);

  useEffect(() => {
    if (!selectedFeedbackId) {
      setFeedback(null);
      setSimilarFeedback(null);
      setTranslation(null);
      setCopilotTicket(null);
      setShowCorrectionForm(false);
      return;
    }

    async function loadDetails() {
      try {
        setIsLoading(true);
        const res = await ApiService.getFeedbackById(selectedFeedbackId!);
        setFeedback(res.feedback);
        setSimilarFeedback(res.similarFeedback || null);
        if (res.feedback.analysis) {
          setCorrectedSentiment(res.feedback.analysis.sentiment);
          setCorrectedUrgency(res.feedback.analysis.priority);
        }
      } catch (err) {
        console.error('Failed to load feedback details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [selectedFeedbackId]);

  if (!selectedFeedbackId) return null;

  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    if (!feedback) return;
    try {
      const res = await ApiService.updateFeedbackStatus(feedback.id, newStatus);
      setFeedback(res.feedback);
      triggerRefresh();
      addToast({
        title: 'Status Updated',
        message: `Feedback marked as ${newStatus}`,
        type: 'success'
      });
    } catch (err) {}
  };

  const handleAddTag = async (rawTag: string) => {
    if (!feedback) return;
    const clean = rawTag.trim().replace(/^#/, '');
    if (!clean) return;
    const currentTags = feedback.tags || [];
    if (currentTags.includes(clean)) {
      setNewTagInput('');
      return;
    }

    const updatedTags = [...currentTags, clean];
    try {
      setIsUpdatingTags(true);
      const res = await ApiService.updateFeedbackTags(feedback.id, updatedTags);
      setFeedback(res.feedback);
      triggerRefresh();
      setNewTagInput('');
      addToast({
        title: 'Tag Added',
        message: `Added #${clean} to this feedback`,
        type: 'success'
      });
    } catch (err) {
      addToast({ title: 'Tag Update Failed', message: (err as Error).message, type: 'error' });
    } finally {
      setIsUpdatingTags(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!feedback) return;
    const currentTags = feedback.tags || [];
    const updatedTags = currentTags.filter(t => t !== tagToRemove);
    try {
      setIsUpdatingTags(true);
      const res = await ApiService.updateFeedbackTags(feedback.id, updatedTags);
      setFeedback(res.feedback);
      triggerRefresh();
      addToast({
        title: 'Tag Removed',
        message: `Removed #${tagToRemove}`,
        type: 'info'
      });
    } catch (err) {
      addToast({ title: 'Tag Removal Failed', message: (err as Error).message, type: 'error' });
    } finally {
      setIsUpdatingTags(false);
    }
  };

  const handleConvertToIssue = async () => {
    if (!feedback) return;
    try {
      const title = feedback.analysis?.summary || `Customer Issue: ${feedback.productName}`;
      await ApiService.createIssue({
        title,
        description: `Feedback from ${feedback.customerName} (${feedback.customerEmail}):\n"${feedback.text}"\n\nAI Recommended Action: ${feedback.analysis?.recommendation?.action || 'Review and triage.'}`,
        priority: feedback.analysis?.priority || 'MEDIUM',
        category: feedback.analysis?.topics?.[0] || 'General',
        productId: feedback.productId,
        feedbackIds: [feedback.id]
      });
      addToast({
        title: 'Issue Created',
        message: 'New issue tracked in Kanban board',
        type: 'success'
      });
      setSelectedFeedbackId(null);
      setActiveTab('issues');
    } catch (err) {
      addToast({ title: 'Conversion Failed', message: (err as Error).message, type: 'error' });
    }
  };

  const handleTranslate = async () => {
    if (!feedback) return;
    try {
      setIsTranslating(true);
      const res = await ApiService.translateFeedback(feedback.text, targetLang);
      setTranslation(res);
      addToast({
        title: 'Translation Complete',
        message: `Translated from ${res.detectedSourceLanguage} to ${targetLang}`,
        type: 'success'
      });
    } catch (err) {
      addToast({ title: 'Translation Failed', message: (err as Error).message, type: 'error' });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateCopilotReply = async () => {
    if (!feedback) return;
    try {
      setIsGeneratingCopilot(true);
      const res = await ApiService.generateCopilotReply(feedback.id);
      setCopilotTicket(res.ticket);
      addToast({
        title: 'Copilot Draft Ready',
        message: 'Synthesized grounded response from knowledge base',
        type: 'success'
      });
    } catch (err) {
      addToast({ title: 'Copilot Draft Failed', message: (err as Error).message, type: 'error' });
    } finally {
      setIsGeneratingCopilot(false);
    }
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback || !correctionReasoning.trim()) return;
    try {
      setIsSubmittingCorrection(true);
      await ApiService.submitHumanCorrection({
        feedbackId: feedback.id,
        correctedSentiment,
        correctedUrgency,
        reasoning: correctionReasoning.trim()
      });
      addToast({
        title: 'RLHF Feedback Logged',
        message: 'Human correction contributed to model calibration dataset',
        type: 'success'
      });
      setShowCorrectionForm(false);
    } catch (err) {
      addToast({ title: 'Correction Failed', message: (err as Error).message, type: 'error' });
    } finally {
      setIsSubmittingCorrection(false);
    }
  };

  const copyText = () => {
    if (feedback) {
      navigator.clipboard.writeText(feedback.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyEmail = () => {
    if (feedback) {
      navigator.clipboard.writeText(feedback.customerEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs">
        <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Feedback Intelligence Detail & Enterprise Diagnostics
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">ID: {feedback?.id}</span>
              </div>
            </div>

            {/* Quick Action Pills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExplainOpen(true)}
                className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950/50 dark:text-purple-300 transition"
              >
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Explain AI</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRootCauseOpen(true)}
                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300 transition"
              >
                <AlertOctagon className="h-3.5 w-3.5" />
                <span>Root Cause</span>
              </button>

              <button
                id="btn-close-feedback-detail-modal"
                onClick={() => setSelectedFeedbackId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
            {isLoading || !feedback ? (
              <div className="space-y-4 py-12 text-center text-xs text-slate-400 animate-pulse">
                <div className="h-5 w-48 mx-auto rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-24 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ) : (
              <>
                {/* Customer & Product Meta Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                  {/* Customer Details */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3 text-indigo-500" /> Customer
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {feedback.customerName}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{feedback.customerEmail}</span>
                      <button
                        type="button"
                        onClick={copyEmail}
                        title="Copy customer email"
                        className="text-slate-400 hover:text-indigo-600 transition"
                      >
                        {copiedEmail ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    {feedback.customerSegment && (
                      <span className="inline-block rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {feedback.customerSegment}
                      </span>
                    )}
                  </div>

                  {/* Product & Source */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Product</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{feedback.productName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Channel: {feedback.source}</div>
                  </div>

                  {/* Rating & Sentiment */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rating & Sentiment</div>
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{feedback.rating}/5 Stars</span>
                    </div>
                    <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${getSentimentBadgeClass(feedback.analysis?.sentiment)}`}>
                      {feedback.analysis?.sentiment}
                    </span>
                  </div>

                  {/* Date & Priority */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ingestion Date</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">{formatDate(feedback.createdAt)}</div>
                    <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${getPriorityBadgeClass(feedback.analysis?.priority)}`}>
                      {feedback.analysis?.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Raw Customer Text with Multilingual Translation Bar */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Customer Verbatim Feedback
                      {feedback.detectedLanguage && (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-normal text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {feedback.detectedLanguage}
                        </span>
                      )}
                    </span>

                    <div className="flex items-center gap-2">
                      <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="h-7 rounded-md border border-slate-300 bg-white px-2 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Tamil">Tamil</option>
                      </select>

                      <button
                        type="button"
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className="flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 transition"
                      >
                        {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
                        <span>Translate</span>
                      </button>

                      <button
                        onClick={copyText}
                        className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200/80 bg-white p-3.5 text-xs text-slate-900 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100 leading-relaxed">
                    "{feedback.text}"
                  </div>

                  {/* Translated Box if available */}
                  {translation && (
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-xs dark:border-indigo-900 dark:bg-indigo-950/40">
                      <span className="font-semibold text-indigo-900 dark:text-indigo-300 block mb-1">
                        Translated to {targetLang}:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        "{translation.translatedText}"
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Analysis Card */}
                {feedback.analysis && (
                  <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-slate-50 p-4 dark:border-indigo-950/80 dark:from-slate-900 dark:to-indigo-950/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        <Sparkles className="h-4 w-4" />
                        <span>Gemini Synthetic Intelligence</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCorrectionForm(!showCorrectionForm)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
                      >
                        <Sliders className="h-3 w-3" />
                        <span>Correct AI Classification</span>
                      </button>
                    </div>

                    {/* Summary */}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Executive Summary</div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {feedback.analysis.summary}
                      </p>
                    </div>

                    {/* Aspect Sentiments */}
                    {feedback.analysis.aspects && feedback.analysis.aspects.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                          Aspect-Based Sentiment Decomposition
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {feedback.analysis.aspects.map((asp, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800/80"
                            >
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{asp.aspect}</span>
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getSentimentBadgeClass(asp.sentiment)}`}>
                                {asp.sentiment}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Recommendation */}
                    {feedback.analysis.recommendation && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs dark:border-amber-900/60 dark:bg-amber-950/30">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Recommended Resolution Strategy:</span>
                        </div>
                        <p className="mt-1 text-slate-800 dark:text-slate-200">
                          {feedback.analysis.recommendation.action}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Human RLHF Correction Form Accordion */}
                {showCorrectionForm && (
                  <form onSubmit={handleSubmitCorrection} className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30 space-y-3 animate-in fade-in">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-indigo-500" />
                      Submit Human-in-the-Loop (RLHF) Correction
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Corrected Sentiment
                        </label>
                        <select
                          value={correctedSentiment}
                          onChange={(e) => setCorrectedSentiment(e.target.value as SentimentType)}
                          className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="POSITIVE">Positive</option>
                          <option value="NEUTRAL">Neutral</option>
                          <option value="NEGATIVE">Negative</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Corrected Urgency
                        </label>
                        <select
                          value={correctedUrgency}
                          onChange={(e) => setCorrectedUrgency(e.target.value as PriorityLevel)}
                          className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Reasoning for Model Correction
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarcasm detected; customer expressed acute frustration despite polite greeting."
                        value={correctionReasoning}
                        onChange={(e) => setCorrectionReasoning(e.target.value)}
                        className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCorrectionForm(false)}
                        className="rounded-lg bg-white px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingCorrection}
                        className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700"
                      >
                        Save RLHF Calibration
                      </button>
                    </div>
                  </form>
                )}

                {/* Copilot Grounded Reply Section */}
                <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 dark:border-purple-900/60 dark:bg-purple-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300 text-xs">
                      <Bot className="h-4 w-4" />
                      <span>RAG Support Copilot</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateCopilotReply}
                      disabled={isGeneratingCopilot}
                      className="flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-purple-700 transition"
                    >
                      {isGeneratingCopilot ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      <span>{copilotTicket ? 'Regenerate Draft' : 'Draft Response with RAG'}</span>
                    </button>
                  </div>

                  {copilotTicket && (
                    <div className="space-y-2 pt-1">
                      <div className="rounded-lg border border-purple-200 bg-white p-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 leading-relaxed font-mono">
                        {copilotTicket.generatedDraftResponse}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-purple-700 dark:text-purple-300">
                        <span>Grounding Confidence: {Math.round(copilotTicket.confidenceScore * 100)}%</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(copilotTicket.generatedDraftResponse);
                            addToast({ title: 'Copied', message: 'Draft response copied to clipboard', type: 'info' });
                          }}
                          className="hover:underline font-semibold"
                        >
                          Copy Draft
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Status:</span>
              <select
                value={feedback?.status || 'NEW'}
                onChange={(e) => handleStatusChange(e.target.value as FeedbackStatus)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="NEW">New</option>
                <option value="ANALYZED">Analyzed</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleConvertToIssue}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Convert to Action Issue</span>
              </button>
              <button
                onClick={() => setSelectedFeedbackId(null)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Modals */}
      <ExplainabilityDrawer
        feedbackId={selectedFeedbackId}
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
      />

      <RootCauseAnalysisModal
        feedbackId={selectedFeedbackId}
        isOpen={isRootCauseOpen}
        onClose={() => setIsRootCauseOpen(false)}
      />
    </>
  );
}
