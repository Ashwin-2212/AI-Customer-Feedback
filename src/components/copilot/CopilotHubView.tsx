import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { KnowledgeDocument, CopilotTicket } from '../../types.js';
import {
  Bot,
  BookOpen,
  Send,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Plus,
  FileText,
  ExternalLink,
  RefreshCw,
  User,
  Mail,
  Loader2
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export function CopilotHubView() {
  const { setSelectedFeedbackId, addToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'tickets' | 'knowledge'>('tickets');

  // Support Tickets State
  const [tickets, setTickets] = useState<CopilotTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<CopilotTicket | null>(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Knowledge Base State
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [searchDoc, setSearchDoc] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Product Documentation');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const loadTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const res = await ApiService.getCopilotTickets();
      const list = res.tickets || [];
      setTickets(list);
      if (list.length > 0 && !selectedTicket) {
        setSelectedTicket(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await ApiService.getKnowledgeDocs();
      setDocuments(res.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTickets();
    loadDocuments();
  }, []);

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    try {
      setIsResolving(true);
      const res = await ApiService.resolveCopilotTicket(
        selectedTicket.id,
        selectedTicket.generatedDraftResponse
      );
      setSelectedTicket(res.ticket);
      setTickets(prev => prev.map(t => (t.id === res.ticket.id ? res.ticket : t)));
      addToast({
        title: 'Ticket Resolved & Sent',
        message: `Response dispatched to ${selectedTicket.customerEmail}`,
        type: 'success'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsResolving(false);
    }
  };

  const handleCreateKnowledgeDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      const res = await ApiService.addKnowledgeDoc({
        title: newTitle.trim(),
        category: newCategory,
        content: newContent.trim(),
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setDocuments(prev => [res.document, ...prev]);
      setIsAddingDoc(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      addToast({
        title: 'Knowledge Document Added',
        message: 'RAG index updated with new knowledge asset',
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Failed to Add Document',
        message: (err as Error).message,
        type: 'error'
      });
    }
  };

  const copyResponse = () => {
    if (selectedTicket) {
      navigator.clipboard.writeText(selectedTicket.generatedDraftResponse);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
    }
  };

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(searchDoc.toLowerCase()) ||
    d.content.toLowerCase().includes(searchDoc.toLowerCase()) ||
    d.category.toLowerCase().includes(searchDoc.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              AI Support Copilot & RAG Knowledge Hub
            </h1>
            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Grounded Gemini 2.5
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-generate hyper-accurate support responses grounded in verified product knowledge documentation.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'tickets'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-purple-500" />
            <span>Copilot Drafts ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('knowledge')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'knowledge'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
            <span>RAG Knowledge Base ({documents.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'tickets' ? (
        /* Support Tickets & Copilot Reply Workspace */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Tickets List */}
          <div className="space-y-3 lg:col-span-5">
            {isLoadingTickets ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <RefreshCw className="mx-auto h-5 w-5 animate-spin mb-2 text-indigo-500" />
                Loading copilot queue...
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                No copilot tickets in queue.
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/40 shadow-sm dark:border-purple-500/70 dark:bg-purple-950/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            t.status === 'SENT' || t.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {t.status}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {t.customerName}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                          "{t.feedbackSnippet}"
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {formatDate(t.createdAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles className="h-3 w-3" />
                        Grounding Confidence: {Math.round((t.confidenceScore || 0.85) * 100)}%
                      </span>
                      <span>{(t.ragCitations || []).length} KB Citations</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Copilot Reply Review & Send */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
                {/* Customer Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {selectedTicket.customerName}
                      </span>
                      <span className="text-xs text-slate-400">({selectedTicket.customerEmail})</span>
                    </div>
                    <div className="text-xs text-slate-500">Ticket ID: {selectedTicket.id}</div>
                  </div>

                  <button
                    onClick={() => setSelectedFeedbackId(selectedTicket.feedbackId)}
                    className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    View Original Feedback Record →
                  </button>
                </div>

                {/* Customer Verbatim Snippet */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Customer Signal:
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 italic">
                    "{selectedTicket.feedbackSnippet}"
                  </p>
                </div>

                {/* RAG Knowledge Base Citations */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-purple-500" />
                    Verified RAG Grounding Citations ({(selectedTicket.ragCitations || []).length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedTicket.ragCitations || []).map((cite, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-purple-100 bg-purple-50/50 p-2.5 text-xs dark:border-purple-950 dark:bg-purple-950/20"
                      >
                        <div className="font-bold text-purple-900 dark:text-purple-300">
                          {cite.title}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          "{cite.snippet}"
                        </p>
                        <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 mt-1 block">
                          Doc: {cite.docId}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Draft Response Editor */}
                <div className="rounded-xl border border-purple-200 bg-white p-4 dark:border-purple-900/60 dark:bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                      <Sparkles className="h-4 w-4" />
                      <span>Copilot Suggested Resolution Draft</span>
                    </div>

                    <button
                      onClick={copyResponse}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-purple-600 transition"
                    >
                      {copiedDraft ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={selectedTicket.generatedDraftResponse}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedTicket(prev => prev ? { ...prev, generatedDraftResponse: val } : null);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white leading-relaxed focus:border-purple-500 focus:outline-none"
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-400">
                      Grounding Confidence: <span className="font-bold text-purple-600">{Math.round(selectedTicket.confidenceScore * 100)}%</span>
                    </div>

                    <button
                      onClick={handleResolveTicket}
                      disabled={isResolving || selectedTicket.status === 'SENT'}
                      className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                      {isResolving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>{selectedTicket.status === 'SENT' ? 'Already Dispatched' : 'Approve & Dispatch Reply'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                Select a ticket from the left panel to review grounded AI draft responses.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* RAG Knowledge Base Document Explorer */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search knowledge documents by keyword, title, or category..."
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              onClick={() => setIsAddingDoc(!isAddingDoc)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Knowledge Document</span>
            </button>
          </div>

          {/* New Document Form */}
          {isAddingDoc && (
            <form onSubmit={handleCreateKnowledgeDoc} className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-900 dark:bg-indigo-950/30 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ingest New Knowledge Document into RAG Vector Base
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., SSO Troubleshooting Guide"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Product Documentation">Product Documentation</option>
                    <option value="Troubleshooting">Troubleshooting</option>
                    <option value="Billing & Pricing">Billing & Pricing</option>
                    <option value="API & Integrations">API & Integrations</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Document Content (Markdown / Knowledge Article)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste verified resolution steps, technical troubleshooting, or policy guidelines..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="sso, saml, okta, authentication"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Save & Index Knowledge
                </button>
              </div>
            </form>
          )}

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {doc.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(doc.lastUpdated)}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {doc.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(doc.tags || []).map((t, idx) => (
                      <span key={idx} className="text-[9px] text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                    Indexed for RAG
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
