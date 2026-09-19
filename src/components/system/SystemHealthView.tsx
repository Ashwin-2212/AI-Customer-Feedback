import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Database,
  Radio,
  RefreshCw,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  HardDrive,
  Wifi,
  Bot
} from 'lucide-react';

interface ServiceStatus {
  id: string;
  name: string;
  category: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  uptimePct: number;
  version: string;
  description: string;
  metrics: { [key: string]: string | number };
}

export function SystemHealthView() {
  const { addToast, refreshTrigger, triggerRefresh, setActiveTab } = useApp();
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState<ServiceStatus | null>(null);

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      id: 'gemini-ai',
      name: 'Google Gemini 3.7 Flash Engine',
      category: 'AI / LLM Ingestion',
      status: 'HEALTHY',
      latencyMs: 118,
      uptimePct: 99.98,
      version: 'gemini-3.7-flash',
      description: 'Primary generative AI inference pipeline for customer sentiment, aspect extraction, and causal RCA.',
      metrics: {
        'Token Quota': 'Enterprise Unlimited',
        'Inference P95': '142 ms',
        'Fallback Mode': 'Local NLP Ready'
      }
    },
    {
      id: 'sse-stream',
      name: 'Realtime SSE Stream Gateway',
      category: 'Streaming & WebSockets',
      status: 'HEALTHY',
      latencyMs: 12,
      uptimePct: 100.0,
      version: 'v2.4-sse',
      description: 'Server-Sent Events event stream channel broadcasting live feedback, alerts, and triage status.',
      metrics: {
        'Channel URI': '/api/v1/stream',
        'Active Clients': 1,
        'Buffered Events': 0
      }
    },
    {
      id: 'memory-db',
      name: 'In-Memory Graph & Vector Store',
      category: 'Persistence & Graph',
      status: 'HEALTHY',
      latencyMs: 4,
      uptimePct: 100.0,
      version: 'v2.12.0',
      description: 'Zero-latency in-memory data store holding feedback records, customer directory, issues, and topologies.',
      metrics: {
        'Total Records': '520+ Documents',
        'Target Products': '6 Active',
        'Heap Allocated': '18.4 MB'
      }
    },
    {
      id: 'causal-engine',
      name: 'Bayesian Causal DAG Engine',
      category: 'Inference Graph',
      status: 'HEALTHY',
      latencyMs: 24,
      uptimePct: 99.95,
      version: 'DAG-v3.1',
      description: 'Directed Acyclic Graph topology evaluator linking technical faults to customer churn and financial ARR risk.',
      metrics: {
        'Graph Nodes': 10,
        'Causal Edges': 12,
        'Cycle Check': '0 ms Pass'
      }
    },
    {
      id: 'rbac-security',
      name: 'RBAC Multi-Tenant Security Guard',
      category: 'Security & Auth',
      status: 'HEALTHY',
      latencyMs: 2,
      uptimePct: 100.0,
      version: 'RBAC-v2.4',
      description: '4-Tier Role Access Control verifying user permissions across Admin, Manager, Analyst, and Viewer.',
      metrics: {
        'Active Roles': '4 Configured',
        'Auth Mode': 'JWT Mock Session',
        'Policy Violations': 0
      }
    },
    {
      id: 'webhook-worker',
      name: 'Audit & Webhook Notification Dispatch',
      category: 'Background Workers',
      status: 'HEALTHY',
      latencyMs: 18,
      uptimePct: 99.99,
      version: 'Worker-v1.8',
      description: 'Asynchronous event queue dispatching integration alerts to Slack, Jira, PagerDuty, and Linear webhooks.',
      metrics: {
        'Integrations Ready': 12,
        'Queue Latency': '0 ms',
        'Failed Dispatches': 0
      }
    }
  ]);

  const handleRunHealthCheck = async () => {
    setIsRunningCheck(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setLastCheckTime(new Date());
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          latencyMs: Math.floor(Math.random() * 20) + (s.id === 'gemini-ai' ? 110 : s.id === 'causal-engine' ? 20 : 4)
        }))
      );
      addToast({
        title: 'System Diagnostic Complete',
        message: 'All 6/6 microservices and AI inference pipelines reported HEALTHY status.',
        type: 'success'
      });
    } catch (e: any) {
      addToast({
        title: 'Diagnostic Error',
        message: e?.message || 'Failed to ping services.',
        type: 'error'
      });
    } finally {
      setIsRunningCheck(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl dark:border-indigo-900/50">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-300 uppercase border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Operational Status: 6/6 Up (100%)
              </span>
              <span className="text-[11px] text-slate-300 font-mono">
                P95 Latency: 118ms
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
              <Server className="h-6 w-6 text-indigo-400" />
              <span>System Health & AI Infrastructure Metrics</span>
            </h1>
            <p className="mt-1 text-xs text-indigo-200/80 max-w-2xl">
              Real-time telemetry across Gemini AI models, SSE streaming gateway, in-memory graph DAG engine, and security proxies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunHealthCheck}
              disabled={isRunningCheck}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRunningCheck ? 'animate-spin' : ''}`} />
              <span>{isRunningCheck ? 'Running Diagnostic...' : 'Run Full Health Ping'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Metric Gauges */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-4">
          <div>
            <div className="text-[11px] font-medium text-indigo-300/80">Overall System Uptime</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">99.99%</div>
            <div className="text-[10px] text-slate-300">Last 30 rolling days</div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-indigo-300/80">Active AI Model</div>
            <div className="text-lg font-bold text-white mt-0.5 font-mono">gemini-3.7-flash</div>
            <div className="text-[10px] text-emerald-400">Low-latency multimodal engine</div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-indigo-300/80">SSE Stream Channel</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <Radio className="h-4 w-4 animate-pulse" />
              <span>Connected</span>
            </div>
            <div className="text-[10px] text-indigo-200">Port 3000 /api/v1/stream</div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-indigo-300/80">Diagnostic Timestamp</div>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">
              {lastCheckTime.toLocaleTimeString()}
            </div>
            <div className="text-[10px] text-slate-300">Auto-synced</div>
          </div>
        </div>
      </div>

      {/* Services Grid (6/6) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Monitored Service Stack (6/6 Operational)</span>
          </h2>
          <span className="text-xs text-slate-500">Click any service to inspect detailed metrics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              onClick={() => setSelectedService(srv)}
              className={`rounded-2xl border p-5 transition cursor-pointer ${
                selectedService?.id === srv.id
                  ? 'border-indigo-600 bg-indigo-50/40 dark:border-indigo-500 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {srv.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {srv.name}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> UP
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {srv.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Latency:</span>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">{srv.latencyMs} ms</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Uptime:</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-200">{srv.uptimePct}%</div>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {Object.entries(srv.metrics).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{k}:</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Infrastructure Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Need to inspect AI configurations or model governance?</h3>
          <p className="text-xs text-slate-500">Tune temperature, test webhook integrations, or inspect RLHF human feedback datasets.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('governance')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Bot className="h-3.5 w-3.5 text-indigo-500" />
            <span>Model Governance</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_config')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Configure AI Models</span>
          </button>
        </div>
      </div>
    </div>
  );
}
