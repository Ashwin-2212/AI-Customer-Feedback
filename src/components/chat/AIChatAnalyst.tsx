import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import {
  AnalyticsChatMessage,
  AnalyticsStructuredPayload
} from '../../types.js';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Loader2,
  TrendingDown,
  TrendingUp,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Activity,
  Layers,
  HelpCircle,
  GitFork,
  Sliders,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

export function AIChatAnalyst() {
  const { setActiveTab } = useApp();
  const [messages, setMessages] = useState<AnalyticsChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ASSISTANT',
      text: `Hello! I am your **Conversational Customer Analytics Assistant** grounded in live feedback telemetry.

You can ask natural questions like:
- *"Why did customer satisfaction decrease last month?"*
- *"Show me the evidence."*
- *"Which customers are affected?"*
- *"What if we fix payment?"*
- *"What caused the payment issue?"*
- *"Which feature should we build first?"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Why did customer satisfaction decrease last month?',
        'Show me the evidence.',
        'Which customers are affected?',
        'What if we fix payment?',
        'What caused the payment issue?',
        'Which feature should we build first?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AnalyticsChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'USER',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await ApiService.askConversationalAnalytics(textToSend, messages);
      if (res.success && res.response) {
        setMessages(prev => [...prev, res.response]);
      } else {
        throw new Error('No response returned from analytics copilot');
      }
    } catch (err) {
      const errorMsg: AnalyticsChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ASSISTANT',
        text: `⚠️ I encountered an error communicating with the intelligence service: ${(err as Error).message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'Why did customer satisfaction decrease last month?',
          'What if we fix payment?',
          'Which feature should we build first?'
        ]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderStructuredPayload = (payload?: AnalyticsStructuredPayload) => {
    if (!payload) return null;

    // 1. CSAT Breakdown
    if (payload.type === 'CSAT_BREAKDOWN' && payload.csatBreakdown) {
      const csat = payload.csatBreakdown;
      return (
        <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/30 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2 dark:border-indigo-900/60">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">CSAT Movement: {csat.previousCSAT} → {csat.currentCSAT} ({csat.drop})</span>
            </div>
            <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {csat.period}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Primary Dissatisfaction Contributors:
            </span>
            <div className="space-y-2">
              {csat.primaryContributors.map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{c.name} ({c.count} complaints)</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{c.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${c.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Most Affected Segment:</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{csat.mostAffectedSegment}</span>
            </div>
            <div className="rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Recommended Action:</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{csat.recommendedAction}</span>
            </div>
          </div>
        </div>
      );
    }

    // 2. Evidence Quotes
    if (payload.type === 'EVIDENCE_LIST' && payload.evidenceQuotes) {
      return (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>Extracted Customer Verbatim Evidence:</span>
          </div>
          <div className="space-y-2">
            {payload.evidenceQuotes.map((q) => (
              <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700/60 dark:bg-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{q.customerName}</span>
                  <span className="rounded bg-red-100 px-1.5 py-0.2 font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">{q.severity}</span>
                </div>
                <p className="text-xs italic text-slate-700 dark:text-slate-300">"{q.text}"</p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Category: {q.category}</span>
                  <span>{q.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. Affected Customers
    if (payload.type === 'AFFECTED_CUSTOMERS' && payload.affectedCustomers) {
      return (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
            <span>High-Value Accounts at Risk (Sample):</span>
            <button
              onClick={() => setActiveTab('churn_intelligence')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View Full Churn Directory <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {payload.affectedCustomers.map((c) => (
              <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700/60 dark:bg-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{c.name}</span>
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    Risk {c.churnRiskScore}/100
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {c.segment} • ARR: ${c.arrUSD?.toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate">
                  ⚠️ {c.recentIssue}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4. Simulation Result
    if (payload.type === 'SIMULATION_RESULT' && payload.simulationResult) {
      const sim = payload.simulationResult;
      return (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30 space-y-2.5">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 dark:border-emerald-900/60">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">{sim.scenarioTitle}</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              {sim.netGain}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white p-2 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">CSAT Projection:</span>
              <span className="font-bold text-slate-900 dark:text-white">{sim.currentValue} → <span className="text-emerald-600 font-extrabold">{sim.projectedValue}</span></span>
            </div>
            <div className="rounded-lg bg-white p-2 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Modeled ARR Protected:</span>
              <span className="font-bold text-emerald-600">${sim.estimatedRevenueSavedUSD?.toLocaleString()} (₹18.4L)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{sim.rationale}</p>
        </div>
      );
    }

    // 5. Causal RCA
    if (payload.type === 'CAUSAL_RCA' && payload.causalRCA) {
      const rca = payload.causalRCA;
      return (
        <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/20 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
            <GitFork className="h-4 w-4 text-indigo-500" />
            <span>{rca.incidentName} — Causal Chain:</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
            {rca.causalChain.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white p-2.5 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Recommended Hotfix:</span>
            {rca.recommendedHotfix}
          </div>
        </div>
      );
    }

    // 6. Roadmap Priority
    if (payload.type === 'ROADMAP_PRIORITY' && payload.roadmapPriority) {
      return (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 space-y-2">
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            AI-Ranked Feature Roadmap (ROI & Churn Mitigation):
          </div>
          <div className="space-y-2">
            {payload.roadmapPriority.rankedFeatures.map((feat) => (
              <div key={feat.rank} className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700/60 dark:bg-slate-800/80">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      #{feat.rank}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{feat.featureName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7">{feat.rationale}</p>
                </div>
                <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-extrabold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
                  Score {feat.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Conversational Customer Analytics Copilot
              </h1>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                Gemini 3.7 Flash • Real-Data Grounding
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Query causal root causes, CSAT movement drivers, what-if interventions, and customer risk with zero hallucination.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(prev => (prev || []).slice(0, 1))}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-4 overflow-y-auto py-6 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'USER' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ASSISTANT' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
            )}

            <div
              className={`relative max-w-3xl rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                msg.sender === 'USER'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              {/* Copy Button on AI responses */}
              {msg.sender === 'ASSISTANT' && (
                <button
                  onClick={() => copyResponse(msg.id, msg.text)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title="Copy response"
                >
                  {copiedId === msg.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}

              {/* Render Text */}
              <div className="space-y-2 whitespace-pre-line font-normal text-xs sm:text-[13px] leading-relaxed">
                {msg.text}
              </div>

              {/* Render Structured Payload */}
              {renderStructuredPayload(msg.payload)}

              {/* Suggested Follow-Up Chips */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                    Suggested Next Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/80 transition"
                      >
                        <span>{chip}</span>
                        <ArrowRight className="h-2.5 w-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`mt-2 text-[10px] ${
                  msg.sender === 'USER' ? 'text-indigo-200 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'USER' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white shadow-xs">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Querying live feedback telemetry, causal models, and financial impact simulations...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="relative flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900">
        <input
          type="text"
          placeholder="Ask why satisfaction changed, request evidence, test what-if scenarios, or query feature priorities..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
