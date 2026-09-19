import React, { useState, useEffect } from 'react';
import {
  GitFork,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Info,
  CheckCircle2,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  X,
  TrendingUp,
  DollarSign,
  Workflow,
  Sliders,
  RefreshCw
} from 'lucide-react';
import { CausalGraphData, CausalNode, CausalEdge } from '../../types.js';
import { useApp } from '../../context/AppContext.js';

export function CausalGraphView() {
  const { setActiveTab, addToast } = useApp();
  const [graphData, setGraphData] = useState<CausalGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<CausalNode | null>(null);
  const [filterSegment, setFilterSegment] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    fetchGraphData();
  }, [filterSegment]);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/causal-graph?segment=${filterSegment}`);
      const data = await res.json();
      if (data.success && data.graph) {
        setGraphData(data.graph);
        if (data.graph.nodes && data.graph.nodes.length > 0) {
          setSelectedNode(data.graph.nodes[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch causal graph', e);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredNodes = () => {
    if (!graphData) return [];
    if (filterType === 'ALL') return graphData.nodes;
    return graphData.nodes.filter(n => n.type === filterType);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'ISSUE': return 'bg-rose-500/10 text-rose-600 border-rose-300 dark:border-rose-900/60 dark:text-rose-400';
      case 'PRODUCT': return 'bg-indigo-500/10 text-indigo-600 border-indigo-300 dark:border-indigo-900/60 dark:text-indigo-400';
      case 'FEATURE': return 'bg-purple-500/10 text-purple-600 border-purple-300 dark:border-purple-900/60 dark:text-purple-400';
      case 'CUSTOMER_SEGMENT': return 'bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-900/60 dark:text-blue-400';
      case 'EMOTION': return 'bg-pink-500/10 text-pink-600 border-pink-300 dark:border-pink-900/60 dark:text-pink-400';
      case 'ROOT_CAUSE': return 'bg-amber-500/10 text-amber-700 border-amber-300 dark:border-amber-900/60 dark:text-amber-400';
      case 'CHURN_RISK': return 'bg-red-700/10 text-red-700 border-red-400 dark:border-red-950 dark:text-red-300';
      case 'BUSINESS_IMPACT': return 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-900/60 dark:text-emerald-400';
      case 'RESOLUTION': return 'bg-teal-500/10 text-teal-600 border-teal-300 dark:border-teal-900/60 dark:text-teal-400';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-300 dark:border-slate-800';
    }
  };

  const getRelationshipBadge = (type: string) => {
    switch (type) {
      case 'CONFIRMED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Confirmed Causal Link
          </span>
        );
      case 'EVIDENCE_SUPPORTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Evidence-Supported
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
            <HelpCircle className="h-3 w-3" /> AI Hypothesis
          </span>
        );
    }
  };

  const relatedEdges = graphData?.edges?.filter(
    e => e.source === selectedNode?.id || e.target === selectedNode?.id
  ) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Workflow className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Causal Customer Intelligence Graph</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Bayesian DAG
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Explore multi-dimensional causal chains linking complaints to technical root causes, emotional friction, customer churn risk, and financial impact.
              </p>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('simulator')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100 transition"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Simulate Interventions</span>
          </button>
          <button
            onClick={fetchGraphData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Model</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Zoom */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <Filter className="h-3.5 w-3.5 text-indigo-500" /> Customer Segment:
          </div>
          <select
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white font-medium"
          >
            <option value="ALL">All Enterprise Segments</option>
            <option value="Enterprise VIP Accounts">Enterprise VIP Accounts ($500K+ ARR)</option>
            <option value="Mobile Field Workers">Mobile Field Workers (High Frequency)</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ml-2 font-semibold">
            Layer Filter:
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white font-medium"
          >
            <option value="ALL">All Layers (End-to-End DAG)</option>
            <option value="ISSUE">Layer 1: Issues & Triggers</option>
            <option value="ROOT_CAUSE">Layer 3: Technical Root Causes</option>
            <option value="CHURN_RISK">Layer 4: Churn & Account Risk</option>
            <option value="BUSINESS_IMPACT">Layer 5: Revenue & Business Impact</option>
          </select>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.1))}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono text-slate-500 px-1">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
            title="Reset Zoom"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas & Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Graph Canvas Area */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden min-h-[580px] flex flex-col justify-between">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-3">
                <div className="animate-spin w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-slate-400 text-xs">Computing Bayesian causal chains...</p>
              </div>
            </div>
          ) : (
            <div
              className="relative z-10 transition-transform duration-200 ease-out space-y-6"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
            >
              {/* Layer 1: Issues & Triggers */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Layer 1: Triggering Issues & Friction Points
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {getFilteredNodes().filter(n => n.type === 'ISSUE').map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${getNodeColor(node.type)} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-indigo-500 scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span>{node.type}</span>
                        <span className="font-mono text-[10px]">{node.metric}</span>
                      </div>
                      <div className="text-sm font-bold mt-1 text-white">{node.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer 2: Emotional Valence & Customer Segments */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-indigo-400" /> Layer 2: Affected Segments & Customer Friction
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getFilteredNodes().filter(n => n.type === 'CUSTOMER_SEGMENT' || n.type === 'EMOTION').map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${getNodeColor(node.type)} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span>{node.type}</span>
                        <span className="font-mono text-[10px]">{node.metric}</span>
                      </div>
                      <div className="text-sm font-bold mt-1 text-white">{node.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer 3: Root Cause Layer */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Layer 3: Systemic Root Causes & Architectural Deficits
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getFilteredNodes().filter(n => n.type === 'ROOT_CAUSE').map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${getNodeColor(node.type)} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-amber-500 scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span>{node.type}</span>
                        <span className="font-mono text-[10px]">{node.metric}</span>
                      </div>
                      <div className="text-sm font-bold mt-1 text-white">{node.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer 4: Business Impact & Churn Risk */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Layer 4: Financial Risk & Retention Outcomes
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getFilteredNodes().filter(n => n.type === 'CHURN_RISK' || n.type === 'BUSINESS_IMPACT').map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${getNodeColor(node.type)} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-emerald-500 scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span>{node.type}</span>
                        <span className="font-mono text-[10px]">{node.metric}</span>
                      </div>
                      <div className="text-sm font-bold mt-1 text-white">{node.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Node Telemetry & Impact Inspector Drawer */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Inspecting Causal Node
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedNode.label}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {selectedNode.type}
                </span>
              </div>

              {/* Node Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-xs">
                <div>
                  <div className="text-[11px] text-slate-400">Bayesian Confidence:</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {selectedNode.confidence ? `${Math.round(selectedNode.confidence * 100)}% Confidence` : '94% Confidence'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Telemetry Value:</div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
                    {selectedNode.metric || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Connected Causal Links */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                  Connected Causal Dependencies ({relatedEdges.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {relatedEdges.map((e, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {e.source === selectedNode.id ? 'Affects ➔' : 'Triggered by ⬅'}
                        </span>
                        {getRelationshipBadge(e.relationshipType)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {e.source === selectedNode.id ? e.target : e.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('simulator');
                    addToast({
                      title: 'Simulating Intervention',
                      message: `Loaded "${selectedNode.label}" into Monte Carlo Engine.`,
                      type: 'info'
                    });
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-xs font-semibold hover:from-indigo-500 hover:to-indigo-600 transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                >
                  <span>Simulate Fixing This Node</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('feedback');
                    addToast({
                      title: 'Filtering Feedback',
                      message: `Showing customer complaints related to ${selectedNode.label}`,
                      type: 'info'
                    });
                  }}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  View Raw Feedback Evidence
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3 shadow-sm">
              <Workflow className="h-8 w-8 text-indigo-500 mx-auto" />
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Select any Causal Node</div>
              <p className="text-xs text-slate-500">
                Click a node in the DAG canvas to inspect its Bayesian probability, upstream causes, and revenue impact.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
